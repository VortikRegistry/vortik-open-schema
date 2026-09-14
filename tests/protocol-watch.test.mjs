import assert from "node:assert/strict";
import test from "node:test";

import { compareBaseline, formatReport, parseFrontmatter } from "../scripts/protocol-watch.mjs";

test("parseFrontmatter extracts bounded EIP metadata", () => {
  const parsed = parseFrontmatter("---\neip: 7732\nstatus: Review\ncategory: Core\n---\nbody");
  assert.equal(parsed.eip, "7732");
  assert.equal(parsed.status, "Review");
  assert.equal(parsed.category, "Core");
});

test("compareBaseline detects only fingerprint drift", () => {
  const baseline = { sources: [{ id: "eip-7732", fingerprint: "a".repeat(40) }] };
  assert.deepEqual(compareBaseline(baseline, [{ id: "eip-7732", fingerprint: "a".repeat(40) }]), []);
  assert.equal(compareBaseline(baseline, [{ id: "eip-7732", fingerprint: "b".repeat(40) }]).length, 1);
});

test("formatReport keeps the human gate explicit", () => {
  const report = formatReport({
    observedAt: "2026-09-13T00:00:00.000Z",
    baseline: { reviewed_through: "2026-09-13" },
    changes: [{ id: "eip-7732", previous: { fingerprint: "a".repeat(40) }, current: { id: "eip-7732", repository: "ethereum/EIPs", path: "EIPS/eip-7732.md", fingerprint: "b".repeat(40), relevance: ["epbs.eth"], source_url: "https://github.com/ethereum/EIPs" } }]
  });
  assert.match(report, /MUST NOT be merged/);
  assert.match(report, /Update `protocol-watch\/baseline\.json` only after that review/);
});
