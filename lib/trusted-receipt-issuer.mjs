import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";

import {
  assertAdmissionIntentBinding,
  assertKeyPolicyAuthorizesReceipt,
  assertReceiptEvidenceSemantics,
  assertReceiptTemporalSemantics,
  computeTrustedReceiptDigest,
  sha256CanonicalDigest,
  verifyTrustedReceiptSignature
} from "./trusted-verification-crypto.mjs";

const RECEIPT_SCHEMA_ID = "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json";
const CLAIM_SCHEMA_URL = new URL("../schemas/verification/vortik-verification-claim/1.0.0/schema.json", import.meta.url);
const INTENT_SCHEMA_URL = new URL("../schemas/verification/vortik-admission-intent/1.0.0/schema.json", import.meta.url);
const RECEIPT_SCHEMA_URL = new URL("../schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json", import.meta.url);
const MAX_ADMISSION_VALIDITY_SECONDS = 86_400;
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const VERSION_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const SIGNATURE_PATTERN = /^[A-Za-z0-9_-]{80,128}$/;
const SIGNATURE_CONTRACT_PLACEHOLDER = "A".repeat(86);

const contractAjv = new Ajv2020({ allErrors: true, strict: false });
const validateClaimContract = contractAjv.compile(JSON.parse(readFileSync(CLAIM_SCHEMA_URL, "utf8")));
const validateIntentContract = contractAjv.compile(JSON.parse(readFileSync(INTENT_SCHEMA_URL, "utf8")));
const validateReceiptContract = contractAjv.compile(JSON.parse(readFileSync(RECEIPT_SCHEMA_URL, "utf8")));

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function snapshot(value, label) {
  assertPlainObject(value, label);
  let cloned;
  try {
    cloned = structuredClone(value);
  } catch {
    throw new TypeError(`${label} must be snapshotable structured data`);
  }
  assertPlainObject(cloned, `${label} snapshot`);
  return cloned;
}

function assertContract(validate, value, label) {
  if (!validate(value)) {
    throw new Error(`${label} violates its closed versioned contract: ${contractAjv.errorsText(validate.errors, { separator: "; " })}`);
  }
}

function assertClosedGates(claim, intent) {
  const claimGates = {
    claim_trusted: false,
    authoritative_source_selected: false,
    registry_pr_eligible: false,
    registry_mutated: false,
    ownership_inferred: false,
    commercial_authority: false,
    separate_registry_pr_required: true
  };
  const intentGates = {
    admission_enabled: false,
    trusted_primary_source_receipt_available: false,
    trusted_ens_receipt_available: false,
    registry_pr_eligible: false,
    registry_mutated: false,
    ownership_inferred: false,
    commercial_authority: false,
    separate_registry_pr_required: true
  };

  for (const [key, expected] of Object.entries(claimGates)) {
    if (claim?.gates?.[key] !== expected) throw new Error(`verification claim gate ${key} is not fail-closed`);
  }
  for (const [key, expected] of Object.entries(intentGates)) {
    if (intent?.gates?.[key] !== expected) throw new Error(`admission intent gate ${key} is not fail-closed`);
  }
}

function bindVerifier(verifier, identity, label) {
  assertPlainObject(verifier, `${label} verifier`);
  if (typeof verifier.verify !== "function") throw new TypeError(`${label} verifier requires verify()`);
  assertPlainObject(identity, `${label} verifier identity`);
  if (!ID_PATTERN.test(identity.verifier_id ?? "")) throw new Error(`${label} verifier_id is invalid`);
  if (!VERSION_PATTERN.test(identity.verifier_version ?? "")) throw new Error(`${label} verifier_version is invalid`);
  if (!COMMIT_PATTERN.test(identity.code_commit ?? "")) throw new Error(`${label} code_commit is invalid`);

  const verify = verifier.verify.bind(verifier);
  return Object.freeze({
    verify,
    identity: Object.freeze({
      verifier_id: identity.verifier_id,
      verifier_version: identity.verifier_version,
      code_commit: identity.code_commit
    })
  });
}

function bindSigner(signer) {
  assertPlainObject(signer, "protected signer");
  if (signer.algorithm !== "Ed25519") throw new Error("protected signer algorithm must be Ed25519");
  if (!ID_PATTERN.test(signer.key_id ?? "")) throw new Error("protected signer key_id is invalid");
  if (typeof signer.signDigest !== "function") throw new TypeError("protected signer requires signDigest()");
  for (const forbidden of ["privateKey", "private_key", "secret", "seed"]) {
    if (Object.prototype.hasOwnProperty.call(signer, forbidden)) {
      throw new Error(`trusted receipt issuer does not accept raw signer field ${forbidden}`);
    }
  }
  return Object.freeze({
    algorithm: "Ed25519",
    key_id: signer.key_id,
    signDigest: signer.signDigest.bind(signer)
  });
}

