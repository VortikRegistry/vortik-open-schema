import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

const registry = await readJson("registry.json");
const anchor = registry.anchors.find((entry) => entry.id === "epbs");
if (!anchor) {
  throw new Error("Registry entry 'epbs' was not found");
}

const schema = await readJson(anchor.schema);
const example = await readJson("examples/epbs.valid.json");

const feed = {
  feed: "vortik-anchor-feed",
  feed_version: "1.0.0",
  registry: {
    name: registry.registry,
    version: registry.version,
    last_updated: registry.last_updated,
    source_of_truth: registry.source_of_truth
  },
  anchor: {
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    classification: anchor.classification,
    status: anchor.status,
    stage: anchor.stage,
    type: anchor.type,
    role: anchor.role,
    schema_path: anchor.schema,
    schema_id: schema.$id,
    anchor_doc: anchor.anchor_doc
  },
  instance: example,
  authority: {
    registry_scope: "independent semantic registry",
    protocol_authority: false,
    ens_authority: false,
    note: "This feed is a Vortik semantic artifact, not an official Ethereum protocol specification."
  },
  generated_from: [
    "registry.json",
    anchor.schema,
    "examples/epbs.valid.json"
  ]
};

const outputPath = resolve(root, "feeds/epbs.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
console.log("Generated feeds/epbs.json");
