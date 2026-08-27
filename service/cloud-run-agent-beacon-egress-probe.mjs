import { connect as connectTcp } from "node:net";
import { resolveTxt as resolveTxtDns } from "node:dns/promises";

const DIRECT_VPC_READINESS = Object.freeze({
  id: "direct_vpc_private_dns",
  protocol: "dns_txt",
  hostname: "ready.beacon-readiness.vortik.internal",
  expected_value: "vortik-agent-beacon-vpc-ready-v1"
});

const EXTERNAL_HTTPS_DESTINATION = Object.freeze({
  id: "external_https",
  protocol: "https",
  url: "https://example.com/"
});

const PRIVATE_TCP_DESTINATION = Object.freeze({
  id: "private_rfc1918",
  protocol: "tcp",
  host: "10.255.255.1",
  port: 443
});

const FIXED_DESTINATIONS = Object.freeze([
  EXTERNAL_HTTPS_DESTINATION,
  PRIVATE_TCP_DESTINATION
]);

const DEFAULT_TIMEOUT_MS = 3_000;
const NETWORK_SETTLE_MS = 180_000;
const INACCESSIBLE_NETWORK_CODES = new Set([
  "EACCES",
  "EPERM",
  "EHOSTDOWN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT"
]);
const REACHABLE_NETWORK_CODES = new Set(["ECONNREFUSED", "ECONNRESET"]);

function assertTimeoutMs(timeoutMs) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 10_000) {
    throw new TypeError("outbound-denial probe timeout must be an integer from 1 to 10000 milliseconds");
  }
}

function waitForNetworkSettle(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function assertDirectVpcReady({ resolveTxtImpl, timeoutMs }) {
  const deadlineError = new Error("outbound-denial probe Direct VPC readiness deadline elapsed");
  let timeoutId;
  const deadline = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(deadlineError), timeoutMs);
  });

  try {
    const records = await Promise.race([
      resolveTxtImpl(DIRECT_VPC_READINESS.hostname),
      deadline
    ]);
    if (
      !Array.isArray(records)
      || records.length !== 1
      || !Array.isArray(records[0])
      || records[0].length !== 1
      || records[0][0] !== DIRECT_VPC_READINESS.expected_value
    ) {
      throw new Error("outbound-denial probe Direct VPC readiness response mismatch");
    }
  } catch {
    throw new Error("outbound-denial probe Direct VPC readiness was indeterminate");
  } finally {
    clearTimeout(timeoutId);
  }
}

function resultFor(destination, outcome) {
  return Object.freeze({ destination: destination.id, outcome });
}

function networkErrorCode(error) {
  return error?.cause?.code ?? error?.code;
}

async function attemptFixedExternalHttps({ fetchImpl, timeoutMs }) {
  const destination = EXTERNAL_HTTPS_DESTINATION;
  const controller = new AbortController();
  const deadlineError = new Error("outbound-denial probe destination deadline elapsed");
  let timeoutId;
  const deadline = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(deadlineError);
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
    return resultFor(destination, "reachable");
  } catch (error) {
    if (error === deadlineError || error?.name === "AbortError") {
      return resultFor(destination, "inaccessible");
    }
    const code = networkErrorCode(error);
    if (INACCESSIBLE_NETWORK_CODES.has(code)) {
      return resultFor(destination, "inaccessible");
    }
    if (REACHABLE_NETWORK_CODES.has(code)) {
      return resultFor(destination, "reachable");
    }
    if (error?.message === "outbound-denial probe received an invalid HTTP response") {
      throw error;
    }
    throw new Error("outbound-denial probe external HTTPS result was indeterminate");
  } finally {
    clearTimeout(timeoutId);
    controller.abort();
  }
}

