import { readFileSync } from "node:fs";

import {
  GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE,
  createGoogleCloudRunProductionReceiptRuntime
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import {
  assertReceiptEvidenceSemantics,
  assertReceiptTemporalSemantics,
  sha256CanonicalDigest,
  verifyTrustedReceiptSignature
} from "../lib/trusted-verification-crypto.mjs";
import { readGoogleCloudMetadataServiceAccountEmail } from "./cloud-run-kms-preactivation-probe.mjs";

const KEY_POLICY_URL = new URL("../verification/key-policies/vortik-prod-receipt-signing-v1.json", import.meta.url);
const CLAIM_SCHEMA_ID = "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-claim/1.0.0/schema.json";
const INTENT_SCHEMA_ID = "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-admission-intent/1.0.0/schema.json";

const SOURCE = Object.freeze({
  repository_id: 44971752,
  repository_full_name: "ethereum/EIPs",
  commit_sha: "5eea6d0c5db9ccb6d424bcb58508c9c1576f6c37",
  blob_sha: "fec48f74c51e61d966bb6c5e431c54c66ca5c11f",
  path: "EIPS/eip-7732.md"
});

const CONTRIBUTION_ID = "contrib-preactivation-eip7732";
const REVIEW_ID = "review-preactivation-eip7732";
const CLAIM_ID = "claim-preactivation-eip7732";
const INTENT_ID = "intent-preactivation-eip7732";
const CANDIDATE_NAME = "epbs.eth";

function buildPreactivationContribution() {
  return {
    contribution_id: CONTRIBUTION_ID,
    purpose: "production-primary-source-receipt-preactivation",
    candidate_name: CANDIDATE_NAME,
    source: {
      repository_full_name: SOURCE.repository_full_name,
      commit_sha: SOURCE.commit_sha,
      path: SOURCE.path
    }
  };
}

function buildPreactivationReview(contributionDigest) {
  return {
    review_id: REVIEW_ID,
    contribution_digest: contributionDigest,
    disposition: "preactivation_fixture_only",
    registry_mutation_authorized: false
  };
}

export function buildPrimaryReceiptPreactivationFixture() {
  const contributionDigest = sha256CanonicalDigest(buildPreactivationContribution());
  const reviewDigest = sha256CanonicalDigest(buildPreactivationReview(contributionDigest));

  const claim = {
    $schema: CLAIM_SCHEMA_ID,
    claim: "vortik-verification-claim",
    claim_version: "1.0.0",
    claim_id: CLAIM_ID,
    contribution_id: CONTRIBUTION_ID,
    contribution_digest: contributionDigest,
    review_id: REVIEW_ID,
    review_digest: reviewDigest,
    candidate_name: CANDIDATE_NAME,
    normalized_candidate_name: CANDIDATE_NAME,
    normalization_profile: "ENSIP-15",
    technical_claim: {
      claim_kind: "semantic_registry_anchor_relevance",
      canonical_term: "Enshrined Proposer-Builder Separation",
      classification: "core",
      statement: "EIP-7732 is titled Enshrined Proposer-Builder Separation.",
      source_authority_class: "eip"
    },
    gates: {
      claim_trusted: false,
      authoritative_source_selected: false,
      registry_pr_eligible: false,
      registry_mutated: false,
      ownership_inferred: false,
      commercial_authority: false,
      separate_registry_pr_required: true
    }
  };

  const admissionIntent = {
    $schema: INTENT_SCHEMA_ID,
    admission_intent: "vortik-admission-intent",
    admission_intent_version: "1.0.0",
    intent_id: INTENT_ID,
    contribution_digest: contributionDigest,
    review_digest: reviewDigest,
    claim_digest: sha256CanonicalDigest(claim),
    normalized_candidate_name: CANDIDATE_NAME,
    normalization_profile: "ENSIP-15",
    proposed_registry_change: {
      change_kind: "new_anchor",
      anchor_id: "epbs-preactivation",
      proposed_ens: CANDIDATE_NAME,
      expected_base_anchor_digest: null,
      proposed_anchor_digest: sha256CanonicalDigest({
        id: "epbs-preactivation",
        ens: CANDIDATE_NAME,
        canonical_term: claim.technical_claim.canonical_term,
        classification: claim.technical_claim.classification,
        preactivation_only: true
      })
    },
    gates: {
      admission_enabled: false,
      trusted_primary_source_receipt_available: false,
      trusted_ens_receipt_available: false,
      registry_pr_eligible: false,
      registry_mutated: false,
      ownership_inferred: false,
      commercial_authority: false,
      separate_registry_pr_required: true
    }
  };

  return Object.freeze({
    claim: Object.freeze(structuredClone(claim)),
    admissionIntent: Object.freeze(structuredClone(admissionIntent)),
    selector: SOURCE
  });
}

export function assertPrimaryReceiptPreactivationEvidence(receipt, claim) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("primary receipt preactivation probe requires a receipt object");
  }
  if (receipt.receipt_type !== "primary_source") {
    throw new Error("primary receipt preactivation probe received the wrong receipt type");
  }
  if (receipt.subject?.candidate_name !== CANDIDATE_NAME || receipt.subject?.normalized_candidate_name !== CANDIDATE_NAME) {
    throw new Error("primary receipt preactivation probe subject drifted");
  }
  if (receipt.verifier?.verifier_id !== "vortik-primary-source-github" ||
      receipt.verifier?.verifier_version !== "0.1.0" ||
      receipt.verifier?.code_commit !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.primary_source_verifier_code_commit) {
    throw new Error("primary receipt preactivation probe verifier identity drifted");
  }
  if (receipt.verifier?.key_policy_digest !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest ||
      receipt.signature?.key_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id ||
      receipt.signature?.algorithm !== "Ed25519") {
    throw new Error("primary receipt preactivation probe signing identity drifted");
  }
  if (receipt.trusted_issuance_clock?.source_id !== "google-cloud-run-system-clock" ||
      receipt.trusted_issuance_clock?.policy_id !== "vortik-google-cloud-run-system-clock-v1") {
    throw new Error("primary receipt preactivation probe trusted clock identity drifted");
  }

  const repository = receipt.payload?.repository;
  if (receipt.payload?.authority_class !== "eip" ||
      receipt.payload?.retrieval_policy_id !== "vortik-primary-source-github-v1" ||
      receipt.payload?.retrieved_independently !== true ||
      repository?.repository_id !== SOURCE.repository_id ||
      repository?.repository_full_name !== SOURCE.repository_full_name ||
      repository?.commit_sha !== SOURCE.commit_sha ||
      repository?.blob_sha !== SOURCE.blob_sha ||
      repository?.path !== SOURCE.path) {
    throw new Error("primary receipt preactivation probe source evidence drifted");
  }

  assertReceiptTemporalSemantics(receipt);
  assertReceiptEvidenceSemantics(receipt, claim);
  return true;
}

