import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE,
  runCloudRunAgentBeaconEgressProbe,
  runCloudRunAgentBeaconEgressProbeCli
} from "../service/cloud-run-agent-beacon-egress-probe.mjs";

function networkError(code) {
  return Object.assign(new Error(code), { code });
}

function blockedFetch() {
  return async () => {
    throw networkError("ETIMEDOUT");
  };
}

function eventSocket(event, error) {
  const socket = new EventEmitter();
  socket.destroy = () => {};
  queueMicrotask(() => socket.emit(event, error));
  return socket;
}

function blockedPrivateConnect() {
  return () => eventSocket("error", networkError("ETIMEDOUT"));
}

function captureStream() {
  let output = "";
  return {
    stream: { write: (chunk) => { output += chunk; } },
    read: () => output
  };
}

function runProbe(options = {}) {
  return runCloudRunAgentBeaconEgressProbe({
    networkSettleWaitImpl: async () => {},
    readinessResolver: {
      resolveTxt: async () => [["vortik-agent-beacon-vpc-ready-v1"]],
      cancel: () => {}
    },
    ...options
  });
}

test("egress probe profile fixes HTTPS and private TCP destinations with no retries, secrets or KMS", () => {
  assert.deepEqual(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.direct_vpc_readiness, {
    id: "direct_vpc_private_dns",
    protocol: "dns_txt",
    hostname: "ready.beacon-readiness.vortik.internal",
    expected_value: "vortik-agent-beacon-vpc-ready-v1"
  });
  assert.deepEqual(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.destinations, [
    { id: "external_https", protocol: "https", url: "https://example.com/" },
    { id: "private_rfc1918", protocol: "tcp", host: "10.255.255.1", port: 443 }
  ]);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.network_settle_ms, 180_000);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.readiness_attempts, 1);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.attempts_per_destination, 1);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.retries, 0);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.secrets_required, false);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.kms_required, false);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.persistent_state, false);
});

test("PASS requires the fixed HTTPS and private TCP destinations to be inaccessible", async () => {
  const httpsCalls = [];
  const tcpCalls = [];
  const result = await runProbe({
    fetchImpl: async (url, options) => {
      httpsCalls.push({ url, options });
      throw networkError("ETIMEDOUT");
    },
    privateConnectImpl: (options) => {
      tcpCalls.push(options);
      return eventSocket("error", networkError("ENETUNREACH"));
    },
    timeoutMs: 100
  });

  assert.deepEqual(httpsCalls.map(({ url }) => url), ["https://example.com/"]);
  assert.equal(httpsCalls[0].options.method, "HEAD");
  assert.equal(httpsCalls[0].options.redirect, "manual");
  assert.ok(httpsCalls[0].options.signal instanceof AbortSignal);
  assert.deepEqual(tcpCalls, [{ host: "10.255.255.1", port: 443 }]);
  assert.deepEqual(result, {
    probe_id: "vortik-cloud-run-agent-beacon-egress-denial-v1",
    status: "PASS",
    network_settle_ms: 180_000,
    direct_vpc_readiness: {
      id: "direct_vpc_private_dns",
      outcome: "ready"
    },
    readiness_attempts: 1,
    attempts_per_destination: 1,
    retries: 0,
    results: [
      { destination: "external_https", outcome: "inaccessible" },
      { destination: "private_rfc1918", outcome: "inaccessible" }
    ]
  });
});

test("the one-shot transports start only after the fixed network-settle phase", async () => {
  let releaseSettle;
  const settleGate = new Promise((resolve) => { releaseSettle = resolve; });
  const events = [];

  const execution = runCloudRunAgentBeaconEgressProbe({
    networkSettleWaitImpl: async (delayMs) => {
      events.push(`settle:${delayMs}`);
      await settleGate;
    },
    readinessResolver: {
      resolveTxt: async (hostname) => {
        events.push(`dns:${hostname}`);
        return [["vortik-agent-beacon-vpc-ready-v1"]];
      },
      cancel: () => {}
    },
    fetchImpl: async () => {
      events.push("https");
      throw networkError("ETIMEDOUT");
    },
    privateConnectImpl: () => {
      events.push("tcp");
      return eventSocket("error", networkError("ETIMEDOUT"));
    },
    timeoutMs: 100
  });

  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(events, ["settle:180000"]);

  releaseSettle();
  const result = await execution;
  assert.deepEqual(events, [
    "settle:180000",
    "dns:ready.beacon-readiness.vortik.internal",
    "https",
    "tcp"
  ]);
  assert.equal(result.status, "PASS");
});

test("a failed network-settle phase fails closed without any destination attempt", async () => {
  let attempts = 0;
  await assert.rejects(
    runCloudRunAgentBeaconEgressProbe({
      networkSettleWaitImpl: async () => { throw new Error("variable platform detail"); },
      fetchImpl: async () => { attempts += 1; },
      privateConnectImpl: () => { attempts += 1; },
      timeoutMs: 100
    }),
    /network-settle phase failed/
  );
  assert.equal(attempts, 0);
});

