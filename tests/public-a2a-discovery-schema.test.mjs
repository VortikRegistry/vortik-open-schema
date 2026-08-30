import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { assertPublicBaseUrl } from "../lib/public-a2a-beacon.mjs";
import {
  buildInternalA2AErrorPayload,
  createCloudRunAgentBeaconServer
} from "../service/cloud-run-agent-beacon.mjs";

const schemaUrl = new URL("../schemas/agents/vortik-agent-discovery/1.5.0/schema.json", import.meta.url);
const publicSchemaUrl = new URL("../docs/schemas/agents/vortik-agent-discovery/1.5.0/schema.json", import.meta.url);
const manifestUrl = new URL("../agents/discovery.json", import.meta.url);
const PUBLIC_BASE_URL = "https://beacon.example.test";
const LIFECYCLE_NOTE = "Lifecycle state is defined exclusively by the structured interaction fields; runtime capability availability is resolved from the live Agent Card rather than asserted by this static manifest.";

async function loadFixture() {
  const [schemaText, publicSchemaText, manifestText] = await Promise.all([
    readFile(schemaUrl, "utf8"),
    readFile(publicSchemaUrl, "utf8"),
    readFile(manifestUrl, "utf8")
  ]);
  assert.equal(publicSchemaText, schemaText, "source and public 1.5.0 schemas must be byte-identical");
  const schema = JSON.parse(schemaText);
  const manifest = JSON.parse(manifestText);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return { validate: ajv.compile(schema), manifest };
}

function liveCandidate(manifest, publicBaseUrl) {
  const candidate = structuredClone(manifest);
  candidate.interaction.mode = "a2a_live";
  candidate.interaction.a2a_server = true;
  candidate.interaction.live_network_ingress = true;
  candidate.interaction.agent_card_published = true;
  candidate.interaction.public_base_url = publicBaseUrl;
  return candidate;
}

