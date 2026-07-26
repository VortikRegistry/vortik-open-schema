#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

const feedSchema = await readJson("schemas/feeds/vortik-anchor-feed/1.0.0/schema.json");
const epbsSchema = await readJson("schemas/epbs/1.0-draft/schema.json");
const feed = await readJson("feeds/epbs.json");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(epbsSchema);
const validate = ajv.compile(feedSchema);

if (!validate(feed)) {
  throw new Error(`feeds/epbs.json violates the versioned feed contract:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

const unsafeAuthority = structuredClone(feed);
unsafeAuthority.authority.protocol_authority = true;
if (validate(unsafeAuthority)) {
  throw new Error("Feed contract must reject protocol_authority=true");
}

const wrongVersion = structuredClone(feed);
wrongVersion.feed_version = "2.0.0";
if (validate(wrongVersion)) {
  throw new Error("Feed contract must reject an unsupported feed_version");
}

const mismatchedAnchor = structuredClone(feed);
mismatchedAnchor.anchor.id = "ssf";
mismatchedAnchor.anchor.ens = "fastfinality.eth";
mismatchedAnchor.anchor.schema_path = "schemas/ssf/0.1-research/schema.json";
mismatchedAnchor.anchor.schema_id = "https://example.org/schemas/ssf/schema.json";
mismatchedAnchor.anchor.anchor_doc = "anchors/ssf.md";
if (validate(mismatchedAnchor)) {
  throw new Error("Feed contract must reject anchor metadata that does not match the ePBS instance schema");
}

console.log("feeds/epbs.json conforms to vortik-anchor-feed 1.0.0");
console.log("EXPECTED FAIL protocol_authority=true");
console.log("EXPECTED FAIL unsupported feed_version");
console.log("EXPECTED FAIL mismatched anchor metadata");
