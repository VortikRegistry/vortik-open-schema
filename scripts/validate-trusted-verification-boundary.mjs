#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = "schemas/verification/vortik-trusted-verification-requirements/1.1.0/schema.json";
const PUBLIC_SCHEMA_PATH = "docs/schemas/verification/vortik-trusted-verification-requirements/1.1.0/schema.json";
const REQUIREMENTS_PATH = "verification/requirements.json";
const PUBLIC_REQUIREMENTS_PATH = "docs/verification/requirements.json";

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function assertByteIdentical(label, sourceText, mirrorText) {
  if (sourceText !== mirrorText) throw new Error(`${label} must be byte-identical`);
}

function assertMirrorMismatchRejected(label, sourceText, mirrorText) {
  try {
    assertByteIdentical(label, sourceText, `${mirrorText}\n`);
  } catch {
    return;
  }
  throw new Error(`${label} mismatch regression was not rejected`);
}

const [schemaText, publicSchemaText, requirementsText, publicRequirementsText] = await Promise.all([
  readText(SCHEMA_PATH), readText(PUBLIC_SCHEMA_PATH), readText(REQUIREMENTS_PATH), readText(PUBLIC_REQUIREMENTS_PATH)
]);

assertByteIdentical("trusted verification source schema and public mirror", schemaText, publicSchemaText);
assertByteIdentical("trusted verification requirements and public mirror", requirementsText, publicRequirementsText);
assertMirrorMismatchRejected("trusted verification schema mirror", schemaText, publicSchemaText);
assertMirrorMismatchRejected("trusted verification requirements mirror", requirementsText, publicRequirementsText);

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
  if (validate(candidate)) throw new Error(`trusted verification requirements must reject ${label}`);
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
  ["single-receipt admission", (value) => { value.admission.both_receipts_required = false; }],
  ["receipt without issuer authentication", (value) => { value.receipt_integrity.issuer_authentication_required = false; }],
  ["receipt without issuer key identity", (value) => { value.receipt_integrity.issuer_key_identity_required = false; }],
  ["receipt without signing-key authorization", (value) => { value.receipt_integrity.signing_key_authorization_required = false; }],
  ["receipt without signing-key trust-policy validation", (value) => { value.receipt_integrity.signing_key_trust_policy_validation_required = false; }],
  ["receipt without signature requirement", (value) => { value.receipt_integrity.signature_required = false; }],
  ["receipt without signature validation", (value) => { value.receipt_integrity.signature_validation_required = false; }],
  ["signature not bound to complete receipt", (value) => { value.receipt_integrity.complete_receipt_authentication_binding_required = false; }],
  ["signature not bound to receipt digest", (value) => { value.receipt_integrity.signature_covers_receipt_digest_required = false; }],
  ["admission of unauthenticated receipts", (value) => { value.admission.authenticated_receipts_required = false; }],
  ["admission of unauthorized signing key", (value) => { value.admission.authorized_signing_key_required = false; }],
  ["primary source without canonical source identity", (value) => { value.primary_source_verification.canonical_source_identifier_required = false; }],
  ["primary source without repository identity", (value) => { value.primary_source_verification.repository_identity_required = false; }],
  ["primary source without immutable revision", (value) => { value.primary_source_verification.immutable_revision_required = false; }],
  ["primary source without commit revision", (value) => { value.primary_source_verification.commit_sha_required = false; }],
  ["primary source without blob revision", (value) => { value.primary_source_verification.blob_sha_required = false; }],
  ["primary source without source path", (value) => { value.primary_source_verification.source_path_required = false; }],
  ["primary source digest not verified against asserted artifact", (value) => { value.primary_source_verification.content_digest_verified_against_asserted_artifact_required = false; }],
  ["primary source bytes not bound to asserted revision", (value) => { value.primary_source_verification.retrieved_bytes_bound_to_asserted_revision_required = false; }],
  ["ENS negative/null/indeterminate result acceptance", (value) => { value.ens_mainnet_verification.negative_null_or_indeterminate_result_rejected = false; }],
  ["ENS receipt without affirmative existence", (value) => { value.ens_mainnet_verification.affirmative_existence_result_required = false; }],
  ["ENS exists-but-expired result", (value) => { value.ens_mainnet_verification.active_registration_result_required = false; }],
  ["ENS result without registration expiry", (value) => { value.ens_mainnet_verification.registration_expiry_required = false; }],
  ["ENS result without observed block timestamp", (value) => { value.ens_mainnet_verification.block_timestamp_required = false; }],
  ["ENS expiry not required after observed block timestamp", (value) => { value.ens_mainnet_verification.registration_expiry_after_block_timestamp_required = false; }],
  ["ENS block number/hash not bound as one asserted block", (value) => { value.ens_mainnet_verification.asserted_block_number_hash_binding_required = false; }],
  ["ENS lookup result not bound to asserted block", (value) => { value.ens_mainnet_verification.lookup_result_bound_to_asserted_block_required = false; }],
  ["ENS lookup result digest not bound to asserted block", (value) => { value.ens_mainnet_verification.lookup_result_digest_bound_to_asserted_block_required = false; }],
  ["ENS block timestamp not bound to asserted block", (value) => { value.ens_mainnet_verification.block_timestamp_bound_to_asserted_block_required = false; }],
  ["mismatched contribution/name subject acceptance", (value) => {
    value.admission.same_subject_binding_required = false;
    value.receipt_integrity.normalized_candidate_name_required = false;
  }]
]) {
  assertRejected(label, mutate);
}

console.log("Trusted verification requirements 1.1.0 validated");
console.log("Public schema and requirements mirrors verified byte-identical");
console.log("EXPECTED FAIL live verifier/network/receipt/admission claims remain closed");
console.log("EXPECTED FAIL contributor authority, ownership and commercial inference remain closed");
console.log("EXPECTED FAIL unauthenticated, unauthorized or partially signed receipts and mutable/unidentified primary-source evidence remain closed");
console.log("EXPECTED FAIL negative, null, indeterminate, expired, cross-block or block-time-unbound ENS evidence remains closed");
console.log("EXPECTED FAIL cross-receipt subject mismatch and public-mirror divergence remain closed");
