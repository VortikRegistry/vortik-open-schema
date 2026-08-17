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

Version `1.1.0` closes three post-merge review gaps in the original boundary:

1. primary-source evidence must identify an exact canonical source and immutable repository revision, not only an authority class and content digest;
2. ENS evidence must contain an affirmative, active, unexpired existence result and must reject negative, null or indeterminate lookups;
3. receipts must be authenticated by a verifiable issuer identity and signature, not only protected by a recomputable digest.

These are contract requirements only. This version does not implement retrieval, ENS lookup, signing, key management, trusted receipt issuance or admission.

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
- binding between the retrieved evidence and the semantic claim under review;
- verifier identity and version.

An authority label alone is insufficient. A digest alone is also insufficient because it does not identify which primary source and immutable revision supplied the bytes.

The concrete repository allowlist, repository IDs, allowed paths, retrieval adapters and network defenses belong to the later verifier implementation and its trust review. Contributor-supplied URLs remain untrusted and cannot select an official source.

## Required ENS mainnet receipt

ENS existence is a separate question from semantic relevance. A future ENS verifier must independently query Ethereum mainnet for the exact normalized candidate rather than trust a contributor's ENS claim.

The future receipt must be bound to:

- Ethereum chain ID `1`;
- the exact normalized ENS candidate name;
- a concrete block number and block hash;
- the lookup-result digest;
- the identity of the provider or verification path;
- an affirmative existence result;
- an active registration result at the observed block;
- registration-expiry evidence sufficient to reject an already expired name;
- explicit rejection of negative, null or indeterminate lookup results;
- verifier identity and version.

This contract deliberately does not yet define the concrete ENS normalization library, contract calls, finalized-block selection, dual-provider policy or lookup semantics identifier. Those are implementation decisions for the later ENS verifier PR.

An ENS receipt must never be interpreted as ownership authorization, delegated authority, sale intent or commercial representation.

## Receipt authentication and integrity

A receipt digest detects accidental or malicious modification only when the expected digest is already trusted. It does not authenticate the party that created the receipt.

Future trusted receipts must therefore require:

- verifier identity and version;
- issuer authentication;
- issuer key identity;
- a verifiable signature;
- signature validation before admission;
- subject contribution digest;
- candidate name and exact normalized candidate name;
- receipt digest;
- issued-at metadata;
- replay protection.

The concrete canonical serialization, signature algorithm, public-key policy, key rotation and admission-intent binding are intentionally deferred to the later offline receipt-contract PR. This requirements-only change merely makes issuer authentication non-optional.

## Dual-receipt rule

Future candidate admission requires **both** independently derived receipts:

1. primary Ethereum/relevant-protocol semantic evidence; and
2. exact-name ENS mainnet evidence.

Both receipts must be authenticated and must bind to the same candidate/contribution subject. A receipt for one contribution or normalized name cannot be reused for another. One receipt cannot substitute for the other.

Even after a future verifier exists, a separate registry PR remains mandatory. Verification is evidence for admission; it is not permission to mutate the registry directly.

## Public mirror invariant

The canonical schema and requirements manifest each have a public documentation mirror. Validation requires each source/public pair to remain byte-identical. The validator includes a negative regression proving that an artificial mirror mismatch is rejected.

## WORK GATE

Implementing the real verifier is a separate infrastructure and trust-boundary change. It will require selecting and constraining real external repositories and Ethereum RPC providers, handling timeouts and failures, recording provenance and content/block hashes, defining provider identity, authenticating receipt issuance, preventing replay, and testing adversarial responses.

That work must not be represented by this requirements-only contract. Until the real verifier is separately implemented and reviewed, `admission.enabled` remains `false` and the repository-level candidate-admission gate continues to reject new anchors and ENS rebindings.
