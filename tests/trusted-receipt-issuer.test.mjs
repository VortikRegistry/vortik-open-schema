import assert from "node:assert/strict";
import { generateKeyPairSync, sign as signMessage } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";

import { createTrustedReceiptIssuerCore } from "../lib/trusted-receipt-issuer.mjs";
import {
  assertReceiptEvidenceSemantics,
  assertReceiptTemporalSemantics,
  assertSameReceiptSubject,
  computeEnsLookupResultDigest,
  computePrimarySourceCanonicalIdentifier,
  sha256CanonicalDigest,
  verifyTrustedReceiptSignature
} from "../lib/trusted-verification-crypto.mjs";

const receiptSchema = JSON.parse(await readFile(
  new URL("../schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json", import.meta.url),
  "utf8"
));
const validateReceipt = new Ajv2020({ allErrors: true, strict: false }).compile(receiptSchema);

const contributionDigest = sha256CanonicalDigest({ contribution_id: "contrib-issuer", candidate_name: "candidate.eth" });
const reviewDigest = sha256CanonicalDigest({ review_id: "review-issuer", contribution_digest: contributionDigest });

function makeClaim() {
  return {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-claim/1.0.0/schema.json",
    claim: "vortik-verification-claim",
    claim_version: "1.0.0",
    claim_id: "claim-issuer",
    contribution_id: "contrib-issuer",
    contribution_digest: contributionDigest,
    review_id: "review-issuer",
    review_digest: reviewDigest,
    candidate_name: "Candidate.eth",
    normalized_candidate_name: "candidate.eth",
    normalization_profile: "ENSIP-15",
    technical_claim: {
      claim_kind: "semantic_registry_anchor_relevance",
      canonical_term: "candidate term",
      classification: "external",
      statement: "The candidate is proposed as an independently reviewable semantic anchor.",
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
    intent_id: "intent-issuer",
    contribution_digest: claim.contribution_digest,
    review_digest: claim.review_digest,
    claim_digest: sha256CanonicalDigest(claim),
    normalized_candidate_name: claim.normalized_candidate_name,
    normalization_profile: "ENSIP-15",
    proposed_registry_change: {
      change_kind: "new_anchor",
      anchor_id: "candidate",
      proposed_ens: "candidate.eth",
      expected_base_anchor_digest: null,
      proposed_anchor_digest: sha256CanonicalDigest({
        id: "candidate",
        ens: "candidate.eth",
        canonical_term: "candidate term",
        classification: "external"
      })
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

function primaryPayload(claim) {
  const payload = {
    authority_class: claim.technical_claim.source_authority_class,
    retrieval_policy_id: "vortik-primary-source-github-v1",
    retrieved_independently: true,
    canonical_source_identifier: "",
    repository: {
      provider: "github",
      repository_id: 44971752,
      repository_full_name: "ethereum/EIPs",
      commit_sha: "b".repeat(40),
      blob_sha: "c".repeat(40),
      path: "EIPS/eip-7732.md",
      content_sha256: sha256CanonicalDigest({ bytes: "trusted-source" })
    },
    claim_binding_digest: sha256CanonicalDigest(claim)
  };
  payload.canonical_source_identifier = computePrimarySourceCanonicalIdentifier(payload);
  return payload;
}

function ensPayload(normalizedName, { blockTimestamp = 1_799_999_900, expiry = 1_800_200_000 } = {}) {
  const payload = {
    chain_id: 1,
    normalization_profile: "ENSIP-15",
    active_definition: "active_eth_2ld_at_finalized_block_v1",
    normalized_candidate_name: normalizedName,
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

function createFixture({
  trustedTime = 1_800_000_000,
  primaryFactory = primaryPayload,
  ensFactory = (name) => ensPayload(name),
  signerOverride,
  keyAllowedReceiptTypes = ["primary_source", "ens_mainnet"]
} = {}) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const keyPolicy = {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-key-policy/1.0.0/schema.json",
    policy: "vortik-verification-key-policy",
    policy_version: "1.0.0",
    policy_id: "issuer-test-policy",
    canonicalization: "RFC8785-JCS-constrained-v1",
    digest_algorithm: "SHA-256",
    signature_algorithm: "Ed25519",
    authorized_keys: [{
      key_id: "issuer-test-key",
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
      status: "active",
      not_before: 1_700_000_000,
      not_after: 1_900_000_000,
      allowed_receipt_types: keyAllowedReceiptTypes
    }]
  };
  const trustedPolicyIdentity = {
    policy_id: keyPolicy.policy_id,
    policy_version: keyPolicy.policy_version,
    policy_digest: sha256CanonicalDigest(keyPolicy)
  };
  let randomCounter = 1;
  let signerCalls = 0;
  const signer = signerOverride ?? {
    algorithm: "Ed25519",
    key_id: "issuer-test-key",
    signDigest(digest) {
      signerCalls += 1;
      return signMessage(null, Buffer.from(digest, "utf8"), privateKey).toString("base64url");
    }
  };
  const calls = { primary: [], ens: [], clock: 0 };
  const issuer = createTrustedReceiptIssuerCore({
    primarySourceVerifier: {
      async verify(input) {
        calls.primary.push(structuredClone(input));
        return primaryFactory(input.claim);
      }
    },
    ensMainnetVerifier: {
      async verify(input) {
        calls.ens.push(structuredClone(input));
        return ensFactory(input.normalizedCandidateName);
      }
    },
    verifierIdentities: {
      primary_source: {
        verifier_id: "vortik-primary-source-github",
        verifier_version: "0.1.0",
        code_commit: "a".repeat(40)
      },
      ens_mainnet: {
        verifier_id: "vortik-ens-mainnet",
        verifier_version: "0.1.0",
        code_commit: "d".repeat(40)
      }
    },
    keyPolicy,
    trustedPolicyIdentity,
    signer,
    trustedClock: {
      source_id: "issuer-test-clock",
      policy_id: "issuer-test-clock-policy",
      policy_digest: sha256CanonicalDigest({ policy: "issuer-test-clock-policy", version: 1 }),
      async readTrustedTime() {
        calls.clock += 1;
        return trustedTime;
      }
    },
    randomBytesImpl(size) {
      assert.equal(size, 16);
      const output = Buffer.alloc(16, 0);
      output.writeUInt32BE(randomCounter, 12);
      randomCounter += 1;
      return output;
    }
  });
  return { issuer, keyPolicy, trustedPolicyIdentity, calls, getSignerCalls: () => signerCalls };
}

function assertSchemaValid(receipt) {
  assert.equal(validateReceipt(receipt), true, JSON.stringify(validateReceipt.errors));
}

test("issuer core derives and authenticates both receipt types without caller-protected fields", async () => {
  const claim = makeClaim();
  const admissionIntent = makeIntent(claim);
  const fixture = createFixture();

  const primary = await fixture.issuer.issuePrimarySourceReceipt({
    claim,
    admissionIntent,
    selector: {
      repository_full_name: "ethereum/EIPs",
      commit_sha: "b".repeat(40),
      path: "EIPS/eip-7732.md"
    }
  });
  const ens = await fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent });

  for (const receipt of [primary, ens]) {
    assertSchemaValid(receipt);
    assertReceiptTemporalSemantics(receipt);
    assertReceiptEvidenceSemantics(receipt, claim);
    assert.equal(verifyTrustedReceiptSignature(receipt, fixture.keyPolicy, fixture.trustedPolicyIdentity), true);
    assert.equal(receipt.trusted_issued_at, 1_800_000_000);
    assert.equal(receipt.issued_at, receipt.trusted_issued_at);
    assert.equal(receipt.signature.key_id, "issuer-test-key");
    assert.equal(receipt.trusted_issuance_clock.source_id, "issuer-test-clock");
    assert.equal(receipt.trusted_issuance_clock.not_caller_controlled, true);
    assert.equal(receipt.replay_protection.nonce.length, 32);
    assert.equal(Object.isFrozen(receipt), true);
  }

  assertSameReceiptSubject(primary, ens);
  assert.equal(fixture.calls.primary.length, 1);
  assert.equal(fixture.calls.ens.length, 1);
  assert.equal(fixture.calls.clock, 2);
  assert.equal(fixture.getSignerCalls(), 2);
  assert.equal(fixture.calls.primary[0].claim.candidate_name, "Candidate.eth");
  assert.equal(fixture.calls.ens[0].normalizedCandidateName, "candidate.eth");
  assert.equal(ens.admission_valid_until, 1_800_086_400);
});

test("caller cannot inject verifier payload, time, signer identity, nonce or receipt identity", async () => {
  const claim = makeClaim();
  const admissionIntent = makeIntent(claim);
  const { issuer } = createFixture();

  for (const [field, value] of [
    ["payload", { forged: true }],
    ["trusted_issued_at", 1],
    ["issued_at", 1],
    ["admission_valid_until", 9_999_999_999],
    ["key_id", "attacker"],
    ["signature", { forged: true }],
    ["nonce", "f".repeat(32)],
    ["receipt_id", "attacker-receipt"]
  ]) {
    await assert.rejects(
      () => issuer.issueEnsMainnetReceipt({ claim, admissionIntent, [field]: value }),
      /must not supply/
    );
  }
});

test("issuer rejects fail-open claim and intent gates before signing", async () => {
  const fixture = createFixture();
  const claim = makeClaim();
  const intent = makeIntent(claim);
  claim.gates.commercial_authority = true;
  await assert.rejects(
    () => fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: intent }),
    /claim gate commercial_authority/
  );
  assert.equal(fixture.getSignerCalls(), 0);

  const cleanClaim = makeClaim();
  const failOpenIntent = makeIntent(cleanClaim);
  failOpenIntent.gates.admission_enabled = true;
  await assert.rejects(
    () => fixture.issuer.issueEnsMainnetReceipt({ claim: cleanClaim, admissionIntent: failOpenIntent }),
    /intent gate admission_enabled/
  );
  assert.equal(fixture.getSignerCalls(), 0);
});

test("issuer rejects detached primary-source evidence before signing", async () => {
  const fixture = createFixture({
    primaryFactory(claim) {
      const payload = primaryPayload(claim);
      payload.claim_binding_digest = `sha256:${"9".repeat(64)}`;
      return payload;
    }
  });
  const claim = makeClaim();
  await assert.rejects(
    () => fixture.issuer.issuePrimarySourceReceipt({
      claim,
      admissionIntent: makeIntent(claim),
      selector: { repository_full_name: "ethereum/EIPs", commit_sha: "b".repeat(40), path: "EIPS/eip-7732.md" }
    }),
    /claim binding/
  );
  assert.equal(fixture.getSignerCalls(), 0);
});

test("issuer rejects stale ENS evidence and expired registrations before signing", async () => {
  const claim = makeClaim();
  for (const [label, ensFactory, expected] of [
    ["stale", (name) => ensPayload(name, { blockTimestamp: 1_799_998_000 }), /older than 1800 seconds/],
    ["expired", (name) => ensPayload(name, { expiry: 1_799_999_999 }), /remain active after trusted issuance/]
  ]) {
    const fixture = createFixture({ ensFactory });
    await assert.rejects(
      () => fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: makeIntent(claim) }),
      expected,
      label
    );
    assert.equal(fixture.getSignerCalls(), 0);
  }
});

