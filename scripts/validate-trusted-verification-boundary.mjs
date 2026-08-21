#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATH = "schemas/verification/vortik-trusted-verification-requirements/1.3.0/schema.json";
const PUBLIC_SCHEMA_PATH = "docs/schemas/verification/vortik-trusted-verification-requirements/1.3.0/schema.json";
const HISTORICAL_SCHEMA_PATH = "schemas/verification/vortik-trusted-verification-requirements/1.2.0/schema.json";
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

const [schemaText, publicSchemaText, historicalSchemaText, requirementsText, publicRequirementsText] = await Promise.all([
  readText(SCHEMA_PATH),
  readText(PUBLIC_SCHEMA_PATH),
  readText(HISTORICAL_SCHEMA_PATH),
  readText(REQUIREMENTS_PATH),
  readText(PUBLIC_REQUIREMENTS_PATH)
]);

assertByteIdentical("trusted verification source schema and public mirror", schemaText, publicSchemaText);
assertByteIdentical("trusted verification requirements and public mirror", requirementsText, publicRequirementsText);
assertMirrorMismatchRejected("trusted verification schema mirror", schemaText, publicSchemaText);
assertMirrorMismatchRejected("trusted verification requirements mirror", requirementsText, publicRequirementsText);

const historicalSchema = JSON.parse(historicalSchemaText);
if (historicalSchema?.properties?.requirements_version?.const !== "1.2.0" ||
    historicalSchema?.properties?.implementation_state?.properties?.mode?.const !== "primary_source_verifier" ||
    historicalSchema?.properties?.implementation_state?.properties?.primary_source_verifier_implemented?.const !== true ||
    historicalSchema?.properties?.implementation_state?.properties?.ens_mainnet_verifier_implemented?.const !== false ||
    historicalSchema?.properties?.implementation_state?.properties?.live_network_access?.const !== true ||
    historicalSchema?.properties?.implementation_state?.properties?.trusted_receipt_issuance?.const !== false) {
  throw new Error("historical trusted verification requirements 1.2.0 semantics must remain unchanged");
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
  if (validate(candidate)) throw new Error(`trusted verification requirements must reject ${label}`);
}