function attemptFixedPrivateTcp({ connectImpl, timeoutMs }) {
  const destination = PRIVATE_TCP_DESTINATION;
  return new Promise((resolve, reject) => {
    let settled = false;
    let socket;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      socket?.removeListener?.("connect", onConnect);
      socket?.removeListener?.("error", onError);
      try {
        socket?.once?.("error", () => {});
        socket?.destroy?.();
      } catch {
        // Completion does not depend on cooperative socket cleanup.
      }
      callback(value);
    };

    const onConnect = () => finish(resolve, resultFor(destination, "reachable"));
    const onError = (error) => {
      const code = networkErrorCode(error);
      if (INACCESSIBLE_NETWORK_CODES.has(code)) {
        finish(resolve, resultFor(destination, "inaccessible"));
        return;
      }
      if (REACHABLE_NETWORK_CODES.has(code)) {
        finish(resolve, resultFor(destination, "reachable"));
        return;
      }
      finish(reject, new Error("outbound-denial probe private TCP result was indeterminate"));
    };

    const timeoutId = setTimeout(() => {
      finish(resolve, resultFor(destination, "inaccessible"));
    }, timeoutMs);

    try {
      socket = connectImpl({ host: destination.host, port: destination.port });
      if (!socket || typeof socket.once !== "function") {
        finish(reject, new Error("outbound-denial probe received an invalid TCP socket"));
        return;
      }
      socket.once("connect", onConnect);
      socket.once("error", onError);
    } catch {
      finish(reject, new Error("outbound-denial probe private TCP setup failed"));
    }
  });
}

export const CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE = Object.freeze({
  probe_id: "vortik-cloud-run-agent-beacon-egress-denial-v1",
  direct_vpc_readiness: DIRECT_VPC_READINESS,
  destinations: FIXED_DESTINATIONS,
  network_settle_ms: NETWORK_SETTLE_MS,
  readiness_attempts: 1,
  timeout_ms: DEFAULT_TIMEOUT_MS,
  attempts_per_destination: 1,
  retries: 0,
  secrets_required: false,
  kms_required: false,
  persistent_state: false
});

export async function runCloudRunAgentBeaconEgressProbe({
  fetchImpl = globalThis.fetch,
  privateConnectImpl = connectTcp,
  networkSettleWaitImpl = waitForNetworkSettle,
  readinessResolveTxtImpl = resolveTxtDns,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new TypeError("outbound-denial probe requires fetch()");
  }
  if (typeof privateConnectImpl !== "function") {
    throw new TypeError("outbound-denial probe requires a TCP connect implementation");
  }
  if (typeof networkSettleWaitImpl !== "function") {
    throw new TypeError("outbound-denial probe requires a network-settle wait implementation");
  }
  if (typeof readinessResolveTxtImpl !== "function") {
    throw new TypeError("outbound-denial probe requires a Direct VPC readiness resolver");
  }
  assertTimeoutMs(timeoutMs);

  try {
    await networkSettleWaitImpl(NETWORK_SETTLE_MS);
  } catch {
    throw new Error("outbound-denial probe network-settle phase failed");
  }

  await assertDirectVpcReady({
    resolveTxtImpl: readinessResolveTxtImpl,
    timeoutMs
  });

  const results = await Promise.all([
    attemptFixedExternalHttps({ fetchImpl, timeoutMs }),
    attemptFixedPrivateTcp({ connectImpl: privateConnectImpl, timeoutMs })
  ]);

  const reachable = results.find((result) => result.outcome === "reachable");
  if (reachable) {
    throw new Error(`outbound-denial probe failed: ${reachable.destination} was reachable`);
  }

  return Object.freeze({
    probe_id: CLOUD_RUN_AGENT_BEACON_EGRESS_PROBE_PROFILE.probe_id,
    status: "PASS",
    network_settle_ms: NETWORK_SETTLE_MS,
    direct_vpc_readiness: Object.freeze({
      id: DIRECT_VPC_READINESS.id,
      outcome: "ready"
    }),
    readiness_attempts: 1,
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