async function withServer(run) {
  const server = createCloudRunAgentBeaconServer({ publicBaseUrl: PUBLIC_BASE_URL, requestBudgetLimit: 20 });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  try {
    return await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function withBudgetedServer(requestBudgetLimit, run) {
  const server = createCloudRunAgentBeaconServer({ publicBaseUrl: PUBLIC_BASE_URL, requestBudgetLimit });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  try {
    return await run(base);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function jsonResponse(response) {
  return JSON.parse(await response.text());
}

test("A2A live schema accepts canonical public DNS HTTPS origins also accepted by runtime", async () => {
  const { validate, manifest } = await loadFixture();
  for (const origin of [
    "https://beacon.example.test",
    "https://beacon.example.test:443",
    "https://vortik-beacon-abc123.sa-east1.run.app"
  ]) {
    assert.equal(validate(liveCandidate(manifest, origin)), true, JSON.stringify(validate.errors));
    assert.equal(assertPublicBaseUrl(origin), new URL(origin).origin);
  }
});

test("A2A lifecycle note is state-neutral and contradictory lifecycle prose fails closed", async () => {
  const { validate, manifest } = await loadFixture();
  assert.equal(manifest.interaction.note, LIFECYCLE_NOTE);
  assert.equal(validate(manifest), true, JSON.stringify(validate.errors));

  const live = liveCandidate(manifest, PUBLIC_BASE_URL);
  assert.equal(live.interaction.note, LIFECYCLE_NOTE);
  assert.equal(validate(live), true, JSON.stringify(validate.errors));

  for (const [label, candidate] of [
    ["preactivation stale prose", structuredClone(manifest)],
    ["live stale preactivation prose", liveCandidate(manifest, PUBLIC_BASE_URL)]
  ]) {
    candidate.interaction.note = "No public Agent Card or ingress is active.";
    assert.equal(validate(candidate), false, label);
  }
});

test("A2A live schema rejects non-public-host shapes and every origin the runtime cannot parse", async () => {
  const { validate, manifest } = await loadFixture();
  for (const invalidOrigin of [
    "http://beacon.example.test",
    "https://user@example.test",
    "https://user:secret@example.test",
    "https://beacon.example.test/path",
    "https://beacon.example.test/",
    "https://beacon.example.test?mode=live",
    "https://beacon.example.test#card",
    "https://beacon.example.test:0",
    "https://beacon.example.test:65536",
    "https://999.999.999.999",
    "https://127.0.0.1:8443"
  ]) {
    assert.equal(validate(liveCandidate(manifest, invalidOrigin)), false, invalidOrigin);
  }

  assert.throws(() => assertPublicBaseUrl("https://999.999.999.999"), /valid HTTPS URL/);
});

test("A2A live schema bounds total DNS host length and the runtime URL limit", async () => {
  const { validate, manifest } = await loadFixture();
  const tooLongDnsHost = Array.from({ length: 5 }, () => "a".repeat(50)).join(".");
  assert.equal(tooLongDnsHost.length, 254);
  const tooLongDnsOrigin = `https://${tooLongDnsHost}`;
  assert.equal(validate(liveCandidate(manifest, tooLongDnsOrigin)), false, "DNS host longer than 253 characters must fail");

  const overRuntimeLimit = `https://${Array.from({ length: 41 }, () => "a".repeat(50)).join(".")}.test`;
  assert.ok(overRuntimeLimit.length > 2048);
  assert.equal(validate(liveCandidate(manifest, overRuntimeLimit)), false, "origin beyond runtime URL limit must fail schema validation");
  assert.throws(() => assertPublicBaseUrl(overRuntimeLimit), /bounded HTTPS URL/);
});

test("wrong HTTP methods retain 405 while using a canonical google.rpc.Code status name", async () => {
  await withServer(async (base) => {
    for (const [path, method] of [
      ["/a2a/v1/message:send", "GET"],
      ["/a2a/v1/tasks", "POST"],
      ["/a2a/v1/tasks/task-1:cancel", "GET"],
      ["/a2a/v1/tasks/task-1", "POST"]
    ]) {
      const response = await fetch(`${base}${path}`, { method });
      assert.equal(response.status, 405, `${method} ${path}`);
      const payload = await jsonResponse(response);
      assert.equal(payload.error.code, 405, `${method} ${path}`);
      assert.equal(payload.error.status, "UNIMPLEMENTED", `${method} ${path}`);
      assert.equal(payload.error.status === "METHOD_NOT_ALLOWED", false, `${method} ${path}`);
    }
  });
});

test("Cloud Run internal fallback uses the same A2A HTTP error envelope", () => {
  assert.deepEqual(buildInternalA2AErrorPayload(), {
    error: {
      code: 500,
      status: "INTERNAL",
      message: "Internal beacon error"
    }
  });
});

test("Agent Card shares the application request budget with A2A while health remains exempt", async () => {
  await withBudgetedServer(1, async (base) => {
    const healthBefore = await fetch(`${base}/health`);
    assert.equal(healthBefore.status, 200);

    const card = await fetch(`${base}/.well-known/agent-card.json`);
    assert.equal(card.status, 200);

    const a2aAfterCard = await fetch(`${base}/a2a/v1/tasks`);
    assert.equal(a2aAfterCard.status, 429);
    const a2aPayload = await jsonResponse(a2aAfterCard);
    assert.equal(a2aPayload.error.code, 429);
    assert.equal(a2aPayload.error.status, "RESOURCE_EXHAUSTED");

    const cardAfterBudget = await fetch(`${base}/.well-known/agent-card.json`);
    assert.equal(cardAfterBudget.status, 429);
    assert.deepEqual(await jsonResponse(cardAfterBudget), { error: "request_budget_exhausted" });

    const healthAfter = await fetch(`${base}/health`);
    assert.equal(healthAfter.status, 200);
  });
});
