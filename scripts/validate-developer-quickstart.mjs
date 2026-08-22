#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_INDEX_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
const PUBLIC_EPBS_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json";
const QUICKSTART_PATH = "docs/developer-quickstart.md";

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [readme, quickstart, indexText, feedText, pagesWorkflow] = await Promise.all([
  readText("README.md"),
  readText(QUICKSTART_PATH),
  readText("feeds/index.json"),
  readText("feeds/epbs.json"),
  readText(".github/workflows/deploy-pages.yml")
]);

const index = JSON.parse(indexText);
const feed = JSON.parse(feedText);
const epbsEntry = index.feeds?.find((entry) => entry.id === "epbs");

assert(readme.includes("30-second developer quickstart"), "README must expose the 30-second developer quickstart");
assert(readme.includes("docs/developer-quickstart.md"), "README must link the developer quickstart document");
assert(readme.includes(PUBLIC_EPBS_URL), "README must expose the public ePBS feed URL directly");
assert(quickstart.includes(`curl -fsSL ${PUBLIC_EPBS_URL}`), "Quickstart must provide a one-command ePBS fetch");
assert(quickstart.includes(`curl -fsSL ${PUBLIC_INDEX_URL}`), "Quickstart must provide the feed-index discovery command");
assert(quickstart.includes("No package install is required"), "Quickstart must make the zero-install consumption path explicit");
assert(quickstart.includes("async function main()"), "Quickstart JavaScript must avoid CommonJS-incompatible top-level await");
assert(quickstart.includes("main().catch((error) =>"), "Quickstart JavaScript must invoke and handle the async entrypoint");

assert(index.index === "vortik-feed-index", "Quickstart feed index contract id drifted");
assert(index.index_version === "1.0.0", "Quickstart feed index version drifted");
assert(index.authority?.protocol_authority === false, "Feed index must not claim protocol authority");
assert(index.authority?.ens_authority === false, "Feed index must not claim ENS authority");
assert(epbsEntry, "Feed index must advertise the ePBS feed");
assert(epbsEntry.public_url === PUBLIC_EPBS_URL, "Feed index ePBS public URL drifted from quickstart");
assert(epbsEntry.feed_version === feed.feed_version, "Feed index/feed version mismatch");
assert(epbsEntry.canonical_term === feed.anchor?.canonical_term, "Feed index/feed canonical term mismatch");

assert(feed.feed === "vortik-anchor-feed", "Quickstart ePBS artifact must remain a Vortik anchor feed");
assert(feed.feed_version === "1.0.1", "Quickstart ePBS feed version drifted");
assert(feed.anchor?.id === "epbs", "Quickstart ePBS feed anchor id drifted");
assert(feed.anchor?.ens === "epbs.eth", "Quickstart ePBS ENS label drifted");
assert(feed.anchor?.status === "implementation-facing", "Quickstart ePBS status drifted");
assert(feed.authority?.protocol_authority === false, "Quickstart ePBS feed must not claim protocol authority");
assert(feed.authority?.ens_authority === false, "Quickstart ePBS feed must not claim ENS authority");

for (const deployedPath of ["feeds/index.json", "feeds/epbs.json"]) {
  assert(pagesWorkflow.includes(deployedPath), `Pages deployment must verify ${deployedPath}`);
}

console.log("Developer quickstart contract validated");
console.log("Zero-install public ePBS consumption path is source-bound and deployment-verified");
console.log("Node 20 quickstart entrypoint is explicitly runnable without top-level await");
console.log("Protocol, ENS, admission and commercial authority remain closed");