function bindTrustedClock(clock) {
  assertPlainObject(clock, "trusted issuance clock");
  if (typeof clock.readTrustedTime !== "function") throw new TypeError("trusted issuance clock requires readTrustedTime()");
  if (typeof clock.source_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(clock.source_id)) {
    throw new Error("trusted issuance clock source_id is invalid");
  }
  if (!ID_PATTERN.test(clock.policy_id ?? "")) throw new Error("trusted issuance clock policy_id is invalid");
  if (!DIGEST_PATTERN.test(clock.policy_digest ?? "")) throw new Error("trusted issuance clock policy_digest is invalid");
  for (const forbidden of ["issued_at", "trusted_issued_at", "now", "timestamp"]) {
    if (Object.prototype.hasOwnProperty.call(clock, forbidden)) {
      throw new Error(`trusted issuance clock must not expose caller-selectable field ${forbidden}`);
    }
  }
  return Object.freeze({
    source_id: clock.source_id,
    policy_id: clock.policy_id,
    policy_digest: clock.policy_digest,
    readTrustedTime: clock.readTrustedTime.bind(clock)
  });
}

function bindRandomBytes(randomBytesImpl) {
  if (typeof randomBytesImpl !== "function") throw new TypeError("trusted receipt issuer requires randomBytes implementation");
  return function randomHex16(label) {
    const value = randomBytesImpl(16);
    if (!(value instanceof Uint8Array) || value.byteLength !== 16) {
      throw new Error(`${label} randomness must return exactly 16 bytes`);
    }
    return Buffer.from(value).toString("hex");
  };
}

function bindKeyPolicy(keyPolicy, trustedPolicyIdentity) {
  const policy = snapshot(keyPolicy, "verification key policy");
  const identity = snapshot(trustedPolicyIdentity, "trusted key-policy identity");
  if (!ID_PATTERN.test(identity.policy_id ?? "") || identity.policy_version !== "1.0.0" || !DIGEST_PATTERN.test(identity.policy_digest ?? "")) {
    throw new Error("trusted key-policy identity is invalid");
  }
  const computedDigest = sha256CanonicalDigest(policy);
  if (identity.policy_id !== policy.policy_id || identity.policy_version !== policy.policy_version || identity.policy_digest !== computedDigest) {
    throw new Error("verification key policy does not match trusted runtime identity");
  }
  return Object.freeze({
    policy: Object.freeze(policy),
    identity: Object.freeze(identity),
    digest: computedDigest
  });
}

function verifierMetadata(identity, keyPolicyBinding) {
  return {
    verifier_id: identity.verifier_id,
    verifier_version: identity.verifier_version,
    code_commit: identity.code_commit,
    key_policy_id: keyPolicyBinding.identity.policy_id,
    key_policy_version: keyPolicyBinding.identity.policy_version,
    key_policy_digest: keyPolicyBinding.digest
  };
}

function buildSubject(claim, intent) {
  assertAdmissionIntentBinding(claim, intent);
  return {
    contribution_digest: claim.contribution_digest,
    review_digest: claim.review_digest,
    claim_digest: sha256CanonicalDigest(claim),
    admission_intent_digest: sha256CanonicalDigest(intent),
    candidate_name: claim.candidate_name,
    normalized_candidate_name: claim.normalized_candidate_name
  };
}

function assertReceiptRequest(input, label) {
  assertPlainObject(input, label);
  if (Object.prototype.hasOwnProperty.call(input, "payload")) throw new Error(`${label} must not supply verifier payload`);
  for (const forbidden of ["issued_at", "trusted_issued_at", "admission_valid_until", "signature", "key_id", "receipt_digest", "receipt_id", "nonce"]) {
    if (Object.prototype.hasOwnProperty.call(input, forbidden)) {
      throw new Error(`${label} must not supply protected receipt field ${forbidden}`);
    }
  }
}

