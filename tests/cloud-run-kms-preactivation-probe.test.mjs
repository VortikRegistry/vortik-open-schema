import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import {
  GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE,
  verifyKmsPreactivationProbeSignature
} from "../service/cloud-run-kms-preactivation-probe.mjs";

test("KMS preactivation probe profile is fixed to the closed production identity", () => {
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.project_id, "vortik-registry-production");
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.region, "southamerica-east1");
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.service_account, "vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com");
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.key_id, "gcp-kms-vortik-receipt-ed25519-v1");
  assert.match(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.digest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.credential_source, "google-cloud-metadata-service");
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.trusted_receipt_issuance, false);
  assert.equal(GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.admission_enabled, false);
});

test("probe signature verifier accepts only a matching Ed25519 signature", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const digest = GOOGLE_CLOUD_RUN_KMS_PREACTIVATION_PROBE_PROFILE.digest;
  const signatureBase64url = sign(null, Buffer.from(digest, "utf8"), privateKey).toString("base64url");
  const publicKeySpkiDerBase64 = publicKey.export({ format: "der", type: "spki" }).toString("base64");

  assert.equal(verifyKmsPreactivationProbeSignature({ digest, signatureBase64url, publicKeySpkiDerBase64 }), true);

  const wrongDigest = `sha256:${"0".repeat(64)}`;
  assert.equal(verifyKmsPreactivationProbeSignature({ digest: wrongDigest, signatureBase64url, publicKeySpkiDerBase64 }), false);
});
