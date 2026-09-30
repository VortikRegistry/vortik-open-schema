import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const schema = await readJson("docs/protocol-context.schema.json");
const validateShape = ajv.compile(schema);
const primaryHosts = new Set([
  "eips.ethereum.org",
  "blog.ethereum.org",
  "consensus.ethereum.foundation",
  "ethresear.ch",
  "docs.cow.fi",
  "docs.flashbots.net"
]);

function uniqueMap(items, key, label, errors) {
  const map = new Map();
  for (const item of items) {
    if (map.has(item[key])) errors.push(`duplicate ${label}: ${item[key]}`);
    map.set(item[key], item);
  }
  return map;
}

/** Validate structure and local consistency; this never checks live protocol state. */
export function assertProtocolContext(data, registry) {
  if (!validateShape(data)) {
    throw new Error(`Protocol context contract: ${ajv.errorsText(validateShape.errors)}`);
  }
  if (!registry || !Array.isArray(registry.anchors)) {
    throw new Error("Canonical registry with anchors is required");
  }
  const errors = [];
  const anchors = uniqueMap(data.anchors, "id", "anchor", errors);
  const sources = uniqueMap(data.sources, "id", "source", errors);
  const eips = uniqueMap(data.eips, "number", "EIP", errors);
  const forks = uniqueMap(data.forks, "name", "fork", errors);
  const canonical = new Map(registry.anchors.map((entry) => [entry.id, entry]));
  const checkRefs = (refs, label) => {
    for (const ref of refs) if (!sources.has(ref)) errors.push(`${label}: missing source ${ref}`);
  };

  if (data.registry.version !== registry.version || data.registry.last_updated !== registry.last_updated) {
    errors.push("registry version or last_updated differs from canonical registry");
  }
  if (data.reviewed_at < data.registry.last_updated) {
    errors.push("source review predates its referenced registry");
  }
  if (anchors.size !== canonical.size || [...canonical.keys()].some((id) => !anchors.has(id))) {
    errors.push("context must cover every canonical anchor exactly once");
  }
  const paths = [data.review_path, ...data.anchors.flatMap((anchor) => [anchor.anchor_path, anchor.sources_path])];
  for (const path of paths) {
    if (path.split("/").some((part) => part === "." || part === "..")) {
      errors.push(`unsafe local path: ${path}`);
    }
  }
  for (const source of data.sources) {
    const url = new URL(source.url);
    if (url.protocol !== "https:" || !primaryHosts.has(url.hostname)
        || url.username || url.password || url.port || /[\\\s]/u.test(source.url)) {
      errors.push(`source ${source.id}: URL is not an allowed HTTPS primary source`);
    }
  }
  for (const anchor of data.anchors) {
    const original = canonical.get(anchor.id);
    if (!original || anchor.ens !== original.ens || anchor.anchor_path !== original.anchor_doc
        || anchor.sources_path !== original.schema.replace(/schema\.json$/, "sources.md")) {
      errors.push(`${anchor.id}: anchor identity or document paths differ from canonical registry`);
    }
    checkRefs(anchor.source_refs, anchor.id);
    for (const number of anchor.eip_refs) {
      if (!eips.has(number)) errors.push(`${anchor.id}: missing EIP-${number}`);
    }
  }
  for (const eip of data.eips) {
    const source = sources.get(eip.source_ref);
    if (source?.url !== `https://eips.ethereum.org/EIPS/eip-${eip.number}`) {
      errors.push(`EIP-${eip.number}: document source must identify that exact EIP`);
    }
    if (eip.fork) {
      const fork = forks.get(eip.fork.name);
      if (!fork) errors.push(`EIP-${eip.number}: missing fork ${eip.fork.name}`);
      else if (!fork.source_refs.includes(eip.fork.source_ref)) {
        errors.push(`EIP-${eip.number}: assignment source is not among the fork sources`);
      }
      checkRefs([eip.fork.source_ref], `EIP-${eip.number} fork assignment`);
    }
  }
  for (const fork of data.forks) {
    checkRefs(fork.source_refs, fork.name);
    uniqueMap(fork.activations, "network", `${fork.name} network`, errors);
    for (const activation of fork.activations) {
      if (activation.activation_at) {
        const day = activation.activation_at.slice(0, 10);
        if (activation.status === "scheduled" && day < data.reviewed_at) {
          errors.push(`${fork.name}/${activation.network}: scheduled date predates review; recheck source`);
        }
        if (activation.status === "active" && day > data.reviewed_at) {
          errors.push(`${fork.name}/${activation.network}: future activation cannot be active at review`);
        }
      }
      if (activation.epoch !== null && activation.slot !== null && activation.slot !== activation.epoch * 32) {
        errors.push(`${fork.name}/${activation.network}: epoch and slot are inconsistent`);
      }
    }
  }
  if (errors.length) throw new Error(`Protocol context integrity:\n${errors.join("\n")}`);
  return data;
}

/** Read and validate only committed local JSON. No HTTP, RPC, ENS or cloud calls. */
export async function readProtocolContext() {
  const [data, registry] = await Promise.all([
    readJson("docs/protocol-context.json"), readJson("registry.json")
  ]);
  return assertProtocolContext(data, registry);
}

/** Join related records without promoting an EIP's state to the anchor itself. */
export function getAnchorContext(data, id) {
  const anchor = data.anchors.find((entry) => entry.id === id || entry.ens === id);
  if (!anchor) throw new Error(`Unknown context anchor: ${id}`);
  const eips = data.eips.filter((entry) => anchor.eip_refs.includes(entry.number));
  const forkNames = new Set(eips.flatMap((entry) => entry.fork ? [entry.fork.name] : []));
  const forks = data.forks.filter((entry) => forkNames.has(entry.name));
  const sourceIds = new Set([
    ...anchor.source_refs,
    ...eips.flatMap((entry) => [entry.source_ref, ...(entry.fork ? [entry.fork.source_ref] : [])]),
    ...forks.flatMap((entry) => entry.source_refs)
  ]);
  return structuredClone({
    reviewed_at: data.reviewed_at,
    registry: data.registry,
    anchor,
    related_eips: eips,
    related_forks: forks,
    sources: data.sources.filter((entry) => sourceIds.has(entry.id))
  });
}
