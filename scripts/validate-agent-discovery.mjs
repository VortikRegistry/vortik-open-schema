#!/usr/bin/env node
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function requirePath(relativePath, errors) {
  try {
    await access(resolve(root, relativePath));
  } catch {
    errors.push(`referenced path does not exist: ${relativePath}`);
  }
}

async function listFiles(relativeDir) {
  const absoluteDir = resolve(root, relativeDir);
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = resolve(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        files.push(relative(absoluteDir, entryPath).split(sep).join("/"));
      }
    }
  }

  await walk(absoluteDir);
  return files.sort();
}

function inventoryDiff(sourceFiles, publicFiles) {
  const source = new Set(sourceFiles);
  const published = new Set(publicFiles);
  return {
    missing: sourceFiles.filter((file) => !published.has(file)),
    extra: publicFiles.filter((file) => !source.has(file))
  };
}

async function verifyMirrorInventory(sourceDir, publicDir, label) {
  const [sourceFiles, publicFiles] = await Promise.all([
    listFiles(sourceDir),
    listFiles(publicDir)
  ]);
  const { missing, extra } = inventoryDiff(sourceFiles, publicFiles);

  if (missing.length > 0 || extra.length > 0) {
    const details = [
      ...missing.map((file) => `missing public mirror: ${publicDir}/${file}`),
      ...extra.map((file) => `stale public mirror: ${publicDir}/${file}`)
    ];
    throw new Error(`${label} directory inventories differ:\n${details.join("\n")}`);
  }

  for (const file of sourceFiles) {
    const [source, published] = await Promise.all([
      readText(`${sourceDir}/${file}`),
      readText(`${publicDir}/${file}`)
    ]);
    if (source !== published) {
      throw new Error(`${label} mirror must be byte-identical: ${file}`);
    }
  }
}

const schemaPath = "schemas/agents/vortik-agent-discovery/1.0.0/schema.json";
const manifestPath = "agents/discovery.json";

const [schema, manifest] = await Promise.all([
  readJson(schemaPath),
  readJson(manifestPath)
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(manifest)) {
  throw new Error(`agents/discovery.json violates the versioned discovery contract:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

const integrityErrors = [];
for (const capability of manifest.capabilities) {
  await requirePath(capability.local_entrypoint, integrityErrors);
  if (capability.contract) await requirePath(capability.contract, integrityErrors);
  if (capability.documentation) await requirePath(capability.documentation, integrityErrors);
  if (capability.request_contract) await requirePath(capability.request_contract, integrityErrors);
  if (capability.response_contract) await requirePath(capability.response_contract, integrityErrors);
}

const feedCapability = manifest.capabilities.find((entry) => entry.id === "discover_vortik_feeds");
const feedIndex = await readJson(feedCapability.local_entrypoint);
if (feedIndex.index !== "vortik-feed-index" || feedIndex.index_version !== "1.0.0") {
  integrityErrors.push("feed discovery capability does not point to vortik-feed-index 1.0.0");
}

const ensCapability = manifest.capabilities.find((entry) => entry.id === "research_ens_semantics");
const [requestContract, responseContract] = await Promise.all([
  readJson(ensCapability.request_contract),
  readJson(ensCapability.response_contract)
]);
if (requestContract.$id !== `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${ensCapability.request_contract}`) {
  integrityErrors.push("ENS research request contract id does not match the advertised canonical path");
}
if (responseContract.$id !== `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${ensCapability.response_contract}`) {
  integrityErrors.push("ENS research response contract id does not match the advertised canonical path");
}

if (integrityErrors.length > 0) {
  throw new Error(`Agent discovery manifest does not match existing public capabilities:\n${integrityErrors.join("\n")}`);
}

await verifyMirrorInventory("agents", "docs/agents", "Agent discovery");
await verifyMirrorInventory("schemas/agents", "docs/schemas/agents", "Agent discovery schema");

const staleMirrorRegression = inventoryDiff(
  ["discovery.json"],
  ["discovery.json", "obsolete.json"]
);
if (staleMirrorRegression.extra.length !== 1 || staleMirrorRegression.extra[0] !== "obsolete.json") {
  throw new Error("Agent discovery inventory validation must detect stale public mirror files");
}

for (const [label, mutate] of [
  ["a2a_server=true", (candidate) => { candidate.interaction.a2a_server = true; }],
  ["live_network_ingress=true", (candidate) => { candidate.interaction.live_network_ingress = true; }],
  ["agent_card_published=true", (candidate) => { candidate.interaction.agent_card_published = true; }],
  ["live_ens_resolution=true", (candidate) => { candidate.trust_boundary.live_ens_resolution = true; }],
  ["external_web_retrieval=true", (candidate) => { candidate.trust_boundary.external_web_retrieval = true; }],
  ["commercial_authority=true", (candidate) => { candidate.authority.commercial_authority = true; }]
]) {
  const candidate = structuredClone(manifest);
  mutate(candidate);
  if (validate(candidate)) {
    throw new Error(`Agent discovery contract must reject ${label}`);
  }
}

console.log(`agents/discovery.json conforms to vortik-agent-discovery 1.0.0 with ${manifest.capabilities.length} capability entries`);
console.log("Existing feed and ENS research references verified");
console.log("Public agent manifest/schema directory inventories verified complete and byte-identical");
console.log("EXPECTED FAIL stale public agent mirror inventory");
console.log("EXPECTED FAIL unimplemented A2A/live-network/commercial authority claims");
