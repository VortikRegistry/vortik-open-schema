import { createHash } from "node:crypto";

export const CATALOG_CONTRACT = "vortik.ethereum-catalog/1.0.0";
export const PROPOSAL_STATUSES = Object.freeze(["Draft", "Review", "Last Call", "Final", "Stagnant", "Withdrawn", "Living"]);
export const PROPOSAL_TYPES = Object.freeze(["Standards Track", "Meta", "Informational"]);
export const PROPOSAL_CATEGORIES = Object.freeze(["Core", "Networking", "Interface", "ERC"]);
const selectedKeys = new Set(["eip", "title", "description", "status", "type", "category"]);

function scalar(value, label) {
  if (value === "") return null;
  if (value.startsWith('"')) {
    let parsed;
    try { parsed = JSON.parse(value); } catch { throw new Error(`${label}: unsupported quoted scalar`); }
    if (typeof parsed !== "string") throw new Error(`${label}: expected text`);
    return parsed;
  }
  if (value.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(value)) throw new Error(`${label}: unsupported quoted scalar`);
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (/^[>|\[{&*!#`%@]/.test(value) || /\s#/.test(value)) {
    throw new Error(`${label}: unsupported YAML scalar; inspect upstream before extending the parser`);
  }
  return value;
}

/** Parse only scalar metadata, never execute YAML tags or infer text from the body. */
export function parseProposalMetadata(content, label = "proposal") {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  if (lines[0] !== "---") throw new Error(`${label}: missing frontmatter`);
  const end = lines.indexOf("---", 1);
  if (end < 0) throw new Error(`${label}: unclosed frontmatter`);
  const metadata = {};
  let previousKey = null;
  for (const line of lines.slice(1, end)) {
    const match = /^([a-z][a-z0-9-]*):[ \t]*(.*)$/.exec(line);
    if (!match) {
      if (line.trim() && selectedKeys.has(previousKey)) throw new Error(`${label}: unsupported multiline ${previousKey}`);
      continue;
    }
    previousKey = match[1];
    if (!selectedKeys.has(previousKey)) continue;
    if (Object.hasOwn(metadata, previousKey)) throw new Error(`${label}: duplicate field ${previousKey}`);
    metadata[previousKey] = scalar(match[2].trim(), `${label}/${previousKey}`);
  }
  if (!/^[1-9]\d*$/.test(metadata.eip ?? "")) throw new Error(`${label}: invalid proposal number`);
  metadata.number = Number(metadata.eip);
  if (!Number.isSafeInteger(metadata.number)) throw new Error(`${label}: unsafe proposal number`);
  if (metadata.status === "Moved") return metadata;
  if (!metadata.title || !PROPOSAL_STATUSES.includes(metadata.status) || !PROPOSAL_TYPES.includes(metadata.type)) {
    throw new Error(`${label}: invalid title, document status or type`);
  }
  metadata.description ??= null;
  metadata.category ??= null;
  if (metadata.category !== null && !PROPOSAL_CATEGORIES.includes(metadata.category)) throw new Error(`${label}: unsupported category`);
  if (metadata.type === "Standards Track" && metadata.category === null) throw new Error(`${label}: missing Standards Track category`);
  if (metadata.type !== "Standards Track" && metadata.category !== null) throw new Error(`${label}: category on non-Standards Track document`);
  return metadata;
}

export function catalogDigest(proposals) {
  return createHash("sha256").update(JSON.stringify(proposals)).digest("hex");
}

function normalRecord(source, path, metadata) {
  const prefix = source.id === "eips" ? "eip" : "erc";
  const number = metadata.number;
  return {
    id: `${prefix}-${number}`, number, title: metadata.title,
    description: metadata.description, status: metadata.status,
    type: metadata.type, category: metadata.category,
    url: source.id === "eips" ? `https://eips.ethereum.org/EIPS/eip-${number}` : `https://ercs.ethereum.org/ERCS/erc-${number}`,
    source_ref: source.id, path, commit: source.commit
  };
}

/** All documents must come from the pinned source trees; duplicates are explicit. */
export function buildEthereumCatalog(manifest, inputs) {
  if (manifest.contract !== "vortik.ethereum-catalog-sources/1.0.0") throw new Error("Unsupported catalog source manifest");
  if (inputs.length !== 2 || manifest.sources.length !== 2) throw new Error("Both official repositories are required");
  const expected = { eips: ["ethereum/EIPs", "EIPS"], ercs: ["ethereum/ERCs", "ERCS"] };
  const records = new Map();
  const moved = [];
  const mirrors = [];
  const sources = [];
  let scanned = 0;
  for (const source of manifest.sources) {
    if (!expected[source.id] || source.repository !== expected[source.id][0]
        || source.directory !== expected[source.id][1] || !/^[a-f0-9]{40}$/.test(source.commit)
        || sources.some((entry) => entry.id === source.id)) throw new Error("Invalid official source lock");
    const input = inputs.find((entry) => entry.id === source.id);
    if (!input || !Array.isArray(input.documents) || input.documents.length === 0) throw new Error(`Missing source documents: ${source.id}`);
    const paths = new Set();
    let movedCount = 0;
    let mirrorCount = 0;
    let canonicalCount = 0;
    for (const document of [...input.documents].sort((a, b) => a.path.localeCompare(b.path, "en"))) {
      if (paths.has(document.path)) throw new Error(`Duplicate source path: ${document.path}`);
      paths.add(document.path);
      const match = new RegExp(`^${source.directory}/(eip|erc)-([1-9]\\d*)\\.md$`).exec(document.path);
      if (!match) throw new Error(`Unaccounted source document: ${document.path}`);
      const metadata = parseProposalMetadata(document.content, document.path);
      if (Number(match[2]) !== metadata.number) throw new Error(`${document.path}: filename/preamble number mismatch`);
      if (source.id === "eips" && match[1] !== "eip") throw new Error(`Unexpected EIPs source path: ${document.path}`);
      scanned += 1;
      if (metadata.status === "Moved") {
        if (source.id !== "eips" || metadata.category !== "ERC") throw new Error(`Unsupported moved document: ${document.path}`);
        moved.push(metadata.number);
        movedCount += 1;
        continue;
      }
      if (source.id === "ercs" && match[1] === "eip") {
        mirrors.push(metadata);
        mirrorCount += 1;
        continue;
      }
      if (source.id === "ercs" && metadata.category !== "ERC") throw new Error(`Non-ERC canonical document in ERCs: ${document.path}`);
      if (records.has(metadata.number)) throw new Error(`Conflicting canonical proposal number: ${metadata.number}`);
      records.set(metadata.number, normalRecord(source, document.path, metadata));
      canonicalCount += 1;
    }
    sources.push({
      ...source,
      source_url: `https://github.com/${source.repository}/tree/${source.commit}/${source.directory}`,
      license: "CC0-1.0",
      license_url: `https://github.com/${source.repository}/blob/${source.commit}/LICENSE.md`,
      files_seen: paths.size, canonical_records: canonicalCount,
      moved_stubs: movedCount, mirrored_documents: mirrorCount
    });
  }
  for (const number of moved) {
    if (records.get(number)?.source_ref !== "ercs") throw new Error(`Moved EIP-${number} has no canonical ERC counterpart`);
  }
  for (const mirror of mirrors) {
    const canonical = records.get(mirror.number);
    if (canonical?.source_ref !== "eips" || ["title", "description", "status", "type", "category"].some((key) => canonical[key] !== mirror[key])) {
      throw new Error(`Mirrored EIP-${mirror.number} differs from its canonical metadata`);
    }
  }
  const proposals = [...records.values()].sort((a, b) => a.number - b.number);
  return {
    $schema: "https://vortikregistry.github.io/vortik-open-schema/ethereum-catalog.schema.json",
    contract: CATALOG_CONTRACT,
    reviewed_at: manifest.reviewed_at,
    scope: "Metadata from every numbered proposal Markdown file in the two pinned official repository directories. Titles and optional descriptions are indexed; document bodies, unmerged proposals, research forums and live network state are outside this snapshot.",
    provenance: {
      method: "pinned-git-object-frontmatter",
      source_manifest: "scripts/ethereum-catalog-sources.json",
      generator: "scripts/generate-ethereum-catalog.mjs",
      metadata_license: "CC0-1.0",
      bodies_indexed: false,
      status_interpretation: "Upstream document lifecycle only; no network activation or implementation claim.",
      deduplication: "Moved EIP stubs use their canonical ERC metadata. EIP mirrors in ERCs use the canonical EIPs metadata and must agree on all indexed fields.",
      content_sha256: catalogDigest(proposals)
    },
    coverage: {
      repositories: sources.length, scanned_files: scanned, records: proposals.length,
      eips: proposals.filter((entry) => entry.source_ref === "eips").length,
      ercs: proposals.filter((entry) => entry.source_ref === "ercs").length,
      moved_stubs: moved.length, mirrored_documents: mirrors.length,
      excluded_files: [],
      duplicate_numbers: [...moved, ...mirrors.map((entry) => entry.number)].sort((a, b) => a - b)
    },
    sources, proposals
  };
}

/** Additional integrity checks after JSON Schema validation; never reads the network. */
export function assertCatalogIntegrity(data, manifest) {
  const errors = [];
  if (data.reviewed_at !== manifest.reviewed_at) errors.push("snapshot date differs from reviewed source lock");
  const sourceMap = new Map();
  for (const source of data.sources) {
    const locked = manifest.sources.find((entry) => entry.id === source.id);
    if (sourceMap.has(source.id)) errors.push(`duplicate source: ${source.id}`);
    sourceMap.set(source.id, source);
    if (!locked || ["repository", "commit", "directory"].some((key) => source[key] !== locked[key])) {
      errors.push(`${source.id}: provenance differs from source lock`);
    }
    if (source.source_url !== `https://github.com/${source.repository}/tree/${source.commit}/${source.directory}`
        || source.license_url !== `https://github.com/${source.repository}/blob/${source.commit}/LICENSE.md`) {
      errors.push(`${source.id}: invalid pinned source URL`);
    }
    if (source.files_seen !== source.canonical_records + source.moved_stubs + source.mirrored_documents) {
      errors.push(`${source.id}: unaccounted source files`);
    }
  }
  if (sourceMap.size !== 2 || !sourceMap.has("eips") || !sourceMap.has("ercs")) errors.push("both source repositories are required");
  const numbers = new Set();
  const counts = { eips: 0, ercs: 0 };
  let last = 0;
  for (const proposal of data.proposals) {
    const source = sourceMap.get(proposal.source_ref);
    const prefix = proposal.source_ref === "eips" ? "eip" : "erc";
    const official = proposal.source_ref === "eips" ? "https://eips.ethereum.org/EIPS/eip-" : "https://ercs.ethereum.org/ERCS/erc-";
    if (numbers.has(proposal.number)) errors.push(`duplicate proposal number: ${proposal.number}`);
    numbers.add(proposal.number);
    if (proposal.number <= last) errors.push("proposals must be sorted by unique ascending number");
    last = proposal.number;
    if (!source || proposal.id !== `${prefix}-${proposal.number}` || proposal.commit !== source.commit
        || proposal.path !== `${source.directory}/${prefix}-${proposal.number}.md`
        || proposal.url !== `${official}${proposal.number}`) errors.push(`${proposal.id}: identity, URL or pinned provenance mismatch`);
    if (proposal.type === "Standards Track" ? proposal.category === null : proposal.category !== null) {
      errors.push(`${proposal.id}: category/type mismatch`);
    }
    if ((proposal.source_ref === "ercs") !== (proposal.category === "ERC")) errors.push(`${proposal.id}: category/source mismatch`);
    counts[proposal.source_ref] += 1;
  }
  const totals = (key) => data.sources.reduce((sum, source) => sum + source[key], 0);
  const coverage = data.coverage;
  if (coverage.records !== data.proposals.length || coverage.eips !== counts.eips || coverage.ercs !== counts.ercs
      || coverage.scanned_files !== totals("files_seen") || coverage.moved_stubs !== totals("moved_stubs")
      || coverage.mirrored_documents !== totals("mirrored_documents")) errors.push("coverage counts differ from records and source accounting");
  for (const source of data.sources) {
    if (counts[source.id] !== source.canonical_records) errors.push(`${source.id}: canonical record count mismatch`);
  }
  const duplicates = coverage.duplicate_numbers;
  if (duplicates.length !== coverage.moved_stubs + coverage.mirrored_documents
      || new Set(duplicates).size !== duplicates.length
      || duplicates.some((number, index) => !numbers.has(number) || (index && number <= duplicates[index - 1]))) {
    errors.push("deduplicated source numbers must match accounted duplicates and canonical records");
  }
  if (data.provenance.content_sha256 !== catalogDigest(data.proposals)) errors.push("metadata content digest mismatch");
  if (errors.length) throw new Error(`Ethereum catalog integrity:\n${errors.join("\n")}`);
  return data;
}
