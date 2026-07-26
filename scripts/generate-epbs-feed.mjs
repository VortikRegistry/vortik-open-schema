import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const feedSchemaPath = "schemas/feeds/vortik-anchor-feed/1.0.1/schema.json";
const feedSchemaId = `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${feedSchemaPath}`;

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
  $schema: feedSchemaId,
  feed: "vortik-anchor-feed",
  feed_version: "1.0.1",
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
    feedSchemaPath,
    anchor.schema,
    "examples/epbs.valid.json"
  ]
};

const outputPath = resolve(root, "feeds/epbs.json");
const expectedOutput = `${JSON.stringify(feed, null, 2)}\n`;

if (checkOnly) {
  let committedOutput;
  try {
    committedOutput = await readFile(outputPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error("feeds/epbs.json is missing; run npm run generate:epbs-feed");
    }
    throw error;
  }

  if (committedOutput !== expectedOutput) {
    throw new Error("feeds/epbs.json is stale; run npm run generate:epbs-feed and commit the result");
  }

  console.log("feeds/epbs.json is synchronized with its canonical inputs");
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, expectedOutput, "utf8");
  console.log("Generated feeds/epbs.json");
}
