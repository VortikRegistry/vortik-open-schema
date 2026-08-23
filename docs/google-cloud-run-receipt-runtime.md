# Google Cloud Run trusted receipt runtime

## Status

This runtime assembly is a pre-activation infrastructure component. Its presence does not activate trusted receipt issuance or candidate admission.

Canonical state remains:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

## Purpose

`lib/google-cloud-run-receipt-runtime.mjs` assembles the existing trusted-verification components into one protected Google Cloud Run deployment boundary:

1. bounded GitHub primary-source verifier;
2. bounded dual-provider ENS mainnet verifier;
3. pinned Google Cloud KMS Ed25519 signer;
4. pinned public verification key policy;
5. non-injectable Google Cloud Run system-clock adapter; and
6. trusted receipt issuer core.

The returned production runtime exposes only the two receipt-issuance methods plus non-secret runtime identity metadata. It does not expose the signer, trusted clock, OAuth token provider, key policy object or other protected construction dependencies.

## Exact production profile

The runtime is pinned to:

```text
project = vortik-registry-production
region = southamerica-east1
service account = vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com
CryptoKeyVersion = projects/vortik-registry-production/locations/southamerica-east1/keyRings/vortik-trust/cryptoKeys/vortik-receipt-ed25519/cryptoKeyVersions/1
key_id = gcp-kms-vortik-receipt-ed25519-v1
key policy = vortik-prod-receipt-signing-v1
key policy digest = sha256:b7482b8150cd3775aa8c1790c920e7cc2cc4a87397a4736f2b8846affc9884c1
expected protection level = SOFTWARE
network request timeout = 10000 ms
```

## Immutable verifier identity

Receipt verifier identities are not supplied by deployment configuration.

The runtime pins each verifier to the reviewed commit where its current implementation was introduced, and also recomputes the Git blob SHA-1 of the verifier source bytes at runtime construction. Construction fails if the deployed bytes no longer match that reviewed implementation.

```text
primary-source verifier commit = fce2f64681cd3fae4252c373fd90c2b246a63172
primary-source verifier blob = 6a3bb6d4aa0e84ab3718ad974c0213637b64e6b7

ENS mainnet verifier commit = 0da1897130e64546ec693d631d60b071fcd9082f
ENS mainnet verifier blob = 97ad302a793a65666ba55b78bd2251da0bedfe71
```

Those blob identities were revalidated against the referenced GitHub commits before the binding was added. A caller cannot replace the receipt `code_commit` with a merely well-shaped hash.

The immutable container/revision identity remains separate deployment provenance and must still be recorded during the real Cloud Run deployment gate.

## ENS provider boundary

Deployment requires exactly two protected ENS RPC provider definitions with distinct provider identities and distinct network authorities. The underlying ENS verifier retains its existing requirements: HTTPS, Ethereum mainnet, shared finalized-block evidence, EIP-1898 hash-bound reads and exact ENS Registry/Base Registrar checks.

RPC endpoint selection is deployment configuration, not contributor/request input. Provider selection must be completed before the real end-to-end activation test.

## Trusted issuance clock

`lib/google-cloud-run-trusted-clock.mjs` defines the production Cloud Run clock policy:

```text
policy_id = vortik-google-cloud-run-system-clock-v1
source_id = google-cloud-run-system-clock
time basis = Unix epoch seconds
wall-clock source = runtime system clock
request controlled = false
instance-local rollback guard = true
external time attestation = false
```

The production clock has no `nowImpl` parameter. Its wall-clock function is captured from `Date.now` when the module is initialized; the production runtime also rejects `nowImpl` and `trustedClock` substitution fields.

A separate explicitly test-only clock helper accepts injected samples but uses a different source ID, policy ID and policy digest and therefore never receives the production clock trust identity.

The production adapter converts integer Unix milliseconds to Unix seconds, rejects malformed values and fails closed if time moves backwards within the same runtime instance.

This policy deliberately does not claim cryptographic external time attestation. The production deployment gate must verify that the code is actually running in the intended Google-managed Cloud Run environment before `trusted_receipt_issuance` can become true.

Google documents its compute infrastructure as using synchronized system clocks and recommends Google-managed time synchronization for workloads that depend on stable time. The Vortik policy remains narrower: it records only the runtime wall clock and the fact that it is not request-controlled.

## Identity and secret handling

The production assembly expects Cloud Run service identity / metadata credentials for KMS access. It does not require or accept a service-account JSON key as repository material.

No private key, bearer token or provider credential belongs in this public repository.

The production runtime rejects direct substitutions for `codeCommit`, `nowImpl`, `trustedClock`, `signer` and `keyPolicy`.

## Remaining deployment gate

After this code is merged, production activation is still blocked until the infrastructure exists and is independently exercised:

1. build an immutable container from an exact reviewed `main` commit and record its image digest/revision provenance;
2. deploy it to a private Cloud Run service using the intended service account;
3. configure exactly two approved ENS RPC authorities without publishing credentials;
4. confirm the runtime obtains short-lived Google credentials rather than a static service-account key;
5. confirm only the intended identity can call KMS CryptoKeyVersion `1` for signing;
6. execute a real primary-source and ENS receipt path through the deployed runtime;
7. independently verify the returned Ed25519 signatures against the pinned public policy; and
8. re-run CI and exact-head Codex review for any deployment-support code changes.

Only after those checks pass may a separate, explicit activation change consider `trusted_receipt_issuance = true`.

Candidate admission remains a later, independent gate even after receipt issuance is activated.