test("issuer self-verification rejects a signer that does not match the authorized public key", async () => {
  const { privateKey: wrongPrivateKey } = generateKeyPairSync("ed25519");
  const fixture = createFixture({
    signerOverride: {
      algorithm: "Ed25519",
      key_id: "issuer-test-key",
      signDigest(digest) {
        return signMessage(null, Buffer.from(digest, "utf8"), wrongPrivateKey).toString("base64url");
      }
    }
  });
  const claim = makeClaim();
  await assert.rejects(
    () => fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: makeIntent(claim) }),
    /signature is invalid/
  );
});

test("issuer rejects signing keys not authorized for the requested receipt type", async () => {
  const fixture = createFixture({ keyAllowedReceiptTypes: ["primary_source"] });
  const claim = makeClaim();
  await assert.rejects(
    () => fixture.issuer.issueEnsMainnetReceipt({ claim, admissionIntent: makeIntent(claim) }),
    /receipt type is not authorized/
  );
  assert.equal(fixture.getSignerCalls(), 0);
});

test("issuer construction rejects raw private-key fields and untrusted key-policy identity", () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const keyPolicy = {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/verification/vortik-verification-key-policy/1.0.0/schema.json",
    policy: "vortik-verification-key-policy",
    policy_version: "1.0.0",
    policy_id: "construction-policy",
    canonicalization: "RFC8785-JCS-constrained-v1",
    digest_algorithm: "SHA-256",
    signature_algorithm: "Ed25519",
    authorized_keys: [{
      key_id: "construction-key",
      algorithm: "Ed25519",
      public_key_spki_der_base64: publicKey.export({ type: "spki", format: "der" }).toString("base64"),
      status: "active",
      not_before: 1,
      not_after: 2_000_000_000,
      allowed_receipt_types: ["primary_source", "ens_mainnet"]
    }]
  };
  const base = {
    primarySourceVerifier: { verify() {} },
    ensMainnetVerifier: { verify() {} },
    verifierIdentities: {
      primary_source: { verifier_id: "primary", verifier_version: "0.1.0", code_commit: "a".repeat(40) },
      ens_mainnet: { verifier_id: "ens", verifier_version: "0.1.0", code_commit: "b".repeat(40) }
    },
    keyPolicy,
    trustedPolicyIdentity: {
      policy_id: keyPolicy.policy_id,
      policy_version: keyPolicy.policy_version,
      policy_digest: sha256CanonicalDigest(keyPolicy)
    },
    signer: {
      algorithm: "Ed25519",
      key_id: "construction-key",
      privateKey,
      signDigest() { return "A".repeat(86); }
    },
    trustedClock: {
      source_id: "clock",
      policy_id: "clock-policy",
      policy_digest: sha256CanonicalDigest({ clock: true }),
      readTrustedTime() { return 1_800_000_000; }
    }
  };

  assert.throws(() => createTrustedReceiptIssuerCore(base), /does not accept raw signer field privateKey/);
  const noRawSecret = structuredClone({});
  void noRawSecret;

  const signer = {
    algorithm: "Ed25519",
    key_id: "construction-key",
    signDigest(digest) { return signMessage(null, Buffer.from(digest, "utf8"), privateKey).toString("base64url"); }
  };
  assert.throws(
    () => createTrustedReceiptIssuerCore({
      ...base,
      signer,
      trustedPolicyIdentity: { ...base.trustedPolicyIdentity, policy_digest: `sha256:${"0".repeat(64)}` }
    }),
    /does not match trusted runtime identity/
  );
});
