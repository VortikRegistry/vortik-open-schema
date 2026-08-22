#!/usr/bin/env node
import { createPublicKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const POLICY_PATH = "verification/key-policies/vortik-prod-receipt-signing-v1.json";
const POLICY_SCHEMA_PATH = "schemas/verification/vortik-verification-key-policy/1.0.0/schema.json";
const REQUIREMENTS_PATH = "verification/requirements.json";
const EXPECTED_KEY_ID = "gcp-kms-vortik-receipt-ed25519-v1";
const EXPECTED_POLICY_ID = "vortik-prod-receipt-signing-v1";
const EXPECTED_PUBLIC_KEY_SPKI_DER_BASE64 = "MCowBQYDK2VwAyEAhwRbk6gD5zrP06PmXnirY7jfGkLqe11RkNdS/H4KSt4=";
const EXPECTED_POLICY_DIGEST = "sha256:b7482b8150cd3775aa8c1790c920e7cc2cc4a87397a4736f2b8846affc9884c1";
const EXPECTED_NOT_BEFORE = 1787437914;
const EXPECTED_NOT_AFTER = 1818973914;

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
}

const [policy, schema, requirements] = await Promise.all([
  readJson(POLICY_PATH),
  readJson(POLICY_SCHEMA_PATH),
  readJson(REQUIREMENTS_PATH)
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(policy)) {
  throw new Error(`production KMS key policy violates its closed contract:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

const policyDigest = sha256CanonicalDigest(policy);
if (policyDigest !== EXPECTED_POLICY_DIGEST) {
  throw new Error("production KMS key policy digest drifted from the independently recorded provisioning anchor");
}
if (policy.policy_id !== EXPECTED_POLICY_ID) throw new Error("production KMS policy_id drifted");
if (policy.authorized_keys.length !== 1) throw new Error("production KMS policy must bind exactly one initial key version");
const key = policy.authorized_keys[0];
if (key.key_id !== EXPECTED_KEY_ID) throw new Error("production KMS key_id drifted");
if (key.public_key_spki_der_base64 !== EXPECTED_PUBLIC_KEY_SPKI_DER_BASE64) {
  throw new Error("production KMS public verification key drifted from the pre-provisioned CryptoKeyVersion");
}
if (key.algorithm !== "Ed25519" || key.status !== "active") throw new Error("production KMS public verification key state is invalid");
if (key.not_before !== EXPECTED_NOT_BEFORE || key.not_after !== EXPECTED_NOT_AFTER) {
  throw new Error("production KMS key authorization window drifted");
}
if (key.not_after <= key.not_before) throw new Error("production KMS key authorization window is invalid");
if (JSON.stringify(key.allowed_receipt_types) !== JSON.stringify(["primary_source", "ens_mainnet"])) {
  throw new Error("production KMS key receipt-type authority drifted");
}

const publicKey = createPublicKey({
  key: Buffer.from(key.public_key_spki_der_base64, "base64"),
  format: "der",
  type: "spki"
});
if (publicKey.asymmetricKeyType !== "ed25519") throw new Error("production KMS public verification key is not Ed25519");

if (requirements.implementation_state?.trusted_receipt_issuance !== false) {
  throw new Error("Google Cloud KMS provisioning must not activate trusted receipt issuance");
}
if (requirements.admission?.enabled !== false) {
  throw new Error("Google Cloud KMS provisioning must not enable candidate admission");
}
if (requirements.admission?.commercial_authority !== false || requirements.ens_mainnet_verification?.ownership_inference !== false) {
  throw new Error("Google Cloud KMS provisioning must preserve authority boundaries");
}

console.log(`Validated Google Cloud KMS public key policy: ${POLICY_PATH}`);
console.log(`Pinned public key SPKI: ${EXPECTED_PUBLIC_KEY_SPKI_DER_BASE64}`);
console.log(`Policy digest: ${policyDigest}`);
console.log("Production trusted receipt issuance remains disabled.");
console.log("Candidate admission remains disabled.");
