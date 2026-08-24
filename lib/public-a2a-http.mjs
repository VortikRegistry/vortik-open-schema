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

const PROBLEM_HEADERS = Object.freeze({
  "content-type": "application/problem+json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
});

function writeJson(response, statusCode, payload, extraHeaders = {}) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    ...JSON_HEADERS,
    ...extraHeaders,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function writeProblem(response, statusCode, code, title) {
  const payload = Object.freeze({
    type: `urn:vortik:a2a:error:${code}`,
    title,
    status: statusCode,
    code
  });
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    ...PROBLEM_HEADERS,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function stableEtag(payload) {
  const body = JSON.stringify(payload);
  return `"sha256-${createHash("sha256").update(body).digest("base64url")}"`;
}

function assertA2AVersion(request) {
  const version = request.headers["a2a-version"];
  if (version !== undefined && version !== A2A_PROTOCOL_VERSION) {
    throw Object.assign(new Error("unsupported A2A version"), { code: "unsupported_version" });
  }
  if (request.headers["a2a-extensions"] !== undefined) {
    throw Object.assign(new Error("A2A extensions are not supported"), { code: "unsupported_extension" });
  }
}

function assertJsonContentType(request) {
  const contentType = request.headers["content-type"] ?? "";
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json" && mediaType !== "application/a2a+json") {
    throw Object.assign(new Error("unsupported media type"), { code: "unsupported_media_type" });
  }
}

async function readBoundedJson(request, maxBodyBytes) {
  const declaredLength = request.headers["content-length"];
  if (declaredLength !== undefined) {
    if (!/^(?:0|[1-9][0-9]*)$/.test(declaredLength)) {
      throw Object.assign(new Error("invalid content length"), { code: "invalid_request" });
    }
    if (Number(declaredLength) > maxBodyBytes) {
      throw Object.assign(new Error("request body too large"), { code: "payload_too_large" });
    }
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += bytes.byteLength;
    if (total > maxBodyBytes) {
      throw Object.assign(new Error("request body too large"), { code: "payload_too_large" });
    }
    chunks.push(bytes);
  }
  if (total === 0) throw Object.assign(new Error("empty body"), { code: "invalid_request" });

  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
  } catch {
    throw Object.assign(new Error("invalid utf8"), { code: "invalid_request" });
  }
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error("invalid json"), { code: "invalid_json" });
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

function mapRequestError(error) {
  switch (error?.code) {
    case "payload_too_large": return [413, "payload_too_large", "Request body exceeds the beacon limit"];
    case "unsupported_media_type": return [415, "unsupported_media_type", "Only JSON A2A messages are accepted"];
    case "unsupported_version": return [400, "unsupported_version", "Unsupported A2A protocol version"];
    case "unsupported_extension": return [400, "unsupported_extension", "A2A extensions are not enabled"];
    case "invalid_json": return [400, "invalid_json", "Request body is not valid JSON"];
    default: return [400, "invalid_request", "Request does not match the bounded discovery contract"];
  }
}

function parseTarget(request) {
  try {
    return new URL(request.url ?? "/", "http://vortik-a2a.internal");
  } catch {
    return null;
  }
}

function unsupportedOperation(response) {
  writeProblem(response, 501, "unsupported_operation", "This A2A operation is not enabled by the read-only beacon");
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
      writeProblem(response, 400, "invalid_request_target", "Invalid request target");
      return;
    }

    if (url.pathname === "/health") {
      if (request.method !== "GET" || url.search || url.hash) {
        writeProblem(response, request.method === "GET" ? 400 : 405, "invalid_health_request", "Health endpoint accepts only plain GET requests");
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
        writeProblem(response, request.method === "GET" ? 400 : 405, "invalid_agent_card_request", "Agent Card endpoint accepts only plain GET requests");
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
      writeProblem(response, 404, "not_found", "Route not found");
      return;
    }

    try {
      assertA2AVersion(request);
    } catch (error) {
      const [status, code, title] = mapRequestError(error);
      writeProblem(response, status, code, title);
      return;
    }

    if (url.pathname === "/a2a/v1/message:send") {
      if (request.method !== "POST" || url.search || url.hash) {
        writeProblem(response, request.method === "POST" ? 400 : 405, "invalid_send_request", "SendMessage accepts only plain POST requests");
        return;
      }
      if (!budget.consume()) {
        writeProblem(response, 429, "request_budget_exhausted", "Beacon request budget is exhausted");
        return;
      }
      try {
        assertJsonContentType(request);
        const payload = await readBoundedJson(request, maxBodyBytes);
        writeJson(response, 200, beacon.sendMessage(payload), {
          "cache-control": "no-store",
          "a2a-version": A2A_PROTOCOL_VERSION
        });
      } catch (error) {
        const [status, code, title] = mapRequestError(error);
        writeProblem(response, status, code, title);
      }
      return;
    }

    if (url.pathname === "/a2a/v1/message:stream" ||
        url.pathname.endsWith(":subscribe") ||
        url.pathname.includes("pushNotification") ||
        url.pathname === "/a2a/v1/extendedAgentCard") {
      unsupportedOperation(response);
      return;
    }

    if (url.pathname === "/a2a/v1/tasks") {
      if (request.method !== "GET") {
        writeProblem(response, 405, "method_not_allowed", "Task listing accepts only GET");
        return;
      }
      if (url.hash) {
        writeProblem(response, 400, "invalid_task_list_request", "Task list request is invalid");
        return;
      }
      const allowed = new Set(["pageSize", "pageToken"]);
      if ([...url.searchParams.keys()].some((key) => !allowed.has(key))) {
        writeProblem(response, 400, "invalid_task_list_request", "Task list query contains unsupported fields");
        return;
      }
      const rawPageSize = url.searchParams.get("pageSize") ?? "50";
      if (!/^[1-9][0-9]{0,2}$/.test(rawPageSize) || Number(rawPageSize) > 100) {
        writeProblem(response, 400, "invalid_task_list_request", "pageSize must be between 1 and 100");
        return;
      }
      if (url.searchParams.get("pageToken")) {
        writeProblem(response, 400, "invalid_task_list_request", "The stateless beacon does not issue page tokens");
        return;
      }
      writeJson(response, 200, {
        tasks: [],
        nextPageToken: "",
        pageSize: Number(rawPageSize),
        totalSize: 0
      }, { "cache-control": "no-store", "a2a-version": A2A_PROTOCOL_VERSION });
      return;
    }

    const taskMatch = /^\/a2a\/v1\/tasks\/([A-Za-z0-9._:-]{1,128})(:cancel)?$/.exec(url.pathname);
    if (taskMatch) {
      if (url.search || url.hash) {
        writeProblem(response, 400, "invalid_task_request", "Task request target is invalid");
        return;
      }
      if ((!taskMatch[2] && request.method !== "GET") || (taskMatch[2] === ":cancel" && request.method !== "POST")) {
        writeProblem(response, 405, "method_not_allowed", "Task operation uses the wrong method");
        return;
      }
      writeProblem(response, 404, "task_not_found", "The stateless discovery beacon retains no tasks");
      return;
    }

    writeProblem(response, 404, "not_found", "A2A route not found");
  };
}
