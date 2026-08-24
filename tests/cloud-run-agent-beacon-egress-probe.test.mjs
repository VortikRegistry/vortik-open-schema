import assert from "node:assert/strict";
import test from "node:test";

import {
  CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE,
  runCloudRunAgentBeaconEgressProbe,
  runCloudRunAgentBeaconEgressProbeCli
} from "../service/cloud-run-agent-beacon-egress-probe.mjs";

function blockedFetch(errorFactory = () => new TypeError("network unavailable")) {
  return async () => {
    throw errorFactory();
  };
}

function captureStream() {
  let output = "";
  return {
    stream: { write: (chunk) => { output += chunk; } },
    read: () => output
  };
}

test("egress probe profile fixes two destinations and has no retries, secrets or KMS", () => {
  assert.deepEqual(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.destinations, [
    { id: "external_https", url: "https://example.com/" },
    { id: "private_rfc1918", url: "https://10.255.255.1/" }
  ]);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.attempts_per_destination, 1);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.retries, 0);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.secrets_required, false);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.kms_required, false);
  assert.equal(CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.persistent_state, false);
});

test("PASS requires both fixed destinations to be inaccessible", async () => {
  const calls = [];
  const result = await runCloudRunAgentBeaconEgressProbe({
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      throw new TypeError("blocked by isolated runtime");
    },
    timeoutMs: 100
  });

  assert.deepEqual(calls.map(({ url }) => url), [
    "https://example.com/",
    "https://10.255.255.1/"
  ]);
  for (const { options } of calls) {
    assert.equal(options.method, "HEAD");
    assert.equal(options.redirect, "manual");
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.deepEqual(result, {
    probe_id: "vortik-cloud-run-agent-beacon-egress-denial-v1",
    status: "PASS",
    attempts_per_destination: 1,
    retries: 0,
    results: [
      { destination: "external_https", outcome: "inaccessible" },
      { destination: "private_rfc1918", outcome: "inaccessible" }
    ]
  });
});

test("a hard deadline bounds a transport that ignores AbortSignal without retry", { timeout: 250 }, async () => {
  let attempts = 0;
  const result = await runCloudRunAgentBeaconEgressProbe({
    fetchImpl: async () => {
      attempts += 1;
      await new Promise(() => {});
    },
    timeoutMs: 5
  });

  assert.equal(attempts, 2);
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.results.map(({ outcome }) => outcome), ["inaccessible", "inaccessible"]);
});

test("an unexpected response fails without waiting for body cancellation", { timeout: 250 }, async () => {
  await assert.rejects(
    runCloudRunAgentBeaconEgressProbe({
      fetchImpl: async (url) => {
        if (url === "https://example.com/") {
          return {
            status: 200,
            body: { cancel: async () => new Promise(() => {}) }
          };
        }
        throw new TypeError("blocked");
      },
      timeoutMs: 100
    }),
    /external_https was reachable/
  );
});

test("any HTTP response, including an error response, rejects PASS", async () => {
  for (const reachableUrl of ["https://example.com/", "https://10.255.255.1/"]) {
    await assert.rejects(
      runCloudRunAgentBeaconEgressProbe({
        fetchImpl: async (url) => {
          if (url === reachableUrl) return new Response(null, { status: 503 });
          throw new TypeError("blocked");
        },
        timeoutMs: 100
      }),
      new RegExp(reachableUrl.includes("example.com") ? "external_https was reachable" : "private_rfc1918 was reachable")
    );
  }
});

test("invalid fetch responses fail closed instead of being counted as denial", async () => {
  await assert.rejects(
    runCloudRunAgentBeaconEgressProbe({ fetchImpl: async () => ({}), timeoutMs: 100 }),
    /invalid HTTP response/
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
    runProbe: blockedFetch(() => new Error("variable internal detail")),
    stdout: failOut.stream,
    stderr: failErr.stream
  });
  assert.equal(failCode, 1);
  assert.equal(failOut.read(), "");
  assert.equal(failErr.read(), "Vortik agent beacon outbound-denial probe failed\n");
});