export function createTrustedReceiptIssuerCore({
  primarySourceVerifier,
  ensMainnetVerifier,
  verifierIdentities,
  keyPolicy,
  trustedPolicyIdentity,
  signer,
  trustedClock,
  randomBytesImpl = randomBytes
}) {
  assertPlainObject(verifierIdentities, "verifier identities");
  const primary = bindVerifier(primarySourceVerifier, verifierIdentities.primary_source, "primary-source");
  const ens = bindVerifier(ensMainnetVerifier, verifierIdentities.ens_mainnet, "ENS mainnet");
  const protectedSigner = bindSigner(signer);
  const clock = bindTrustedClock(trustedClock);
  const keyPolicyBinding = bindKeyPolicy(keyPolicy, trustedPolicyIdentity);
  const randomHex16 = bindRandomBytes(randomBytesImpl);

  async function issue({ receiptType, claim: rawClaim, intent: rawIntent, verifierBinding, derivePayload }) {
    const claim = snapshot(rawClaim, "verification claim");
    const intent = snapshot(rawIntent, "admission intent");
    assertClosedGates(claim, intent);
    assertContract(validateClaimContract, claim, "verification claim");
    assertContract(validateIntentContract, intent, "admission intent");
    const subject = buildSubject(claim, intent);

    const payload = snapshot(await derivePayload(claim), `${receiptType} verifier payload`);
    const trustedIssuedAt = await clock.readTrustedTime();
    if (!Number.isSafeInteger(trustedIssuedAt) || trustedIssuedAt < 0) {
      throw new Error("trusted issuance clock returned an invalid Unix-seconds value");
    }

    let admissionValidUntil = trustedIssuedAt + MAX_ADMISSION_VALIDITY_SECONDS;
    if (!Number.isSafeInteger(admissionValidUntil)) throw new Error("trusted receipt validity exceeds safe integer range");
    if (receiptType === "ens_mainnet") {
      if (!Number.isSafeInteger(payload?.lookup?.base_registrar_expiry)) {
        throw new Error("ENS verifier payload lacks a valid registration expiry");
      }
      if (payload.lookup.base_registrar_expiry <= trustedIssuedAt) {
        throw new Error("ENS registration must remain active after trusted issuance");
      }
      admissionValidUntil = Math.min(admissionValidUntil, payload.lookup.base_registrar_expiry);
    }

    const receipt = {
      $schema: RECEIPT_SCHEMA_ID,
      receipt: "vortik-trusted-verification-receipt",
      receipt_version: "1.0.0",
      receipt_type: receiptType,
      receipt_id: `receipt-${receiptType}-${randomHex16("receipt id")}`,
      subject,
      verifier: verifierMetadata(verifierBinding.identity, keyPolicyBinding),
      canonicalization: "RFC8785-JCS-constrained-v1",
      digest_algorithm: "SHA-256",
      issued_at: trustedIssuedAt,
      trusted_issued_at: trustedIssuedAt,
      admission_valid_until: admissionValidUntil,
      trusted_issuance_clock: {
        source_id: clock.source_id,
        policy_id: clock.policy_id,
        policy_digest: clock.policy_digest,
        policy_validated: true,
        not_caller_controlled: true
      },
      payload,
      replay_protection: {
        domain: "vortik-trusted-verification-receipt-v1",
        nonce: randomHex16("receipt nonce"),
        single_use_admission_required: true
      },
      receipt_digest: "",
      signature: {
        algorithm: protectedSigner.algorithm,
        key_id: protectedSigner.key_id,
        signature_base64url: ""
      }
    };

    assertReceiptTemporalSemantics(receipt);
    assertReceiptEvidenceSemantics(receipt, claim);
    assertKeyPolicyAuthorizesReceipt(receipt, keyPolicyBinding.policy, keyPolicyBinding.identity);

    receipt.receipt_digest = computeTrustedReceiptDigest(receipt);
    const preSigningContractCandidate = structuredClone(receipt);
    preSigningContractCandidate.signature.signature_base64url = SIGNATURE_CONTRACT_PLACEHOLDER;
    assertContract(validateReceiptContract, preSigningContractCandidate, "trusted receipt");

    const signature = await protectedSigner.signDigest(receipt.receipt_digest);
    if (typeof signature !== "string" || !SIGNATURE_PATTERN.test(signature)) {
      throw new Error("protected signer returned an invalid Ed25519 base64url signature");
    }
    receipt.signature.signature_base64url = signature;

    assertContract(validateReceiptContract, receipt, "trusted receipt");
    verifyTrustedReceiptSignature(receipt, keyPolicyBinding.policy, keyPolicyBinding.identity);
    return Object.freeze(structuredClone(receipt));
  }

  return Object.freeze({
    async issuePrimarySourceReceipt(input) {
      assertReceiptRequest(input, "primary-source receipt request");
      return issue({
        receiptType: "primary_source",
        claim: input.claim,
        intent: input.admissionIntent,
        verifierBinding: primary,
        derivePayload: (claim) => primary.verify({ claim, selector: input.selector })
      });
    },
    async issueEnsMainnetReceipt(input) {
      assertReceiptRequest(input, "ENS mainnet receipt request");
      return issue({
        receiptType: "ens_mainnet",
        claim: input.claim,
        intent: input.admissionIntent,
        verifierBinding: ens,
        derivePayload: (claim) => ens.verify({ normalizedCandidateName: claim.normalized_candidate_name })
      });
    }
  });
}

export { MAX_ADMISSION_VALIDITY_SECONDS, RECEIPT_SCHEMA_ID };
