import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync } from "node:fs";

import {
  METADATA_TOKEN_URL,
  createGoogleCloudKmsEd25519Signer
} from "../lib/google-cloud-kms-ed25519-signer.mjs";
import { GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE } from "../lib/google-cloud-run-receipt-runtime.mjs";
import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const KEY_POLICY_URL = new URL("../verification/key-policies/vortik-prod-receipt-signing-v1.json", import.meta.url);
const METADATA_SERVICE_ACCOUNT_EMAIL_URL = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email";
const PROBE_PAYLOAD = "vortik-cloud-run-kms-preactivation-probe-v1";
const PROBE_DIGEST = `sha256:${createHash("sha256").update(PROBE_PAYLOAD, "utf8").digest("hex")}`;
const BASE64URL_SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{86}$/;
const SERVICE_ACCOUNT_EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.iam\.gserviceaccount\.com$/;

export function validatePinnedProbeKeyPolicy(policy) {
  if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
    throw new TypeError("KMS preactivation probe key policy must be an object");
  }
  const digest = sha256CanonicalDigest(policy);
  if (digest !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest) {
    throw new Error("KMS preactivation probe key policy digest drifted");
  }
  const key = policy.authorized_keys?.[0];
  if (policy.policy_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_id) {
    throw new Error("KMS preactivation probe key policy_id drifted");
  }
  if (policy.authorized_keys?.length !== 1 || key?.key_id !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id) {
    throw new Error("KMS preactivation probe signing key identity drifted");
  }
  if (key.algorithm !== "Ed25519" || typeof key.public_key_spki_der_base64 !== "string") {
    throw new Error("KMS preactivation probe public key binding is invalid");
  }
  return Object.freeze({
    policy_digest: digest,
    public_key_spki_der_base64: key.public_key_spki_der_base64
  });
}

function loadPinnedProbeKeyPolicy() {
  const policy = JSON.parse(readFileSync(KEY_POLICY_URL, "utf8"));
  return validatePinnedProbeKeyPolicy(policy);
}

export async function readGoogleCloudMetadataServiceAccountEmail({
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("KMS preactivation probe requires fetch() for metadata identity");
  }
  if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs < 1 || requestTimeoutMs > 30_000) {
    throw new TypeError("KMS preactivation probe metadata timeout is invalid");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetchImpl(METADATA_SERVICE_ACCOUNT_EMAIL_URL, {
      method: "GET",
      redirect: "error",
      headers: { "Metadata-Flavor": "Google" },
      signal: controller.signal
    });
    if (!response || typeof response.ok !== "boolean" || typeof response.text !== "function") {
      throw new Error("KMS preactivation probe metadata identity returned an invalid HTTP response");
    }
    if (!response.ok) {
      throw new Error(`KMS preactivation probe metadata identity failed with HTTP ${response.status ?? "unknown"}`);
    }
    if (response.headers?.get?.("metadata-flavor") !== "Google") {
      throw new Error("KMS preactivation probe metadata identity lacks Metadata-Flavor binding");
    }
    const email = (await response.text()).trim();
    if (!SERVICE_ACCOUNT_EMAIL_PATTERN.test(email)) {
      throw new Error("KMS preactivation probe metadata identity returned an invalid service-account email");
    }
    return email;
  } finally {
    clearTimeout(timeoutId);
    controller.abort();
  }
}

export function verifyKmsPreactivationProbeSignature({
  digest,
  signatureBase64url,
  publicKeySpkiDerBase64
}) {
  if (typeof digest !== "string" || !/^sha256:[0-9a-f]{64}$/.test(digest)) {
    throw new TypeError("probe digest must be a canonical Vortik SHA-256 digest string");
  }
  if (typeof signatureBase64url !== "string" || !BASE64URL_SIGNATURE_PATTERN.test(signatureBase64url)) {
    throw new TypeError("probe signature must be canonical Ed25519 base64url without padding");
  }
  const signature = Buffer.from(signatureBase64url, "base64url");
  if (signature.byteLength !== 64 || signature.toString("base64url") !== signatureBase64url) {
    throw new TypeError("probe signature must decode to exactly 64 canonical bytes");
  }
  if (typeof publicKeySpkiDerBase64 !== "string" || publicKeySpkiDerBase64.length === 0) {
    throw new TypeError("probe public key SPKI DER base64 is required");
  }
  const publicKey = createPublicKey({
    key: Buffer.from(publicKeySpkiDerBase64, "base64"),
    format: "der",
    type: "spki"
  });
  return verify(null, Buffer.from(digest, "utf8"), publicKey, signature);
}

export const GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE = Object.freeze({
  probe_id: "vortik-cloud-run-kms-preactivation-v1",
  payload: PROBE_PAYLOAD,
  digest: PROBE_DIGEST,
  credential_source: "google-cloud-metadata-service",
  metadata_token_url: METADATA_TOKEN_URL,
  metadata_service_account_email_url: METADATA_SERVICE_ACCOUNT_EMAIL_URL,
  project_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.project_id,
  region: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.region,
  service_account: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account,
  crypto_key_version: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
  key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
  key_policy_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_id,
  key_policy_digest: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_policy_digest,
  expected_protection_level: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.expected_protection_level,
  trusted_receipt_issuance: false,
  admission_enabled: false
});

export async function runGoogleCloudRunKmsPreactivationProbe() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("KMS preactivation probe refuses static GOOGLE_APPLICATION_CREDENTIALS");
  }
  if (typeof globalThis.fetch !== "function") {
    throw new Error("KMS preactivation probe requires the runtime fetch implementation");
  }

  const trustedFetch = globalThis.fetch.bind(globalThis);
  const actualServiceAccount = await readGoogleCloudMetadataServiceAccountEmail({
    fetchImpl: trustedFetch,
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms
  });
  if (actualServiceAccount !== GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.service_account) {
    throw new Error("KMS preactivation probe is running under an unexpected service account");
  }

  const policyBinding = loadPinnedProbeKeyPolicy();
  const signer = createGoogleCloudKmsEd25519Signer({
    key_id: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.key_id,
    cryptoKeyVersion: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.crypto_key_version,
    expectedProtectionLevel: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.expected_protection_level,
    requestTimeoutMs: GOOGLE_CLOUD_RUN_RECEIPT_RUNTIME_PROFILE.request_timeout_ms,
    fetchImpl: trustedFetch
  });

  const signatureBase64url = await signer.signDigest(PROBE_DIGEST);
  const signatureVerified = verifyKmsPreactivationProbeSignature({
    digest: PROBE_DIGEST,
    signatureBase64url,
    publicKeySpkiDerBase64: policyBinding.public_key_spki_der_base64
  });
  if (!signatureVerified) {
    throw new Error("KMS preactivation probe signature failed pinned public-key verification");
  }

  return Object.freeze({
    ...GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE,
    service_account: actualServiceAccount,
    service_account_verified: true,
    key_policy_digest: policyBinding.policy_digest,
    key_policy_digest_verified: true,
    status: "PASS",
    signature_base64url: signatureBase64url,
    signature_verified: true
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const result = await runGoogleCloudRunKmsPreactivationProbe();
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`KMS preactivation probe failed: ${error?.message ?? String(error)}\n`);
    process.exitCode = 1;
  }
}
