#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { assertCatalogIntegrity } from "../lib/ethereum-catalog.mjs";

const root = new URL("../", import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), "utf8"));
const [data, schema, manifest, context] = await Promise.all([
  readJson("docs/ethereum-catalog.json"), readJson("docs/ethereum-catalog.schema.json"),
  readJson("scripts/ethereum-catalog-sources.json"), readJson("docs/protocol-context.json")
]);
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(data)) throw new Error(`Ethereum catalog contract: ${ajv.errorsText(validate.errors)}`);
assertCatalogIntegrity(data, manifest);
if (context.reviewed_at === data.reviewed_at) {
  for (const eip of context.eips) {
    const record = data.proposals.find((entry) => entry.id === `eip-${eip.number}`);
    if (!record || record.status !== eip.document_status) throw new Error(`Same-date context disagrees with official metadata for EIP-${eip.number}`);
  }
}
console.log(`Ethereum catalog valid: ${data.coverage.records} unique proposals (${data.coverage.eips} EIPs, ${data.coverage.ercs} ERCs).`);
console.log(`All ${data.coverage.scanned_files} source files accounted for; ${data.coverage.moved_stubs} moved stubs and ${data.coverage.mirrored_documents} mirror deduplicated.`);
