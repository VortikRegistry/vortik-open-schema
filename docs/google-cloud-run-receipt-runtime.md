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

The returned runtime contains receipt-issuance methods plus non-secret runtime identity metadata. Protected construction dependencies such as the signer, trusted clock, OAuth token provider and key policy object are not exposed.

The preactivation HTTP service does **not** expose the receipt-issuance methods. It receives only the runtime identity snapshot and serves health/identity inspection while canonical issuance remains disabled.

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

The production wrapper no longer accepts provider selection from deployment configuration. It pins exactly two public Ethereum mainnet authorities:

```text
ethereum-rpc-publicnode = https://ethereum-rpc.publicnode.com/
ethereum-drpc           = https://eth.drpc.org/
```

Before this binding was introduced, both endpoints were exercised against the same finalized Ethereum mainnet block and returned matching block number, hash, state root, parent hash and timestamp. Both also returned the same ENS Registry `owner(namehash("eth"))` result using an EIP-1898 `eth_call` bound to that finalized block hash with `requireCanonical=true`.

The underlying ENS verifier still independently enforces HTTPS, Ethereum mainnet chain ID, distinct network authorities, shared finalized-block evidence, EIP-1898 hash-bound reads and exact ENS Registry/Base Registrar checks. A request cannot choose or replace either provider.

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

## Preactivation HTTP surface

`service/cloud-run-private-service.mjs` is the buildpack-compatible Cloud Run entrypoint (`npm start`). It listens on the Cloud Run `PORT` and constructs the zero-argument production runtime wrapper.

The HTTP surface is intentionally read-only and contains only:

```text
GET /health
GET /v1/runtime-identity
```

The health path deliberately does not end in `z`. Cloud Run reserves some URL paths ending in `z`, so the deployed service avoids that namespace rather than relying on an application route that the Google frontend may intercept before the request reaches the container.

It exposes no receipt-issuance route, no signer route, no KMS proxy and no admission route. Non-GET methods are rejected and query strings are rejected. Responses use `Cache-Control: no-store`; no CORS policy is enabled by the application.

This application-level narrow surface is not a substitute for Cloud Run IAM. Deployment must still require authentication and must not grant `allUsers` the Cloud Run Invoker role.

## Identity and secret handling

The production assembly expects Cloud Run service identity / metadata credentials for KMS access. It does not require or accept a service-account JSON key as repository material.

No private key, bearer token or provider credential belongs in this public repository. The two pinned RPC endpoints are public and require no repository secret.

The production runtime rejects direct substitutions for `codeCommit`, `nowImpl`, `trustedClock`, `signer` and `keyPolicy`; the zero-argument production wrapper also fixes the ENS provider pair.

`ajv` is declared as a production dependency because the trusted receipt issuer compiles the closed claim, intent, receipt and key-policy schemas at runtime. Development-only validators remain outside the production dependency set.

## Remaining deployment gate

After this code is merged, production activation is still blocked until infrastructure is independently exercised:

1. deploy the exact reviewed source through Cloud Run source deployment and record the resulting image digest and revision provenance;
2. require authentication and use only `vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com` as the service identity;
3. verify `/health` and `/v1/runtime-identity` through an authenticated invocation;
4. verify the deployed identity reports the pinned CryptoKeyVersion, key-policy digest, verifier blobs and provider pair;
5. confirm the runtime obtains short-lived Google credentials rather than a static service-account key;
6. confirm only the intended service identity can use KMS CryptoKeyVersion `1` for signing;
7. run a separate bounded preactivation end-to-end receipt probe using the reviewed runtime without exposing issuance through the HTTP service;
8. independently verify the resulting Ed25519 receipt signatures against the pinned public policy; and
9. re-run CI and exact-head Codex review for any deployment-support changes.

Only after those checks pass may a separate, explicit activation change consider `trusted_receipt_issuance = true`.

Candidate admission remains a later, independent gate even after receipt issuance is activated.
