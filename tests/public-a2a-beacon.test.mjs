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

function a2aReason(payload) {
  return payload.error?.details?.find((detail) => detail["@type"] === "type.googleapis.com/google.rpc.ErrorInfo")?.reason;
}

test("A2A Agent Card is fixed to HTTP+JSON 1.0 and read-only capabilities", () => {
  const card = buildPublicA2AAgentCard({ publicBaseUrl: PUBLIC_BASE_URL });
  assert.equal(card.name, "Vortik Registry Reception Beacon");
  assert.equal(card.version, "0.2.0");
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
  assert.equal(card.skills.length, 5);
  assert.ok(card.skills.some((skill) => skill.id === "vortik-public-reception"));
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
  assert.equal(result.message.parts[0].mediaType, "text/plain");
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

test("A2A 1.0 optional metadata and stateless configuration remain inert", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  const result = beacon.sendMessage({
    tenant: "",
    metadata: { client: "example" },
    configuration: {
      historyLength: 0,
      returnImmediately: true,
      acceptedOutputModes: ["text/plain", "application/json"]
    },
    message: {
      messageId: "client-1",
      role: "ROLE_USER",
      metadata: { language: "en" },
      extensions: ["https://example.test/non-required-extension"],
      parts: [{
        text: "epbs",
        mediaType: "text/plain",
        filename: "query.txt",
        metadata: { source: "client" }
      }]
    }
  });
  assert.equal(result.message.role, "ROLE_AGENT");
  assert.equal(result.message.parts[0].mediaType, "text/plain");
  assert.equal(JSON.stringify(result).includes("example.test/non-required-extension"), false);
});

test("core rejects wrong roles, multiple parts, binary/structured/url parts and caller URLs", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", { message: { role: "ROLE_AGENT" } })),
    /ROLE_USER/
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      message: { parts: [{ text: "epbs" }, { text: "focil" }] }
    })),
    /exactly one/
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      message: { parts: [{ data: { query: "epbs" } }] }
    })),
    /unsupported field/
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      message: { parts: [{ raw: "ZXBicw==" }] }
    })),
    /unsupported field/
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      message: { parts: [{ url: "https://example.com" }] }
    })),
    /unsupported field/
  );
  for (const text of [
    "please inspect https://example.com",
    "research ipfs://gateway.test/epbs.eth",
    "research //gateway.test/epbs.eth",
    "research gateway.test/epbs.eth",
    "research mailto:epbs.eth",
    "research gateway.test?name=epbs.eth"
  ]) {
    assert.throws(() => beacon.sendMessage(sendRequest(text)), /URLs are not accepted/);
  }
  assert.throws(() => beacon.sendMessage(sendRequest("x".repeat(513))), /1-512/);
});

test("stateless task references and push configuration fail with A2A-specific reasons", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: sequenceIds() });
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      message: { taskId: "task-1" }
    })),
    (error) => error.a2aReason === "TASK_NOT_FOUND"
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest("epbs", {
      request: { configuration: { taskPushNotificationConfig: {} } }
    })),
    (error) => error.a2aReason === "PUSH_NOTIFICATION_NOT_SUPPORTED"
  );
});

test("generated identifiers use the stricter ENS-compatible contract", () => {
  for (const generatedId of ["ok:colon", "x".repeat(65)]) {
    const beacon = createPublicA2ABeacon({
      publicBaseUrl: PUBLIC_BASE_URL,
      idFactory: () => generatedId
    });
    assert.throws(
      () => beacon.sendMessage(sendRequest("research epbs.eth")),
      /ENS-compatible generated identifier contract/
    );
    assert.throws(
      () => beacon.sendMessage(sendRequest("capabilities")),
      /ENS-compatible generated identifier contract/
    );
  }

  const accepted = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => `a${"b".repeat(63)}`
  }).sendMessage(sendRequest("research epbs.eth", {
    message: { contextId: "caller:context" }
  }));
  assert.equal(accepted.message.contextId, "caller:context");
  assert.equal(accepted.message.messageId.length, 64);
  assert.equal(accepted.message.parts[0].mediaType, "text/plain");
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

