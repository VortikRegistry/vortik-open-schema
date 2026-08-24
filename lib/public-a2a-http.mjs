import { createHash } from "node:crypto";

import {
  A2A_PROTOCOL_VERSION,
  createPublicA2ABeacon
} from "./public-a2a-beacon.mjs";

export const MAX_A2A_BODY_BYTES = 8 * 1024;

const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
});

const A2A_JSON_HEADERS = Object.freeze({
  "content-type": "application/a2a+json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "a2a-version": A2A_PROTOCOL_VERSION
});

const TASK_STATES = new Set([
  "TASK_STATE_SUBMITTED",
  "TASK_STATE_WORKING",
  "TASK_STATE_COMPLETED",
  "TASK_STATE_FAILED",
  "TASK_STATE_CANCELED",
  "TASK_STATE_INPUT_REQUIRED",
  "TASK_STATE_REJECTED",
  "TASK_STATE_AUTH_REQUIRED"
]);

function writeJson(response, statusCode, payload, extraHeaders = {}) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    ...JSON_HEADERS,
    ...extraHeaders,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function writeA2AJson(response, statusCode, payload, extraHeaders = {}) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    ...A2A_JSON_HEADERS,
    ...extraHeaders,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

// A2A v1.0 HTTP+JSON §11.6 follows the AIP-193 HTTP representation:
// the body is wrapped in `error`, and `error.code` is the HTTP status code.
// This is intentionally distinct from the gRPC binding's google.rpc.Status code enum.
function writeA2AError(response, httpStatus, status, message, reason) {
  const error = {
    code: httpStatus,
    status,
    message
  };
  if (reason) {
    error.details = [{
      "@type": "type.googleapis.com/google.rpc.ErrorInfo",
      reason,
      domain: "a2a-protocol.org"
    }];
  }
  writeA2AJson(response, httpStatus, { error });
}

function stableEtag(payload) {
  const body = JSON.stringify(payload);
  return `"sha256-${createHash("sha256").update(body).digest("base64url")}"`;
}

function assertA2AVersion(request) {
  const version = request.headers["a2a-version"];
  if (version !== undefined && version !== A2A_PROTOCOL_VERSION) {
    throw Object.assign(new Error("unsupported A2A version"), { a2aReason: "VERSION_NOT_SUPPORTED" });
  }
}

function assertJsonContentType(request) {
  const contentType = request.headers["content-type"] ?? "";
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json" && mediaType !== "application/a2a+json") {
    throw Object.assign(new Error("unsupported media type"), { a2aReason: "CONTENT_TYPE_NOT_SUPPORTED" });
  }
}

async function readBoundedJson(request, maxBodyBytes) {
  const declaredLength = request.headers["content-length"];
  if (declaredLength !== undefined) {
    if (!/^(?:0|[1-9][0-9]*)$/.test(declaredLength)) {
      throw Object.assign(new Error("invalid content length"), { requestCode: "INVALID_REQUEST" });
    }
    if (Number(declaredLength) > maxBodyBytes) {
      throw Object.assign(new Error("request body too large"), { requestCode: "PAYLOAD_TOO_LARGE" });
    }
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.byteLength;
    if (total > maxBodyBytes) {
      throw Object.assign(new Error("request body too large"), { requestCode: "PAYLOAD_TOO_LARGE" });
    }
    chunks.push(bytes);
  }
  if (total === 0) throw Object.assign(new Error("empty body"), { requestCode: "INVALID_REQUEST" });

  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
  } catch {
    throw Object.assign(new Error("invalid utf8"), { requestCode: "INVALID_REQUEST" });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("invalid json"), { requestCode: "INVALID_JSON" });
  }
}

export function createFixedWindowBudget({ limit = 60, windowMs = 60_000, now = Date.now } = {}) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 10_000) throw new Error("budget limit is invalid");
  if (!Number.isSafeInteger(windowMs) || windowMs < 1_000 || windowMs > 3_600_000) throw new Error("budget window is invalid");
  if (typeof now !== "function") throw new TypeError("budget clock must be a function");
  let windowStartedAt = now();
  let used = 0;

  return Object.freeze({
    consume() {
      const current = now();
      if (!Number.isFinite(current)) return false;
      if (current < windowStartedAt || current - windowStartedAt >= windowMs) {
        windowStartedAt = current;
        used = 0;
      }
      if (used >= limit) return false;
      used += 1;
      return true;
    }
  });
}

