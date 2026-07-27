import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PUBLIC_INDEX_URL = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
export const SUPPORTED_INDEX_VERSION = "1.0.0";
export const DEFAULT_ALLOWED_ORIGINS = Object.freeze([
  new URL(PUBLIC_INDEX_URL).origin
]);

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const LOCAL_INDEX_PATH = resolve(repositoryRoot, "feeds/index.json");

function isHttpSource(source) {
  return /^https?:\/\//u.test(source);
}

function normalizeAllowedOrigins(indexSource, allowedOrigins = DEFAULT_ALLOWED_ORIGINS) {
  if (!Array.isArray(allowedOrigins) || allowedOrigins.length === 0) {
    throw new Error("At least one allowed HTTP origin is required");
  }

  const normalized = new Set(allowedOrigins.map((origin) => new URL(origin).origin));
  if (isHttpSource(indexSource)) normalized.add(new URL(indexSource).origin);
  return normalized;
}

function assertAllowedHttpSource(source, allowedOrigins, label) {
  if (!isHttpSource(source)) return;

  const url = new URL(source);
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS`);
  }

  if (!allowedOrigins.has(url.origin)) {
    throw new Error(`${label} origin is not allowed: ${url.origin}`);
  }
}

async function loadJson(source, options = {}) {
  if (isHttpSource(source)) {
    const fetchImpl = options.fetchImpl || globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      throw new Error("A fetch implementation is required for HTTP sources");
    }

    assertAllowedHttpSource(source, options.allowedOrigins, options.label || "Vortik artifact");
    const response = await fetchImpl(source, {
      headers: { accept: "application/json" },
      redirect: "error"
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

function verifyIndexEntry(entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error("Feed index entries must be objects");
  }

  if (!/^[a-z0-9-]+$/u.test(entry.id || "")) {
    throw new Error("Feed index entry id is invalid");
  }

  if (!/^feeds\/[a-z0-9-]+\.json$/u.test(entry.path || "")) {
    throw new Error("Feed index entry path is unsafe");
  }

  if (!entry.contract || typeof entry.contract.id !== "string") {
    throw new Error("Feed index entry contract metadata is missing");
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

  for (const entry of index.feeds) verifyIndexEntry(entry);
  return index;
}

export function verifyFeed(entry, feed) {
  verifyIndexEntry(entry);

  if (feed?.anchor?.id !== entry.id || feed?.instance?.id !== entry.id) {
    throw new Error("Discovered feed identity does not match the index entry");
  }

  if (feed.feed !== entry.feed || feed.feed_version !== entry.feed_version) {
    throw new Error("Discovered feed contract metadata does not match the index entry");
  }

  if (feed.$schema !== entry.contract.id) {
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
  const allowedOrigins = normalizeAllowedOrigins(indexSource, options.allowedOrigins);
  const index = verifyIndex(await loadJson(indexSource, {
    fetchImpl: options.fetchImpl,
    allowedOrigins,
    label: "Feed index"
  }));

  return index.feeds.map((entry) => structuredClone(entry));
}

export async function getFeed(id, options = {}) {
  if (!id || typeof id !== "string") {
    throw new Error("A non-empty anchor id is required");
  }

  const indexSource = options.indexSource || LOCAL_INDEX_PATH;
  const allowedOrigins = normalizeAllowedOrigins(indexSource, options.allowedOrigins);
  const index = verifyIndex(await loadJson(indexSource, {
    fetchImpl: options.fetchImpl,
    allowedOrigins,
    label: "Feed index"
  }));
  const entry = index.feeds.find((candidate) => candidate.id === id);

  if (!entry) {
    throw new Error(`No public Vortik feed is indexed for anchor: ${id}`);
  }

  const publicationRoot = isHttpSource(indexSource)
    ? null
    : resolve(dirname(indexSource), "..");
  const feedSource = options.feedSource
    || (isHttpSource(indexSource) ? entry.public_url : resolve(publicationRoot, entry.path));
  const feed = await loadJson(feedSource, {
    fetchImpl: options.fetchImpl,
    allowedOrigins,
    label: "Discovered feed"
  });

  verifyFeed(entry, feed);
  return {
    indexSource,
    feedSource,
    entry: structuredClone(entry),
    feed: structuredClone(feed)
  };
}
