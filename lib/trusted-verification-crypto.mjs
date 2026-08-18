import { createHash, createPublicKey, verify as verifySignature } from "node:crypto";

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

function assertUnicodeScalarString(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError("canonical JSON strings must not contain lone high surrogates");
      }
      i += 1;
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError("canonical JSON strings must not contain lone low surrogates");
    }
  }
}

function assertCanonicalValue(value, path = "$") {
  if (value === null || typeof value === "boolean") return;

  if (typeof value === "string") {
    assertUnicodeScalarString(value);
    return;
  }

  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) {
      throw new TypeError(`${path} must use safe non-negative/positive integer JSON numbers only; floats, unsafe integers and -0 are forbidden`);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertCanonicalValue(item, `${path}[${index}]`));
    return;
  }

  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(`${path} must be a plain JSON object`);
    }

    for (const [key, child] of Object.entries(value)) {
      assertUnicodeScalarString(key);
      if (child === undefined) throw new TypeError(`${path}.${key} must not be undefined`);
      assertCanonicalValue(child, `${path}.${key}`);
    }
    return;
  }

  throw new TypeError(`${path} contains a non-JSON value`);
}

export function canonicalizeJcsConstrained(value) {
  assertCanonicalValue(value);

  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalizeJcsConstrained(item)).join(",")}]`;

  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${canonicalizeJcsConstrained(value[key])}`).join(",")}}`;
}

export function sha256CanonicalDigest(value) {
  const canonical = canonicalizeJcsConstrained(value);
  return `sha256:${createHash("sha256").update(canonical, "utf8").digest("hex")}`;
}

export function computeTrustedReceiptDigest(receipt) {
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    throw new TypeError("receipt must be an object");
  }

  const unsignedReceipt = structuredClone(receipt);
  delete unsignedReceipt.receipt_digest;
  delete unsignedReceipt.signature;
  return sha256CanonicalDigest(unsignedReceipt);
}

export function assertAdmissionIntentBinding(claim, intent) {
  const claimDigest = sha256CanonicalDigest(claim);
  if (intent.claim_digest !== claimDigest) throw new Error("admission intent claim digest mismatch");
  if (intent.contribution_digest !== claim.contribution_digest) throw new Error("admission intent contribution digest mismatch");
  if (intent.review_digest !== claim.review_digest) throw new Error("admission intent review digest mismatch");
  if (intent.normalized_candidate_name !== claim.normalized_candidate_name) throw new Error("admission intent candidate name mismatch");
  if (intent.proposed_registry_change.proposed_ens !== intent.normalized_candidate_name) {
    throw new Error("admission intent proposed ENS must equal normalized candidate name");
  }
}

export function assertReceiptSubjectBinding(receipt, expected) {
  const keys = [
    "contribution_digest",
    "review_digest",
    "claim_digest",
    "admission_intent_digest",
    "normalized_candidate_name"
  ];

  for (const key of keys) {
    if (receipt?.subject?.[key] !== expected?.[key]) {
      throw new Error(`receipt subject mismatch for ${key}`);
    }
  }
}

export function assertSameReceiptSubject(first, second) {
  assertReceiptSubjectBinding(first, second.subject);
}

export function assertReceiptTemporalSemantics(receipt) {
  if (!Number.isSafeInteger(receipt.issued_at) || !Number.isSafeInteger(receipt.trusted_issued_at)) {
    throw new Error("receipt issuance timestamps must be safe integers");
  }
  if (receipt.issued_at !== receipt.trusted_issued_at) {
    throw new Error("issued_at must equal trusted_issued_at in receipt v1");
  }
  if (!Number.isSafeInteger(receipt.admission_valid_until)) {
    throw new Error("admission_valid_until must be a safe integer");
  }
  if (receipt.admission_valid_until < receipt.trusted_issued_at) {
    throw new Error("admission_valid_until must not precede trusted_issued_at");
  }
  if (receipt.admission_valid_until > receipt.trusted_issued_at + 86400) {
    throw new Error("receipt validity exceeds 86400 seconds from trusted issuance");
  }

  if (receipt.receipt_type === "ens_mainnet") {
    const { block, lookup, normalized_candidate_name: payloadName, providers } = receipt.payload;
    if (payloadName !== receipt.subject.normalized_candidate_name) {
      throw new Error("ENS payload name must match receipt subject");
    }
    if (block.finalized !== true) throw new Error("ENS block must be finalized");
    if (block.timestamp > receipt.trusted_issued_at) throw new Error("ENS block timestamp must not be in the future");
    if (receipt.trusted_issued_at - block.timestamp > 1800) throw new Error("ENS block is older than 1800 seconds at trusted issuance");
    if (lookup.base_registrar_expiry <= receipt.trusted_issued_at) throw new Error("ENS registration must remain active after trusted issuance");
    if (receipt.admission_valid_until > lookup.base_registrar_expiry) throw new Error("receipt validity must not exceed ENS expiry");
    if (lookup.registry_record_exists !== true || lookup.active_registration !== true || lookup.eth_registrar_owner_matches_base_registrar !== true) {
      throw new Error("ENS receipt must contain affirmative active-registration evidence");
    }

    if (new Set(providers.map((provider) => provider.provider_id)).size !== 2) {
      throw new Error("ENS receipt requires two distinct provider identities");
    }

    for (const provider of providers) {
      if (provider.block_hash !== block.hash ||
          provider.state_root !== block.state_root ||
          provider.timestamp !== block.timestamp ||
          provider.lookup_result_digest !== lookup.lookup_result_digest) {
        throw new Error(`ENS provider ${provider.provider_id} evidence disagrees with asserted block/lookup`);
      }
    }
  }
}

export function assertKeyPolicyAuthorizesReceipt(receipt, keyPolicy) {
  const expectedPolicyDigest = sha256CanonicalDigest(keyPolicy);
  if (receipt.verifier.key_policy_digest !== expectedPolicyDigest) {
    throw new Error("receipt key policy digest mismatch");
  }
  if (receipt.verifier.key_policy_id !== keyPolicy.policy_id ||
      receipt.verifier.key_policy_version !== keyPolicy.policy_version) {
    throw new Error("receipt key policy identity mismatch");
  }

  const matchingKeys = keyPolicy.authorized_keys.filter((candidate) => candidate.key_id === receipt.signature.key_id);
  if (matchingKeys.length !== 1) throw new Error("receipt signing key identity must resolve to exactly one authorized policy key");
  const [key] = matchingKeys;
  if (key.status !== "active") throw new Error("receipt signing key is not active");
  if (key.algorithm !== "Ed25519" || receipt.signature.algorithm !== "Ed25519") {
    throw new Error("receipt signature algorithm must be Ed25519");
  }
  if (!key.allowed_receipt_types.includes(receipt.receipt_type)) {
    throw new Error("receipt type is not authorized for signing key");
  }
  if (receipt.trusted_issued_at < key.not_before || receipt.trusted_issued_at > key.not_after) {
    throw new Error("receipt signing key is outside its authorization window");
  }

  return key;
}

export function verifyTrustedReceiptSignature(receipt, keyPolicy) {
  const computedDigest = computeTrustedReceiptDigest(receipt);
  if (computedDigest !== receipt.receipt_digest) {
    throw new Error("receipt digest does not match canonical unsigned receipt");
  }

  const key = assertKeyPolicyAuthorizesReceipt(receipt, keyPolicy);
  const publicKey = createPublicKey({
    key: Buffer.from(key.public_key_spki_der_base64, "base64"),
    format: "der",
    type: "spki"
  });

  const signature = Buffer.from(receipt.signature.signature_base64url, "base64url");
  const valid = verifySignature(
    null,
    Buffer.from(receipt.receipt_digest, "utf8"),
    publicKey,
    signature
  );

  if (!valid) throw new Error("receipt Ed25519 signature is invalid");
  return true;
}

export { MAX_SAFE_INTEGER };
