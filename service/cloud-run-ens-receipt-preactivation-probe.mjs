import { createPublicKey, verify as verifySignature } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS,
  GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE,
  createGoogleCloudRunProductionReceiptRuntime
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import { DEFAULT_ENS_MAINNET_POLICY } from "../lib/ens-mainnet-verifier.mjs";
import {
  assertReceiptEvidenceSemantics,
  assertReceiptTemporalSemantics,
  computeEnsLookupResultDigest,
  computeTrustedReceiptDigest,
  sha256CanonicalDigest
} from "../lib/trusted-verification-crypto.mjs";
import { buildPrimaryReceiptPreactivationFixture } from "./cloud-run-primary-receipt-preactivation-probe.mjs";
import { readGoogleCloudMetadataServiceAccountEmail } from "./cloud-run-kms-preactivation-probe.mjs";

const KEY_POLICY_URL = new URL("../verification/key-policies/vortik-prod-receipt-signing-v1.json", import.meta.url);
const CANDIDATE_NAME = "epbs.eth";
const HASH_PATTERN = /^0x[0-9a-f]{64}$/;

export function buildEnsReceiptPreactivationFixture() {
  const fixture = buildPrimaryReceiptPreactivationFixture();
  if (fixture.claim.candidate_name !== CANDIDATE_NAME ||
      fixture.claim.normalized_candidate_name !== CANDIDATE_NAME ||
      fixture.admissionIntent.normalized_candidate_name !== CANDIDATE_NAME) {
    throw new Error("ENS receipt preactivation fixture drifted from the primary receipt subject");
  }
  return fixture;
}

function assertFinalizedBlock(block) {
  if (!block || typeof block !== "object" || Array.isArray(block)) {
    throw new Error("ENS receipt preactivation probe requires finalized block evidence");
  }
  if (!Number.isSafeInteger(block.number) || block.number < 0 ||
      !Number.isSafeInteger(block.timestamp) || block.timestamp < 0 ||
      !HASH_PATTERN.test(block.hash ?? "") ||
      !HASH_PATTERN.test(block.state_root ?? "") ||
      !HASH_PATTERN.test(block.parent_hash ?? "") ||
      block.finalized !== true) {
    throw new Error("ENS receipt preactivation probe finalized block evidence drifted");
  }
}

function assertEnsProviderEvidence(payload) {
  const expectedProviderIds = GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS.map((provider) => provider.provider_id);
  if (!Array.isArray(payload.providers) || payload.providers.length !== expectedProviderIds.length) {
    throw new Error("ENS receipt preactivation probe provider evidence count drifted");
  }
  if (JSON.stringify(payload.providers.map((provider) => provider.provider_id)) !== JSON.stringify(expectedProviderIds)) {
    throw new Error("ENS receipt preactivation probe provider identities drifted");
  }
  for (const provider of payload.providers) {
    if (provider.block_hash !== payload.block.hash ||
        provider.state_root !== payload.block.state_root ||
        provider.timestamp !== payload.block.timestamp ||
        provider.lookup_result_digest !== payload.lookup.lookup_result_digest) {
      throw new Error("ENS receipt preactivation probe provider evidence detached from shared finalized evidence");
    }
  }
}

function assertReceiptSubjectMatchesFixture(subject, claim, admissionIntent) {
  if (!subject || typeof subject !== "object" || Array.isArray(subject) ||
      !claim || typeof claim !== "object" || Array.isArray(claim) ||
      !admissionIntent || typeof admissionIntent !== "object" || Array.isArray(admissionIntent)) {
    throw new TypeError("ENS receipt preactivation probe requires the exact fixed receipt subject fixture");
  }
  const expected = {
    contribution_digest: claim.contribution_digest,
    review_digest: claim.review_digest,
    claim_digest: sha256CanonicalDigest(claim),
    admission_intent_digest: sha256CanonicalDigest(admissionIntent),
    candidate_name: claim.candidate_name,
    normalized_candidate_name: claim.normalized_candidate_name
  };
  for (const [field, value] of Object.entries(expected)) {
    if (subject[field] !== value) {
      throw new Error(`ENS receipt preactivation probe subject field ${field} drifted from the fixed fixture`);
    }
  }
  if (expected.candidate_name !== CANDIDATE_NAME || expected.normalized_candidate_name !== CANDIDATE_NAME ||
      admissionIntent.normalized_candidate_name !== CANDIDATE_NAME || admissionIntent.claim_digest !== expected.claim_digest) {
    throw new Error("ENS receipt preactivation probe fixed fixture subject binding drifted");
  }
}

