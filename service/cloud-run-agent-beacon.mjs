import { createServer } from "node:http";

import {
  createFixedWindowBudget,
  createPublicA2AHttpHandler
} from "../lib/public-a2a-http.mjs";

function resolvePort(rawPort) {
  const value = rawPort ?? "8080";
  if (!/^[1-9][0-9]{0,4}$/.test(value)) throw new Error("PORT must be a decimal TCP port");
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error("PORT is outside TCP port range");
  return port;
}

function resolveBudgetLimit(rawLimit) {
  const value = rawLimit ?? "60";
  if (!/^[1-9][0-9]{0,3}$/.test(value)) throw new Error("VORTIK_A2A_REQUESTS_PER_MINUTE must be a bounded positive integer");
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 600) throw new Error("VORTIK_A2A_REQUESTS_PER_MINUTE is outside the allowed range");
  return limit;
}

function resolvePublicBaseUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.length === 0) {
    throw new Error("VORTIK_A2A_PUBLIC_BASE_URL is required");
  }
  return rawUrl;
}

function classifyBudgetingPath(request) {
  try {
    const pathname = new URL(request.url ?? "/", "http://vortik-a2a.internal").pathname;
    if (pathname === "/health") return "health";
    if (pathname.startsWith("/a2a/v1")) return "a2a";
    return "wrapper";
  } catch {
    return "wrapper";
  }
}

function writeDiscoveryBudgetExhausted(response) {
  const body = `${JSON.stringify({ error: "request_budget_exhausted" })}\n`;
  response.writeHead(429, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

export function buildInternalA2AErrorPayload() {
  return Object.freeze({
    error: Object.freeze({
      code: 500,
      status: "INTERNAL",
      message: "Internal beacon error"
    })
  });
}

export function createCloudRunAgentBeaconServer({
  publicBaseUrl,
  requestBudgetLimit = 60,
  idFactory
} = {}) {
  const budget = createFixedWindowBudget({ limit: requestBudgetLimit, windowMs: 60_000 });
  const handler = createPublicA2AHttpHandler({ publicBaseUrl, budget, idFactory });
  return createServer((request, response) => {
    const budgetingPath = classifyBudgetingPath(request);
    if (budgetingPath === "wrapper" && !budget.consume()) {
      writeDiscoveryBudgetExhausted(response);
      return;
    }

    Promise.resolve(handler(request, response)).catch(() => {
      if (!response.headersSent) {
        const body = `${JSON.stringify(buildInternalA2AErrorPayload())}\n`;
        response.writeHead(500, {
          "content-type": "application/a2a+json; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "a2a-version": "1.0",
          "content-length": Buffer.byteLength(body)
        });
        response.end(body);
      } else {
        response.destroy();
      }
    });
  });
}

export function startCloudRunAgentBeacon({
  port = resolvePort(process.env.PORT),
  publicBaseUrl = resolvePublicBaseUrl(process.env.VORTIK_A2A_PUBLIC_BASE_URL),
  requestBudgetLimit = resolveBudgetLimit(process.env.VORTIK_A2A_REQUESTS_PER_MINUTE)
} = {}) {
  const server = createCloudRunAgentBeaconServer({ publicBaseUrl, requestBudgetLimit });
  server.requestTimeout = 10_000;
  server.headersTimeout = 5_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 32;
  server.maxRequestsPerSocket = 100;

  server.listen(port, "0.0.0.0", () => {
    process.stdout.write(`Vortik public A2A discovery beacon listening on ${port}\n`);
  });

  const shutdown = () => {
    server.close((error) => {
      if (error) {
        process.stderr.write("A2A beacon shutdown failed\n");
        process.exitCode = 1;
      }
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startCloudRunAgentBeacon();
}
