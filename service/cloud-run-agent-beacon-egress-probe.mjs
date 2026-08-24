const FIXED_DESTINATIONS = Object.freeze([
  Object.freeze({
    id: "external_https",
    url: "https://example.com/"
  }),
  Object.freeze({
    id: "private_rfc1918",
    url: "https://10.255.255.1/"
  })
]);

const DEFAULT_TIMEOUT_MS = 3_000;

function assertTimeoutMs(timeoutMs) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new TypeError("outbound-denial probe timeout must be an integer from 1 to 10000 milliseconds");
  }
}

async function attemptFixedDestination({ destination, fetchImpl, timeoutMs }) {
  const controller = new AbortController();
  let timeoutId;
  const deadline = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("outbound-denial probe destination deadline elapsed"));
    }, timeoutMs);
  });
  try {
    const response = await Promise.race([
      fetchImpl(destination.url, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal
      }),
      deadline
    ]);
    if (!response || typeof response.status !== "number") {
      throw new Error("outbound-denial probe received an invalid HTTP response");
    }
    try {
      void Promise.resolve(response.body?.cancel?.()).catch(() => {});
    } catch {
      // The received HTTP response already proves reachability.
    }
    return Object.freeze({ destination: destination.id, outcome: "reachable" });
  } catch (error) {
    if (error?.message === "outbound-denial probe received an invalid HTTP response") {
      throw error;
    }
    return Object.freeze({ destination: destination.id, outcome: "inaccessible" });
  } finally {
    clearTimeout(timeoutId);
    controller.abort();
  }
}

export const CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE = Object.freeze({
  probe_id: "vortik-cloud-run-agent-beacon-egress-denial-v1",
  destinations: Object.freeze(FIXED_DESTINATIONS.map(({ id, url }) => Object.freeze({ id, url }))),
  timeout_ms: DEFAULT_TIMEOUT_MS,
  attempts_per_destination: 1,
  retries: 0,
  secrets_required: false,
  kms_required: false,
  persistent_state: false
});

export async function runCloudRunAgentBeaconEgressProbe({
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("outbound-denial probe requires fetch()");
  }
  assertTimeoutMs(timeoutMs);

  const results = await Promise.all(FIXED_DESTINATIONS.map((destination) =>
    attemptFixedDestination({ destination, fetchImpl, timeoutMs })
  ));

  const reachable = results.find((result) => result.outcome === "reachable");
  if (reachable) {
    throw new Error(`outbound-denial probe failed: ${reachable.destination} was reachable`);
  }

  return Object.freeze({
    probe_id: CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.probe_id,
    status: "PASS",
    attempts_per_destination: 1,
    retries: 0,
    results: Object.freeze(results)
  });
}

export async function runCloudRunAgentBeaconEgressProbeCli({
  runProbe = runCloudRunAgentBeaconEgressProbe,
  stdout = process.stdout,
  stderr = process.stderr
} = {}) {
  try {
    const result = await runProbe();
    stdout.write(`${JSON.stringify(result)}\n`);
    return 0;
  } catch {
    stderr.write("Vortik agent beacon outbound-denial probe failed\n");
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await runCloudRunAgentBeaconEgressProbeCli();
}