export function assertEnsReceiptPreactivationEvidence(receipt, claim, admissionIntent) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("ENS receipt preactivation probe requires a receipt object");
  }
  if (receipt.receipt_type !== "ens_mainnet") {
    throw new Error("ENS receipt preactivation probe received the wrong receipt type");
  }
  assertReceiptSubjectMatchesFixture(receipt.subject, claim, admissionIntent);
  if (receipt.verifier?.verifier_id !== "vortik-ens-mainnet" ||
      receipt.verifier?.verifier_version !== "0.1.0" ||
      receipt.verifier?.code_commit !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.ens_mainnet_verifier_code_commit) {
    throw new Error("ENS receipt preactivation probe verifier identity drifted");
  }
  if (receipt.verifier?.key_policy_digest !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest ||
      receipt.signature?.key_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id ||
      receipt.signature?.algorithm !== "Ed25519") {
    throw new Error("ENS receipt preactivation probe signing identity drifted");
  }
  if (receipt.trusted_issuance_clock?.source_id !== "google-cloud-run-system-clock" ||
      receipt.trusted_issuance_clock?.policy_id !== "vortik-google-cloud-run-system-clock-v1") {
    throw new Error("ENS receipt preactivation probe trusted clock identity drifted");
  }

  const payload = receipt.payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("ENS receipt preactivation probe payload is missing");
  }
  if (payload.chain_id !== DEFAULT_ENS_MAINNET_POLICY.chain_id ||
      payload.normalization_profile !== DEFAULT_ENS_MAINNET_POLICY.normalization_profile ||
      payload.active_definition !== DEFAULT_ENS_MAINNET_POLICY.active_definition ||
      payload.normalized_candidate_name !== CANDIDATE_NAME ||
      payload.provider_policy_id !== DEFAULT_ENS_MAINNET_POLICY.policy_id ||
      payload.contracts?.ens_registry !== DEFAULT_ENS_MAINNET_POLICY.contracts.ens_registry ||
      payload.contracts?.base_registrar !== DEFAULT_ENS_MAINNET_POLICY.contracts.base_registrar) {
    throw new Error("ENS receipt preactivation probe ENS policy evidence drifted");
  }

  assertFinalizedBlock(payload.block);

  if (payload.lookup?.registry_record_exists !== true ||
      payload.lookup?.eth_registrar_owner_matches_base_registrar !== true ||
      payload.lookup?.active_registration !== true ||
      !Number.isSafeInteger(payload.lookup?.base_registrar_expiry) ||
      payload.lookup.base_registrar_expiry <= payload.block.timestamp) {
    throw new Error("ENS receipt preactivation probe active registration evidence drifted");
  }

  const recomputedLookupDigest = computeEnsLookupResultDigest(payload);
  if (payload.lookup.lookup_result_digest !== recomputedLookupDigest) {
    throw new Error("ENS receipt preactivation probe lookup result digest drifted");
  }
  assertEnsProviderEvidence(payload);

  assertReceiptTemporalSemantics(receipt);
  assertReceiptEvidenceSemantics(receipt, claim);
  return true;
}

export function verifyEnsReceiptSignatureDirect({ receipt, keyPolicy }) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("direct ENS receipt verification requires a receipt object");
  }
  if (!keyPolicy || typeof keyPolicy !== "object" || Array.isArray(keyPolicy)) {
    throw new TypeError("direct ENS receipt verification requires a key policy object");
  }
  const recomputedDigest = computeTrustedReceiptDigest(receipt);
  if (recomputedDigest !== receipt.receipt_digest) {
    throw new Error("direct ENS receipt verification detected receipt digest drift");
  }
  const keys = keyPolicy.authorized_keys?.filter((key) => key.key_id === receipt.signature?.key_id) ?? [];
  if (keys.length !== 1 || keys[0].algorithm !== "Ed25519") {
    throw new Error("direct ENS receipt verification cannot resolve the exact Ed25519 key");
  }
  const publicKey = createPublicKey({
    key: Buffer.from(keys[0].public_key_spki_der_base64, "base64"),
    format: "der",
    type: "spki"
  });
  const signature = Buffer.from(receipt.signature.signature_base64url, "base64url");
  if (signature.byteLength !== 64 || signature.toString("base64url") !== receipt.signature.signature_base64url) {
    throw new Error("direct ENS receipt verification received a noncanonical Ed25519 signature");
  }
  return verifySignature(
    null,
    Buffer.from(recomputedDigest, "utf8"),
    publicKey,
    signature
  );
}

