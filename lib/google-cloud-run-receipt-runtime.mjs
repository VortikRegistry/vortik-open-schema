import { readFileSync } from "node:fs";

import { createEnsMainnetVerifierWithTrustedProviders } from "./ens-mainnet-verifier.mjs";
import { createGoogleCloudKmsEd25519Signer } from "./google-cloud-kms-ed25519-signer.mjs";
import { createGoogleCloudRunTrustedClock } from "./google-cloud-run-trusted-clock.mjs";
import { createPrimarySourceVerifierWithTrustedTransport } from "./primary-source-verifier.mjs";
import { createTrustedReceiptIssuerCore } from "./trusted-receipt-issuer.mjs";
import { sha256CanonicalDigest } from "./trusted-verification-crypto.mjs";

const MODULE_FETCH = typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;
const KEY_POLICY_URL = new URL("../verification/key-policies/vortik-prod-receipt-signing-v1.json", import.meta.url);
const EXPECTED_KEY_POLICY_DIGEST = "sha256:b7482b8150cd3775aa8c1790c920e7cc2cc4a87397a4736f2b8846affc9884c1";
const CODE_COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const PROVIDER_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export const GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE = Object.freeze({
  project_id: "vortik-registry-production",
  region: "southamerica-east1",
  service_account: "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com",
  crypto_key_version: "projects/vortik-registry-production/locations/southamerica-east1/keyRings/vortik-trust/cryptoKeys/vortik-receipt-ed25519/cryptoKeyVersions/1",
  key_id: "gcp-kms-vortik-receipt-ed25519-v1",
  key_policy_id: "vortik-prod-receipt-signing-v1",
  key_policy_digest: EXPECTED_KEY_POLICY_DIGEST,
  expected_protection_level: "SOFTWARE",
  request_timeout_ms: 10_000,
  trusted_receipt_issuance: false,
  admission_enabled: false
});

function assertFetch(fetchImpl) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("Cloud Run receipt runtime requires a protected fetch transport");
  }
  return fetchImpl;
}

function assertCodeCommit(codeCommit) {
  if (typeof codeCommit !== "string" || !CODE_COMMIT_PATTERN.test(codeCommit)) {
    throw new Error("Cloud Run receipt runtime requires the exact deployed lowercase 40-hex source commit");
  }
  return codeCommit;
}

function snapshotEnsProviders(ensProviders) {
  if (!Array.isArray(ensProviders) || ensProviders.length !== 2) {
    throw new Error("Cloud Run receipt runtime requires exactly two protected ENS provider definitions");
  }
  return Object.freeze(ensProviders.map((provider) => {
    if (!provider || typeof provider !== "object" || Array.isArray(provider)) {
      throw new TypeError("Cloud Run ENS provider definition must be an object");
    }
    if (!PROVIDER_ID_PATTERN.test(provider.provider_id ?? "")) {
      throw new Error("Cloud Run ENS provider_id is invalid");
    }
    if (typeof provider.rpc_url !== "string" || provider.rpc_url.length === 0) {
      throw new Error("Cloud Run ENS provider rpc_url is required");
    }
    return Object.freeze({
      provider_id: provider.provider_id,
      rpc_url: provider.rpc_url
    });
  }));
}

function loadPinnedKeyPolicy() {
  const policy = JSON.parse(readFileSync(KEY_POLICY_URL, "utf8"));
  const digest = sha256CanonicalDigest(policy);
  if (digest !== EXPECTED_KEY_POLICY_DIGEST) {
    throw new Error("Cloud Run receipt runtime key policy does not match the pinned production policy digest");
  }
  if (policy.policy_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_id) {
    throw new Error("Cloud Run receipt runtime key policy_id drifted");
  }
  if (policy.authorized_keys?.length !== 1 || policy.authorized_keys[0]?.key_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id) {
    throw new Error("Cloud Run receipt runtime signing-key identity drifted");
  }
  return Object.freeze({
    policy: Object.freeze(structuredClone(policy)),
    identity: Object.freeze({
      policy_id: policy.policy_id,
      policy_version: policy.policy_version,
      policy_digest: digest
    })
  });
}

export function createGoogleCloudRunReceiptRuntime({
  codeCommit,
  ensProviders,
  fetchImpl = MODULE_FETCH,
  accessTokenProvider,
  nowImpl
}) {
  const deployedCodeCommit = assertCodeCommit(codeCommit);
  const trustedFetch = assertFetch(fetchImpl);
  const providerDefinitions = snapshotEnsProviders(ensProviders);
  const keyPolicyBinding = loadPinnedKeyPolicy();

  const primarySourceVerifier = createPrimarySourceVerifierWithTrustedTransport({
    fetchImpl: trustedFetch,
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
  });

  const ensMainnetVerifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: providerDefinitions.map((provider) => ({
      provider_id: provider.provider_id,
      rpc_url: provider.rpc_url,
      fetchImpl: trustedFetch
    })),
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
  });

  const signerOptions = {
    key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
    cryptoKeyVersion: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
    expectedProtectionLevel: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.expected_protection_level,
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms,
    fetchImpl: trustedFetch
  };
  if (accessTokenProvider !== undefined) signerOptions.accessTokenProvider = accessTokenProvider;
  const signer = createGoogleCloudKmsEd25519Signer(signerOptions);

  const trustedClock = createGoogleCloudRunTrustedClock(nowImpl === undefined ? {} : { nowImpl });
  const issuer = createTrustedReceiptIssuerCore({
    primarySourceVerifier,
    ensMainnetVerifier,
    verifierIdentities: {
      primary_source: {
        verifier_id: "vortik-primary-source-github",
        verifier_version: "0.1.0",
        code_commit: deployedCodeCommit
      },
      ens_mainnet: {
        verifier_id: "vortik-ens-mainnet",
        verifier_version: "0.1.0",
        code_commit: deployedCodeCommit
      }
    },
    keyPolicy: keyPolicyBinding.policy,
    trustedPolicyIdentity: keyPolicyBinding.identity,
    signer,
    trustedClock
  });

  const runtimeIdentity = Object.freeze({
    runtime: "vortik-google-cloud-run-receipt-runtime",
    runtime_version: "0.1.0",
    code_commit: deployedCodeCommit,
    project_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.project_id,
    region: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.region,
    service_account: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account,
    crypto_key_version: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
    key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
    key_policy_digest: keyPolicyBinding.identity.policy_digest,
    trusted_clock_source_id: trustedClock.source_id,
    trusted_clock_policy_id: trustedClock.policy_id,
    trusted_clock_policy_digest: trustedClock.policy_digest,
    trusted_receipt_issuance: false,
    admission_enabled: false
  });

  return Object.freeze({
    identity: runtimeIdentity,
    issuePrimarySourceReceipt: issuer.issuePrimarySourceReceipt.bind(issuer),
    issueEnsMainnetReceipt: issuer.issueEnsMainnetReceipt.bind(issuer)
  });
}
