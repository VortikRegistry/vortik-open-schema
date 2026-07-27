import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const rawBase = "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/";
const publicBase = "https://vortikregistry.github.io/vortik-open-schema/";
const indexSchemaPath = "schemas/feeds/vortik-feed-index/1.0.0/schema.json";
const indexSchemaId = `${rawBase}${indexSchemaPath}`;

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

const feedFilenames = (await readdir(resolve(root, "feeds")))
  .filter((filename) => filename.endsWith(".json") && filename !== "index.json")
  .sort();

if (feedFilenames.length === 0) {
  throw new Error("No machine feeds were found in feeds/");
}

const feedEntries = [];
let registryMetadata;

for (const filename of feedFilenames) {
  const feedPath = `feeds/${filename}`;
  const feed = await readJson(feedPath);

  if (!feed.$schema?.startsWith(rawBase)) {
    throw new Error(`${feedPath} must declare a repository-local raw GitHub schema URL`);
  }

  const contractPath = feed.$schema.slice(rawBase.length);
  const currentRegistry = feed.registry;

  if (!registryMetadata) {
    registryMetadata = currentRegistry;
  } else if (JSON.stringify(currentRegistry) !== JSON.stringify(registryMetadata)) {
    throw new Error(`${feedPath} registry metadata does not match the other feeds`);
  }

  feedEntries.push({
    id: feed.anchor.id,
    feed: feed.feed,
    feed_version: feed.feed_version,
    canonical_term: feed.anchor.canonical_term,
    classification: feed.anchor.classification,
    status: feed.anchor.status,
    path: feedPath,
    public_url: `${publicBase}${feedPath}`,
    anchor_doc: feed.anchor.anchor_doc,
    contract: {
      path: contractPath,
      id: feed.$schema,
      public_url: `${publicBase}${contractPath}`
    }
  });
}

feedEntries.sort((left, right) => left.id.localeCompare(right.id));

const index = {
  $schema: indexSchemaId,
  index: "vortik-feed-index",
  index_version: "1.0.0",
  registry: registryMetadata,
  feeds: feedEntries,
  authority: {
    registry_scope: "independent semantic registry",
    protocol_authority: false,
    ens_authority: false,
    note: "This index lists Vortik semantic feeds and does not define Ethereum protocol rules or ENS authority."
  },
  generated_from: [
    indexSchemaPath,
    ...feedEntries.map((entry) => entry.path)
  ]
};

const outputPath = resolve(root, "feeds/index.json");
const expectedOutput = `${JSON.stringify(index, null, 2)}\n`;

if (checkOnly) {
  let committedOutput;
  try {
    committedOutput = await readFile(outputPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error("feeds/index.json is missing; run npm run generate:feed-index");
    }
    throw error;
  }

  if (committedOutput !== expectedOutput) {
    throw new Error("feeds/index.json is stale; run npm run generate:feed-index and commit the result");
  }

  console.log("feeds/index.json is synchronized with the available machine feeds");
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, expectedOutput, "utf8");
  console.log(`Generated feeds/index.json with ${feedEntries.length} feed(s)`);
}
