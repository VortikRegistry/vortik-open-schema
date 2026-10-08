import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parseProposalMetadata, buildEthereumCatalog, assertCatalogIntegrity, catalogDigest } from "../lib/ethereum-catalog.mjs";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const [manifest, snapshot, schema] = await Promise.all([
  readJson("scripts/ethereum-catalog-sources.json"), readJson("docs/ethereum-catalog.json"), readJson("docs/ethereum-catalog.schema.json")
]);
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const doc = (path, text) => ({ path, content: `---\n${text}\n---\n\n## Body\nNot indexed.\n` });
const guideline = "eip: 1\ntitle: EIP Purpose and Guidelines\nstatus: Living\ntype: Meta";
const fixture = () => [
  { id: "eips", documents: [
    doc("EIPS/eip-1.md", guideline),
    doc("EIPS/eip-20.md", "eip: 20\ncategory: ERC\nstatus: Moved"),
    doc("EIPS/eip-7732.md", "eip: 7732\ntitle: Enshrined Proposer-Builder Separation\nstatus: Review\ntype: Standards Track\ncategory: Core")
  ] },
  { id: "ercs", documents: [
    doc("ERCS/erc-20.md", "eip: 20\ntitle: Token Standard\nstatus: Final\ntype: Standards Track\ncategory: ERC"),
    doc("ERCS/eip-1.md", guideline)
  ] }
];

test("metadata parser preserves quoted titles and optional descriptions without reading body text", () => {
  const input = doc("example", "eip: 1\ntitle: \"Purpose: a guide\"\nstatus: Living\ntype: Meta");
  input.content += "description: This is body text, not metadata\n";
  const metadata = parseProposalMetadata(input.content);
  assert.equal(metadata.title, "Purpose: a guide");
  assert.equal(metadata.description, null);
  assert.equal(metadata.category, null);
  const quoted = parseProposalMetadata(doc("example", "eip: 2\ntitle: 'A reader''s guide'\ndescription: Exact upstream description\nstatus: Draft\ntype: Informational").content);
  assert.equal(quoted.title, "A reader's guide");
  assert.equal(quoted.description, "Exact upstream description");
});

test("unsupported YAML or duplicate fields fail instead of silently inventing metadata", () => {
  for (const title of ["title: >\n  Folded title", "title: [one, two]", "title: !custom value", "title: text # comment", "title: one\ntitle: two"]) {
    assert.throws(() => parseProposalMetadata(doc("example", `eip: 1\n${title}\nstatus: Living\ntype: Meta`).content), /unsupported|duplicate/);
  }
  assert.throws(() => parseProposalMetadata("# No frontmatter"), /missing frontmatter/);
});

test("migrated ERCs and the mirrored process document produce one canonical record each", () => {
  const data = buildEthereumCatalog(manifest, fixture());
  assert.deepEqual(data.proposals.map((entry) => entry.id), ["eip-1", "erc-20", "eip-7732"]);
  assert.equal(data.proposals[1].status, "Final");
  assert.equal(data.proposals[1].url, "https://ercs.ethereum.org/ERCS/erc-20");
  assert.deepEqual(data.coverage, { repositories: 2, scanned_files: 5, records: 3, eips: 2, ercs: 1,
    moved_stubs: 1, mirrored_documents: 1, excluded_files: [], duplicate_numbers: [1, 20] });
  assert.equal(validate(data), true, ajv.errorsText(validate.errors));
  assert.doesNotThrow(() => assertCatalogIntegrity(data, manifest));
});

test("source input order cannot change the generated snapshot", () => {
  const inputs = fixture();
  const first = buildEthereumCatalog(manifest, inputs);
  inputs.reverse().forEach((input) => input.documents.reverse());
  assert.deepEqual(buildEthereumCatalog(manifest, inputs), first);
});

test("missing canonical ERC counterparts prevent partial coverage", () => {
  const inputs = fixture();
  inputs[1].documents = inputs[1].documents.filter((entry) => entry.path !== "ERCS/erc-20.md");
  assert.throws(() => buildEthereumCatalog(manifest, inputs), /no canonical ERC counterpart/);
});

