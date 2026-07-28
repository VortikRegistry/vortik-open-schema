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

const INDEX_SCHEMA_ID = "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/feeds/vortik-feed-index/1.0.0/schema.json";
const INDEX_KEYS = new Set(["$schema", "index", "index_version", "registry", "feeds", "authority", "generated_from"]);
const REGISTRY_KEYS = new Set(["name", "version", "last_updated", "source_of_truth"]);
const INDEX_ENTRY_KEYS = new Set(["id", "feed", "feed_version", "canonical_term", "classification", "status", "path", "public_url", "anchor_doc", "contract"]);
const CONTRACT_KEYS = new Set(["path", "id", "public_url"]);
const AUTHORITY_KEYS = new Set(["registry_scope", "protocol_authority", "ens_authority", "note"]);
const FEED_KEYS = new Set(["$schema", "feed", "feed_version", "registry", "anchor", "instance", "authority", "generated_from"]);
const ANCHOR_KEYS = new Set(["id", "ens", "canonical_term", "classification", "status", "stage", "type", "role", "schema_path", "schema_id", "anchor_doc"]);

function assertClosedObject(value, allowedKeys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }

  const unexpected = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (unexpected.length > 0) {
    throw new Error(`${label} contains unexpected fields: ${unexpected.sort().join(", ")}`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertSemanticVersion(value, label) {
  if (typeof value !== "string" || !/^[0-9]+\.[0-9]+\.[0-9]+$/u.test(value)) {
    throw new Error(`${label} must be a semantic version`);
  }
}

function assertHttpsUrl(value, label) {
  assertNonEmptyString(value, label);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS`);
  }
}

function assertStringArray(value, label, minimumItems) {
  if (!Array.isArray(value) || value.length < minimumItems) {
    throw new Error(`${label} must contain at least ${minimumItems} items`);
  }

  for (const item of value) assertNonEmptyString(item, `${label} item`);
  if (new Set(value).size !== value.length) {
    throw new Error(`${label} must not contain duplicate items`);
  }
}

function verifyRegistryMetadata(registry, label) {
  assertClosedObject(registry, REGISTRY_KEYS, label);
  assertNonEmptyString(registry.name, `${label} name`);
  assertSemanticVersion(registry.version, `${label} version`);
  if (typeof registry.last_updated !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(registry.last_updated)) {
    throw new Error(`${label} last_updated must be an ISO date`);
  }
  if (registry.source_of_truth !== "schemas") {
    throw new Error(`${label} source_of_truth must be schemas`);
  }
}

function verifyAnchorMetadata(anchor) {
  assertClosedObject(anchor, ANCHOR_KEYS, "Discovered feed anchor");
  for (const key of ANCHOR_KEYS) {
    assertNonEmptyString(anchor[key], `Discovered feed anchor ${key}`);
  }
}

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

function assertRemoteIndexFeedSource(indexSource, feedSource) {
  if (isHttpSource(indexSource) && !isHttpSource(feedSource)) {
    throw new Error("Remote feed indexes must advertise an HTTPS feed URL");
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
  assertClosedObject(authority, AUTHORITY_KEYS, `${label} authority`);
  assertNonEmptyString(authority.note, `${label} authority note`);

  if (
    authority.registry_scope !== "independent semantic registry"
    || authority.protocol_authority !== false
    || authority.ens_authority !== false
  ) {
    throw new Error(`${label} authority boundaries are missing or unsafe`);
  }
}

function verifyIndexEntry(entry) {
  assertClosedObject(entry, INDEX_ENTRY_KEYS, "Feed index entry");

  if (!/^[a-z0-9-]+$/u.test(entry.id || "")) {
    throw new Error("Feed index entry id is invalid");
  }

  assertNonEmptyString(entry.feed, "Feed index entry feed");
  assertSemanticVersion(entry.feed_version, "Feed index entry feed_version");
  for (const field of ["canonical_term", "classification", "status"]) {
    assertNonEmptyString(entry[field], `Feed index entry ${field}`);
  }

  if (!/^feeds\/[a-z0-9-]+\.json$/u.test(entry.path || "")) {
    throw new Error("Feed index entry path is unsafe");
  }
  assertHttpsUrl(entry.public_url, "Feed index entry public_url");
  if (typeof entry.anchor_doc !== "string" || !/^anchors\/.+\.md$/u.test(entry.anchor_doc)) {
    throw new Error("Feed index entry anchor_doc is unsafe");
  }

  assertClosedObject(entry.contract, CONTRACT_KEYS, "Feed index entry contract");
  if (typeof entry.contract.path !== "string" || !/^schemas\/.+\/schema\.json$/u.test(entry.contract.path)) {
    throw new Error("Feed index entry contract path is unsafe");
  }
  assertHttpsUrl(entry.contract.id, "Feed index entry contract id");
  assertHttpsUrl(entry.contract.public_url, "Feed index entry contract public_url");
}

function verifyIndex(index) {
  assertClosedObject(index, INDEX_KEYS, "Feed index");
  verifyRegistryMetadata(index.registry, "Feed index registry metadata");
  if (index.$schema !== INDEX_SCHEMA_ID) {
    throw new Error("Unsupported Vortik feed index schema");
  }

  if (index.index !== "vortik-feed-index" || index.index_version !== SUPPORTED_INDEX_VERSION) {
    throw new Error("Unsupported Vortik feed index contract");
  }

  verifyAuthority(index.authority, "Feed index");

  if (!Array.isArray(index.feeds)) {
    throw new Error("Vortik feed index must contain a feeds array");
  }

  for (const entry of index.feeds) verifyIndexEntry(entry);
  if (new Set(index.feeds.map((entry) => entry.id)).size !== index.feeds.length) {
    throw new Error("Vortik feed index contains duplicate ids");
  }
  assertStringArray(index.generated_from, "Feed index generated_from", 2);
  return index;
}

export function verifyFeed(entry, feed) {
  verifyIndexEntry(entry);
  assertClosedObject(feed, FEED_KEYS, "Discovered feed");
  verifyRegistryMetadata(feed.registry, "Discovered feed registry metadata");
  verifyAnchorMetadata(feed.anchor);
  if (!feed.instance || typeof feed.instance !== "object" || Array.isArray(feed.instance)) {
    throw new Error("Discovered feed instance must be an object");
  }
  assertStringArray(feed.generated_from, "Discovered feed generated_from", 4);

  if (feed.anchor.id !== entry.id || feed.instance.id !== entry.id) {
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

  assertRemoteIndexFeedSource(indexSource, feedSource);

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
