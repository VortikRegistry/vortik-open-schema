import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_INDEX_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
export const SUPPORTED_INDEX_VERSION = "1.0.0";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const LOCAL_INDEX_PATH = resolve(repositoryRoot, "feeds/index.json");

function isHttpSource(source) {
  return /^https?:\/\//u.test(source);
}

async function loadJson(source, fetchImpl = globalThis.fetch) {
  if (isHttpSource(source)) {
    if (typeof fetchImpl !== "function") {
      throw new Error("A fetch implementation is required for HTTP sources");
    }

    const response = await fetchImpl(source, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch Vortik artifact: HTTP ${response.status}`);
    }

    return response.json();
  }

  return JSON.parse(await readFile(source, "utf8"));
}

function verifyAuthority(authority, label) {
  if (
    authority?.registry_scope !== "independent semantic registry"
    || authority?.protocol_authority !== false
    || authority?.ens_authority !== false
  ) {
    throw new Error(`${label} authority boundaries are missing or unsafe`);
  }
}

function verifyIndex(index) {
  if (index?.index !== "vortik-feed-index" || index.index_version !== SUPPORTED_INDEX_VERSION) {
    throw new Error("Unsupported Vortik feed index contract");
  }

  verifyAuthority(index.authority, "Feed index");

  if (!Array.isArray(index.feeds)) {
    throw new Error("Vortik feed index must contain a feeds array");
  }

  return index;
}

export function verifyFeed(entry, feed) {
  if (!entry || typeof entry !== "object") {
    throw new Error("A feed index entry is required");
  }

  if (feed?.anchor?.id !== entry.id || feed?.instance?.id !== entry.id) {
    throw new Error("Discovered feed identity does not match the index entry");
  }

  if (feed.feed !== entry.feed || feed.feed_version !== entry.feed_version) {
    throw new Error("Discovered feed contract metadata does not match the index entry");
  }

  if (feed.$schema !== entry.contract?.id) {
    throw new Error("Discovered feed schema does not match the index contract metadata");
  }

  const semanticFields = ["canonical_term", "classification", "status", "anchor_doc"];
  for (const field of semanticFields) {
    if (feed.anchor?.[field] !== entry[field]) {
      throw new Error(`Discovered feed semantic metadata does not match the index entry: ${field}`);
    }
  }

  verifyAuthority(feed.authority, "Discovered feed");
  return true;
}

export async function listFeeds(options = {}) {
  const indexSource = options.indexSource || LOCAL_INDEX_PATH;
  const index = verifyIndex(await loadJson(indexSource, options.fetchImpl));

  return index.feeds.map((entry) => structuredClone(entry));
}

export async function getFeed(id, options = {}) {
  if (!id || typeof id !== "string") {
    throw new Error("A non-empty anchor id is required");
  }

  const indexSource = options.indexSource || LOCAL_INDEX_PATH;
  const index = verifyIndex(await loadJson(indexSource, options.fetchImpl));
  const entry = index.feeds.find((candidate) => candidate.id === id);

  if (!entry) {
    throw new Error(`No public Vortik feed is indexed for anchor: ${id}`);
  }

  const publicationRoot = isHttpSource(indexSource)
    ? null
    : resolve(dirname(indexSource), "..");
  const feedSource = options.feedSource
    || (isHttpSource(indexSource) ? entry.public_url : resolve(publicationRoot, entry.path));
  const feed = await loadJson(feedSource, options.fetchImpl);

  verifyFeed(entry, feed);
  return {
    indexSource,
    feedSource,
    entry: structuredClone(entry),
    feed: structuredClone(feed)
  };
}
