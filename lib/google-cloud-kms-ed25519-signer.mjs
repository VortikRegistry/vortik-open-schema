const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const CRYPTO_KEY_VERSION_PATTERN = /^projects\/[a-z][a-z0-9-]{4,28}[a-z0-9]\/locations\/[a-z0-9-]{1,63}\/keyRings\/[A-Za-z0-9_-]{1,63}\/cryptoKeys\/[A-Za-z0-9_-]{1,63}\/cryptoKeyVersions\/[1-9][0-9]*$/;
const METADATA_TOKEN_URL = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token";
const KMS_API_ORIGIN = "https://cloudkms.googleapis.com";
const CRC32C_POLYNOMIAL = 0x82f63b78;

const CRC32C_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1
        ? (CRC32C_POLYNOMIAL ^ (value >>> 1))
        : (value >>> 1);
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function assertFetch(fetchImpl) {
  if (typeof fetchImpl !== "function") throw new TypeError("Google Cloud runtime requires fetch()");
  return (...args) => fetchImpl(...args);
}

function assertResponseShape(response, label) {
  if (!response || typeof response !== "object" || typeof response.ok !== "boolean" || typeof response.json !== "function") {
    throw new Error(`${label} returned an invalid HTTP response`);
  }
}

async function readJson(response, label) {
  assertResponseShape(response, label);
  try {
    return await response.json();
  } catch {
    throw new Error(`${label} returned invalid JSON`);
  }
}

function parseCrc32c(value, label) {
  if (typeof value !== "string" || !/^[0-9]{1,10}$/.test(value)) {
    throw new Error(`${label} is invalid`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 0xffffffff) {
    throw new Error(`${label} is outside uint32 range`);
  }
  return parsed >>> 0;
}

function decodeCanonicalBase64(value, label) {
  if (typeof value !== "string" || value.length === 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error(`${label} is not canonical base64`);
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value) {
    throw new Error(`${label} is not canonical base64`);
  }
  return bytes;
}

export function computeCrc32c(value) {
  const bytes = value instanceof Uint8Array ? value : Buffer.from(value);
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC32C_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function createGoogleCloudMetadataAccessTokenProvider({ fetchImpl = globalThis.fetch } = {}) {
  const request = assertFetch(fetchImpl);

  return async function getAccessToken() {
    const response = await request(METADATA_TOKEN_URL, {
      method: "GET",
      redirect: "error",
      headers: {
        "Metadata-Flavor": "Google"
      }
    });
    assertResponseShape(response, "Google Cloud metadata token endpoint");
    if (!response.ok) {
      throw new Error(`Google Cloud metadata token endpoint failed with HTTP ${response.status ?? "unknown"}`);
    }
    const metadataFlavor = response.headers?.get?.("metadata-flavor");
    if (metadataFlavor !== "Google") {
      throw new Error("Google Cloud metadata token response lacks Metadata-Flavor binding");
    }
    const payload = await readJson(response, "Google Cloud metadata token endpoint");
    if (typeof payload.access_token !== "string" || payload.access_token.length < 20 || /\s/.test(payload.access_token)) {
      throw new Error("Google Cloud metadata token response lacks a valid access token");
    }
    if (payload.token_type !== "Bearer") {
      throw new Error("Google Cloud metadata token response uses an unexpected token type");
    }
    if (!Number.isSafeInteger(payload.expires_in) || payload.expires_in <= 0) {
      throw new Error("Google Cloud metadata token response has invalid expiry");
    }
    return payload.access_token;
  };
}

export function createGoogleCloudKmsEd25519Signer({
  key_id,
  cryptoKeyVersion,
  expectedProtectionLevel = "SOFTWARE",
  accessTokenProvider,
  fetchImpl = globalThis.fetch
}) {
  if (!ID_PATTERN.test(key_id ?? "")) throw new Error("Google Cloud KMS signer key_id is invalid");
  if (!CRYPTO_KEY_VERSION_PATTERN.test(cryptoKeyVersion ?? "")) {
    throw new Error("Google Cloud KMS signer requires an exact CryptoKeyVersion resource name");
  }
  if (!new Set(["SOFTWARE", "HSM"]).has(expectedProtectionLevel)) {
    throw new Error("Google Cloud KMS signer expected protection level is invalid");
  }

  const request = assertFetch(fetchImpl);
  const getAccessToken = accessTokenProvider
    ? (() => {
        if (typeof accessTokenProvider !== "function") throw new TypeError("Google Cloud KMS signer accessTokenProvider must be a function");
        const provider = accessTokenProvider;
        return () => provider();
      })()
    : createGoogleCloudMetadataAccessTokenProvider({ fetchImpl: request });
  const versionName = cryptoKeyVersion;
  const endpoint = `${KMS_API_ORIGIN}/v1/${versionName}:asymmetricSign`;

  return Object.freeze({
    algorithm: "Ed25519",
    key_id,
    async signDigest(digest) {
      if (typeof digest !== "string" || !DIGEST_PATTERN.test(digest)) {
        throw new Error("Google Cloud KMS signer accepts only canonical Vortik SHA-256 receipt digests");
      }

      const data = Buffer.from(digest, "utf8");
      const dataCrc32c = computeCrc32c(data);
      const accessToken = await getAccessToken();
      if (typeof accessToken !== "string" || accessToken.length < 20 || /\s/.test(accessToken)) {
        throw new Error("Google Cloud KMS signer received an invalid access token");
      }

      const response = await request(endpoint, {
        method: "POST",
        redirect: "error",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          data: data.toString("base64"),
          dataCrc32c: String(dataCrc32c)
        })
      });
      assertResponseShape(response, "Google Cloud KMS asymmetricSign");
      if (!response.ok) {
        throw new Error(`Google Cloud KMS asymmetricSign failed with HTTP ${response.status ?? "unknown"}`);
      }

      const payload = await readJson(response, "Google Cloud KMS asymmetricSign");
      if (payload.name !== versionName) {
        throw new Error("Google Cloud KMS asymmetricSign returned a different CryptoKeyVersion");
      }
      if (payload.verifiedDataCrc32c !== true) {
        throw new Error("Google Cloud KMS asymmetricSign did not verify request data CRC32C");
      }
      if (payload.protectionLevel !== expectedProtectionLevel) {
        throw new Error("Google Cloud KMS asymmetricSign returned an unexpected protection level");
      }

      const signature = decodeCanonicalBase64(payload.signature, "Google Cloud KMS signature");
      if (signature.byteLength !== 64) {
        throw new Error("Google Cloud KMS Ed25519 signature must be exactly 64 bytes");
      }
      const expectedSignatureCrc32c = parseCrc32c(payload.signatureCrc32c, "Google Cloud KMS signature CRC32C");
      if (computeCrc32c(signature) !== expectedSignatureCrc32c) {
        throw new Error("Google Cloud KMS asymmetricSign response failed signature CRC32C verification");
      }

      return signature.toString("base64url");
    }
  });
}

export {
  KMS_API_ORIGIN,
  METADATA_TOKEN_URL
};
