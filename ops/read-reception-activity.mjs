#!/usr/bin/env node
// Read existing logs only. No service requests, resource creation or log writes.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const PROJECT = "vortik-registry-production";
const SERVICE = "vortik-agent-beacon";
const REGION = "southamerica-east1";
const SCHEMA = "vortik_reception_observation/1.0.0";
const LIMIT = 10000;
const INTENTS = new Set(["candidate_submission", "evidence_contribution", "commercial_interest", "business_proposal", "ens_research", "capability_discovery", "registry_lookup", "technical_context", "unsupported"]);

export function queryFor(start, end) {
  for (const value of [start, end]) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value.replace("Z", ".000Z")) {
      throw new Error("Use exact UTC timestamps: YYYY-MM-DDTHH:mm:ssZ");
    }
  }
  const interval = Date.parse(end) - Date.parse(start);
  if (interval <= 0 || interval > 31 * 86400000) throw new Error("Choose a positive interval of at most 31 days");
  return [
    'resource.type="cloud_run_revision"',
    `resource.labels.project_id="${PROJECT}"`,
    `resource.labels.service_name="${SERVICE}"`,
    `resource.labels.location="${REGION}"`,
    `timestamp>="${start}"`,
    `timestamp<"${end}"`,
    `(logName="projects/${PROJECT}/logs/run.googleapis.com%2Frequests" OR jsonPayload.schema="${SCHEMA}")`
  ].join("\n");
}

export function summarize(entries, { start, end }) {
  queryFor(start, end);
  if (!Array.isArray(entries)) throw new Error("Expected a Logging JSON array");
  const result = {
    interval_utc: { start_inclusive: start, end_exclusive: end },
    read_limit: LIMIT,
    coverage: entries.length > LIMIT ? "INCOMPLETE_LIMIT_REACHED" : "RETURNED_LOGS_ONLY",
    returned_records: entries.length,
    processed_records: Math.min(entries.length, LIMIT),
    http_requests: 0,
    http_status_groups: {},
    reception_events: 0,
    duplicate_reception_events: 0,
    events_without_id: 0,
    high_priority_events: 0,
    intents: {},
    days_utc: {},
    ignored_records: 0,
    external_visitors: "NOT_DETERMINED",
    synthetic_events: "NOT_AUTOMATICALLY_EXCLUDED",
    note: "Requests and Reception events are separate counts; never add them as visitors. Missing retained logs, exclusions, probes, retries and unverified identities prevent a human visitor count. Reconcile known tests privately."
  };
  const seen = new Set();
  const bump = (object, key) => { object[key] = (object[key] || 0) + 1; };
  for (const entry of entries.slice(0, LIMIT)) {
    const labels = entry?.resource?.labels;
    const time = Date.parse(entry?.timestamp);
    if (entry?.resource?.type !== "cloud_run_revision" || labels?.project_id !== PROJECT || labels?.service_name !== SERVICE || labels?.location !== REGION || !Number.isFinite(time) || time < Date.parse(start) || time >= Date.parse(end)) {
      result.ignored_records++;
      continue;
    }
    if (entry.logName === `projects/${PROJECT}/logs/run.googleapis.com%2Frequests`) {
      result.http_requests++;
      const status = entry.httpRequest?.status;
      bump(result.http_status_groups, Number.isInteger(status) && status >= 100 && status < 600 ? `${Math.floor(status / 100)}xx` : "unknown");
      continue;
    }
    const payload = entry.jsonPayload;
    if (payload?.schema !== SCHEMA) { result.ignored_records++; continue; }
    if (typeof payload.event_id === "string" && payload.event_id.length > 0 && payload.event_id.length <= 128) {
      if (seen.has(payload.event_id)) { result.duplicate_reception_events++; continue; }
      seen.add(payload.event_id);
    } else {
      result.events_without_id++;
    }
    result.reception_events++;
    if (payload.priority === "high") result.high_priority_events++;
    bump(result.intents, INTENTS.has(payload.intent) ? payload.intent : "unknown");
    bump(result.days_utc, new Date(time).toISOString().slice(0, 10));
  }
  return result;
}

export function readActivity(start, end, run = execFileSync) {
  const query = queryFor(start, end);
  const raw = run("gcloud", ["logging", "read", query, `--project=${PROJECT}`, "--order=asc", `--limit=${LIMIT + 1}`,
    "--format=json(timestamp,logName,resource.type,resource.labels.project_id,resource.labels.service_name,resource.labels.location,httpRequest.status,jsonPayload.schema,jsonPayload.event_id,jsonPayload.intent,jsonPayload.priority)", "--quiet"],
  { encoding: "utf8", timeout: 120000, maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });
  return summarize(JSON.parse(raw), { start, end });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length !== 4) throw new Error("Usage: node ops/read-reception-activity.mjs START_UTC END_UTC");
    console.log(JSON.stringify(readActivity(process.argv[2], process.argv[3]), null, 2));
  } catch (error) {
    // Do not echo gcloud output, which may contain account or environment data.
    console.error(error.code || error.status ? "READ_FAILED: check your gcloud session, Logging access and query interval. No resources were changed." : error.message);
    process.exitCode = 1;
  }
}
