import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  digestCandidateContribution,
  evaluateCandidateReview
} from "../lib/ens-candidate-review.mjs";
import {
  assertTrustedCandidateAdmissionAvailable,
  findCandidateAdmissionSensitiveChanges
} from "../lib/candidate-admission-gate.mjs";

const contribution = {
  $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json",
  contribution: "vortik-ens-candidate-contribution",
  contribution_version: "1.0.0",
  contribution_id: "candidate-001",
  contributor: { kind: "agent", claimed_id: "visitor-agent" },
  candidate: {
    name: "candidate-name.eth",
    rationale: "Untrusted proposal for review only.",
    proposed_term: "candidate term",
    proposed_classification: "premature"
  },
  evidence: [
    { kind: "primary_source", reference: "https://eips.ethereum.org/EIPS/eip-7732" }
  ]
};

function reviewArtifact() {
  return {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/reviews/vortik-ens-candidate-review/1.0.0/schema.json",
    review: "vortik-ens-candidate-review",
    review_version: "1.0.0",
    review_id: "review-001",
    contribution_id: "candidate-001",
    contribution_digest: digestCandidateContribution(contribution),
    candidate_name: "candidate-name.eth",
    evidence_review: [
      {
        reference: "https://example.com/not-authoritative-even-when-labeled-eip",
        source_classification: "eip",
        review_status: "independently_reviewed",
        supports_semantic_claim: true,
        supports_ens_existence: false,
        note: "Classification and review status are observations only, not trusted receipts."
      },
      {
        reference: "https://example.com/not-an-onchain-proof",
        source_classification: "ens_onchain_claim",
        review_status: "independently_reviewed",
        supports_semantic_claim: false,
        supports_ens_existence: true,
        note: "An ENS claim cannot open the admission gate without a trusted lookup receipt."
      }
    ],
    decision: {
      outcome: "research_note",
      reason: "Useful research signal, but trusted verification receipts are not implemented.",
      reviewed_term: "candidate term",
      reviewed_classification: "premature"
    },
    gates: {
      trusted_primary_source_receipt_available: false,
      trusted_ens_receipt_available: false,
      contributor_input_trusted: false,
      ownership_inferred: false,
      commercial_authority: false,
      registry_mutated: false,
      registry_pr_eligible: false,
      separate_registry_pr_required: true
    }
  };
}

function baseRegistry() {
  return {
    anchors: [
      {
        id: "existing",
        ens: "existing.eth",
        canonical_term: "existing term"
      }
    ]
  };
}

test("source and public review schemas are byte-identical and structurally closed", async () => {
  const [sourceText, publicText, contributionSchemaText] = await Promise.all([
    readFile(new URL("../schemas/reviews/vortik-ens-candidate-review/1.0.0/schema.json", import.meta.url), "utf8"),
    readFile(new URL("../docs/schemas/reviews/vortik-ens-candidate-review/1.0.0/schema.json", import.meta.url), "utf8"),
    readFile(new URL("../schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json", import.meta.url), "utf8")
  ]);
  assert.equal(sourceText, publicText);

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validateReview = ajv.compile(JSON.parse(sourceText));
  const validateContribution = ajv.compile(JSON.parse(contributionSchemaText));
  assert.equal(validateReview(reviewArtifact()), true);

  const injectedAuthority = structuredClone(reviewArtifact());
  injectedAuthority.commercial_authority = true;
  assert.equal(validateReview(injectedAuthority), false);

  const selfPromotingReview = structuredClone(reviewArtifact());
  selfPromotingReview.decision.outcome = "registry_pr_eligible";
  assert.equal(validateReview(selfPromotingReview), false);

  const fakeVerificationFlag = structuredClone(reviewArtifact());
  fakeVerificationFlag.evidence_review[0].verification_status = "verified";
  assert.equal(validateReview(fakeVerificationFlag), false);

  const selfPromotingContribution = structuredClone(contribution);
  selfPromotingContribution.candidate.review_outcome = "registry_pr_eligible";
  assert.equal(validateContribution(selfPromotingContribution), false);
});

test("review labels and ENS claims can never create registry eligibility", () => {
  const result = evaluateCandidateReview(contribution, reviewArtifact());
  assert.equal(result.outcome, "research_note");
  assert.equal(result.registry_pr_eligible, false);
  assert.equal(result.registry_mutated, false);
  assert.equal(result.commercial_authority, false);
});

test("direct callers cannot bypass the schema and declare registry eligibility", () => {
  const review = reviewArtifact();
  review.decision.outcome = "registry_pr_eligible";
  review.gates.registry_pr_eligible = true;
  assert.throws(
    () => evaluateCandidateReview(contribution, review),
    /cannot declare registry PR eligibility without trusted verification receipts/
  );
});

test("review provenance binds the complete contribution digest", () => {
  const changedContribution = structuredClone(contribution);
  changedContribution.candidate.rationale = "Changed semantic claim after the review.";
  assert.notEqual(
    digestCandidateContribution(changedContribution),
    digestCandidateContribution(contribution)
  );
  assert.throws(
    () => evaluateCandidateReview(changedContribution, reviewArtifact()),
    /contribution_digest must bind the complete contribution artifact/
  );
});

test("review provenance also binds contribution id and exact candidate name", () => {
  const wrongId = reviewArtifact();
  wrongId.contribution_id = "candidate-002";
  assert.throws(() => evaluateCandidateReview(contribution, wrongId), /contribution_id must match/);

  const wrongName = reviewArtifact();
  wrongName.candidate_name = "other.eth";
  assert.throws(() => evaluateCandidateReview(contribution, wrongName), /candidate_name must exactly match/);
});

test("canonical contribution digest rejects accessors without invoking them", () => {
  let getterCalls = 0;
  const unsafe = structuredClone(contribution);
  Object.defineProperty(unsafe.candidate, "rationale", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "unsafe";
    }
  });
  assert.throws(() => digestCandidateContribution(unsafe), /must be an enumerable data property/);
  assert.equal(getterCalls, 0);
});

test("registry admission gate blocks every new anchor while trusted receipts are unavailable", () => {
  const base = baseRegistry();
  const current = structuredClone(base);
  current.anchors.push({ id: "candidate", ens: "candidate-name.eth", canonical_term: "candidate term" });

  assert.deepEqual(findCandidateAdmissionSensitiveChanges(base, current), [
    { kind: "new_anchor", id: "candidate", ens: "candidate-name.eth" }
  ]);
  assert.throws(
    () => assertTrustedCandidateAdmissionAvailable(base, current),
    /candidate-derived registry admission is fail-closed/
  );
});

test("registry admission gate blocks rebinding an existing anchor to another ENS name", () => {
  const base = baseRegistry();
  const current = structuredClone(base);
  current.anchors[0].ens = "replacement.eth";
  assert.throws(
    () => assertTrustedCandidateAdmissionAvailable(base, current),
    /ENS rebound existing:existing\.eth->replacement\.eth/
  );
});

test("ordinary semantic maintenance of an existing anchor does not trigger candidate admission", () => {
  const base = baseRegistry();
  const current = structuredClone(base);
  current.anchors[0].canonical_term = "refined existing term";
  const result = assertTrustedCandidateAdmissionAvailable(base, current);
  assert.equal(result.blocked, false);
  assert.deepEqual(result.changes, []);
});
