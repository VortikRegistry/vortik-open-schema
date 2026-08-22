import assert from "node:assert/strict";
import { generateKeyPairSync, sign as signMessage } from "node:crypto";
import test from "node:test";

import { createTrustedReceiptIssuerCore } from "../lib/trusted-receipt-issuer.mjs";
import {
  computeEnsLookupResultDigest,
  sha256CanonicalDigest,
  verifyTrustedReceiptSignature
} from "../lib/trusted-verification-crypto.mjs";

function makeClaim() {
  const contributionDigest = sha256CanonicalDigest({ contribution_id: "contrib-boundary" });
  const reviewDigest = sha256CanonicalDigest({ review_id: "review-boundary", contributionDigest });
  return {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-claim/1.0.0/schema.json",
    claim: "vortik-verification-claim",
    claim_version: "1.0.0",
    claim_id: "claim-boundary",
    contribution_id: "contrib-boundary",
    contribution_digest: contributionDigest,
    review_id: "review-boundary",
    review_digest: reviewDigest,
    candidate_name: "Candidate.eth",
    normalized_candidate_name: "candidate.eth",
    normalization_profile: "ENSIP-15",
    technical_claim: {
      claim_kind: "semantic_registry_anchor_relevance",
      canonical_term: "candidate term",
      classification: "external",
      statement: "Boundary regression subject.",
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
}

function makeIntent(claim) {
  return {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-admission-intent/1.0.0/schema.json",
    admission_intent: "vortik-admission-intent",
    admission_intent_version: "1.0.0",
    intent_id: "intent-boundary",
    contribution_digest: claim.contribution_digest,
    review_digest: claim.review_digest,
    claim_digest: sha256CanonicalDigest(claim),
    normalized_candidate_name: claim.normalized_candidate_name,
    normalization_profile: "ENSIP-15",
    proposed_registry_change: {
      change_kind: "new_anchor",
      anchor_id: "candidate",
      proposed_ens: claim.normalized_candidate_name,
      expected_base_anchor_digest: null,
      proposed_anchor_digest: sha256CanonicalDigest({ id: "candidate", ens: claim.normalized_candidate_name })
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
}

function ensPayload(name, { blockTimestamp, expiry }) {
  const payload = {
    chain_id: 1,
    normalization_profile: "ENSIP-15",
    active_definition: "active_eth_2ld_at_finalized_block_v1",
    normalized_candidate_name: name,
    contracts: {
      ens_registry: "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e",
      base_registrar: "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"
    },
    block: {
      number: 22_000_000,
      hash: `0x${"1".repeat(64)}`,
      state_root: `0x${"2".repeat(64)}`,
      parent_hash: `0x${"3".repeat(64)}`,
      timestamp: blockTimestamp,
      finalized: true
    },
    provider_policy_id: "vortik-ens-mainnet-dual-rpc-v1",
    providers: [],
    lookup: {
      registry_record_exists: true,
      eth_registrar_owner_matches_base_registrar: true,
      base_registrar_expiry: expiry,
      active_registration: true,
      lookup_result_digest: ""
    }
  };
  payload.lookup.lookup_result_digest = computeEnsLookupResultDigest(payload);
  payload.providers = ["rpc-a", "rpc-b"].map((provider_id) => ({
    provider_id,
    block_hash: payload.block.hash,
    state_root: payload.block.state_root,
    timestamp: payload.block.timestamp,
    lookup_result_digest: payload.lookup.lookup_result_digest
  }));
  return payload;
}

function buildIssuer({ ensVerifier, readTrustedTime, keyNotAfter = 1_900_000_000, mutateKeyPolicy } = {}) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  let signerCalls = 0;
  const keyPolicy = {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-key-policy/1.0.0/schema.json",
    policy: "vortik-verification-key-policy",
    policy_version: "1.0.0",
    policy_id: "boundary-policy",
    canonicalization: "RFC8785-JCS-constrained-v1",
    digest_algorithm: "SHA-256",
    signature_algorithm: "Ed25519",
    authorized_keys: [{
      key_id: "boundary-key",
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
      status: "active",
      not_before: 1_700_000_000,
      not_after: keyNotAfter,
      allowed_receipt_types: ["primary_source", "ens_mainnet"]
    }]
  };
  if (typeof mutateKeyPolicy === "function") mutateKeyPolicy(keyPolicy);
  const trustedPolicyIdentity = {
    policy_id: keyPolicy.policy_id,
    policy_version: keyPolicy.policy_version,
    policy_digest: sha256CanonicalDigest(keyPolicy)
  };
  const issuer = createTrustedReceiptIssuerCore({
    primarySourceVerifier: { async verify() { throw new Error("primary verifier not used"); } },
    ensMainnetVerifier: ensVerifier ?? { async verify() { throw new Error("ENS verifier not used"); } },
    verifierIdentities: {
      primary_source: { verifier_id: "primary-boundary", verifier_version: "0.1.0", code_commit: "a".repeat(40) },
      ens_mainnet: { verifier_id: "ens-boundary", verifier_version: "0.1.0", code_commit: "b".repeat(40) }
    },
    keyPolicy,
    trustedPolicyIdentity,
    signer: {
      algorithm: "Ed25519",
      key_id: "boundary-key",
      signDigest(digest) {
        signerCalls += 1;
        return signMessage(null, Buffer.from(digest, "utf8"), privateKey).toString("base64url");
      }
    },
    trustedClock: {
      source_id: "boundary-clock",
      policy_id: "boundary-clock-policy",
      policy_digest: sha256CanonicalDigest({ policy: "boundary-clock-policy" }),
      readTrustedTime: readTrustedTime ?? (async () => 1_800_000_000)
    },
    randomBytesImpl() { return Buffer.alloc(16, 7); }
  });
  return { issuer, keyPolicy, trustedPolicyIdentity, getSignerCalls: () => signerCalls };
}

test("issuer captures verifier verify method at construction", async () => {
  let originalCalls = 0;
  let replacementCalls = 0;
  const verifier = {
    async verify({ normalizedCandidateName }) {
      originalCalls += 1;
      return ensPayload(normalizedCandidateName, {
        blockTimestamp: 1_799_999_900,
        expiry: 1_800_200_000
      });
    }
  };
  const fixture = buildIssuer({ ensVerifier: verifier, readTrustedTime: async () => 1_800_000_000 });

  verifier.verify = async () => {
    replacementCalls += 1;
    throw new Error("replacement verifier must not be used");
  };

  const claim = makeClaim();
  const receipt = await fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: makeIntent(claim) });
  assert.equal(originalCalls, 1);
  assert.equal(replacementCalls, 0);
  assert.equal(verifyTrustedReceiptSignature(receipt, fixture.keyPolicy, fixture.trustedPolicyIdentity), true);
});

test("issuer samples trusted issuance time after verifier completion", async () => {
  let trustedTime = 1_800_000_000;
  const verifier = {
    async verify({ normalizedCandidateName }) {
      trustedTime = 1_800_000_001;
      return ensPayload(normalizedCandidateName, {
        blockTimestamp: 1_800_000_000,
        expiry: 1_800_200_000
      });
    }
  };
  const fixture = buildIssuer({
    ensVerifier: verifier,
    readTrustedTime: async () => trustedTime,
    keyNotAfter: 1_800_000_000
  });
  const claim = makeClaim();

  await assert.rejects(
    () => fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: makeIntent(claim) }),
    /outside its authorization window/
  );
  assert.equal(fixture.getSignerCalls(), 0);
});

test("issuer rejects a protected key policy that violates its closed schema even when identity digest matches", () => {
  assert.throws(
    () => buildIssuer({
      mutateKeyPolicy(policy) {
        policy.signature_algorithm = "secp256k1";
      }
    }),
    /verification key policy violates its closed versioned contract/
  );

  assert.throws(
    () => buildIssuer({
      mutateKeyPolicy(policy) {
        policy.runtime_override = true;
      }
    }),
    /verification key policy violates its closed versioned contract/
  );
});
