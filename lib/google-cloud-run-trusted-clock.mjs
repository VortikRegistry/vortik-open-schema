import { sha256CanonicalDigest } from "./trusted-verification-crypto.mjs";

const MODULE_NOW = Date.now.bind(Date);

export const GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY = Object.freeze({
  policy: "vortik-trusted-issuance-clock-policy",
  policy_version: "1.0.0",
  policy_id: "vortik-google-cloud-run-system-clock-v1",
  deployment_runtime: "google-cloud-run",
  time_basis: "unix-epoch-seconds",
  wall_clock_source: "runtime-system-clock",
  google_managed_time_sync_expected: true,
  request_controlled: false,
  monotonic_instance_guard: true,
  external_time_attestation: false
});

export const GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST = sha256CanonicalDigest(
  GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY
);

const TEST_CLOCK_POLICY = Object.freeze({
  policy: "vortik-test-clock-policy",
  policy_version: "1.0.0",
  policy_id: "vortik-test-only-clock-v1",
  production_trust: false,
  request_controlled: true
});
const TEST_CLOCK_POLICY_DIGEST = sha256CanonicalDigest(TEST_CLOCK_POLICY);

function createBoundClock({ readWallClockMilliseconds, source_id, policy_id, policy_digest }) {
  let lastUnixSeconds = -1;
  return Object.freeze({
    source_id,
    policy_id,
    policy_digest,
    async readTrustedTime() {
      const milliseconds = readWallClockMilliseconds();
      if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
        throw new Error("trusted runtime clock returned an invalid Unix-millisecond value");
      }
      const unixSeconds = Math.floor(milliseconds / 1000);
      if (!Number.isSafeInteger(unixSeconds) || unixSeconds < 0) {
        throw new Error("trusted runtime clock returned an invalid Unix-seconds value");
      }
      if (unixSeconds < lastUnixSeconds) {
        throw new Error("trusted runtime clock detected wall-clock rollback within this runtime instance");
      }
      lastUnixSeconds = unixSeconds;
      return unixSeconds;
    }
  });
}

export function createGoogleCloudRunTrustedClock() {
  return createBoundClock({
    readWallClockMilliseconds: MODULE_NOW,
    source_id: "google-cloud-run-system-clock",
    policy_id: GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY.policy_id,
    policy_digest: GOOGLE_CLOUD_RUN_TRUSTED_CLOCK_POLICY_DIGEST
  });
}

export function createTestOnlyRuntimeClock({ nowImpl }) {
  if (typeof nowImpl !== "function") throw new TypeError("test-only runtime clock requires nowImpl()");
  return createBoundClock({
    readWallClockMilliseconds: nowImpl,
    source_id: "test-only-runtime-clock",
    policy_id: TEST_CLOCK_POLICY.policy_id,
    policy_digest: TEST_CLOCK_POLICY_DIGEST
  });
}