test("conflicting proposal numbers and divergent mirrors fail closed", () => {
  const inputs = fixture();
  inputs[0].documents[1] = doc("EIPS/eip-20.md", "eip: 20\ntitle: Conflicting proposal\nstatus: Draft\ntype: Standards Track\ncategory: Core");
  assert.throws(() => buildEthereumCatalog(manifest, inputs), /Conflicting canonical proposal number/);
  const mirrors = fixture();
  mirrors[1].documents[1].content = mirrors[1].documents[1].content.replace("EIP Purpose and Guidelines", "Different title");
  assert.throws(() => buildEthereumCatalog(manifest, mirrors), /differs from its canonical metadata/);
});

test("filenames, source repositories and unknown Markdown cannot escape source accounting", () => {
  const inputs = fixture();
  inputs[0].documents[0].path = "EIPS/eip-2.md";
  assert.throws(() => buildEthereumCatalog(manifest, inputs), /filename\/preamble number mismatch/);
  inputs[0].documents[0].path = "EIPS/unaccounted.md";
  assert.throws(() => buildEthereumCatalog(manifest, inputs), /Unaccounted source document/);
  const badLock = structuredClone(manifest);
  badLock.sources[0].repository = "other/EIPs";
  assert.throws(() => buildEthereumCatalog(badLock, fixture()), /Invalid official source lock/);
});

test("document lifecycle stays distinct from network activation and inferred summaries", () => {
  const data = buildEthereumCatalog(manifest, fixture());
  data.proposals[2].status = "scheduled";
  assert.equal(validate(data), false);
  data.proposals[2].status = "Review";
  data.proposals[2].mainnet_active = true;
  assert.equal(validate(data), false);
  delete data.proposals[2].mainnet_active;
  data.provenance.bodies_indexed = true;
  assert.equal(validate(data), false);
});

test("official links and immutable source provenance cannot be substituted", () => {
  for (const change of [
    (entry) => { entry.url = "https://eips.ethereum.org.attacker.example/EIPS/eip-1"; },
    (entry) => { entry.url = "javascript:alert(1)"; },
    (entry) => { entry.path = "EIPS/eip-7732.md"; },
    (entry) => { entry.commit = "a".repeat(40); }
  ]) {
    const data = buildEthereumCatalog(manifest, fixture());
    change(data.proposals[0]);
    data.provenance.content_sha256 = catalogDigest(data.proposals);
    assert.throws(() => assertCatalogIntegrity(data, manifest), /provenance mismatch/);
  }
});

test("coverage and digest reveal dropped or altered metadata", () => {
  const data = buildEthereumCatalog(manifest, fixture());
  data.proposals.pop();
  data.provenance.content_sha256 = catalogDigest(data.proposals);
  assert.throws(() => assertCatalogIntegrity(data, manifest), /coverage counts/);
  const altered = buildEthereumCatalog(manifest, fixture());
  altered.proposals[0].title = "Altered metadata";
  assert.throws(() => assertCatalogIntegrity(altered, manifest), /content digest mismatch/);
});

test("current snapshot accounts for every pinned file and includes ERCs beyond tracked naming anchors", () => {
  assert.equal(validate(snapshot), true, ajv.errorsText(validate.errors));
  assert.doesNotThrow(() => assertCatalogIntegrity(snapshot, manifest));
  assert.equal(snapshot.coverage.scanned_files, 1575);
  assert.equal(snapshot.proposals.length, 1209);
  assert.equal(snapshot.coverage.duplicate_numbers.length, 366);
  assert.equal(snapshot.proposals.find((entry) => entry.number === 20).id, "erc-20");
  assert.equal(snapshot.proposals.find((entry) => entry.number === 721).title, "Non-Fungible Token Standard");
  assert.equal(snapshot.proposals.find((entry) => entry.number === 7732).status, "Last Call");
  assert.equal(snapshot.proposals.some((entry) => entry.status === "Moved"), false);
});
