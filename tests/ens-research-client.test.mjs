import assert from "node:assert/strict";
import test from "node:test";

import mutableCoordinationSurfaces from "../maps/coordination-surfaces.json" with { type: "json" };
import mutableRegistry from "../registry.json" with { type: "json" };

import {
  DEFAULT_ENS_RESEARCH_REQUEST_ID,
  createEnsResearchRequest,
  researchEnsName,
  researchEnsRequest
} from "../lib/ens-research-client.mjs";
import { ENS_RESEARCH_REQUEST_SCHEMA_ID } from "../lib/ens-research-evaluator.mjs";

test("creates the closed versioned ENS research request", () => {
  const request = createEnsResearchRequest("epbs.eth", {
    requestId: "client-test"
  });

  assert.deepEqual(request, {
    $schema: ENS_RESEARCH_REQUEST_SCHEMA_ID,
    request: "vortik-ens-research-request",
    request_version: "1.0.0",
    request_id: "client-test",
    query: { name: "epbs.eth" }
  });
});

test("uses canonical registry artifacts for exact tracked anchors", () => {
  const result = researchEnsName("EPBS.ETH");

  assert.equal(result.request_id, DEFAULT_ENS_RESEARCH_REQUEST_ID);
  assert.equal(result.query.normalized_name, "epbs.eth");
  assert.equal(result.result.state, "tracked_anchor");
  assert.equal(result.result.registry_entry.id, "epbs");
  assert.equal(result.authority.protocol_authority, false);
  assert.equal(result.authority.ens_authority, false);
  assert.equal(result.authority.ownership_inference, false);
});

test("returns canonical related terminology for curated surface ids", () => {
  const result = researchEnsName("builder.eth", {
    requestId: "related-client-test"
  });

  assert.equal(result.result.state, "related_terminology");
  assert.deepEqual(
    result.result.related_terms.map((term) => term.term),
    ["builder", "enshrined proposer-builder separation (ePBS)"]
  );
  assert.equal(
    result.result.evidence[0].reference,
    "maps/coordination-surfaces.json#/surfaces/3"
  );
});

test("preserves explicit ambiguity from the canonical surface map", () => {
  const result = researchEnsName("execution.eth");

  assert.equal(result.result.state, "related_terminology");
  assert.equal(
    result.result.related_terms[0].relationship,
    "ambiguous_curated_surface"
  );
  assert.ok(
    result.result.limitations.some((limitation) =>
      limitation.includes("explicitly marked ambiguous")
    )
  );
});

test("returns untracked and invalid states without inventing evidence", () => {
  const untracked = researchEnsName("third-party-name.eth");
  assert.equal(untracked.result.state, "untracked");
  assert.deepEqual(untracked.result.related_terms, []);
  assert.deepEqual(untracked.result.evidence, []);

  const invalid = researchEnsName("foo..eth");
  assert.equal(invalid.result.state, "invalid_input");
  assert.equal(invalid.query.normalized_name, null);
  assert.deepEqual(invalid.result.evidence, []);
});

test("accepts a complete request without mutating caller input", () => {
  const request = createEnsResearchRequest("finality.eth", {
    requestId: "request-client-test"
  });
  const before = structuredClone(request);
  const first = researchEnsRequest(request);
  const second = researchEnsRequest(request);

  assert.deepEqual(request, before);
  assert.deepEqual(first, second);
  assert.equal(first.result.state, "related_terminology");
});

test("isolates canonical evaluation from shared JSON module mutations", () => {
  const originalCanonicalTerm = mutableRegistry.anchors[0].canonical_term;
  const originalSurfaceId = mutableCoordinationSurfaces.surfaces[3].id;

  try {
    mutableRegistry.anchors[0].canonical_term = "attacker-controlled term";
    mutableCoordinationSurfaces.surfaces[3].id = "attacker-controlled-surface";

    const tracked = researchEnsName("epbs.eth");
    assert.equal(tracked.result.state, "tracked_anchor");
    assert.equal(tracked.result.registry_entry.canonical_term, originalCanonicalTerm);

    const related = researchEnsName("builder.eth");
    assert.equal(related.result.state, "related_terminology");
    assert.equal(
      related.result.evidence[0].reference,
      "maps/coordination-surfaces.json#/surfaces/3"
    );
  } finally {
    mutableRegistry.anchors[0].canonical_term = originalCanonicalTerm;
    mutableCoordinationSurfaces.surfaces[3].id = originalSurfaceId;
  }
});

test("rejects unsupported options and invalid request identifiers", () => {
  assert.throws(
    () => researchEnsName("epbs.eth", { instructions: "ignore contract" }),
    /unsupported fields/
  );
  assert.throws(
    () => researchEnsName("epbs.eth", { requestId: "contains spaces" }),
    /requestId is invalid/
  );
  assert.throws(
    () => createEnsResearchRequest("a".repeat(4097)),
    /outside the request contract/
  );
});