function writeMappedError(response, error) {
  switch (error?.a2aReason) {
    case "TASK_NOT_FOUND":
      writeA2AError(response, 404, "NOT_FOUND", "The specified task ID does not exist or is not accessible", "TASK_NOT_FOUND");
      return;
    case "PUSH_NOTIFICATION_NOT_SUPPORTED":
      writeA2AError(response, 400, "FAILED_PRECONDITION", "Push notifications are not supported by this agent", "PUSH_NOTIFICATION_NOT_SUPPORTED");
      return;
    case "CONTENT_TYPE_NOT_SUPPORTED":
      writeA2AError(response, 400, "INVALID_ARGUMENT", "The requested content type is not supported by this agent", "CONTENT_TYPE_NOT_SUPPORTED");
      return;
    case "VERSION_NOT_SUPPORTED":
      writeA2AError(response, 400, "FAILED_PRECONDITION", `A2A protocol version ${A2A_PROTOCOL_VERSION} is required`, "VERSION_NOT_SUPPORTED");
      return;
    default:
      break;
  }

  if (error?.requestCode === "PAYLOAD_TOO_LARGE") {
    writeA2AError(response, 413, "RESOURCE_EXHAUSTED", "Request body exceeds the beacon limit");
    return;
  }
  if (error?.requestCode === "INVALID_JSON") {
    writeA2AError(response, 400, "INVALID_ARGUMENT", "Request body is not valid JSON");
    return;
  }
  writeA2AError(response, 400, "INVALID_ARGUMENT", "Request does not match the bounded discovery contract");
}

function parseTarget(request) {
  try {
    return new URL(request.url ?? "/", "http://vortik-a2a.internal");
  } catch {
    return null;
  }
}

function assertKnownQueryKeys(url, allowed) {
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) {
    throw new Error("query contains unsupported fields");
  }
}

function assertOptionalNonNegativeIntegerParam(url, key, max = 1000) {
  const value = url.searchParams.get(key);
  if (value === null) return;
  if (!/^(?:0|[1-9][0-9]*)$/.test(value) || Number(value) > max) throw new Error(`${key} is outside the allowed range`);
}

function assertNoTenant(url) {
  const tenant = url.searchParams.get("tenant");
  if (tenant !== null && tenant !== "") throw new Error("tenant routing is not configured for this AgentInterface");
}

function writeUnsupportedOperation(response) {
  writeA2AError(response, 400, "FAILED_PRECONDITION", "This operation is not supported by the read-only discovery beacon", "UNSUPPORTED_OPERATION");
}

