#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicBase = "https://vortikregistry.github.io/vortik-open-schema/";

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

async function collectIntegrityErrors(candidate) {
  const errors = [];
  const ids = new Set();
  const paths = new Set();
  const publicUrls = new Set();

  for (const entry of candidate.feeds ?? []) {
    if (ids.has(entry.id)) {
      errors.push(`duplicate feed id: ${entry.id}`);
    }
    ids.add(entry.id);

    if (paths.has(entry.path)) {
      errors.push(`duplicate feed path: ${entry.path}`);
    }
    paths.add(entry.path);

    if (publicUrls.has(entry.public_url)) {
      errors.push(`duplicate public URL: ${entry.public_url}`);
    }
    publicUrls.add(entry.public_url);

    let feed;
    let contract;
    try {
      feed = await readJson(entry.path);
    } catch (error) {
      errors.push(`unable to read ${entry.path}: ${error.message}`);
      continue;
    }

    try {
      contract = await readJson(entry.contract.path);
    } catch (error) {
      errors.push(`unable to read ${entry.contract.path}: ${error.message}`);
      continue;
    }

    const comparisons = [
      ["feed id", entry.id, feed.anchor?.id],
      ["feed type", entry.feed, feed.feed],
      ["feed version", entry.feed_version, feed.feed_version],
      ["canonical term", entry.canonical_term, feed.anchor?.canonical_term],
      ["classification", entry.classification, feed.anchor?.classification],
      ["status", entry.status, feed.anchor?.status],
      ["anchor document", entry.anchor_doc, feed.anchor?.anchor_doc],
      ["contract id", entry.contract.id, feed.$schema],
      ["contract file id", entry.contract.id, contract.$id],
      ["public feed URL", entry.public_url, `${publicBase}${entry.path}`],
      ["public contract URL", entry.contract.public_url, `${publicBase}${entry.contract.path}`]
    ];

    for (const [label, advertised, actual] of comparisons) {
      if (advertised !== actual) {
        errors.push(`${entry.id} ${label} mismatch: expected ${actual}, found ${advertised}`);
      }
    }

    try {
      await access(resolve(root, entry.anchor_doc));
    } catch {
      errors.push(`${entry.id} anchor document does not exist: ${entry.anchor_doc}`);
    }
  }

  return errors;
}

const indexSchema = await readJson("schemas/feeds/vortik-feed-index/1.0.0/schema.json");
const index = await readJson("feeds/index.json");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(indexSchema);

if (!validate(index)) {
  throw new Error(`feeds/index.json violates the versioned index contract:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

const integrityErrors = await collectIntegrityErrors(index);
if (integrityErrors.length > 0) {
  throw new Error(`feeds/index.json does not match its referenced artifacts:\n${integrityErrors.join("\n")}`);
}

const unsafeAuthority = structuredClone(index);
unsafeAuthority.authority.protocol_authority = true;
if (validate(unsafeAuthority)) {
  throw new Error("Feed index contract must reject protocol_authority=true");
}

const wrongVersion = structuredClone(index);
wrongVersion.index_version = "2.0.0";
if (validate(wrongVersion)) {
  throw new Error("Feed index contract must reject an unsupported index_version");
}

const duplicateFeed = structuredClone(index);
duplicateFeed.feeds.push(structuredClone(index.feeds[0]));
if ((await collectIntegrityErrors(duplicateFeed)).length === 0) {
  throw new Error("Feed index integrity checks must reject duplicate feed identifiers and paths");
}

const mismatchedVersion = structuredClone(index);
mismatchedVersion.feeds[0].feed_version = "9.9.9";
if ((await collectIntegrityErrors(mismatchedVersion)).length === 0) {
  throw new Error("Feed index integrity checks must reject metadata that does not match the referenced feed");
}

console.log(`feeds/index.json conforms to vortik-feed-index 1.0.0 with ${index.feeds.length} feed(s)`);
console.log("EXPECTED FAIL protocol_authority=true");
console.log("EXPECTED FAIL unsupported index_version");
console.log("EXPECTED FAIL duplicate feed identity");
console.log("EXPECTED FAIL mismatched feed metadata");
