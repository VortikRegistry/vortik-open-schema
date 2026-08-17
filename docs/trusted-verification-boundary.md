# Trusted verification boundary

## Purpose

Candidate Review & Provenance deliberately does not create trusted evidence. This boundary defines the machine-readable requirements that a future verifier must satisfy before Vortik may consider enabling admission for a new ENS-backed registry anchor.

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
schemas/verification/vortik-trusted-verification-requirements/1.1.0/schema.json
```

Version `1.0.0` remains available as historical schema only. The canonical manifest now targets `1.1.0`.

## Current implementation state

Version `1.1.0` remains **requirements-only**.

It fixes all of these states closed:

- primary-source verifier not implemented;
- ENS mainnet verifier not implemented;
- live network access disabled;
- trusted receipt issuance disabled;
- candidate admission disabled.

A structurally valid contribution or review artifact therefore cannot become trusted merely by matching this requirements contract.

Version `1.1.0` closes the review gaps in the original boundary by requiring:

1. primary-source evidence to identify an exact canonical source and immutable repository revision, with the retrieved bytes and content digest bound to that same asserted artifact;
2. ENS evidence to contain an affirmative, active, unexpired existence result, with the lookup result, lookup-result digest and observed block timestamp all verified against and bound to one asserted **finalized** Ethereum mainnet block;
3. that finalized block to be fresh relative to a trusted verifier issuance time, with a maximum age of `1800` seconds and no future-dated block timestamp;
4. registration expiry to remain later than the trusted issuance time;
5. receipts to authenticate their issuer, bind the signature to the complete receipt semantics/digest, use a signing key authorized by the verifier's configured trust policy, and expose a bounded `admission_valid_until`;
6. future admission to reject stale or expired receipts.

These are contract requirements only. This version does not implement retrieval, ENS lookup, a clock source, signing, key management, trusted receipt issuance or admission.

## Required primary-source receipt

Before future admission can use semantic evidence, a verifier must independently retrieve the relevant Ethereum or protocol source rather than trusting the contributor's URL or classification.

The future receipt must prove at least:

- validated authority class: EIP, Ethereum specification, official Ethereum repository, official relevant-protocol specification, or official relevant-protocol repository;
- independent retrieval by the verifier;
- canonical source identifier;
- exact repository identity;
- immutable revision identity;
- exact commit SHA;
- exact blob SHA;
- exact source path;
- cryptographic digest of the retrieved bytes;
- verification that the content digest corresponds to the exact asserted repository/commit/blob/path artifact;
- binding proving that the retrieved bytes are the bytes identified by that asserted immutable revision, not unrelated bytes hashed alongside trusted-looking identifiers;
- binding between the retrieved evidence and the semantic claim under review;
- verifier identity and version.

An authority label alone is insufficient. A digest alone is also insufficient, and trusted-looking revision identifiers cannot be recorded independently from the bytes they are supposed to identify.

The concrete repository allowlist, repository IDs, allowed paths, retrieval adapters and network defenses belong to the later verifier implementation and its trust review. Contributor-supplied URLs remain untrusted and cannot select an official source.

## Required ENS mainnet receipt

ENS existence is a separate question from semantic relevance. A future ENS verifier must independently query Ethereum mainnet for the exact normalized candidate rather than trust a contributor's ENS claim.

The future receipt must be bound to:

- Ethereum chain ID `1`;
- the exact normalized ENS candidate name;
- one asserted concrete **finalized** block number and block hash representing the same block identity;
- the lookup result and lookup-result digest, both verified against and bound to that same asserted block;
- the observed block timestamp, verified against and bound to that same asserted block;
- a trusted verifier `issued_at` time derived from a trusted clock source;
- a freshness rule requiring `0 <= issued_at - block_timestamp <= 1800 seconds`;
- the identity of the provider or verification path;
- an affirmative existence result;
- an active registration result at the asserted block;
- registration-expiry evidence sufficient to reject an expired name;
- registration expiry later than both the asserted block timestamp and the trusted verifier `issued_at`;
- explicit rejection of negative, null or indeterminate lookup results;
- verifier identity and version.

The receipt must not mix state obtained at one block with a different recorded block number, hash or timestamp. It also must not revive historical validity by selecting an old block at which the name used to be active. A future-dated block timestamp is invalid, and a finalized block older than `1800` seconds relative to trusted `issued_at` is stale and cannot produce admissible evidence.

This contract deliberately does not yet define the concrete ENS normalization library, contract calls, dual-provider implementation or lookup semantics identifier. Those remain implementation decisions for the later ENS verifier PR. It does, however, close the freshness policy: finalized block only, maximum block age `1800` seconds relative to trusted issuance time.

An ENS receipt must never be interpreted as ownership authorization, delegated authority, sale intent or commercial representation.

## Receipt authentication, integrity and freshness

A receipt digest detects accidental or malicious modification only when the expected digest is already trusted. It does not authenticate the party that created the receipt, and a mathematically valid signature does not by itself establish that its key is authorized to issue Vortik verification receipts.

Future trusted receipts must therefore require:

- verifier identity and version;
- issuer authentication;
- issuer key identity;
- validation that the signing key is authorized by the verifier's configured trust policy;
- a verifiable signature;
- signature validation before admission;
- authentication binding that covers the complete receipt semantics, not unrelated data;
- signature coverage of the receipt digest so subject/evidence/result fields cannot be substituted independently;
- subject contribution digest;
- candidate name and exact normalized candidate name;
- receipt digest;
- `issued_at` derived from a trusted clock source;
- `admission_valid_until`;
- a maximum admission-validity window of `86400` seconds from trusted `issued_at`;
- `admission_valid_until` no later than registration expiry when the receipt depends on ENS registration validity;
- replay protection.

The concrete canonical serialization, signature algorithm, authorized public-key list, key lifecycle/rotation and admission-intent binding are intentionally deferred to the later offline receipt-contract PR.

For the requirements contract, the freshness rule is closed as:

```text
block_timestamp <= trusted_issued_at
trusted_issued_at - block_timestamp <= 1800 seconds
registration_expiry > trusted_issued_at
admission_valid_until <= trusted_issued_at + 86400 seconds
admission_valid_until <= registration_expiry
trusted_admission_time <= admission_valid_until
```

The future admission gate must fail closed if any freshness comparison cannot be established.

## Dual-receipt rule

Future candidate admission requires **both** independently derived receipts:

1. primary Ethereum/relevant-protocol semantic evidence; and
2. exact-name ENS mainnet evidence.

Both receipts must be authenticated, must be issued by an authorized signing key, and must bind to the same candidate/contribution subject. Admission must validate their freshness and reject a receipt whose `admission_valid_until` has passed. A receipt for one contribution or normalized name cannot be reused for another. One receipt cannot substitute for the other.

Even after a future verifier exists, a separate registry PR remains mandatory. Verification is evidence for admission; it is not permission to mutate the registry directly.

## Public mirror invariant

The canonical schema and requirements manifest each have a public documentation mirror. Validation requires each source/public pair to remain byte-identical. The validator includes a negative regression proving that an artificial mirror mismatch is rejected.

## WORK GATE

Implementing the real verifier is a separate infrastructure and trust-boundary change. It will require selecting and constraining real external repositories and Ethereum RPC providers, handling timeouts and failures, recording provenance and content/block hashes, defining provider identity, providing a trusted clock source, authenticating receipt issuance, authorizing signing keys, enforcing finalized-block and receipt freshness, preventing cross-block evidence substitution and replay, and testing adversarial responses.

That work must not be represented by this requirements-only contract. Until the real verifier is separately implemented and reviewed, `admission.enabled` remains `false` and the repository-level candidate-admission gate continues to reject new anchors and ENS rebindings.
