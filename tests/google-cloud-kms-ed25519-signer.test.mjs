import assert from "node:assert/strict";
import { createPublicKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  KMS_API_ORIGIN,
  METADATA_TOKEN_URL,
  computeCrc32c,
  createGoogleCloudKmsEd25519Signer,
  createGoogleCloudMetadataAccessTokenProvider
} from "../lib/google-cloud-kms-ed25519-signer.mjs";

const VERSION_NAME = "projects/vortik-registry-production/locations/southamerica-east1/keyRings/vortik-trust/cryptoKeys/vortik-receipt-ed25519/cryptoKeyVersions/1";
const KEY_ID = "gcp-kms-vortik-receipt-ed25519-v1";
const VALID_DIGEST = `sha256:${"a".repeat(64)}`;
const ACCESS_TOKEN = "test-access-token-abcdefghijklmnopqrstuvwxyz";

function response({ ok = true, status = 200, headers = {}, payload = {} } = {}) {
  const normalizedHeaders = new Map(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));
  return {
    ok,
    status,
    headers: {
      get(name) {
        return normalizedHeaders.get(String(name).toLowerCase()) ?? null;
      }
    },
    async json() {
      return structuredClone(payload);
    }
  };
}

function validKmsPayload(signature = Buffer.alloc(64, 7)) {
  return {
    name: VERSION_NAME,
    signature: signature.toString("base64"),
    signatureCrc32c: String(computeCrc32c(signature)),
    verifiedDataCrc32c: true,
    protectionLevel: "SOFTWARE"
  };
}

test("CRC32C implementation matches the canonical Castagnoli test vector", () => {
  assert.equal(computeCrc32c(Buffer.from("123456789", "ascii")), 0xe3069283);
});

test("metadata access-token provider is fixed to the Google metadata identity endpoint", async () => {
  const calls = [];
  const provider = createGoogleCloudMetadataAccessTokenProvider({
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response({
        headers: { "Metadata-Flavor": "Google" },
        payload: {
          access_token: ACCESS_TOKEN,
          token_type: "Bearer",
          expires_in: 3599
        }
      });
    }
  });

  assert.equal(await provider(), ACCESS_TOKEN);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, METADATA_TOKEN_URL);
  assert.equal(calls[0].options.method, "GET");
  assert.equal(calls[0].options.redirect, "error");
  assert.deepEqual(calls[0].options.headers, { "Metadata-Flavor": "Google" });
});

test("metadata provider rejects responses without Google metadata binding", async () => {
  const provider = createGoogleCloudMetadataAccessTokenProvider({
    fetchImpl: async () => response({
      payload: {
        access_token: ACCESS_TOKEN,
        token_type: "Bearer",
        expires_in: 3599
      }
    })
  });
  await assert.rejects(() => provider(), /lacks Metadata-Flavor binding/);
});

test("KMS signer sends raw Vortik digest bytes with CRC32C to the exact key version", async () => {
  const calls = [];
  const signature = Buffer.alloc(64, 19);
  const signer = createGoogleCloudKmsEd25519Signer({
    key_id: KEY_ID,
    cryptoKeyVersion: VERSION_NAME,
    accessTokenProvider: async () => ACCESS_TOKEN,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return response({ payload: validKmsPayload(signature) });
    }
  });

  const result = await signer.signDigest(VALID_DIGEST);
  assert.equal(signer.algorithm, "Ed25519");
  assert.equal(signer.key_id, KEY_ID);
  assert.equal(result, signature.toString("base64url"));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `${KMS_API_ORIGIN}/v1/${VERSION_NAME}:asymmetricSign`);
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.redirect, "error");
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${ACCESS_TOKEN}`);

  const body = JSON.parse(calls[0].options.body);
  assert.deepEqual(Object.keys(body).sort(), ["data", "dataCrc32c"]);
  assert.equal(Buffer.from(body.data, "base64").toString("utf8"), VALID_DIGEST);
  assert.equal(body.dataCrc32c, String(computeCrc32c(Buffer.from(VALID_DIGEST, "utf8"))));
});

test("KMS signer rejects noncanonical receipt digests before identity or network access", async () => {
  let tokenCalls = 0;
  let networkCalls = 0;
  const signer = createGoogleCloudKmsEd25519Signer({
    key_id: KEY_ID,
    cryptoKeyVersion: VERSION_NAME,
    accessTokenProvider: async () => {
      tokenCalls += 1;
      return ACCESS_TOKEN;
    },
    fetchImpl: async () => {
      networkCalls += 1;
      return response({ payload: validKmsPayload() });
    }
  });

  await assert.rejects(() => signer.signDigest("caller-controlled-message"), /canonical Vortik SHA-256 receipt digests/);
  assert.equal(tokenCalls, 0);
  assert.equal(networkCalls, 0);
});

test("KMS signer fails closed on response identity and transport-integrity mismatches", async () => {
  const cases = [
    ["different key version", { ...validKmsPayload(), name: `${VERSION_NAME.slice(0, -1)}2` }, /different CryptoKeyVersion/],
    ["unverified request CRC", { ...validKmsPayload(), verifiedDataCrc32c: false }, /did not verify request data CRC32C/],
    ["different protection level", { ...validKmsPayload(), protectionLevel: "HSM" }, /unexpected protection level/],
    ["signature CRC mismatch", { ...validKmsPayload(), signatureCrc32c: "0" }, /failed signature CRC32C verification/],
    ["wrong Ed25519 signature size", validKmsPayload(Buffer.alloc(63, 7)), /exactly 64 bytes/]
  ];

  for (const [label, payload, expected] of cases) {
    const signer = createGoogleCloudKmsEd25519Signer({
      key_id: KEY_ID,
      cryptoKeyVersion: VERSION_NAME,
      accessTokenProvider: async () => ACCESS_TOKEN,
      fetchImpl: async () => response({ payload })
    });
    await assert.rejects(() => signer.signDigest(VALID_DIGEST), expected, label);
  }
});

test("pre-provisioned production policy binds the observed Google KMS Ed25519 public key", async () => {
  const policy = JSON.parse(await readFile(
    new URL("../verification/key-policies/vortik-prod-receipt-signing-v1.json", import.meta.url),
    "utf8"
  ));
  assert.equal(policy.policy_id, "vortik-prod-receipt-signing-v1");
  assert.equal(policy.authorized_keys.length, 1);
  const key = policy.authorized_keys[0];
  assert.equal(key.key_id, KEY_ID);
  assert.equal(key.algorithm, "Ed25519");
  assert.equal(key.status, "active");
  assert.deepEqual(key.allowed_receipt_types, ["primary_source", "ens_mainnet"]);
  assert.equal(key.not_before, 1787437914);
  assert.equal(key.not_after, 1818973914);

  const publicKey = createPublicKey({
    key: Buffer.from(key.public_key_spki_der_base64, "base64"),
    format: "der",
    type: "spki"
  });
  assert.equal(publicKey.asymmetricKeyType, "ed25519");
});
