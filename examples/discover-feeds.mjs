#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_INDEX_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const localIndexPath = resolve(root, "feeds/index.json");
const indexSource = process.env.VORTIK_FEED_INDEX_SOURCE || localIndexPath;
const requestedAnchor = process.env.VORTIK_ANCHOR_ID || "epbs";

async function loadJson(input) {
  if (/^https?:\/\//u.test(input)) {
    const response = await fetch(input, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch Vortik artifact: HTTP ${response.status}`);
    }

    return response.json();
  }

  return JSON.parse(await readFile(input, "utf8"));
}

const index = await loadJson(indexSource);

if (index.index !== "vortik-feed-index" || index.index_version !== "1.0.0") {
  throw new Error("Unsupported Vortik feed index contract");
}

if (index.authority?.protocol_authority !== false || index.authority?.ens_authority !== false) {
  throw new Error("Feed index authority boundaries are missing or unsafe");
}

const entry = index.feeds?.find((candidate) => candidate.id === requestedAnchor);
if (!entry) {
  throw new Error(`No public Vortik feed is indexed for anchor: ${requestedAnchor}`);
}

const remoteIndex = /^https?:\/\//u.test(indexSource);
const feedSource = process.env.VORTIK_FEED_SOURCE
  || (remoteIndex ? entry.public_url : resolve(root, entry.path));

const feed = await loadJson(feedSource);

if (feed.anchor?.id !== entry.id || feed.instance?.id !== entry.id) {
  throw new Error("Discovered feed identity does not match the index entry");
}

if (feed.feed !== entry.feed || feed.feed_version !== entry.feed_version) {
  throw new Error("Discovered feed contract metadata does not match the index entry");
}

if (feed.$schema !== entry.contract?.id) {
  throw new Error("Discovered feed schema does not match the index contract metadata");
}

if (feed.authority?.protocol_authority !== false || feed.authority?.ens_authority !== false) {
  throw new Error("Discovered feed authority boundaries are missing or unsafe");
}

console.log(JSON.stringify({
  index_source: indexSource,
  public_index: PUBLIC_INDEX_URL,
  requested_anchor: requestedAnchor,
  feed_source: feedSource,
  feed: entry.feed,
  feed_version: entry.feed_version,
  canonical_term: entry.canonical_term,
  status: entry.status,
  contract: entry.contract.id,
  protocol_authority: feed.authority.protocol_authority
}, null, 2));
