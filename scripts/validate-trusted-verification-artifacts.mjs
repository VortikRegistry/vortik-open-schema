#!/usr/bin/env node
import { generateKeyPairSync, sign as signMessage } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import {
  assertAdmissionIntentBinding,
  assertReceiptSubjectBinding,
  assertReceiptTemporalSemantics,
  assertSameReceiptSubject,
  canonicalizeJcsConstrained,
  computeTrustedReceiptDigest,
  sha256CanonicalDigest,
  verifyTrustedReceiptSignature
} from "../lib/trusted-verification-crypto.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEMA_PATHS = [
  "schemas/verification/vortik-verification-claim/1.0.0/schema.json",
  "schemas/verification/vortik-admission-intent/1.0.0/schema.json",
  "schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json",
  "schemas/verification/vortik-verification-key-policy/1.0.0/schema.json"
];

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function publicMirrorPath(sourcePath) {
  return `docs/${sourcePath}`;
}

function assertByteIdentical(label, sourceText, mirrorText) {
  if (sourceText !== mirrorText) throw new Error(`${label} must be byte-identical`);
}

function assertThrows(label, fn) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`expected rejection: ${label}`);
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validators = new Map();

for (const schemaPath of SCHEMA_PATHS) {
  const [sourceText, mirrorText] = await Promise.all([
    readText(schemaPath),
    readText(publicMirrorPath(schemaPath))
  ]);
  assertByteIdentical(schemaPath, sourceText, mirrorText);
  const schema = JSON.parse(sourceText);
  validators.set(schema.title, ajv.compile(schema));
}

