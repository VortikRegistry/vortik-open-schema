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

The repository now also contains `lib/trusted-receipt-issuer.mjs`, a protected-runtime issuer core that composes those verifier outputs with the existing receipt/key-policy cryptography.

The issuer core is intentionally **not** represented by changing `trusted_receipt_issuance` to `true`. That existing flag continues to mean that real production receipt issuance is activated under protected signing/key and trusted-clock infrastructure. Production activation is still false.

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

## Production issuance remains disabled

`trusted_receipt_issuance` remains `false` because the public repository intentionally does not contain the protected production material needed to make the issuer trustworthy in operation.

Production activation requires at minimum:

- a real Ed25519 signing key in an appropriate secret/HSM/KMS boundary;
- a production public key-policy instance and independently trusted policy identity;
- a policy-validated trusted issuance-clock implementation whose time is not request-controlled;
- deployment assembly binding the real verifier instances, signer, clock and policy identities; and
- operational signing-key rotation/revocation procedures.

A generic code patch cannot truthfully invent those protected runtime dependencies. They require owner/infrastructure choices.

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

The canonical verification schemas and requirements manifest retain their existing source/public mirror invariants. This issuer-core change does not mutate historical contracts or enable admission.

## WORK GATE

After the issuer core is merged and reviewed, the public-code trusted-verification path is materially closed through evidence derivation, receipt construction, canonical digesting, policy authorization, signing abstraction and signature self-verification.

The next step is **not** another public hardening loop and is **not** candidate admission.

Production `trusted_receipt_issuance=true` is blocked on protected infrastructure/owner decisions: key custody, production key-policy identity, trusted clock implementation/policy and deployment assembly.

`admission.enabled` remains `false` and must stay separate.