export const GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE = Object.freeze({
  probe_id: "vortik-cloud-run-primary-receipt-preactivation-v1",
  project_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.project_id,
  region: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.region,
  service_account: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account,
  crypto_key_version: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
  key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
  key_policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest,
  source: SOURCE,
  candidate_name: CANDIDATE_NAME,
  trusted_receipt_issuance: false,
  admission_enabled: false
});

export async function runGoogleCloudRunPrimaryReceiptPreactivationProbe() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("primary receipt preactivation probe refuses static GOOGLE_APPLICATION_CREDENTIALS");
  }
  if (typeof globalThis.fetch !== "function") {
    throw new Error("primary receipt preactivation probe requires runtime fetch");
  }

  const actualServiceAccount = await readGoogleCloudMetadataServiceAccountEmail({
    fetchImpl: globalThis.fetch.bind(globalThis),
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
  });
  if (actualServiceAccount !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account) {
    throw new Error("primary receipt preactivation probe is running under an unexpected service account");
  }

  const runtime = createGoogleCloudRunProductionReceiptRuntime();
  if (runtime.identity.trusted_receipt_issuance !== false || runtime.identity.admission_enabled !== false) {
    throw new Error("primary receipt preactivation probe requires canonical preactivation gates to remain closed");
  }

  const fixture = buildPrimaryReceiptPreactivationFixture();
  const receipt = await runtime.issuePrimarySourceReceipt({
    claim: fixture.claim,
    admissionIntent: fixture.admissionIntent,
    selector: fixture.selector
  });

  assertPrimaryReceiptPreactivationEvidence(receipt, fixture.claim);

  const keyPolicy = JSON.parse(readFileSync(KEY_POLICY_URL, "utf8"));
  const trustedPolicyIdentity = {
    policy_id: keyPolicy.policy_id,
    policy_version: keyPolicy.policy_version,
    policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest
  };
  if (sha256CanonicalDigest(keyPolicy) !== trustedPolicyIdentity.policy_digest) {
    throw new Error("primary receipt preactivation probe key policy drifted before independent verification");
  }
  if (verifyTrustedReceiptSignature(receipt, keyPolicy, trustedPolicyIdentity) !== true) {
    throw new Error("primary receipt preactivation probe independent signature verification failed");
  }

  return Object.freeze({
    ...GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE,
    service_account: actualServiceAccount,
    service_account_verified: true,
    source_evidence_verified: true,
    receipt_signature_verified: true,
    status: "PASS",
    receipt
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await runGoogleCloudRunPrimaryReceiptPreactivationProbe();
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`Primary receipt preactivation probe failed: ${error?.message ?? String(error)}\n`);
    process.exitCode = 1;
  }
}
