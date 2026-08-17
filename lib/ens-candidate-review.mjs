import { createHash } from "node:crypto";

const REVIEW_OUTCOMES = new Set(["reject", "keep_backlog", "research_note"]);

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function canonicalJson(value, path = "$") {
  if (value === null) return "null";

  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} must contain only finite JSON numbers`);
    }
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry, index) => canonicalJson(entry, `${path}[${index}]`)).join(",")}]`;
  }

  if (typeof value !== "object") {
    throw new TypeError(`${path} contains a non-JSON value`);
  }

  if (Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError(`${path} must use Object.prototype`);
  }
  if (Object.getOwnPropertySymbols(value).length !== 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }

  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors).sort();
  const fields = [];
  for (const key of keys) {
    const descriptor = descriptors[key];
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`${path}.${key} must be an enumerable data property`);
    }
    fields.push(`${JSON.stringify(key)}:${canonicalJson(descriptor.value, `${path}.${key}`)}`);
  }
  return `{${fields.join(",")}}`;
}

export function digestCandidateContribution(contribution) {
  assertObject(contribution, "contribution");
  const digest = createHash("sha256")
    .update(canonicalJson(contribution), "utf8")
    .digest("hex");
  return `sha256:${digest}`;
}

export function evaluateCandidateReview(contribution, review) {
  assertObject(contribution, "contribution");
  assertObject(review, "review");
  assertObject(contribution.candidate, "contribution.candidate");
  assertObject(review.decision, "review.decision");
  assertObject(review.gates, "review.gates");

  if (contribution.contribution_id !== review.contribution_id) {
    throw new Error("review contribution_id must match the contribution");
  }
  if (digestCandidateContribution(contribution) !== review.contribution_digest) {
    throw new Error("review contribution_digest must bind the complete contribution artifact");
  }
  if (contribution.candidate.name !== review.candidate_name) {
    throw new Error("review candidate_name must exactly match the contributed candidate name");
  }
  if (!Array.isArray(review.evidence_review) || review.evidence_review.length === 0) {
    throw new Error("review requires evidence_review entries");
  }
  if (!REVIEW_OUTCOMES.has(review.decision.outcome)) {
    throw new Error("candidate review cannot declare registry PR eligibility without trusted verification receipts");
  }

  if (
    review.gates.trusted_primary_source_receipt_available !== false ||
    review.gates.trusted_ens_receipt_available !== false ||
    review.gates.contributor_input_trusted !== false ||
    review.gates.ownership_inferred !== false ||
    review.gates.commercial_authority !== false ||
    review.gates.registry_mutated !== false ||
    review.gates.registry_pr_eligible !== false ||
    review.gates.separate_registry_pr_required !== true
  ) {
    throw new Error("candidate review authority gates must remain fail-closed until trusted verification receipts exist");
  }

  return Object.freeze({
    outcome: review.decision.outcome,
    contribution_digest: review.contribution_digest,
    registry_pr_eligible: false,
    registry_mutated: false,
    commercial_authority: false
  });
}