for (const [label, mutate] of [
  ["implementation mode regressing to primary_source_verifier", (v) => { v.implementation_state.mode = "primary_source_verifier"; }],
  ["primary_source_verifier_implemented=false", (v) => { v.implementation_state.primary_source_verifier_implemented = false; }],
  ["ens_mainnet_verifier_implemented=false", (v) => { v.implementation_state.ens_mainnet_verifier_implemented = false; }],
  ["live_network_access=false", (v) => { v.implementation_state.live_network_access = false; }],
  ["trusted_receipt_issuance=true", (v) => { v.implementation_state.trusted_receipt_issuance = true; }],
  ["admission.enabled=true", (v) => { v.admission.enabled = true; }],
  ["contributor_reference_trusted=true", (v) => { v.primary_source_verification.contributor_reference_trusted = true; }],
  ["contributor_ens_claim_trusted=true", (v) => { v.ens_mainnet_verification.contributor_ens_claim_trusted = true; }],
  ["ownership_inference=true", (v) => { v.ens_mainnet_verification.ownership_inference = true; }],
  ["commercial_authority=true", (v) => { v.admission.commercial_authority = true; }],
  ["ENS chain_id other than mainnet", (v) => { v.ens_mainnet_verification.chain_id = 11155111; }],
  ["missing exact-name binding", (v) => { v.ens_mainnet_verification.exact_normalized_name_binding_required = false; }],
  ["missing block hash", (v) => { v.ens_mainnet_verification.block_hash_required = false; }],
  ["single-receipt admission", (v) => { v.admission.both_receipts_required = false; }],
  ["receipt without issuer authentication", (v) => { v.receipt_integrity.issuer_authentication_required = false; }],
  ["receipt without issuer key identity", (v) => { v.receipt_integrity.issuer_key_identity_required = false; }],
  ["receipt without signing-key authorization", (v) => { v.receipt_integrity.signing_key_authorization_required = false; }],
  ["receipt without signing-key trust-policy validation", (v) => { v.receipt_integrity.signing_key_trust_policy_validation_required = false; }],
  ["receipt without signature requirement", (v) => { v.receipt_integrity.signature_required = false; }],
  ["receipt without signature validation", (v) => { v.receipt_integrity.signature_validation_required = false; }],
  ["signature not bound to complete receipt", (v) => { v.receipt_integrity.complete_receipt_authentication_binding_required = false; }],
  ["signature not bound to receipt digest", (v) => { v.receipt_integrity.signature_covers_receipt_digest_required = false; }],
  ["receipt without trusted issued_at", (v) => { v.receipt_integrity.trusted_issued_at_required = false; }],
  ["receipt without trusted clock source", (v) => { v.receipt_integrity.trusted_clock_source_required = false; }],
  ["receipt without trusted-clock policy validation", (v) => { v.receipt_integrity.trusted_clock_source_policy_validation_required = false; }],
  ["caller-controlled trusted issued_at", (v) => { v.receipt_integrity.trusted_issued_at_not_caller_controlled_required = false; }],
  ["receipt without admission_valid_until", (v) => { v.receipt_integrity.admission_valid_until_required = false; }],
  ["receipt admission validity longer than 24h", (v) => { v.receipt_integrity.max_admission_validity_seconds = 86401; }],
  ["receipt validity not bounded by trusted_issued_at window", (v) => { v.receipt_integrity.admission_valid_until_not_after_trusted_issued_at_plus_max_window_required = false; }],
  ["receipt validity not bounded by registration expiry", (v) => { v.receipt_integrity.admission_valid_until_not_after_registration_expiry_required = false; }],
  ["admission of unauthenticated receipts", (v) => { v.admission.authenticated_receipts_required = false; }],
  ["admission of unauthorized signing key", (v) => { v.admission.authorized_signing_key_required = false; }],
  ["admission without freshness validation", (v) => { v.admission.freshness_validation_required = false; }],
  ["admission without trusted admission time", (v) => { v.admission.trusted_admission_time_required = false; }],
  ["admission without trusted admission clock source", (v) => { v.admission.trusted_admission_clock_source_required = false; }],
  ["admission clock not validated by policy", (v) => { v.admission.trusted_admission_clock_source_policy_validation_required = false; }],
  ["caller-controlled trusted admission time", (v) => { v.admission.trusted_admission_time_not_caller_controlled_required = false; }],
  ["admission time allowed before trusted issued_at", (v) => { v.admission.trusted_admission_time_not_before_trusted_issued_at_required = false; }],
  ["freshness not checked against trusted admission time", (v) => { v.admission.freshness_validation_against_trusted_admission_time_required = false; }],
  ["expired receipt usable at admission", (v) => { v.admission.receipt_not_expired_at_admission_required = false; }],
  ["receipt expiry not checked at trusted admission time", (v) => { v.admission.receipt_not_expired_at_trusted_admission_time_required = false; }],
  ["primary source without canonical source identity", (v) => { v.primary_source_verification.canonical_source_identifier_required = false; }],
  ["primary source without repository identity", (v) => { v.primary_source_verification.repository_identity_required = false; }],
  ["primary source without immutable revision", (v) => { v.primary_source_verification.immutable_revision_required = false; }],
  ["primary source without commit revision", (v) => { v.primary_source_verification.commit_sha_required = false; }],
  ["primary source without blob revision", (v) => { v.primary_source_verification.blob_sha_required = false; }],
  ["primary source without source path", (v) => { v.primary_source_verification.source_path_required = false; }],
  ["primary source digest not verified against asserted artifact", (v) => { v.primary_source_verification.content_digest_verified_against_asserted_artifact_required = false; }],
  ["primary source bytes not bound to asserted revision", (v) => { v.primary_source_verification.retrieved_bytes_bound_to_asserted_revision_required = false; }],
  ["ENS negative/null/indeterminate result acceptance", (v) => { v.ens_mainnet_verification.negative_null_or_indeterminate_result_rejected = false; }],
  ["ENS receipt without affirmative existence", (v) => { v.ens_mainnet_verification.affirmative_existence_result_required = false; }],
  ["ENS exists-but-expired result", (v) => { v.ens_mainnet_verification.active_registration_result_required = false; }],
  ["ENS result without registration expiry", (v) => { v.ens_mainnet_verification.registration_expiry_required = false; }],
  ["ENS expiry not bound to normalized name", (v) => { v.ens_mainnet_verification.registration_expiry_bound_to_exact_normalized_name_required = false; }],
  ["ENS expiry not bound to lookup result", (v) => { v.ens_mainnet_verification.registration_expiry_bound_to_lookup_result_required = false; }],
  ["ENS expiry not bound to asserted block", (v) => { v.ens_mainnet_verification.registration_expiry_bound_to_asserted_block_required = false; }],
  ["ENS result without observed block timestamp", (v) => { v.ens_mainnet_verification.block_timestamp_required = false; }],
  ["ENS expiry not required after observed block timestamp", (v) => { v.ens_mainnet_verification.registration_expiry_after_block_timestamp_required = false; }],
  ["ENS block number/hash not bound as one asserted block", (v) => { v.ens_mainnet_verification.asserted_block_number_hash_binding_required = false; }],
  ["ENS lookup result not bound to asserted block", (v) => { v.ens_mainnet_verification.lookup_result_bound_to_asserted_block_required = false; }],
  ["ENS lookup result digest not bound to asserted block", (v) => { v.ens_mainnet_verification.lookup_result_digest_bound_to_asserted_block_required = false; }],
  ["ENS block timestamp not bound to asserted block", (v) => { v.ens_mainnet_verification.block_timestamp_bound_to_asserted_block_required = false; }],
  ["ENS evidence not required from finalized block", (v) => { v.ens_mainnet_verification.finalized_block_required = false; }],
  ["ENS block age greater than 30 minutes", (v) => { v.ens_mainnet_verification.max_block_age_seconds = 1801; }],
  ["ENS block freshness not checked against trusted issued_at", (v) => { v.ens_mainnet_verification.block_freshness_against_trusted_issued_at_required = false; }],
  ["future-dated ENS block timestamp acceptance", (v) => { v.ens_mainnet_verification.block_timestamp_not_after_trusted_issued_at_required = false; }],
  ["ENS registration expiry not required after trusted issued_at", (v) => { v.ens_mainnet_verification.registration_expiry_after_trusted_issued_at_required = false; }],
  ["mismatched contribution/name subject acceptance", (v) => {
    v.admission.same_subject_binding_required = false;
    v.receipt_integrity.normalized_candidate_name_required = false;
  }]
]) {
  assertRejected(label, mutate);
}

console.log("Trusted verification requirements 1.3.0 validated");
console.log("Historical 1.2.0 primary-source-verifier semantics preserved");
console.log("Public schema and requirements mirrors verified byte-identical");
console.log("Primary-source and ENS mainnet verifiers plus bounded live network state are machine-readable and fixed true");
console.log("EXPECTED FAIL trusted receipt issuance and candidate admission remain closed");
console.log("EXPECTED FAIL contributor authority, ownership and commercial inference remain closed");
console.log("EXPECTED FAIL unauthenticated, unauthorized, stale or partially signed receipts and mutable/unidentified primary-source evidence remain closed");
console.log("EXPECTED FAIL negative, null, indeterminate, expired, stale, future-dated, cross-block, expiry-substituted or untrusted-clock ENS evidence remain closed");
console.log("EXPECTED FAIL cross-receipt subject mismatch and public-mirror divergence remain closed");
