import assert from "node:assert/strict";
import test from "node:test";

import {
  GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE,
  createGoogleCloudRunReceiptRuntime
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import {
  GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY,
  GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST,
  createGoogleCloudRunTrustedClock,
  createTestOnlyRuntimeClock
} from "../lib/google-cloud-run-trusted-clock.mjs";
import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const ENS_PROVIDERS = [
  { provider_id: "rpc-a", rpc_url: "https://rpc-a.example/ethereum" },
  { provider_id: "rpc-b", rpc_url: "https://rpc-b.example/ethereum" }
];

function neverFetch() {
  throw new Error("network must not be used during protected runtime construction");
}

test("Cloud Run production clock has a deterministic non-injectable policy identity", async () => {
  assert.equal(
    GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST,
    sha256CanonicalDigest(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY)
  );
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.deployment_runtime, "google-cloud-run");
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.request_controlled, false);
  assert.equal(GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.external_time_attestation, false);

  const clock = createGoogleCloudRunTrustedClock();
  assert.equal(clock.source_id, "google-cloud-run-system-clock");
  assert.equal(clock.policy_id, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.policy_id);
  assert.equal(clock.policy_digest, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST);
  const before = Math.floor(Date.now() / 1000) - 1;
  const sampled = await clock.readTrustedTime();
  const after = Math.floor(Date.now() / 1000) + 1;
  assert.ok(sampled >= before && sampled <= after);
});

test("test-only injected clock never receives the production trust identity", async () => {
  const samples = [1_800_000_010_000, 1_800_000_009_000];
  const clock = createTestOnlyRuntimeClock({ nowImpl: () => samples.shift() });
  assert.notEqual(clock.source_id, "google-cloud-run-system-clock");
  assert.notEqual(clock.policy_id, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.policy_id);
  assert.notEqual(clock.policy_digest, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST);
  assert.equal(await clock.readTrustedTime(), 1_800_000_010);
  await assert.rejects(() => clock.readTrustedTime(), /rollback/);

  const invalid = createTestOnlyRuntimeClock({ nowImpl: () => 1.5 });
  await assert.rejects(() => invalid.readTrustedTime(), /invalid Unix-millisecond/);
});

test("Cloud Run receipt runtime binds reviewed verifier bytes and exact production identities without network access", () => {
  const runtime = createGoogleCloudRunReceiptRuntime({
    ensProviders: ENS_PROVIDERS,
    fetchImpl: neverFetch,
    accessTokenProvider: async () => "test-access-token-abcdefghijklmnopqrstuvwxyz"
  });

  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(Object.isFrozen(runtime.identity), true);
  assert.equal(runtime.identity.project_id, "vortik-registry-production");
  assert.equal(runtime.identity.region, "southamerica-east1");
  assert.equal(runtime.identity.service_account, "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com");
  assert.equal(runtime.identity.crypto_key_version, GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version);
  assert.equal(runtime.identity.key_id, "gcp-kms-vortik-receipt-ed25519-v1");
  assert.equal(runtime.identity.key_policy_digest, "sha256:b7482b8150cd3775aa8c1790c920e7cc2cc4a87397a4736f2b8846affc9884c1");
  assert.equal(runtime.identity.primary_source_verifier_code_commit, "fce2f64681cd3fae4252c373fd90c2b246a63172");
  assert.equal(runtime.identity.primary_source_verifier_blob_sha, "6a3bb6d4aa0e84ab3718ad974c0213637b64e6b7");
  assert.equal(runtime.identity.ens_mainnet_verifier_code_commit, "0da1897130e64546ec693d631d60b071fcd9082f");
  assert.equal(runtime.identity.ens_mainnet_verifier_blob_sha, "97ad302a793a65666ba55b78bd2251da0bedfe71");
  assert.equal(runtime.identity.trusted_clock_policy_digest, GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST);
  assert.equal(runtime.identity.trusted_receipt_issuance, false);
  assert.equal(runtime.identity.admission_enabled, false);
  assert.equal(typeof runtime.issuePrimarySourceReceipt, "function");
  assert.equal(typeof runtime.issueEnsMainnetReceipt, "function");
  assert.equal("signer" in runtime, false);
  assert.equal("keyPolicy" in runtime, false);
  assert.equal("accessTokenProvider" in runtime, false);
});

test("Cloud Run production runtime rejects protected clock/identity substitution and ambiguous provider topology", () => {
  for (const forbidden of [
    ["codeCommit", "a".repeat(40)],
    ["nowImpl", () => 1_800_000_000_000],
    ["trustedClock", {}],
    ["signer", {}],
    ["keyPolicy", {}]
  ]) {
    assert.throws(
      () => createGoogleCloudRunReceiptRuntime({
        ensProviders: ENS_PROVIDERS,
        fetchImpl: neverFetch,
        [forbidden[0]]: forbidden[1]
      }),
      /does not accept substitutable protected field/
    );
  }

  assert.throws(
    () => createGoogleCloudRunReceiptRuntime({
      ensProviders: [ENS_PROVIDERS[0]],
      fetchImpl: neverFetch
    }),
    /exactly two protected ENS provider definitions/
  );

  assert.throws(
    () => createGoogleCloudRunReceiptRuntime({
      ensProviders: [
        ENS_PROVIDERS[0],
        { provider_id: "rpc-b", rpc_url: "https://rpc-a.example/other" }
      ],
      fetchImpl: neverFetch
    }),
    /distinct provider network authorities/
  );
});
