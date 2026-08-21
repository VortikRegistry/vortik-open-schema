# Trusted verification boundary

## Purpose

Candidate Review & Provenance deliberately does not create trusted evidence. This boundary defines the machine-readable requirements that a verifier must satisfy before Vortik may consider enabling admission for a new ENS-backed registry anchor.

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
schemas/verification/vortik-trusted-verification-requirements/1.2.0/schema.json
```

Versions `1.0.0` and `1.1.0` remain available as historical schemas. Version `1.1.0` permanently records the earlier requirements-only state; the canonical manifest now targets `1.2.0`.

## Current implementation state

Version `1.2.0` records the bounded primary-source verifier as implemented and live network access as enabled only for that verifier's fixed GitHub policy.

It keeps these states closed:

- ENS mainnet verifier not implemented;
- trusted receipt issuance disabled;
- candidate admission disabled.

The primary-source verifier is limited to its code-owned allowlist, immutable commit resolution, bounded response size and exact evidence binding. Generic network access is not implied by `live_network_access: true`.

A structurally valid contribution or review artifact therefore still cannot become trusted merely by matching this requirements contract.

Version `1.2.0` requires:

1. exact canonical primary-source identity and immutable repository revision, with retrieved bytes and digest bound to that artifact;
2. affirmative ENS evidence bound to one asserted **finalized** Ethereum mainnet block;
3. lookup result, lookup digest, block timestamp, and registration-expiry evidence all bound to the same normalized ENS subject and finalized block context;
4. finalized-block freshness relative to a trusted verifier issuance time, with maximum age `1800` seconds and no future-dated block timestamp;
5. registration expiry later than trusted issuance time;
6. authenticated receipts using an authorized signing key and complete-receipt/digest signature binding;
7. a bounded `admission_valid_until` no more than `86400` seconds after trusted issuance and never after ENS expiry;
8. future admission using its own policy-validated trusted clock, never caller-controlled, to reject stale or expired receipts.

Only the bounded primary-source retrieval capability is implemented by this version. ENS lookup, trusted clock sources, production signing/key management, trusted receipt issuance and admission remain unimplemented or disabled.

## Required primary-source receipt

Before future admission can use semantic evidence, a verifier must independently retrieve the relevant Ethereum or protocol source rather than trusting the contributor's URL or classification.

The primary-source evidence contract requires at least:

- validated authority class;
- independent retrieval by the verifier;
- canonical source identifier;
- exact repository identity;
- immutable revision identity;
- exact commit SHA;
- exact blob SHA;
- exact source path;
- cryptographic digest of the retrieved bytes;
- verification that the content digest corresponds to the exact asserted repository/commit/blob/path artifact;
- binding proving that the retrieved bytes are the bytes identified by that asserted immutable revision;
- binding between the retrieved evidence and the semantic claim under review;
- verifier identity and version where a trusted receipt is later issued.

Contributor-supplied URLs remain untrusted and cannot select an official source.

## Required ENS mainnet receipt

ENS existence is separate from semantic relevance. A future ENS verifier must independently query Ethereum mainnet for the exact normalized candidate.

The future receipt must be bound to:

- Ethereum chain ID `1`;
- the exact normalized ENS candidate name;
- one asserted concrete **finalized** block number and block hash;
- the lookup result and lookup-result digest, both bound to that same block;
- the observed block timestamp, bound to that same block;
- registration-expiry evidence/value verified against and bound to the **same normalized name, same lookup result, and same finalized block**;
- a trusted verifier `issued_at` derived from a policy-validated trusted clock source and not from caller-controlled input;
- `0 <= trusted_issued_at - block_timestamp <= 1800 seconds`;
- affirmative existence and active registration;
- registration expiry later than both block timestamp and trusted issuance time;
- explicit rejection of negative, null, indeterminate, mismatched, or substituted evidence.

The receipt must not mix state, expiry, timestamps, names, or lookup results from different blocks or subjects.

## Receipt authentication, integrity and freshness

Future trusted receipts must require:

- verifier identity and version;
- issuer authentication and issuer key identity;
- signing-key authorization and trust-policy validation;
- a verifiable signature covering the complete receipt semantics/digest;
- subject contribution digest and exact normalized candidate name;
- trusted `issued_at`;
- a policy-validated trusted issuance clock source;
- prohibition on caller-controlled `issued_at`;
- `admission_valid_until`;
- maximum validity of `86400` seconds from trusted issuance;
- `admission_valid_until` no later than ENS registration expiry when the receipt depends on ENS validity;
- replay protection.

## Admission-time trust

The future admission gate must not choose its own arbitrary time basis and must not accept a caller-supplied clock.

It must require:

- a `trusted_admission_time`;
- a trusted admission clock source;
- validation of that clock source against configured trust policy;
- proof that the trusted admission time is not caller-controlled;
- `trusted_admission_time >= trusted_issued_at`;
- freshness evaluation against that trusted admission time;
- `trusted_admission_time <= admission_valid_until`;
- ENS-dependent receipt validity to remain unexpired at that trusted admission time.

The closed freshness relation is:

```text
block_timestamp <= trusted_issued_at
trusted_issued_at - block_timestamp <= 1800 seconds
registration_expiry > trusted_issued_at
admission_valid_until <= trusted_issued_at + 86400 seconds
admission_valid_until <= registration_expiry
trusted_issued_at <= trusted_admission_time
trusted_admission_time <= admission_valid_until
```

If any clock source, binding, freshness comparison, or expiry comparison cannot be established, admission must fail closed.

## Dual-receipt rule

Future candidate admission requires **both** independently derived receipts:

1. primary Ethereum/relevant-protocol semantic evidence; and
2. exact-name ENS mainnet evidence.

Both receipts must be authenticated, use authorized signing keys, bind to the same candidate/contribution subject, and remain valid under the trusted admission time. A separate registry PR remains mandatory. Verification is evidence for admission; it is not permission to mutate the registry directly.

## Public mirror invariant

The canonical schema and requirements manifest each have a public documentation mirror. Validation requires each source/public pair to remain byte-identical.

## WORK GATE

The primary-source verifier is now implemented as a bounded network-backed capability. The remaining verifier work is ENS mainnet verification plus the still-disabled trusted issuance/admission path.

`admission.enabled` remains `false`, and the repository-level candidate-admission gate continues to reject new anchors and ENS rebindings until the remaining trust boundaries are separately implemented and reviewed.