export const GOOGLE_CLOUD_RUN_ENS_RECEIPT_PREACTIVATION_PROFILE = Object.freeze({
  probe_id: "vortik-cloud-run-ens-receipt-preactivation-v1",
  project_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.project_id,
  region: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.region,
  service_account: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account,
  crypto_key_version: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
  key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
  key_policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest,
  candidate_name: CANDIDATE_NAME,
  chain_id: DEFAULT_ENS_MAINNET_POLICY.chain_id,
  provider_policy_id: DEFAULT_ENS_MAINNET_POLICY.policy_id,
  provider_ids: Object.freeze(GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS.map((provider) => provider.provider_id)),
  trusted_receipt_issuance: false,
  admission_enabled: false
});

export function buildEnsReceiptPassEvidence({ receipt, actualServiceAccount }) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("ENS receipt PASS evidence requires a receipt object");
  }
  if (actualServiceAccount !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account) {
    throw new Error("ENS receipt PASS evidence requires the expected service account");
  }
  return Object.freeze({
    ...GOOGLE_CLOUD_RUN_ENS_RECEIPT_PREACTIVATION_PROFILE,
    service_account: actualServiceAccount,
    service_account_verified: true,
    ens_evidence_verified: true,
    receipt_digest_verified: true,
    receipt_signature_verified: true,
    signature_verification_path: "node-crypto-direct-spki",
    receipt_type: receipt.receipt_type,
    receipt_digest: receipt.receipt_digest,
    finalized_block_number: receipt.payload?.block?.number,
    finalized_block_hash: receipt.payload?.block?.hash,
    finalized_state_root: receipt.payload?.block?.state_root,
    finalized_block_timestamp: receipt.payload?.block?.timestamp,
    lookup_result_digest: receipt.payload?.lookup?.lookup_result_digest,
    base_registrar_expiry: receipt.payload?.lookup?.base_registrar_expiry,
    status: "PASS"
  });
}

export async function runGoogleCloudRunEnsReceiptPreactivationProbe() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("ENS receipt preactivation probe refuses static GOOGLE_APPLICATION_CREDENTIALS");
  }
  if (typeof globalThis.fetch !== "function") {
    throw new Error("ENS receipt preactivation probe requires runtime fetch");
  }

  const actualServiceAccount = await readGoogleCloudMetadataServiceAccountEmail({
    fetchImpl: globalThis.fetch.bind(globalThis),
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
  });
  if (actualServiceAccount !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account) {
    throw new Error("ENS receipt preactivation probe is running under an unexpected service account");
  }

  const runtime = createGoogleCloudRunProductionReceiptRuntime();
  if (runtime.identity.trusted_receipt_issuance !== false || runtime.identity.admission_enabled !== false) {
    throw new Error("ENS receipt preactivation probe requires canonical preactivation gates to remain closed");
  }
  if (JSON.stringify(runtime.identity.ens_providers) !== JSON.stringify(GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS)) {
    throw new Error("ENS receipt preactivation probe production provider binding drifted");
  }

  const fixture = buildEnsReceiptPreactivationFixture();
  const receipt = await runtime.issueEnsMainnetReceipt({
    claim: fixture.claim,
    admissionIntent: fixture.admissionIntent
  });

  assertEnsReceiptPreactivationEvidence(receipt, fixture.claim, fixture.admissionIntent);

  const keyPolicy = JSON.parse(readFileSync(KEY_POLICY_URL, "utf8"));
  if (sha256CanonicalDigest(keyPolicy) !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest) {
    throw new Error("ENS receipt preactivation probe key policy drifted before direct verification");
  }
  if (verifyEnsReceiptSignatureDirect({ receipt, keyPolicy }) !== true) {
    throw new Error("ENS receipt preactivation probe direct Ed25519 verification failed");
  }

  return buildEnsReceiptPassEvidence({ receipt, actualServiceAccount });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await runGoogleCloudRunEnsReceiptPreactivationProbe();
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`ENS receipt preactivation probe failed: ${error?.message ?? String(error)}\n`);
    process.exitCode = 1;
  }
}
