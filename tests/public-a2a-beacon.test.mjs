import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  A2A_PROTOCOL_BINDING,
  A2A_PROTOCOL_VERSION,
  buildPublicA2AAgentCard,
  createPublicA2ABeacon
} from "../lib/public-a2a-beacon.mjs";
import { createCloudRunAgentBeaconServer } from "../service/cloud-run-agent-beacon.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function sequenceIds() {
  let index = 0;
  return () => `id-${++index}`;
}

function sendRequest(text, overrides = {}) {
  return {
    message: {
      messageId: "client-1",
      role: "ROLE_USER",
      parts: [{ text }],
      ...overrides.message
    },
    ...overrides.request
  };
}

async function withServer(options, run) {
  const server = createCloudRunAgentBeaconServer({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: sequenceIds(),
    ...options
  });
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

test("A2A Agent Card is fixed to HTTP+JSON 1.0 and read-only capabilities", () => {
  const card = buildPublicA2AAgentCard({ publicBaseUrl: PUBLIC_BASE_URL });
  assert.equal(card.name, "Vortik Registry Discovery Beacon");
  assert.equal(card.version, "0.1.0");
  assert.deepEqual(card.supportedInterfaces, [{
    url: "https://beacon.example.test/a2a/v1",
    protocolBinding: A2A_PROTOCOL_BINDING,
    protocolVersion: A2A_PROTOCOL_VERSION
  }]);
  assert.deepEqual(card.capabilities, {
    streaming: false,
    pushNotifications: false,
    extendedAgentCard: false
  });
  assert.deepEqual(card.defaultInputModes, ["text/plain"]);
  assert.deepEqual(card.defaultOutputModes, ["text/plain", "application/json"]);
  assert.equal(card.skills.length, 4);
});

test("public base URL must be an HTTPS origin and cannot be inferred from requests", async () => {
  assert.throws(() => buildPublicA2AAgentCard({ publicBaseUrl: "http://beacon.example.test" }), /HTTPS/);
  assert.throws(() => buildPublicA2AAgentCard({ publicBaseUrl: "https://user@example.test" }), /credential-free/);
  assert.throws(() => buildPublicA2AAgentCard({ publicBaseUrl: "https://example.test/path" }), /must not contain a path/);

  await withServer({}, async (base) => {
    const response = await fetch(`${base}/.well-known/agent-card.json`, {
      headers: { host: "attacker.example" }
    });
    assert.equal(response.status, 200);
    const card = await jsonResponse(response);
    assert.equal(card.supportedInterfaces[0].url, "https://beacon.example.test/a2a/v1");
    assert.equal(JSON.stringify(card).includes("attacker.example"), false);
  });
});

test("semantic discovery is deterministic, bounded and does not echo the caller query", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  const secretMarker = "epbs private-marker-7f32";
  const result = beacon.sendMessage(sendRequest(secretMarker));
  assert.equal(result.message.role, "ROLE_AGENT");
  assert.equal(result.message.contextId, "id-1");
  assert.equal(result.message.messageId, "id-2");
  assert.equal(result.message.parts.length, 1);
  assert.match(result.message.parts[0].text, /Ethereum ePBS semantic discovery/);
  assert.equal(JSON.stringify(result).includes(secretMarker), false);
  assert.equal("task" in result, false);
});

test("JSON output mode returns closed discovery data with authority flags", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  const result = beacon.sendMessage(sendRequest("ENS semantic research", {
    request: { configuration: { acceptedOutputModes: ["application/json"] } }
  }));
  const part = result.message.parts[0];
  assert.equal(part.mediaType, "application/json");
  assert.equal(part.data.capabilityId, "ens_semantic_research_contracts");
  assert.equal(part.data.externalRetrieval, false);
  assert.equal(part.data.persistentTask, false);
  assert.deepEqual(part.data.authority, {
    protocolAuthority: false,
    ensAuthority: false,
    ownershipInference: false
  });
});

test("unknown discovery queries return a bounded generic response without external search", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  const result = beacon.sendMessage(sendRequest("completely unrelated coordination phrase"));
  assert.match(result.message.parts[0].text, /Vortik Registry public discovery/);
  assert.match(result.message.parts[0].text, /agents\/discovery\.json/);
});

test("core rejects wrong roles, multiple parts, structured parts and caller URLs", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  assert.throws(() => beacon.sendMessage(sendRequest("epbs", { message: { role: "ROLE_AGENT" } })), /ROLE_USER/);
  assert.throws(() => beacon.sendMessage(sendRequest("epbs", { message: { parts: [{ text: "epbs" }, { text: "focil" }] } })), /exactly one/);
  assert.throws(() => beacon.sendMessage(sendRequest("epbs", { message: { parts: [{ data: { query: "epbs" } }] } })), /unsupported field/);
  assert.throws(() => beacon.sendMessage(sendRequest("please inspect https://example.com")), /URLs are not accepted/);
  assert.throws(() => beacon.sendMessage(sendRequest("x".repeat(513))), /1-512/);
});