test("HTTP SendMessage uses application/a2a+json and returns a direct Message", async () => {
  await withServer({}, async (base) => {
    const response = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json", "a2a-version": "1.0" },
      body: JSON.stringify(sendRequest("FOCIL inclusion list"))
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^application\/a2a\+json/);
    assert.equal(response.headers.get("a2a-version"), "1.0");
    const payload = await jsonResponse(response);
    assert.equal(payload.message.role, "ROLE_AGENT");
    assert.match(payload.message.parts[0].text, /inclusion-list semantic discovery/);
    assert.equal("task" in payload, false);
  });
});

test("HTTP errors use the A2A v1.0 error envelope and preserve HTTP status codes", async () => {
  await withServer({}, async (base) => {
    const malformed = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json" },
      body: "{"
    });
    assert.equal(malformed.status, 400);
    const malformedPayload = await jsonResponse(malformed);
    assert.equal(malformedPayload.error.code, 400);
    assert.equal(malformedPayload.error.status, "INVALID_ARGUMENT");
    assert.equal(typeof malformedPayload.error.message, "string");

    const oversized = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json" },
      body: JSON.stringify({ payload: "x".repeat(9000) })
    });
    assert.equal(oversized.status, 413);
    const oversizedPayload = await jsonResponse(oversized);
    assert.equal(oversizedPayload.error.code, 413);
    assert.equal(oversizedPayload.error.status, "RESOURCE_EXHAUSTED");

    const wrongType = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "epbs"
    });
    assert.equal(wrongType.status, 400);
    const wrongTypePayload = await jsonResponse(wrongType);
    assert.equal(wrongTypePayload.error.code, 400);
    assert.equal(wrongTypePayload.error.status, "INVALID_ARGUMENT");
    assert.equal(a2aReason(wrongTypePayload), "CONTENT_TYPE_NOT_SUPPORTED");
  });
});

test("HTTP rejects unsupported A2A versions but ignores undeclared client extension hints", async () => {
  await withServer({}, async (base) => {
    const wrongVersion = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json", "a2a-version": "9.9" },
      body: JSON.stringify(sendRequest("epbs"))
    });
    assert.equal(wrongVersion.status, 400);
    const wrongVersionPayload = await jsonResponse(wrongVersion);
    assert.equal(wrongVersionPayload.error.code, 400);
    assert.equal(wrongVersionPayload.error.status, "FAILED_PRECONDITION");
    assert.equal(a2aReason(wrongVersionPayload), "VERSION_NOT_SUPPORTED");

    const extension = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: { "content-type": "application/a2a+json", "a2a-extensions": "https://example.test/non-required-extension" },
      body: JSON.stringify(sendRequest("epbs"))
    });
    assert.equal(extension.status, 200);
  });
});

test("streaming, push-style and extended-card operations use canonical A2A failure classes", async () => {
  await withServer({}, async (base) => {
    const streaming = await fetch(`${base}/a2a/v1/message:stream`, { method: "POST" });
    assert.equal(streaming.status, 400);
    const streamingPayload = await jsonResponse(streaming);
    assert.equal(streamingPayload.error.code, 400);
    assert.equal(streamingPayload.error.status, "FAILED_PRECONDITION");
    assert.equal(a2aReason(streamingPayload), "UNSUPPORTED_OPERATION");

    const subscription = await fetch(`${base}/a2a/v1/tasks/task-1:subscribe`, { method: "POST" });
    assert.equal(subscription.status, 400);
    assert.equal(a2aReason(await jsonResponse(subscription)), "UNSUPPORTED_OPERATION");

    const push = await fetch(`${base}/a2a/v1/tasks/task-1/pushNotificationConfigs`, { method: "GET" });
    assert.equal(push.status, 400);
    assert.equal(a2aReason(await jsonResponse(push)), "PUSH_NOTIFICATION_NOT_SUPPORTED");

    const extended = await fetch(`${base}/a2a/v1/extendedAgentCard`);
    assert.equal(extended.status, 400);
    assert.equal(a2aReason(await jsonResponse(extended)), "EXTENDED_AGENT_CARD_NOT_CONFIGURED");
  });
});

