import assert from "node:assert/strict";
import test from "node:test";

import {
  GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE,
  createGoogleCloudRunReceiptRuntime
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import {
  GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY,
  GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST,
  createGoogleCloudRunTrustedClock
} from "../lib/google-cloud-run-trusted-clock.mjs";
import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const CODE_COMMIT = "a".repeat(40);
const ENS_PROVIDERS = [
  { provider_id: "rpc-a", rpc_url: "https://rpc-a.example/ethereum" },
  { provider_id: "rpc-b", rpc_url: "https://rpc-b.example/ethereum" }
];

function neverFetch() {
  throw new Error("network must not be used during protected runtime construction");
}

test("Cloud Run trusted clock has a deterministic protected policy identity", async () => {
  assert.equal(
    GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST,
    sha256CanonicalDigest(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY)
  );
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.deployment_runtime, "google-cloud-run");
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.request_controlled, false);
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.external_time_attestation, false);

  const clock = createGoogleCloudRunTrustedClock({ nowImpl: () => 1_800_000_000_999 });
  assert.equal(clock.source_id, "google-cloud-run-system-clock");
  assert.equal(clock.policy_id, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.policy_id);
  assert.equal(clock.policy_digest, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST);
  assert.equal(await clock.readTrustedTime(), 1_800_000_000);
});

test("Cloud Run trusted clock fails closed on invalid time and instance-local rollback", async () => {
  const samples = [1_800_000_010_000, 1_800_000_009_000];
  const clock = createGoogleCloudRunTrustedClock({ nowImpl: () => samples.shift() });
  assert.equal(await clock.readTrustedTime(), 1_800_000_010);
  await assert.rejects(() => clock.readTrustedTime(), /rollback/);

  const invalid = createGoogleCloudRunTrustedClock({ nowImpl: () => 1.5 });
  await assert.rejects(() => invalid.readTrustedTime(), /invalid Unix-millisecond/);
});

test("Cloud Run receipt runtime binds the exact provisioned production identities without network access", () => {
  const runtime = createGoogleCloudRunReceiptRuntime({
    codeCommit: CODE_COMMIT,
    ensProviders: ENS_PROVIDERS,
    fetchImpl: neverFetch,
    accessTokenProvider: async () => "test-access-token-abcdefghijklmnopqrstuvwxyz",
    nowImpl: () => 1_800_000_000_000
  });

  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(Object.isFrozen(runtime.identity), true);
  assert.equal(runtime.identity.code_commit, CODE_COMMIT);
  assert.equal(runtime.identity.project_id, "vortik-registry-production");
  assert.equal(runtime.identity.region, "southamerica-east1");
  assert.equal(runtime.identity.service_account, "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com");
  assert.equal(runtime.identity.crypto_key_version, GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version);
  assert.equal(runtime.identity.key_id, "gcp-kms-vortik-receipt-ed25519-v1");
  assert.equal(runtime.identity.key_policy_digest, "sha256:b7482b8150cd3775aa8c1790c920e7cc2cc4a87397a4736f2b8846affc9884c1");
  assert.equal(runtime.identity.trusted_clock_policy_digest, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST);
  assert.equal(runtime.identity.trusted_receipt_issuance, false);
  assert.equal(runtime.identity.admission_enabled, false);
  assert.equal(typeof runtime.issuePrimarySourceReceipt, "function");
  assert.equal(typeof runtime.issueEnsMainnetReceipt, "function");
  assert.equal("signer" in runtime, false);
  assert.equal("keyPolicy" in runtime, false);
  assert.equal("accessTokenProvider" in runtime, false);
});

test("Cloud Run receipt runtime rejects ambiguous deployment identity and provider topology", () => {
  assert.throws(
    () => createGoogleCloudRunReceiptRuntime({
      codeCommit: "main",
      ensProviders: ENS_PROVIDERS,
      fetchImpl: neverFetch
    }),
    /exact deployed lowercase 40-hex source commit/
  );

  assert.throws(
    () => createGoogleCloudRunReceiptRuntime({
      codeCommit: CODE_COMMIT,
      ensProviders: [ENS_PROVIDERS[0]],
      fetchImpl: neverFetch
    }),
    /exactly two protected ENS provider definitions/
  );

  assert.throws(
    () => createGoogleCloudRunReceiptRuntime({
      codeCommit: CODE_COMMIT,
      ensProviders: [
        ENS_PROVIDERS[0],
        { provider_id: "rpc-b", rpc_url: "https://rpc-a.example/other" }
      ],
      fetchImpl: neverFetch
    }),
    /distinct provider network authorities/
  );
});
