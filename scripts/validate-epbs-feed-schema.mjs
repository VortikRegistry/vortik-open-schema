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

const feedSchema = await readJson("schemas/feeds/vortik-anchor-feed/1.0.1/schema.json");
const epbsSchema = await readJson("schemas/epbs/1.0-draft/schema.json");
const feed = await readJson("feeds/epbs.json");

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(epbsSchema);
const validate = ajv.compile(feedSchema);

if (!validate(feed)) {
  throw new Error(`feeds/epbs.json violates the versioned feed contract:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

function expectRejected(label, mutate) {
  const candidate = structuredClone(feed);
  mutate(candidate);
  if (validate(candidate)) {
    throw new Error(`Feed contract must reject ${label}`);
  }
}

expectRejected("protocol_authority=true", (candidate) => {
  candidate.authority.protocol_authority = true;
});

expectRejected("an unsupported feed_version", (candidate) => {
  candidate.feed_version = "2.0.0";
});

const anchorBindingCases = [
  ["anchor.id", (candidate) => { candidate.anchor.id = "ssf"; }],
  ["anchor.ens", (candidate) => { candidate.anchor.ens = "fastfinality.eth"; }],
  ["anchor.schema_path", (candidate) => { candidate.anchor.schema_path = "schemas/ssf/0.1-research/schema.json"; }],
  ["anchor.schema_id", (candidate) => { candidate.anchor.schema_id = "https://example.org/schemas/ssf/schema.json"; }],
  ["anchor.anchor_doc", (candidate) => { candidate.anchor.anchor_doc = "anchors/ssf.md"; }]
];

for (const [label, mutate] of anchorBindingCases) {
  expectRejected(`${label} that does not match the ePBS instance schema`, mutate);
}

console.log("feeds/epbs.json conforms to vortik-anchor-feed 1.0.1");
console.log("EXPECTED FAIL protocol_authority=true");
console.log("EXPECTED FAIL unsupported feed_version");
for (const [label] of anchorBindingCases) {
  console.log(`EXPECTED FAIL mismatched ${label}`);
}