function validateOrThrow(title, value) {
  const validate = validators.get(title);
  if (!validate) throw new Error(`missing validator for ${title}`);
  if (!validate(value)) {
    throw new Error(`${title} validation failed:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
  }
}

const contributionDigest = sha256CanonicalDigest({ contribution_id: "contrib-1", candidate_name: "candidate.eth" });
const reviewDigest = sha256CanonicalDigest({ review_id: "review-1", contribution_digest: contributionDigest });

const claim = {
  $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-claim/1.0.0/schema.json",
  claim: "vortik-verification-claim",
  claim_version: "1.0.0",
  claim_id: "claim-1",
  contribution_id: "contrib-1",
  contribution_digest: contributionDigest,
  review_id: "review-1",
  review_digest: reviewDigest,
  candidate_name: "Candidate.eth",
  normalized_candidate_name: "candidate.eth",
  normalization_profile: "ENSIP-15",
  technical_claim: {
    claim_kind: "semantic_registry_anchor_relevance",
    canonical_term: "candidate term",
    classification: "external",
    statement: "The candidate is proposed as an independently reviewable semantic anchor for the exact term stated here.",
    source_authority_class: "ethereum_official_repository"
  },
  gates: {
    claim_trusted: false,
    authoritative_source_selected: false,
    registry_pr_eligible: false,
    registry_mutated: false,
    ownership_inferred: false,
    commercial_authority: false,
    separate_registry_pr_required: true
  }
};
validateOrThrow("Vortik Verification Claim 1.0.0", claim);

const claimDigest = sha256CanonicalDigest(claim);
const proposedAnchorDigest = sha256CanonicalDigest({
  id: "candidate",
  ens: "candidate.eth",
  canonical_term: "candidate term",
  classification: "external"
});

const intent = {
  $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-admission-intent/1.0.0/schema.json",
  admission_intent: "vortik-admission-intent",
  admission_intent_version: "1.0.0",
  intent_id: "intent-1",
  contribution_digest: contributionDigest,
  review_digest: reviewDigest,
  claim_digest: claimDigest,
  normalized_candidate_name: "candidate.eth",
  normalization_profile: "ENSIP-15",
  proposed_registry_change: {
    change_kind: "new_anchor",
    anchor_id: "candidate",
    proposed_ens: "candidate.eth",
    expected_base_anchor_digest: null,
    proposed_anchor_digest: proposedAnchorDigest
  },
  gates: {
    admission_enabled: false,
    trusted_primary_source_receipt_available: false,
    trusted_ens_receipt_available: false,
    registry_pr_eligible: false,
    registry_mutated: false,
    ownership_inferred: false,
    commercial_authority: false,
    separate_registry_pr_required: true
  }
};
validateOrThrow("Vortik Admission Intent 1.0.0", intent);
assertAdmissionIntentBinding(claim, intent);

const intentDigest = sha256CanonicalDigest(intent);
const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const publicKeySpki = publicKey.export({ type: "spki", format: "der" }).toString("base64");

const keyPolicy = {
  $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-key-policy/1.0.0/schema.json",
  policy: "vortik-verification-key-policy",
  policy_version: "1.0.0",
  policy_id: "policy-test",
  canonicalization: "RFC8785-JCS-constrained-v1",
  digest_algorithm: "SHA-256",
  signature_algorithm: "Ed25519",
  authorized_keys: [
    {
      key_id: "test-key",
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKeySpki,
      status: "active",
      not_before: 1700000000,
      not_after: 1900000000,
      allowed_receipt_types: ["primary_source", "ens_mainnet"]
    }
  ]
};
validateOrThrow("Vortik Verification Key Policy 1.0.0", keyPolicy);
const keyPolicyDigest = sha256CanonicalDigest(keyPolicy);

const subject = {
  contribution_digest: contributionDigest,
  review_digest: reviewDigest,
  claim_digest: claimDigest,
  admission_intent_digest: intentDigest,
  normalized_candidate_name: "candidate.eth"
};

function signReceipt(unsignedReceipt) {
  const receipt = {
    ...structuredClone(unsignedReceipt),
    receipt_digest: `sha256:${"0".repeat(64)}`,
    signature: {
      algorithm: "Ed25519",
      key_id: "test-key",
      signature_base64url: "A".repeat(86)
    }
  };
  receipt.receipt_digest = computeTrustedReceiptDigest(receipt);
  receipt.signature.signature_base64url = signMessage(
    null,
    Buffer.from(receipt.receipt_digest, "utf8"),
    privateKey
  ).toString("base64url");
  return receipt;
}

const common = {
  $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json",
  receipt: "vortik-trusted-verification-receipt",
  receipt_version: "1.0.0",
  subject,
  verifier: {
    verifier_id: "offline-test-verifier",
    verifier_version: "1.0.0",
    code_commit: "a".repeat(40),
    key_policy_id: keyPolicy.policy_id,
    key_policy_version: keyPolicy.policy_version,
    key_policy_digest: keyPolicyDigest
  },
  canonicalization: "RFC8785-JCS-constrained-v1",
  digest_algorithm: "SHA-256",
  issued_at: 1800000000,
  trusted_issued_at: 1800000000,
  admission_valid_until: 1800003600
};

const primaryReceipt = signReceipt({
  ...common,
  receipt_type: "primary_source",
  receipt_id: "receipt-primary-1",
  payload: {
    authority_class: "ethereum_official_repository",
    retrieval_policy_id: "github-allowlist-v1",
    retrieved_independently: true,
    repository: {
      provider: "github",
      repository_id: 44971752,
      repository_full_name: "ethereum/EIPs",
      commit_sha: "b".repeat(40),
      blob_sha: "c".repeat(40),
      path: "EIPS/eip-1.md",
      content_sha256: sha256CanonicalDigest({ bytes: "test" })
    },
    claim_binding_digest: claimDigest
  }
});

const blockHash = `0x${"1".repeat(64)}`;
const stateRoot = `0x${"2".repeat(64)}`;
const parentHash = `0x${"3".repeat(64)}`;
const lookupDigest = sha256CanonicalDigest({
  name: "candidate.eth",
  block_hash: blockHash,
  record_exists: true,
  expiry: 1800100000
});

const ensReceipt = signReceipt({
  ...common,
  receipt_type: "ens_mainnet",
  receipt_id: "receipt-ens-1",
  payload: {
    chain_id: 1,
    normalization_profile: "ENSIP-15",
    active_definition: "active_eth_2ld_at_finalized_block_v1",
    normalized_candidate_name: "candidate.eth",
    block: {
      number: 25000000,
      hash: blockHash,
      state_root: stateRoot,
      parent_hash: parentHash,
      timestamp: 1799999400,
      finalized: true
    },
    providers: [
      {
        provider_id: "alchemy",
        block_hash: blockHash,
        state_root: stateRoot,
        timestamp: 1799999400,
        lookup_result_digest: lookupDigest
      },
      {
        provider_id: "infura",
        block_hash: blockHash,
        state_root: stateRoot,
        timestamp: 1799999400,
        lookup_result_digest: lookupDigest
      }
    ],
    lookup: {
      registry_record_exists: true,
      eth_registrar_owner_matches_base_registrar: true,
      base_registrar_expiry: 1800100000,
      active_registration: true,
      lookup_result_digest: lookupDigest
    }
  }
});

validateOrThrow("Vortik Trusted Verification Receipt 1.0.0", primaryReceipt);
validateOrThrow("Vortik Trusted Verification Receipt 1.0.0", ensReceipt);
assertReceiptTemporalSemantics(primaryReceipt);
assertReceiptTemporalSemantics(ensReceipt);
verifyTrustedReceiptSignature(primaryReceipt, keyPolicy);
verifyTrustedReceiptSignature(ensReceipt, keyPolicy);
assertSameReceiptSubject(primaryReceipt, ensReceipt);
assertReceiptSubjectBinding(primaryReceipt, subject);

const reordered = {
  z: [3, 2, 1],
  a: { y: "two", x: "one" }
};
const reorderedEquivalent = {
  a: { x: "one", y: "two" },
  z: [3, 2, 1]
};
if (canonicalizeJcsConstrained(reordered) !== canonicalizeJcsConstrained(reorderedEquivalent)) {
  throw new Error("constrained JCS canonicalization is not deterministic");
}
if (sha256CanonicalDigest(reordered) !== sha256CanonicalDigest(reorderedEquivalent)) {
  throw new Error("constrained JCS digest is not deterministic");
}

assertThrows("floating-point canonical JSON", () => canonicalizeJcsConstrained({ value: 1.5 }));
assertThrows("negative zero canonical JSON", () => canonicalizeJcsConstrained({ value: -0 }));

const claimAuthorityEscalation = structuredClone(claim);
claimAuthorityEscalation.gates.claim_trusted = true;
assertThrows("claim authority escalation", () => validateOrThrow("Vortik Verification Claim 1.0.0", claimAuthorityEscalation));

const intentAdmissionEscalation = structuredClone(intent);
intentAdmissionEscalation.gates.admission_enabled = true;
assertThrows("intent admission enablement", () => validateOrThrow("Vortik Admission Intent 1.0.0", intentAdmissionEscalation));

const intentNameMismatch = structuredClone(intent);
intentNameMismatch.proposed_registry_change.proposed_ens = "other.eth";
assertThrows("admission intent subject mismatch", () => assertAdmissionIntentBinding(claim, intentNameMismatch));

const privateKeyLeakPolicy = structuredClone(keyPolicy);
privateKeyLeakPolicy.private_key = "forbidden";
assertThrows("private key field in public key policy", () => validateOrThrow("Vortik Verification Key Policy 1.0.0", privateKeyLeakPolicy));

const tamperedReceipt = structuredClone(primaryReceipt);
tamperedReceipt.subject.normalized_candidate_name = "other.eth";
assertThrows("tampered signed receipt", () => verifyTrustedReceiptSignature(tamperedReceipt, keyPolicy));

const revokedPolicy = structuredClone(keyPolicy);
revokedPolicy.authorized_keys[0].status = "revoked";
const revokedPolicyReceipt = structuredClone(primaryReceipt);
revokedPolicyReceipt.verifier.key_policy_digest = sha256CanonicalDigest(revokedPolicy);
revokedPolicyReceipt.receipt_digest = computeTrustedReceiptDigest(revokedPolicyReceipt);
revokedPolicyReceipt.signature.signature_base64url = signMessage(
  null,
  Buffer.from(revokedPolicyReceipt.receipt_digest, "utf8"),
  privateKey
).toString("base64url");
assertThrows("revoked signing key", () => verifyTrustedReceiptSignature(revokedPolicyReceipt, revokedPolicy));

const untrustedIssuedAt = structuredClone(primaryReceipt);
untrustedIssuedAt.issued_at -= 1;
assertThrows("issued_at diverging from trusted_issued_at", () => assertReceiptTemporalSemantics(untrustedIssuedAt));

const staleEnsReceipt = structuredClone(ensReceipt);
staleEnsReceipt.payload.block.timestamp = ensReceipt.trusted_issued_at - 1801;
assertThrows("ENS block older than freshness window", () => assertReceiptTemporalSemantics(staleEnsReceipt));

const providerDisagreement = structuredClone(ensReceipt);
providerDisagreement.payload.providers[1].state_root = `0x${"4".repeat(64)}`;
assertThrows("dual-provider state disagreement", () => assertReceiptTemporalSemantics(providerDisagreement));

const mismatchedReceiptSubject = structuredClone(ensReceipt);
mismatchedReceiptSubject.subject.claim_digest = `sha256:${"f".repeat(64)}`;
assertThrows("cross-receipt subject mismatch", () => assertSameReceiptSubject(primaryReceipt, mismatchedReceiptSubject));

console.log("Trusted verification offline artifacts 1.0.0 validated");
console.log("Constrained RFC 8785/JCS canonicalization and SHA-256 digest invariants validated");
console.log("Ed25519 receipt signature verification and key-policy authorization validated offline");
console.log("EXPECTED FAIL authority escalation, private-key fields, tampering, revoked keys, stale ENS evidence and subject mismatch remain closed");
