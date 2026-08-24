import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import { GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE } from "../lib/google-cloud-run-receipt-runtime.mjs";
import {
  computePrimarySourceCanonicalIdentifier,
  sha256CanonicalDigest
} from "../lib/trusted-verification-crypto.mjs";
import {
  GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE,
  assertPrimaryReceiptPreactivationEvidence,
  buildPrimaryReceiptPreactivationFixture,
  runGoogleCloudRunPrimaryReceiptPreactivationProbe,
  verifyPrimaryReceiptSignatureDirect
} from "../service/cloud-run-primary-receipt-preactivation-probe.mjs";

function makeReceiptFixture() {
  const fixture = buildPrimaryReceiptPreactivationFixture();
  const payload = {
    authority_class: "eip",
    retrieval_policy_id: "vortik-primary-source-github-v1",
    retrieved_independently: true,
    canonical_source_identifier: "",
    repository: {
      provider: "github",
      repository_id: GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.repository_id,
      repository_full_name: GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.repository_full_name,
      commit_sha: GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.commit_sha,
      blob_sha: GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.blob_sha,
      path: GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.path,
      content_sha256: `sha256:${"1".repeat(64)}`
    },
    claim_binding_digest: sha256CanonicalDigest(fixture.claim)
  };
  payload.canonical_source_identifier = computePrimarySourceCanonicalIdentifier(payload);

  return {
    fixture,
    receipt: {
      receipt_type: "primary_source",
      subject: {
        claim_digest: sha256CanonicalDigest(fixture.claim),
        candidate_name: fixture.claim.candidate_name,
        normalized_candidate_name: fixture.claim.normalized_candidate_name
      },
      verifier: {
        verifier_id: "vortik-primary-source-github",
        verifier_version: "0.1.0",
        code_commit: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.primary_source_verifier_code_commit,
        key_policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest
      },
      issued_at: 1_800_000_000,
      trusted_issued_at: 1_800_000_000,
      admission_valid_until: 1_800_086_400,
      trusted_issuance_clock: {
        source_id: "google-cloud-run-system-clock",
        policy_id: "vortik-google-cloud-run-system-clock-v1",
        policy_digest: `sha256:${"2".repeat(64)}`,
        policy_validated: true,
        not_caller_controlled: true
      },
      payload,
      replay_protection: {
        domain: "vortik-trusted-verification-receipt-v1",
        nonce: "0".repeat(32),
        single_use_admission_required: true
      },
      signature: {
        algorithm: "Ed25519",
        key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
        signature_base64url: "A".repeat(86)
      }
    }
  };
}

test("primary receipt preactivation profile is fixed to production identity and immutable EIP-7732 evidence", () => {
  const profile = GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE;
  assert.equal(profile.project_id, "vortik-registry-production");
  assert.equal(profile.region, "southamerica-east1");
  assert.equal(profile.service_account, "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com");
  assert.equal(profile.candidate_name, "epbs.eth");
  assert.equal(profile.source.repository_id, 44971752);
  assert.equal(profile.source.repository_full_name, "ethereum/EIPs");
  assert.equal(profile.source.commit_sha, "5eea6d0c5db9ccb6d424bcb58508c9c1576f6c37");
  assert.equal(profile.source.blob_sha, "fec48f74c51e61d966bb6c5e431c54c66ca5c11f");
  assert.equal(profile.source.path, "EIPS/eip-7732.md");
  assert.equal(profile.trusted_receipt_issuance, false);
  assert.equal(profile.admission_enabled, false);
});

test("preactivation claim and intent remain deterministic and fail-closed", () => {
  const first = buildPrimaryReceiptPreactivationFixture();
  const second = buildPrimaryReceiptPreactivationFixture();
  assert.deepEqual(first, second);
  assert.equal(first.claim.normalized_candidate_name, "epbs.eth");
  assert.equal(first.claim.technical_claim.canonical_term, "Enshrined Proposer-Builder Separation");
  assert.equal(first.claim.technical_claim.source_authority_class, "eip");
  assert.equal(first.claim.gates.claim_trusted, false);
  assert.equal(first.claim.gates.registry_mutated, false);
  assert.equal(first.claim.gates.commercial_authority, false);
  assert.equal(first.admissionIntent.claim_digest, sha256CanonicalDigest(first.claim));
  assert.equal(first.admissionIntent.gates.admission_enabled, false);
  assert.equal(first.admissionIntent.gates.trusted_primary_source_receipt_available, false);
  assert.equal(first.admissionIntent.gates.registry_mutated, false);
  assert.equal(first.admissionIntent.gates.commercial_authority, false);
  assert.equal(first.selector.commit_sha, GOOGLE_CLOUD_RUN_PRIMARY_RECEIPT_PREACTIVATION_PROFILE.source.commit_sha);
});

test("preactivation evidence assertion accepts the exact source and rejects source drift", () => {
  const { fixture, receipt } = makeReceiptFixture();
  assert.equal(assertPrimaryReceiptPreactivationEvidence(receipt, fixture.claim), true);

  const driftedCommit = structuredClone(receipt);
  driftedCommit.payload.repository.commit_sha = "0".repeat(40);
  assert.throws(
    () => assertPrimaryReceiptPreactivationEvidence(driftedCommit, fixture.claim),
    /source evidence drifted/
  );

  const driftedKey = structuredClone(receipt);
  driftedKey.signature.key_id = "different-key";
  assert.throws(
    () => assertPrimaryReceiptPreactivationEvidence(driftedKey, fixture.claim),
    /signing identity drifted/
  );
});

test("direct receipt signature path verifies Ed25519 bytes independently of issuer verification helper", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const receiptDigest = `sha256:${"a".repeat(64)}`;
  const signatureBase64url = sign(null, Buffer.from(receiptDigest, "utf8"), privateKey).toString("base64url");
  const keyPolicy = {
    authorized_keys: [{
      key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKey.export({ format: "der", type: "spki" }).toString("base64")
    }]
  };
  const receipt = {
    receipt_digest: receiptDigest,
    signature: {
      key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
      signature_base64url: signatureBase64url
    }
  };

  assert.equal(verifyPrimaryReceiptSignatureDirect({ receipt, keyPolicy }), true);
  const tampered = structuredClone(receipt);
  tampered.receipt_digest = `sha256:${"b".repeat(64)}`;
  assert.equal(verifyPrimaryReceiptSignatureDirect({ receipt: tampered, keyPolicy }), false);
});

test("production preactivation probe refuses static Google credentials before network access", async () => {
  const prior = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/forbidden-static-key.json";
  try {
    await assert.rejects(
      () => runGoogleCloudRunPrimaryReceiptPreactivationProbe(),
      /refuses static GOOGLE_APPLICATION_CREDENTIALS/
    );
  } finally {
    if (prior === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = prior;
  }
});
