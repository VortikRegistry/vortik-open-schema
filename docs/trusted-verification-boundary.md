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

Versioned schema:

```text
schemas/verification/vortik-trusted-verification-requirements/1.0.0/schema.json
```

## Current implementation state

Version `1.0.0` is **requirements-only**.

It fixes all of these states closed:

- primary-source verifier not implemented;
- ENS mainnet verifier not implemented;
- live network access disabled;
- trusted receipt issuance disabled;
- candidate admission disabled.

A structurally valid contribution or review artifact therefore cannot become trusted merely by matching this requirements contract.

## Required primary-source receipt

Before future admission can use semantic evidence, a verifier must independently retrieve the relevant Ethereum or protocol source rather than trusting the contributor's URL or classification.

The future receipt must prove at least:

- validated authority class: EIP, Ethereum specification, official Ethereum repository, official relevant-protocol specification, or official relevant-protocol repository;
- independent retrieval by the verifier;
- cryptographic digest of the retrieved content;
- binding between the retrieved evidence and the semantic claim under review;
- verifier identity and version;
- receipt integrity and replay protection.

This requirements layer does not decide which concrete origins, repositories or transport clients are trustworthy. That belongs to the later verifier implementation and its trust review.

## Required ENS mainnet receipt

ENS existence is a separate question from semantic relevance. A future ENS verifier must independently query Ethereum mainnet for the exact normalized candidate rather than trust a contributor's ENS claim.

The future receipt must be bound to:

- Ethereum chain ID `1`;
- the exact normalized ENS candidate name;
- a concrete block number and block hash;
- the lookup-result digest;
- the identity of the provider or verification path;
- verifier identity and version;
- receipt integrity and replay protection.

An ENS receipt may establish the result of a naming lookup. It must not be interpreted as ownership authorization, delegated authority, sale intent or commercial representation.

## Dual-receipt rule

Future candidate admission requires **both** independently derived receipts:

1. primary Ethereum/relevant-protocol semantic evidence; and
2. exact-name ENS mainnet evidence.

Both receipts must bind to the same candidate/contribution subject. One receipt cannot substitute for the other.

Even after a future verifier exists, a separate registry PR remains mandatory. Verification is evidence for admission; it is not permission to mutate the registry directly.

## WORK GATE

Implementing the real verifier is a separate infrastructure and trust-boundary change. It will require selecting and constraining real external origins and/or Ethereum RPC providers, handling timeouts and failures, recording provenance and content/block hashes, defining provider identity, preventing replay, and testing adversarial responses.

That work must not be represented by this requirements-only contract. Until the real verifier is separately implemented and reviewed, `admission.enabled` remains `false` and the repository-level candidate-admission gate continues to reject new anchors and ENS rebindings.