test("beacon retains no tasks and task get/cancel return canonical TaskNotFound", async () => {
  await withServer({}, async (base) => {
    const list = await fetch(`${base}/a2a/v1/tasks?pageSize=10&historyLength=0&includeArtifacts=false`);
    assert.equal(list.status, 200);
    assert.match(list.headers.get("content-type"), /^application\/a2a\+json/);
    assert.deepEqual(await jsonResponse(list), { tasks: [], nextPageToken: "", pageSize: 10, totalSize: 0 });

    const get = await fetch(`${base}/a2a/v1/tasks/task-1?historyLength=0`);
    assert.equal(get.status, 404);
    const getPayload = await jsonResponse(get);
    assert.equal(getPayload.error.code, 404);
    assert.equal(getPayload.error.status, "NOT_FOUND");
    assert.equal(a2aReason(getPayload), "TASK_NOT_FOUND");

    const cancel = await fetch(`${base}/a2a/v1/tasks/task-1:cancel`, { method: "POST" });
    assert.equal(cancel.status, 404);
    const cancelPayload = await jsonResponse(cancel);
    assert.equal(cancelPayload.error.code, 404);
    assert.equal(cancelPayload.error.status, "NOT_FOUND");
    assert.equal(a2aReason(cancelPayload), "TASK_NOT_FOUND");
  });
});

test("application request budget fails closed with RESOURCE_EXHAUSTED", async () => {
  await withServer({ requestBudgetLimit: 1 }, async (base) => {
    const options = {
      method: "POST",
      headers: { "content-type": "application/a2a+json" },
      body: JSON.stringify(sendRequest("epbs"))
    };
    const first = await fetch(`${base}/a2a/v1/message:send`, options);
    assert.equal(first.status, 200);
    const second = await fetch(`${base}/a2a/v1/message:send`, options);
    assert.equal(second.status, 429);
    const payload = await jsonResponse(second);
    assert.equal(payload.error.code, 429);
    assert.equal(payload.error.status, "RESOURCE_EXHAUSTED");
  });
});

test("every non-health request shares the application budget while health remains exempt", async () => {
  await withServer({ requestBudgetLimit: 1 }, async (base) => {
    const arbitrary = await fetch(`${base}/random`);
    assert.equal(arbitrary.status, 404);

    const card = await fetch(`${base}/.well-known/agent-card.json`);
    assert.equal(card.status, 429);
    assert.deepEqual(await jsonResponse(card), { error: "request_budget_exhausted" });

    const health = await fetch(`${base}/health`);
    assert.equal(health.status, 200);
    const healthPayload = await jsonResponse(health);
    assert.equal(healthPayload.status, "ready");
  });
});

test("beacon implementation has no fetch or trusted-receipt/KMS runtime dependency", async () => {
  const paths = [
    new URL("../lib/public-a2a-beacon.mjs", import.meta.url),
    new URL("../lib/public-a2a-http.mjs", import.meta.url),
    new URL("../lib/public-reception-router.mjs", import.meta.url),
    new URL("../lib/ens-research-client.mjs", import.meta.url),
    new URL("../lib/ens-research-evaluator.mjs", import.meta.url),
    new URL("../service/cloud-run-agent-beacon.mjs", import.meta.url)
  ];
  const texts = await Promise.all(paths.map((path) => readFile(path, "utf8")));
  for (const text of texts) {
    assert.equal(/\bfetch\s*\(/.test(text), false);
    assert.equal(/google-cloud-kms|receipt-runtime|cloud-run-receipt-runtime/i.test(text), false);
    assert.equal(/request\.url[^\n]*stdout|parts[^\n]*stdout|console\.log\s*\(/i.test(text), false);
  }
});
