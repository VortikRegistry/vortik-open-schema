import assert from "node:assert/strict";
import test from "node:test";
import { queryFor, readActivity, summarize } from "../ops/read-reception-activity.mjs";

const bounds = { start: "2026-10-01T00:00:00Z", end: "2026-10-08T03:37:44Z" };
function entry(payload = {}, extra = {}) {
  return {
    timestamp: "2026-10-05T15:10:00Z",
    resource: { type: "cloud_run_revision", labels: { project_id: "vortik-registry-production", service_name: "vortik-agent-beacon", location: "southamerica-east1" } },
    jsonPayload: { schema: "vortik_reception_observation/1.0.0", event_id: "fixture-event", intent: "business_proposal", priority: "high", ...payload },
    ...extra
  };
}

test("read query is bounded and rejects invalid dates and filter injection", () => {
  assert.match(queryFor(bounds.start, bounds.end), /resource.labels.service_name="vortik-agent-beacon"/);
  for (const start of ['2026-10-01T00:00:00Z" OR true', "2026-02-30T00:00:00Z", "2026-09-01T00:00:00Z", bounds.end]) {
    assert.throws(() => queryFor(start, bounds.end));
  }
});

test("HTTP requests and deduplicated classifications are never counted as people", () => {
  const report = summarize([
    entry(), entry(),
    entry({ event_id: "second", intent: "registry_lookup", priority: "normal" }),
    entry({}, { logName: "projects/vortik-registry-production/logs/run.googleapis.com%2Frequests", httpRequest: { status: 200, remoteIp: "private-ip", requestUrl: "private-query" } })
  ], bounds);
  assert.equal(report.http_requests, 1);
  assert.equal(report.reception_events, 2);
  assert.equal(report.duplicate_reception_events, 1);
  assert.equal(report.high_priority_events, 1);
  assert.equal(report.external_visitors, "NOT_DETERMINED");
  assert.equal(report.synthetic_events, "NOT_AUTOMATICALLY_EXCLUDED");
  assert.equal(report.days_utc["2026-10-05"], 2);
  assert.equal(JSON.stringify(report).includes("private-"), false);
  assert.equal(JSON.stringify(report).includes("fixture-event"), false);
});

test("foreign and out-of-range records are ignored and caller fields cannot escape", () => {
  const report = summarize([
    entry({ intent: "private-caller-text", event_id: null }),
    entry({}, { timestamp: bounds.end }),
    entry({}, { resource: { type: "other" } }),
    entry({}, { timestamp: "invalid" })
  ], bounds);
  assert.equal(report.ignored_records, 3);
  assert.equal(report.events_without_id, 1);
  assert.equal(report.intents.unknown, 1);
  assert.equal(JSON.stringify(report).includes("private-caller-text"), false);
});

test("the extra record signals truncation; empty retained results are not zero visitors", () => {
  const limited = summarize(Array.from({ length: 10001 }, (_, i) => entry({ event_id: `fixture-${i}` })), bounds);
  assert.equal(limited.coverage, "INCOMPLETE_LIMIT_REACHED");
  assert.equal(limited.processed_records, 10000);
  assert.equal(limited.reception_events, 10000);
  const empty = summarize([], bounds);
  assert.equal(empty.reception_events, 0);
  assert.equal(empty.coverage, "RETURNED_LOGS_ONLY");
  assert.equal(empty.external_visitors, "NOT_DETERMINED");
});

test("only a projected Logging read is issued and errors never become empty results", () => {
  const run = (command, args, options) => {
    assert.equal(command, "gcloud");
    assert.deepEqual(args.slice(0, 2), ["logging", "read"]);
    assert.ok(args.includes("--limit=10001"));
    const projection = args.find((arg) => arg.startsWith("--format="));
    for (const forbidden of ["remoteIp", "requestUrl", "textPayload", "inbound_message_id_digest"]) assert.equal(projection.includes(forbidden), false);
    assert.equal(options.timeout, 120000);
    return JSON.stringify([entry()]);
  };
  assert.equal(readActivity(bounds.start, bounds.end, run).reception_events, 1);
  assert.throws(() => readActivity(bounds.start, bounds.end, () => { throw new Error("access denied"); }), /access denied/);
  assert.throws(() => readActivity(bounds.start, bounds.end, () => "{}"), /array/);
});