test("Agent Card endpoint emits cache controls and supports ETag revalidation", async () => {
  await withServer({}, async (base) => {
    const first = await fetch(`${base}/.well-known/agent-card.json`);
    assert.equal(first.status, 200);
    assert.equal(first.headers.get("cache-control"), "public, max-age=300");
    const etag = first.headers.get("etag");
    assert.ok(etag);
    const second = await fetch(`${base}/.well-known/agent-card.json`, { headers: { "if-none-match": etag } });
    assert.equal(second.status, 304);
  });
});

test("HTTP SendMessage accepts bounded JSON and returns a direct Message", async () => {
  await withServer({}, async (base) => {
    const response = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json", "a2a-version": "1.0" },
      body: JSON.stringify(sendRequest("FOCIL inclusion list"))
    });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("a2a-version"), "1.0");
    const payload = await jsonResponse(response);
    assert.equal(payload.message.role, "ROLE_AGENT");
    assert.match(payload.message.parts[0].text, /inclusion-list semantic discovery/);
    assert.equal("task" in payload, false);
  });
});

test("HTTP rejects malformed JSON, oversized bodies and unsupported media types", async () => {
  await withServer({}, async (base) => {
    const malformed = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    });
    assert.equal(malformed.status, 400);
    assert.equal((await jsonResponse(malformed)).code, "invalid_json");

    const oversized = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: "x".repeat(9000) })
    });
    assert.equal(oversized.status, 413);

    const wrongType = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "epbs"
    });
    assert.equal(wrongType.status, 415);
  });
});

test("HTTP rejects unsupported A2A versions and extensions before body processing", async () => {
  await withServer({}, async (base) => {
    const wrongVersion = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/json", "a2a-version": "9.9" },
      body: JSON.stringify(sendRequest("epbs"))
    });
    assert.equal(wrongVersion.status, 400);
    assert.equal((await jsonResponse(wrongVersion)).code, "unsupported_version");

    const extension = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/json", "a2a-extensions": "urn:example" },
      body: JSON.stringify(sendRequest("epbs"))
    });
    assert.equal(extension.status, 400);
    assert.equal((await jsonResponse(extension)).code, "unsupported_extension");
  });
});

test("streaming, push-style and extended-card operations remain disabled", async () => {
  await withServer({}, async (base) => {
    for (const path of [
      "/a2a/v1/message:stream",
      "/a2a/v1/tasks/task-1:subscribe",
      "/a2a/v1/tasks/task-1/pushNotificationConfig",
      "/a2a/v1/extendedAgentCard"
    ]) {
      const response = await fetch(`${base}${path}`, { method: "POST" });
      assert.equal(response.status, 501, path);
      assert.equal((await jsonResponse(response)).code, "unsupported_operation");
    }
  });
});

test("beacon retains no tasks and task get/cancel fail closed", async () => {
  await withServer({}, async (base) => {
    const list = await fetch(`${base}/a2a/v1/tasks?pageSize=10`);
    assert.equal(list.status, 200);
    assert.deepEqual(await jsonResponse(list), { tasks: [], nextPageToken: "", pageSize: 10, totalSize: 0 });

    const get = await fetch(`${base}/a2a/v1/tasks/task-1`);
    assert.equal(get.status, 404);
    assert.equal((await jsonResponse(get)).code, "task_not_found");

    const cancel = await fetch(`${base}/a2a/v1/tasks/task-1:cancel`, { method: "POST" });
    assert.equal(cancel.status, 404);
    assert.equal((await jsonResponse(cancel)).code, "task_not_found");
  });
});

test("application request budget fails closed", async () => {
  await withServer({ requestBudgetLimit: 1 }, async (base) => {
    const options = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(sendRequest("epbs"))
    };
    const first = await fetch(`${base}/a2a/v1/message:send`, options);
    assert.equal(first.status, 200);
    const second = await fetch(`${base}/a2a/v1/message:send`, options);
    assert.equal(second.status, 429);
    assert.equal((await jsonResponse(second)).code, "request_budget_exhausted");
  });
});

test("beacon implementation has no fetch or trusted-receipt/KMS runtime dependency", async () => {
  const paths = [
    new URL("../lib/public-a2a-beacon.mjs", import.meta.url),
    new URL("../lib/public-a2a-http.mjs", import.meta.url),
    new URL("../service/cloud-run-agent-beacon.mjs", import.meta.url)
  ];
  const texts = await Promise.all(paths.map((path) => readFile(path, "utf8")));
  for (const text of texts) {
    assert.equal(/\bfetch\s*\(/.test(text), false);
    assert.equal(/google-cloud-kms|receipt-runtime|cloud-run-receipt-runtime/i.test(text), false);
    assert.equal(/request\.url[^\n]*stdout|parts[^\n]*stdout|console\.log\s*\(/i.test(text), false);
  }
});
