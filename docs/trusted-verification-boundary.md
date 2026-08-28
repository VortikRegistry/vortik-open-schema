# Trusted verification boundary

## Purpose

Candidate Review & Provenance deliberately does not create trusted evidence. This boundary defines the machine-readable requirements and protected runtime components that must exist before Vortik could later consider enabling candidate admission.

Canonical requirements manifest:

```text
verification/requirements.json
```

Public manifest:

```text
https://vortikregistry.github.io/vortik-open-schema/verification/requirements.json
```

Current versioned schema:

```text
schemas/verification/vortik-trusted-verification-requirements/1.3.0/schema.json
```

Versions `1.0.0`, `1.1.0`, and `1.2.0` remain historical contracts. The canonical manifest targets `1.3.0`.

## Current implementation state

Version `1.3.0` records both bounded trusted verifiers as implemented:

- primary-source verifier implemented;
- ENS mainnet verifier implemented; and
- bounded live network access enabled for their code-owned policies.

The repository contains `lib/trusted-receipt-issuer.mjs`, a protected-runtime issuer core that composes those verifier outputs with the existing receipt/key-policy cryptography.

It now also contains `lib/google-cloud-kms-ed25519-signer.mjs`, a deployment-bound signer adapter for an exact Google Cloud KMS CryptoKeyVersion, plus a pre-provisioned public Ed25519 verification policy at:

```text
verification/key-policies/vortik-prod-receipt-signing-v1.json
```

The KMS adapter and public policy do **not** change `trusted_receipt_issuance` to `true`. That flag continues to mean that real production receipt issuance is activated under a protected deployed runtime with verified signer identity, trusted policy identity and trusted clock. Production activation remains false.

Candidate admission also remains false.

## Evidence derivation

The primary-source verifier is limited to its code-owned GitHub allowlist, immutable commit resolution, bounded response size and exact repository/commit/blob/path/content binding.

The ENS verifier is limited to two construction-bound canonical network authorities, Ethereum mainnet, one shared finalized block, EIP-1898 hash-bound reads, the canonical ENS Registry/Base Registrar, and the bounded ENSIP-15-valid ASCII `.eth` 2LD profile.

Generic network access is not implied by `live_network_access: true`.

The issuer core does not accept caller-supplied evidence payloads. It invokes the configured verifiers itself, so a receipt payload must originate from the bounded verifier runtime selected at protected construction.

## Receipt issuer core

The issuer core receives only protected construction dependencies:

- verifier instances and immutable verifier identity/version/code-commit metadata;
- public key policy plus independently trusted policy identity;
- Ed25519 signer interface fixed to one key ID;
- trusted issuance-clock interface plus fixed source/policy identity; and
- runtime randomness.

Receipt requests may provide the exact claim/admission-intent artifacts and, for primary-source verification, the bounded source selector consumed by the verifier.

Requests cannot provide:

- verifier payload;
- receipt ID or nonce;
- issuance time or validity deadline;
- signing-key identity;
- receipt digest; or
- signature.

The core derives those values internally, checks claim/intent gates remain fail-closed, validates receipt temporal/evidence semantics, checks key-policy authorization, signs the canonical digest and then verifies the completed signature against the authorized public key before returning the receipt.

See [`trusted-receipt-issuer.md`](trusted-receipt-issuer.md).

## Google Cloud KMS signer boundary

The initial KMS adapter is fixed to one explicit CryptoKeyVersion rather than an implicit primary version. It accepts only canonical Vortik receipt-digest strings and sends those UTF-8 bytes as Ed25519 `data` to the KMS `asymmetricSign` operation.

The adapter validates request/response CRC32C integrity, exact returned key-version identity, expected protection level, canonical signature encoding and exact Ed25519 signature length before returning signature material to the issuer core.

The default runtime identity path uses the Google metadata service for short-lived access tokens. No service-account JSON key, bearer token or private signing key is stored in the public repository.

The intended runtime service identity has sign-only access to the receipt-signing key. Repository CI uses injected test doubles and performs no billable KMS operation.

See [`google-cloud-kms-signer.md`](google-cloud-kms-signer.md).

## Receipt integrity and freshness

Trusted receipt semantics require:

1. exact subject binding to contribution/review/claim/admission-intent digests;
2. exact normalized candidate name;
3. verifier identity/version/code commit;
4. independently trusted key-policy identity/digest;
5. policy-authorized Ed25519 signing key;
6. trusted issuance time that is not request-controlled;
7. `issued_at == trusted_issued_at`;
8. `admission_valid_until <= trusted_issued_at + 86400`;
9. replay nonce and single-use-at-admission requirement; and
10. signature verification over the complete receipt digest semantics.

ENS receipts additionally require:

```text
block_timestamp <= trusted_issued_at
trusted_issued_at - block_timestamp <= 1800 seconds
registration_expiry > trusted_issued_at
admission_valid_until <= registration_expiry
```

If any evidence binding, clock value, policy authorization, signature or freshness relation fails, issuance fails closed.

## V1 decision — production issuance deferred

`trusted_receipt_issuance` remains `false`.

For V1 this is an explicit final scope decision, not an unfinished public capability. V1 includes the bounded verifiers, receipt contracts, issuer core, KMS adapter, public verification policy and recorded production-preactivation evidence. It does not expose a receipt-issuance route or advertise receipt issuance as a public service.

The production-preactivation evidence records successful bounded KMS signing, primary-source receipt and ENS-mainnet receipt probes. Those PASS results verify the exercised paths but do not create an operational issuance service or authority.

Any post-V1 activation must be a separate reviewed change that revalidates the then-current protected components and operations:

- a private Google-managed runtime bound to the intended service identity and exact CryptoKeyVersion;
- an independently trusted runtime pin for the production key-policy identity/digest;
- a policy-validated trusted issuance-clock implementation whose time is not request-controlled;
- protected deployment assembly binding the real verifier instances, signer, clock and policy identities;
- an end-to-end real receipt test with independent public-key verification; and
- operational signing-key rotation/revocation procedures.

These remain activation-time deployment and operational assertions. They must not be inferred from public code or from historical preactivation evidence.

## Admission-time trust remains separate

Even after production receipt issuance is activated, candidate admission is a separate gate.

Future admission must require both independently derived authenticated receipts bound to the same subject and must evaluate them against its own policy-validated trusted admission time:

```text
trusted_issued_at <= trusted_admission_time
trusted_admission_time <= admission_valid_until
```

It must also enforce durable replay/single-use semantics and the existing separate-registry-PR rule.

Verification evidence is never direct permission to mutate `registry.json`.

## Authority boundary

Neither verifier evidence, signed receipts nor future admission may infer:

- ENS ownership;
- authority to represent an ENS holder;
- Ethereum protocol authority; or
- commercial authority.

The public/private commercial boundary remains unchanged.

## Public mirror invariant

The canonical verification schemas and requirements manifest retain their existing source/public mirror invariants. This KMS signer integration does not mutate historical contracts or enable admission.

## WORK GATE

The public-code trusted-verification path and its production-preactivation evidence are materially closed for V1 through evidence derivation, receipt construction, canonical digesting, policy authorization, a deployable KMS signing adapter and signature self-verification.

The V1 decision is explicit:

- `trusted_receipt_issuance=false` is deferred from V1;
- `admission.enabled=false` is deferred from V1; and
- neither deferral blocks the bounded public V1 registry and discovery surfaces.

The next step is **not** another public hardening loop and is **not** candidate admission. Any activation belongs to a separate post-V1 gate.