test("missing, mismatched or failed private DNS readiness blocks destination attempts", async () => {
  for (const resolveTxt of [
    async () => [],
    async () => [["wrong-network"]],
    async () => { throw networkError("ENOTFOUND"); }
  ]) {
    let attempts = 0;
    await assert.rejects(
      runCloudRunAgentBeaconEgressProbe({
        networkSettleWaitImpl: async () => {},
        readinessResolver: { resolveTxt, cancel: () => {} },
        fetchImpl: async () => { attempts += 1; },
        privateConnectImpl: () => { attempts += 1; },
        timeoutMs: 100
      }),
      /Direct VPC readiness was indeterminate/
    );
    assert.equal(attempts, 0);
  }
});

test("the private DNS readiness deadline cancels a live resolver handle", { timeout: 250 }, async () => {
  let destinationAttempts = 0;
  let pendingTimer;
  let cancelCalls = 0;
  await assert.rejects(
    runCloudRunAgentBeaconEgressProbe({
      networkSettleWaitImpl: async () => {},
      readinessResolver: {
        resolveTxt: async () => new Promise((resolve) => {
          pendingTimer = setTimeout(
            () => resolve([["vortik-agent-beacon-vpc-ready-v1"]]),
            1_000
          );
        }),
        cancel: () => {
          cancelCalls += 1;
          clearTimeout(pendingTimer);
        }
      },
      fetchImpl: async () => { destinationAttempts += 1; },
      privateConnectImpl: () => { destinationAttempts += 1; },
      timeoutMs: 5
    }),
    /Direct VPC readiness was indeterminate/
  );
  assert.equal(cancelCalls, 1);
  assert.equal(destinationAttempts, 0);
});

test("hard deadlines bound HTTPS and TCP transports that never settle", { timeout: 250 }, async () => {
  let httpsAttempts = 0;
  let tcpAttempts = 0;
  const result = await runProbe({
    fetchImpl: async () => {
      httpsAttempts += 1;
      await new Promise(() => {});
    },
    privateConnectImpl: () => {
      tcpAttempts += 1;
      const socket = new EventEmitter();
      socket.destroy = () => {};
      return socket;
    },
    timeoutMs: 5
  });

  assert.equal(httpsAttempts, 1);
  assert.equal(tcpAttempts, 1);
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.results.map(({ outcome }) => outcome), ["inaccessible", "inaccessible"]);
});

test("an HTTPS response fails without waiting for body cancellation", { timeout: 250 }, async () => {
  await assert.rejects(
    runProbe({
      fetchImpl: async () => ({
        status: 200,
        body: { cancel: async () => new Promise(() => {}) }
      }),
      privateConnectImpl: blockedPrivateConnect(),
      timeoutMs: 100
    }),
    /external_https was reachable/
  );
});

test("any external HTTP response, including an error response, rejects PASS", async () => {
  await assert.rejects(
    runProbe({
      fetchImpl: async () => new Response(null, { status: 503 }),
      privateConnectImpl: blockedPrivateConnect(),
      timeoutMs: 100
    }),
    /external_https was reachable/
  );
});

test("private TCP connect and refusal both prove reachability below TLS", async () => {
  for (const privateConnectImpl of [
    () => eventSocket("connect"),
    () => eventSocket("error", networkError("ECONNREFUSED"))
  ]) {
    await assert.rejects(
      runProbe({
        fetchImpl: blockedFetch(),
        privateConnectImpl,
        timeoutMs: 100
      }),
      /private_rfc1918 was reachable/
    );
  }
});

test("TLS and unknown private errors fail closed as indeterminate", async () => {
  const tlsError = Object.assign(new TypeError("fetch failed"), {
    cause: networkError("CERT_HAS_EXPIRED")
  });
  await assert.rejects(
    runProbe({
      fetchImpl: async () => { throw tlsError; },
      privateConnectImpl: blockedPrivateConnect(),
      timeoutMs: 100
    }),
    /external HTTPS result was indeterminate/
  );

  await assert.rejects(
    runProbe({
      fetchImpl: blockedFetch(),
      privateConnectImpl: () => eventSocket("error", networkError("UNKNOWN")),
      timeoutMs: 100
    }),
    /private TCP result was indeterminate/
  );
});

test("invalid transport responses fail closed instead of being counted as denial", async () => {
  await assert.rejects(
    runProbe({
      fetchImpl: async () => ({}),
      privateConnectImpl: blockedPrivateConnect(),
      timeoutMs: 100
    }),
    /invalid HTTP response/
  );
  await assert.rejects(
    runProbe({
      fetchImpl: blockedFetch(),
      privateConnectImpl: () => ({}),
      timeoutMs: 100
    }),
    /invalid TCP socket/
  );
});

test("CLI output and process exit result are deterministic", async () => {
  const passOut = captureStream();
  const passErr = captureStream();
  const passResult = Object.freeze({ probe_id: "fixed", status: "PASS" });
  const passCode = await runCloudRunAgentBeaconEgressProbeCli({
    runProbe: async () => passResult,
    stdout: passOut.stream,
    stderr: passErr.stream
  });
  assert.equal(passCode, 0);
  assert.equal(passOut.read(), '{"probe_id":"fixed","status":"PASS"}\n');
  assert.equal(passErr.read(), "");

  const failOut = captureStream();
  const failErr = captureStream();
  const failCode = await runCloudRunAgentBeaconEgressProbeCli({
    runProbe: async () => { throw new Error("variable internal detail"); },
    stdout: failOut.stream,
    stderr: failErr.stream
  });
  assert.equal(failCode, 1);
  assert.equal(failOut.read(), "");
  assert.equal(failErr.read(), "Vortik agent beacon outbound-denial probe failed\n");
});
