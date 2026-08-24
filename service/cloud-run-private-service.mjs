import { createServer } from "node:http";

import { createCloudRunPreactivationHttpHandler } from "../lib/cloud-run-private-http.mjs";
import { createGoogleCloudRunProductionReceiptRuntime } from "../lib/google-cloud-run-receipt-runtime.mjs";

function resolvePort(rawPort) {
  const value = rawPort ?? "8080";
  if (!/^[1-9][0-9]{0,4}$/.test(value)) throw new Error("PORT must be a decimal TCP port");
  const port = Number(value);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error("PORT is outside TCP port range");
  return port;
}

export function createCloudRunPreactivationServer({ runtimeIdentity }) {
  const handler = createCloudRunPreactivationHttpHandler({ runtimeIdentity });
  return createServer(handler);
}

export function startGoogleCloudRunPreactivationService({ port = resolvePort(process.env.PORT) } = {}) {
  const runtime = createGoogleCloudRunProductionReceiptRuntime();
  const server = createCloudRunPreactivationServer({ runtimeIdentity: runtime.identity });

  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.keepAliveTimeout = 5_000;

  server.listen(port, "0.0.0.0", () => {
    process.stdout.write(`Vortik preactivation Cloud Run service listening on ${port}\n`);
  });

  const shutdown = () => {
    server.close((error) => {
      if (error) {
        process.stderr.write(`Cloud Run service shutdown failed: ${error.message}\n`);
        process.exitCode = 1;
      }
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startGoogleCloudRunPreactivationService();
}
