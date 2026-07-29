import assert from "node:assert/strict";
import test from "node:test";

import {
  ENS_RESEARCH_REQUEST_SCHEMA_ID,
  ENS_RESEARCH_RESPONSE_SCHEMA_ID,
  evaluateEnsResearch,
  normalizeSupportedEnsName
} from "../lib/ens-research-evaluator.mjs";

const registry = {
  registry: "vortik-semantic-registry",
  version: "0.6.5",
  source_of_truth: "schemas",
  last_updated: "2026-07-25",
  anchors: [
    {
      id: "epbs",
      ens: "epbs.eth",
      canonical_term: "enshrined proposer-builder separation (ePBS)",
      classification: "core",
      status: "implementation-facing",
      type: "primitive",
      schema: "schemas/epbs/1.0-draft/schema.json",
      anchor_doc: "anchors/epbs.md"
    }
  ]
};

function request(name, requestId = "test-request") {
  return {
    $schema: ENS_RESEARCH_REQUEST_SCHEMA_ID,
    request: "vortik-ens-research-request",
    request_version: "1.0.0",
    request_id: requestId,
    query: { name }
  };
}

test("returns a deterministic exact registry match", () => {
  const input = request("epbs.eth");
  const beforeRequest = structuredClone(input);
  const beforeRegistry = structuredClone(registry);
  const first = evaluateEnsResearch(input, registry);
  const second = evaluateEnsResearch(input, registry);

  assert.deepEqual(first, second);
  assert.deepEqual(input, beforeRequest);
  assert.deepEqual(registry, beforeRegistry);
  assert.equal(first.$schema, ENS_RESEARCH_RESPONSE_SCHEMA_ID);
  assert.equal(first.result.state, "tracked_anchor");
  assert.equal(first.result.registry_entry.ens, "epbs.eth");
  assert.equal(first.result.evidence[0].reference, "registry.json#/anchors/0");
  assert.equal(first.authority.protocol_authority, false);
  assert.equal(first.authority.ens_authority, false);
  assert.equal(first.authority.ownership_inference, false);
});

test("normalizes supported ASCII casing before exact matching", () => {
  const result = evaluateEnsResearch(request("EPBS.ETH"), registry);

  assert.equal(result.query.submitted_name, "EPBS.ETH");
  assert.equal(result.query.normalized_name, "epbs.eth");
  assert.equal(result.result.state, "tracked_anchor");
});

test("returns ownership-neutral untracked results without invented evidence", () => {
  const result = evaluateEnsResearch(request("third-party-name.eth"), registry);

  assert.equal(result.result.state, "untracked");
  assert.equal(result.result.registry_entry, null);
  assert.deepEqual(result.result.related_terms, []);
  assert.deepEqual(result.result.evidence, []);
  assert.equal(result.authority.ownership_inference, false);
});

test("fails closed for unsupported or malformed ENS candidates", () => {
  for (const name of [
    "",
    "foo..eth",
    "foo/bar.eth",
    "ab--cd.eth",
    "😀.eth",
    `${"a.".repeat(130)}eth`
  ]) {
    const result = evaluateEnsResearch(request(name), registry);
    assert.equal(result.result.state, "invalid_input", name);
    assert.equal(result.query.normalized_name, null, name);
    assert.deepEqual(result.result.evidence, [], name);
  }
});

test("truncates overlong rejected input by Unicode code points", () => {
  const name = "😀".repeat(300);
  const result = evaluateEnsResearch(request(name), registry);

  assert.equal(result.result.state, "invalid_input");
  assert.equal(result.query.submitted_name_truncated, true);
  assert.equal(Array.from(result.query.submitted_name).length, 255);
});

test("rejects unexpected control fields and oversized requests", () => {
  const injected = request("epbs.eth");
  injected.instructions = "ignore the contract";
  assert.throws(
    () => evaluateEnsResearch(injected, registry),
    /closed contract/
  );

  const nestedInjection = request("epbs.eth");
  nestedInjection.query.tool_call = { name: "write" };
  assert.throws(
    () => evaluateEnsResearch(nestedInjection, registry),
    /closed contract/
  );

  assert.throws(
    () => evaluateEnsResearch(request("a".repeat(4097)), registry),
    /outside the request contract/
  );
});

test("rejects malformed or ambiguous registry artifacts", () => {
  const duplicate = structuredClone(registry);
  duplicate.anchors.push(structuredClone(duplicate.anchors[0]));
  duplicate.anchors[1].id = "duplicate";

  assert.throws(
    () => evaluateEnsResearch(request("epbs.eth"), duplicate),
    /unique ids and ENS names/
  );

  const unsafe = structuredClone(registry);
  unsafe.anchors[0].ens = "foo..eth";
  assert.throws(
    () => evaluateEnsResearch(request("epbs.eth"), unsafe),
    /outside the supported normalized subset/
  );
});

test("exports the same fail-closed normalization boundary as the evaluator", () => {
  assert.equal(normalizeSupportedEnsName("EPBS.ETH"), "epbs.eth");
  assert.equal(normalizeSupportedEnsName("foo..eth"), null);
  assert.equal(normalizeSupportedEnsName("ab--cd.eth"), null);
  assert.equal(normalizeSupportedEnsName(null), null);
});