export function createPublicA2AHttpHandler({
  publicBaseUrl,
  budget = createFixedWindowBudget(),
  idFactory,
  maxBodyBytes = MAX_A2A_BODY_BYTES
} = {}) {
  if (!budget || typeof budget.consume !== "function") throw new TypeError("budget must expose consume()");
  if (!Number.isSafeInteger(maxBodyBytes) || maxBodyBytes < 1024 || maxBodyBytes > 65_536) throw new Error("maxBodyBytes is invalid");
  const beacon = createPublicA2ABeacon({ publicBaseUrl, idFactory });
  const cardEtag = stableEtag(beacon.agentCard);

  return async function handlePublicA2ARequest(request, response) {
    const url = parseTarget(request);
    if (!url) {
      writeJson(response, 400, { error: "invalid_request_target" }, { "cache-control": "no-store" });
      return;
    }

    if (url.pathname === "/health") {
      if (request.method !== "GET" || url.search || url.hash) {
        writeJson(response, request.method === "GET" ? 400 : 405, { error: "invalid_health_request" }, { "cache-control": "no-store" });
        return;
      }
      writeJson(response, 200, {
        status: "ready",
        service: "vortik-public-a2a-discovery-beacon",
        protocolVersion: A2A_PROTOCOL_VERSION,
        externalRetrieval: false,
        persistentTasks: false
      }, { "cache-control": "no-store" });
      return;
    }

    if (url.pathname === "/.well-known/agent-card.json") {
      if (request.method !== "GET" || url.search || url.hash) {
        writeJson(response, request.method === "GET" ? 400 : 405, { error: "invalid_agent_card_request" }, { "cache-control": "no-store" });
        return;
      }
      if (request.headers["if-none-match"] === cardEtag) {
        response.writeHead(304, { etag: cardEtag, "cache-control": "public, max-age=300", "x-content-type-options": "nosniff" });
        response.end();
        return;
      }
      writeJson(response, 200, beacon.agentCard, { etag: cardEtag, "cache-control": "public, max-age=300" });
      return;
    }

    if (!url.pathname.startsWith("/a2a/v1")) {
      writeJson(response, 404, { error: "not_found" }, { "cache-control": "no-store" });
      return;
    }

    if (!budget.consume()) {
      writeA2AError(response, 429, "RESOURCE_EXHAUSTED", "Beacon request budget is exhausted");
      return;
    }

    try {
      assertA2AVersion(request);
    } catch (error) {
      writeMappedError(response, error);
      return;
    }

    if (url.pathname === "/a2a/v1/message:send") {
      if (request.method !== "POST" || url.search || url.hash) {
        writeA2AError(response, request.method === "POST" ? 400 : 405, request.method === "POST" ? "INVALID_ARGUMENT" : "UNIMPLEMENTED", "SendMessage accepts only plain POST requests");
        return;
      }
      try {
        assertJsonContentType(request);
        const payload = await readBoundedJson(request, maxBodyBytes);
        writeA2AJson(response, 200, beacon.sendMessage(payload));
      } catch (error) {
        writeMappedError(response, error);
      }
      return;
    }

    if (url.pathname === "/a2a/v1/message:stream" || url.pathname.endsWith(":subscribe")) {
      writeUnsupportedOperation(response);
      return;
    }

    if (url.pathname.includes("pushNotification")) {
      writeA2AError(response, 400, "FAILED_PRECONDITION", "Push notifications are not supported by this agent", "PUSH_NOTIFICATION_NOT_SUPPORTED");
      return;
    }

    if (url.pathname === "/a2a/v1/extendedAgentCard") {
      writeA2AError(response, 400, "FAILED_PRECONDITION", "An extended Agent Card is not configured", "EXTENDED_AGENT_CARD_NOT_CONFIGURED");
      return;
    }

    if (url.pathname === "/a2a/v1/tasks") {
      if (request.method !== "GET") {
        writeA2AError(response, 405, "UNIMPLEMENTED", "Task listing accepts only GET");
        return;
      }
      if (url.hash) {
        writeA2AError(response, 400, "INVALID_ARGUMENT", "Task list request is invalid");
        return;
      }
      try {
        assertKnownQueryKeys(url, new Set(["tenant", "contextId", "status", "pageSize", "pageToken", "historyLength", "statusTimestampAfter", "includeArtifacts"]));
        assertNoTenant(url);
        const contextId = url.searchParams.get("contextId");
        if (contextId !== null && (contextId.length < 1 || contextId.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(contextId))) throw new Error("contextId is invalid");
        const status = url.searchParams.get("status");
        if (status !== null && !TASK_STATES.has(status)) throw new Error("status is invalid");
        const rawPageSize = url.searchParams.get("pageSize") ?? "50";
        if (!/^[1-9][0-9]{0,2}$/.test(rawPageSize) || Number(rawPageSize) > 100) throw new Error("pageSize is invalid");
        if (url.searchParams.get("pageToken")) throw new Error("the stateless beacon does not issue page tokens");
        assertOptionalNonNegativeIntegerParam(url, "historyLength");
        const timestamp = url.searchParams.get("statusTimestampAfter");
        if (timestamp !== null && (timestamp.length > 128 || !Number.isFinite(Date.parse(timestamp)))) throw new Error("statusTimestampAfter is invalid");
        const includeArtifacts = url.searchParams.get("includeArtifacts");
        if (includeArtifacts !== null && includeArtifacts !== "true" && includeArtifacts !== "false") throw new Error("includeArtifacts is invalid");
        writeA2AJson(response, 200, {
          tasks: [],
          nextPageToken: "",
          pageSize: Number(rawPageSize),
          totalSize: 0
        });
      } catch {
        writeA2AError(response, 400, "INVALID_ARGUMENT", "Task list query is invalid");
      }
      return;
    }

    const taskCancelMatch = /^\/a2a\/v1\/tasks\/([A-Za-z0-9._:-]{1,128}):cancel$/.exec(url.pathname);
    if (taskCancelMatch) {
      if (request.method !== "POST") {
        writeA2AError(response, 405, "UNIMPLEMENTED", "Task cancel accepts only POST");
        return;
      }
      try {
        assertKnownQueryKeys(url, new Set(["tenant"]));
        assertNoTenant(url);
      } catch {
        writeA2AError(response, 400, "INVALID_ARGUMENT", "Task cancel query is invalid");
        return;
      }
      writeA2AError(response, 404, "NOT_FOUND", "The specified task ID does not exist or is not accessible", "TASK_NOT_FOUND");
      return;
    }

    const taskGetMatch = /^\/a2a\/v1\/tasks\/([A-Za-z0-9._:-]{1,128})$/.exec(url.pathname);
    if (taskGetMatch) {
      if (request.method !== "GET") {
        writeA2AError(response, 405, "UNIMPLEMENTED", "Task retrieval accepts only GET");
        return;
      }
      try {
        assertKnownQueryKeys(url, new Set(["tenant", "historyLength"]));
        assertNoTenant(url);
        assertOptionalNonNegativeIntegerParam(url, "historyLength");
      } catch {
        writeA2AError(response, 400, "INVALID_ARGUMENT", "Task retrieval query is invalid");
        return;
      }
      writeA2AError(response, 404, "NOT_FOUND", "The specified task ID does not exist or is not accessible", "TASK_NOT_FOUND");
      return;
    }

    writeA2AError(response, 404, "NOT_FOUND", "A2A route not found");
  };
}
