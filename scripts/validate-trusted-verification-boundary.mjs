#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = "schemas/verification/vortik-trusted-verification-requirements/1.0.0/schema.json";
const PUBLIC_SCHEMA_PATH = "docs/schemas/verification/vortik-trusted-verification-requirements/1.0.0/schema.json";
const REQUIREMENTS_PATH = "verification/requirements.json";
const PUBLIC_REQUIREMENTS_PATH = "docs/verification/requirements.json";

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

const [schemaText, publicSchemaText, requirementsText, publicRequirementsText] = await Promise.all([
  readText(SCHEMA_PATH),
  readText(PUBLIC_SCHEMA_PATH),
  readText(REQUIREMENTS_PATH),
  readText(PUBLIC_REQUIREMENTS_PATH)
]);

if (schemaText !== publicSchemaText) {
  throw new Error("trusted verification source schema and public mirror must be byte-identical");
}
if (requirementsText !== publicRequirementsText) {
  throw new Error("trusted verification requirements and public mirror must be byte-identical");
}

const schema = JSON.parse(schemaText);
const requirements = JSON.parse(requirementsText);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(requirements)) {
  throw new Error(`verification/requirements.json violates its closed schema:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

function assertRejected(label, mutate) {
  const candidate = structuredClone(requirements);
  mutate(candidate);
  if (validate(candidate)) {
    throw new Error(`trusted verification requirements must reject ${label}`);
  }
}

for (const [label, mutate] of [
  ["primary_source_verifier_implemented=true", (value) => { value.implementation_state.primary_source_verifier_implemented = true; }],
  ["ens_mainnet_verifier_implemented=true", (value) => { value.implementation_state.ens_mainnet_verifier_implemented = true; }],
  ["live_network_access=true", (value) => { value.implementation_state.live_network_access = true; }],
  ["trusted_receipt_issuance=true", (value) => { value.implementation_state.trusted_receipt_issuance = true; }],
  ["admission.enabled=true", (value) => { value.admission.enabled = true; }],
  ["contributor_reference_trusted=true", (value) => { value.primary_source_verification.contributor_reference_trusted = true; }],
  ["contributor_ens_claim_trusted=true", (value) => { value.ens_mainnet_verification.contributor_ens_claim_trusted = true; }],
  ["ownership_inference=true", (value) => { value.ens_mainnet_verification.ownership_inference = true; }],
  ["commercial_authority=true", (value) => { value.admission.commercial_authority = true; }],
  ["ENS chain_id other than mainnet", (value) => { value.ens_mainnet_verification.chain_id = 11155111; }],
  ["missing exact-name binding", (value) => { value.ens_mainnet_verification.exact_normalized_name_binding_required = false; }],
  ["missing block hash", (value) => { value.ens_mainnet_verification.block_hash_required = false; }],
  ["single-receipt admission", (value) => { value.admission.both_receipts_required = false; }]
]) {
  assertRejected(label, mutate);
}

console.log("Trusted verification requirements 1.0.0 validated");
console.log("Public schema and requirements mirrors verified byte-identical");
console.log("EXPECTED FAIL live verifier/network/receipt/admission claims remain closed");
console.log("EXPECTED FAIL contributor authority, ownership and commercial inference remain closed");
console.log("EXPECTED FAIL ENS verification remains mainnet/exact-name/block-bound and dual-receipt admission remains required");
