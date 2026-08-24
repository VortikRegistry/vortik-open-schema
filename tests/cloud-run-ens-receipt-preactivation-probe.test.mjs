import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import {
  GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS,
  GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import { DEFAULT_ENS_MAINNET_POLICY } from "../lib/ens-mainnet-verifier.mjs";
import {
  computeEnsLookupResultDigest,
  computeTrustedReceiptDigest,
  sha256CanonicalDigest
} from "../lib/trusted-verification-crypto.mjs";
import { buildPrimaryReceiptPreactivationFixture } from "../service/cloud-run-primary-receipt-preactivation-probe.mjs";
import {
  GOOGLE_CLOUD_RUN_ENS_RECEIPT_PREACTIVATION_PROFILE,
  assertEnsReceiptPreactivationEvidence,
  buildEnsReceiptPassEvidence,
  buildEnsReceiptPreactivationFixture,
  runGoogleCloudRunEnsReceiptPreactivationProbe,
  verifyEnsReceiptSignatureDirect
} from "../service/cloud-run-ens-receipt-preactivation-probe.mjs";

function makeEnsReceiptFixture() {
  const fixture = buildEnsReceiptPreactivationFixture();
  const block = {
    number: 22_000_000,
    hash: `0x${"1".repeat(64)}`,
    state_root: `0x${"2".repeat(64)}`,
    parent_hash: `0x${"3".repeat(64)}`,
    timestamp: 1_799_999_900,
    finalized: true
  };
  const payload = {
    chain_id: DEFAULT_ENS_MAINNET_POLICY.chain_id,
    normalization_profile: DEFAULT_ENS_MAINNET_POLICY.normalization_profile,
    active_definition: DEFAULT_ENS_MAINNET_POLICY.active_definition,
    normalized_candidate_name: fixture.claim.normalized_candidate_name,
    contracts: structuredClone(DEFAULT_ENS_MAINNET_POLICY.contracts),
    block,
    provider_policy_id: DEFAULT_ENS_MAINNET_POLICY.policy_id,
    providers: [],
    lookup: {
      registry_record_exists: true,
      eth_registrar_owner_matches_base_registrar: true,
      base_registrar_expiry: 1_800_200_000,
      active_registration: true,
      lookup_result_digest: ""
    }
  };
  payload.lookup.lookup_result_digest = computeEnsLookupResultDigest(payload);
  payload.providers = GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS.map((provider) => ({
    provider_id: provider.provider_id,
    block_hash: block.hash,
    state_root: block.state_root,
    timestamp: block.timestamp,
    lookup_result_digest: payload.lookup.lookup_result_digest
  }));

  return {
    fixture,
    receipt: {
      receipt_type: "ens_mainnet",
      receipt_digest: `sha256:${"4".repeat(64)}`,
      subject: {
        contribution_digest: fixture.claim.contribution_digest,
        review_digest: fixture.claim.review_digest,
        claim_digest: sha256CanonicalDigest(fixture.claim),
        admission_intent_digest: sha256CanonicalDigest(fixture.admissionIntent),
        candidate_name: fixture.claim.candidate_name,
        normalized_candidate_name: fixture.claim.normalized_candidate_name
      },
      verifier: {
        verifier_id: "vortik-ens-mainnet",
        verifier_version: "0.1.0",
        code_commit: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.ens_mainnet_verifier_code_commit,
        key_policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest
      },
      issued_at: 1_800_000_000,
      trusted_issued_at: 1_800_000_000,
      admission_valid_until: 1_800_086_400,
      trusted_issuance_clock: {
        source_id: "google-cloud-run-system-clock",
        policy_id: "vortik-google-cloud-run-system-clock-v1",
        policy_digest: `sha256:${"5".repeat(64)}`,
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

test("ENS receipt preactivation profile is fixed to production identity, epbs.eth and dual RPC policy", () => {
  const profile = GOOGLE_CLOUD_RUN_ENS_RECEIPT_PREACTIVATION_PROFILE;
  assert.equal(profile.project_id, "vortik-registry-production");
  assert.equal(profile.region, "southamerica-east1");
  assert.equal(profile.service_account, "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com");
  assert.equal(profile.candidate_name, "epbs.eth");
  assert.equal(profile.chain_id, 1);
  assert.equal(profile.provider_policy_id, "vortik-ens-mainnet-dual-rpc-v1");
  assert.deepEqual(profile.provider_ids, ["ethereum-rpc-publicnode", "ethereum-drpc"]);
  assert.equal(profile.trusted_receipt_issuance, false);
  assert.equal(profile.admission_enabled, false);
});

test("ENS preactivation reuses the exact deterministic primary receipt subject fixture", () => {
  const primaryFixture = buildPrimaryReceiptPreactivationFixture();
  const ensFixture = buildEnsReceiptPreactivationFixture();
  assert.deepEqual(ensFixture, primaryFixture);
  assert.equal(ensFixture.claim.candidate_name, "epbs.eth");
  assert.equal(ensFixture.claim.normalized_candidate_name, "epbs.eth");
  assert.equal(ensFixture.admissionIntent.claim_digest, sha256CanonicalDigest(ensFixture.claim));
  assert.equal(ensFixture.claim.gates.claim_trusted, false);
  assert.equal(ensFixture.admissionIntent.gates.admission_enabled, false);
  assert.equal(ensFixture.admissionIntent.gates.trusted_primary_source_receipt_available, false);
  assert.equal(ensFixture.admissionIntent.gates.trusted_ens_receipt_available, false);
});

test("ENS preactivation evidence binds every receipt subject field to the exact fixed claim and intent", () => {
  const { fixture, receipt } = makeEnsReceiptFixture();
  assert.equal(assertEnsReceiptPreactivationEvidence(receipt, fixture.claim, fixture.admissionIntent), true);

  for (const field of ["contribution_digest", "review_digest", "claim_digest", "admission_intent_digest"]) {
    const drifted = structuredClone(receipt);
    drifted.subject[field] = `sha256:${"9".repeat(64)}`;
    assert.throws(
      () => assertEnsReceiptPreactivationEvidence(drifted, fixture.claim, fixture.admissionIntent),
      new RegExp(`subject field ${field} drifted`),
      field
    );
  }

  const differentIntent = structuredClone(fixture.admissionIntent);
  differentIntent.intent_id = "different-intent-same-name";
  assert.throws(
    () => assertEnsReceiptPreactivationEvidence(receipt, fixture.claim, differentIntent),
    /subject field admission_intent_digest drifted/
  );
});

test("ENS preactivation evidence accepts exact finalized dual-provider evidence and rejects provider or lookup drift", () => {
  const { fixture, receipt } = makeEnsReceiptFixture();
  assert.equal(assertEnsReceiptPreactivationEvidence(receipt, fixture.claim, fixture.admissionIntent), true);

  const driftedProvider = structuredClone(receipt);
  driftedProvider.payload.providers[1].provider_id = "unexpected-rpc";
  assert.throws(
    () => assertEnsReceiptPreactivationEvidence(driftedProvider, fixture.claim, fixture.admissionIntent),
    /provider identities drifted/
  );

  const detachedProvider = structuredClone(receipt);
  detachedProvider.payload.providers[1].block_hash = `0x${"9".repeat(64)}`;
  assert.throws(
    () => assertEnsReceiptPreactivationEvidence(detachedProvider, fixture.claim, fixture.admissionIntent),
    /provider evidence detached/
  );

  const driftedLookup = structuredClone(receipt);
  driftedLookup.payload.lookup.base_registrar_expiry += 1;
  assert.throws(
    () => assertEnsReceiptPreactivationEvidence(driftedLookup, fixture.claim, fixture.admissionIntent),
    /lookup result digest drifted/
  );
});

test("ENS direct receipt signature path recomputes complete digest and verifies Ed25519 independently", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const keyPolicy = {
    authorized_keys: [{
      key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKey.export({ format: "der", type: "spki" }).toString("base64")
    }]
  };
  const receipt = {
    receipt: "test-ens-receipt",
    subject: { value: "immutable" },
    receipt_digest: "",
    signature: {
      algorithm: "Ed25519",
      key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
      signature_base64url: ""
    }
  };
  receipt.receipt_digest = computeTrustedReceiptDigest(receipt);
  receipt.signature.signature_base64url = sign(
    null,
    Buffer.from(receipt.receipt_digest, "utf8"),
    privateKey
  ).toString("base64url");

  assert.equal(verifyEnsReceiptSignatureDirect({ receipt, keyPolicy }), true);

  const tamperedBody = structuredClone(receipt);
  tamperedBody.subject.value = "tampered";
  assert.throws(
    () => verifyEnsReceiptSignatureDirect({ receipt: tamperedBody, keyPolicy }),
    /receipt digest drift/
  );
});

test("ENS PASS evidence keeps signed receipt and replay material out of logs", () => {
  const { receipt } = makeEnsReceiptFixture();
  const evidence = buildEnsReceiptPassEvidence({
    receipt,
    actualServiceAccount: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account
  });

  assert.equal(evidence.status, "PASS");
  assert.equal(evidence.receipt_type, "ens_mainnet");
  assert.equal(evidence.ens_evidence_verified, true);
  assert.equal(evidence.receipt_digest_verified, true);
  assert.equal(evidence.receipt_signature_verified, true);
  assert.equal(evidence.finalized_block_hash, receipt.payload.block.hash);
  assert.equal(evidence.lookup_result_digest, receipt.payload.lookup.lookup_result_digest);
  assert.equal("receipt" in evidence, false);
  assert.equal("signature_base64url" in evidence, false);
  assert.equal("nonce" in evidence, false);
  assert.equal("receipt_id" in evidence, false);
  assert.equal("admission_valid_until" in evidence, false);
  const serialized = JSON.stringify(evidence);
  assert.equal(serialized.includes(receipt.signature.signature_base64url), false);
  assert.equal(serialized.includes(receipt.replay_protection.nonce), false);
});

test("production ENS preactivation probe refuses static Google credentials before network access", async () => {
  const prior = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/forbidden-static-key.json";
  try {
    await assert.rejects(
      () => runGoogleCloudRunEnsReceiptPreactivationProbe(),
      /refuses static GOOGLE_APPLICATION_CREDENTIALS/
    );
  } finally {
    if (prior === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = prior;
  }
});
