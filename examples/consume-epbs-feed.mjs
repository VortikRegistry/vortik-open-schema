#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_FEED_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json";
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const localFeedPath = resolve(root, "feeds/epbs.json");
const source = process.env.VORTIK_EPBS_FEED_SOURCE || localFeedPath;

async function loadFeed(input) {
  if (/^https?:\/\//u.test(input)) {
    const response = await fetch(input, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch ePBS feed: HTTP ${response.status}`);
    }

    return response.json();
  }

  return JSON.parse(await readFile(input, "utf8"));
}

const feed = await loadFeed(source);

if (feed.feed !== "vortik-anchor-feed") {
  throw new Error(`Unexpected feed type: ${feed.feed}`);
}

if (feed.feed_version !== "1.0.1") {
  throw new Error(`Unsupported feed version: ${feed.feed_version}`);
}

if (feed.anchor?.id !== "epbs" || feed.instance?.id !== "epbs") {
  throw new Error("Feed anchor and instance must both identify ePBS");
}

if (feed.authority?.protocol_authority !== false || feed.authority?.ens_authority !== false) {
  throw new Error("Feed authority boundaries are missing or unsafe");
}

const result = {
  source,
  public_endpoint: PUBLIC_FEED_URL,
  feed_version: feed.feed_version,
  anchor: feed.anchor.id,
  canonical_term: feed.anchor.canonical_term,
  status: feed.anchor.status,
  schema: feed.$schema,
  instance_summary: feed.instance.summary,
  protocol_authority: feed.authority.protocol_authority
};

console.log(JSON.stringify(result, null, 2));
