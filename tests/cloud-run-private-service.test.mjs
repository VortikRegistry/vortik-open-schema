import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";

import {
  GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS,
  createGoogleCloudRunProductionReceiptRuntime
} from "../lib/google-cloud-run-receipt-runtime.mjs";
import { createCloudRunPreactivationServer } from "../service/cloud-run-private-service.mjs";

async function withServer(runtimeIdentity, callback) {
  const server = createCloudRunPreactivationServer({ runtimeIdentity });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("production Cloud Run runtime pins the independently exercised ENS provider pair", () => {
  assert.deepEqual(GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS, [
    {
      provider_id: "ethereum-rpc-publicnode",
      rpc_url: "https://ethereum-rpc.publicnode.com/"
    },
    {
      provider_id: "ethereum-drpc",
      rpc_url: "https://eth.drpc.org/"
    }
  ]);

  const runtime = createGoogleCloudRunProductionReceiptRuntime();
  assert.deepEqual(runtime.identity.ens_providers, GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS);
  assert.equal(runtime.identity.trusted_receipt_issuance, false);
  assert.equal(runtime.identity.admission_enabled, false);
});

test("preactivation HTTP surface exposes only health and non-secret runtime identity", async () => {
  const runtime = createGoogleCloudRunProductionReceiptRuntime();

  await withServer(runtime.identity, async (origin) => {
    const health = await fetch(`${origin}/healthz`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("cache-control"), "no-store");
    assert.equal(health.headers.get("access-control-allow-origin"), null);
    assert.deepEqual(await health.json(), {
      status: "ready",
      trusted_receipt_issuance: false,
      admission_enabled: false
    });

    const identity = await fetch(`${origin}/v1/runtime-identity`);
    assert.equal(identity.status, 200);
    const identityBody = await identity.json();
    assert.equal(identityBody.key_id, "gcp-kms-vortik-receipt-ed25519-v1");
    assert.deepEqual(identityBody.ens_providers, GOOGLE_CLOUD_RUN_PRODUCTION_ENS_PROVIDERS);
    assert.equal(identityBody.trusted_receipt_issuance, false);
    assert.equal(identityBody.admission_enabled, false);
    assert.equal("signer" in identityBody, false);
    assert.equal("accessTokenProvider" in identityBody, false);
  });
});

test("preactivation HTTP surface does not expose receipt issuance", async () => {
  const runtime = createGoogleCloudRunProductionReceiptRuntime();

  await withServer(runtime.identity, async (origin) => {
    const post = await fetch(`${origin}/v1/receipts/ens-mainnet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    assert.equal(post.status, 405);
    assert.deepEqual(await post.json(), { error: "method_not_allowed" });

    const get = await fetch(`${origin}/v1/receipts/ens-mainnet`);
    assert.equal(get.status, 404);
    assert.deepEqual(await get.json(), { error: "not_found" });

    const query = await fetch(`${origin}/healthz?probe=1`);
    assert.equal(query.status, 400);
    assert.deepEqual(await query.json(), { error: "query_or_fragment_not_allowed" });
  });
});

test("preactivation HTTP surface refuses an activated runtime identity", () => {
  assert.throws(
    () => createCloudRunPreactivationServer({
      runtimeIdentity: {
        trusted_receipt_issuance: true,
        admission_enabled: false
      }
    }),
    /trusted_receipt_issuance=false/
  );
  assert.throws(
    () => createCloudRunPreactivationServer({
      runtimeIdentity: {
        trusted_receipt_issuance: false,
        admission_enabled: true
      }
    }),
    /admission_enabled=false/
  );
});
