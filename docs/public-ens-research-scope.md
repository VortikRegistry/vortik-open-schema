# Public ENS semantic research scope

## Status

This document defines the first public design boundary for researching ENS-style names through Vortik Registry. It is a scope contract, not an API specification, implementation, registry-state change, or claim about Ethereum or ENS protocol behavior.

## Purpose

A public Vortik research path should be useful when a person or machine starts from an ENS-style name, whether or not that name is already a selected Vortik anchor.

The research path may help a caller determine:

- whether the name exactly matches a tracked Vortik anchor;
- which canonical technical term, classification, type, status, and source trail Vortik currently records;
- whether the wording is related to a tracked term without being a tracked anchor;
- whether Vortik currently has no source-grounded assessment for the name;
- which limitations and confidence constraints apply to the result.

The same method must apply to names regardless of ownership. Ownership does not increase or decrease semantic relevance.

## Required result states

A future machine-readable contract should distinguish at least these outcomes:

- **tracked anchor** — the normalized name exactly matches an entry in the validated registry;
- **related terminology** — public, source-grounded registry material supports a relationship, but the queried name is not itself a tracked anchor;
- **untracked** — Vortik has no current source-grounded assessment;
- **invalid input** — the submitted value does not satisfy the accepted input contract;
- **indeterminate** — required evidence is unavailable, conflicting, or insufficient for a safe conclusion.

An untracked result must not be converted into an inferred classification, status, endorsement, or rejection. Absence from Vortik is only absence from the current curated registry.

## Public evidence boundary

Results may be derived only from validated public Vortik artifacts and cited public technical sources. Each substantive conclusion should identify its provenance and distinguish:

- registry facts;
- primary-source facts;
- Vortik interpretation;
- uncertainty or missing evidence.

A name, owner, resolver record, website, text record, avatar, address, content hash, or linked resource must not be treated as protocol authority or as evidence of technical adoption.

## Naming and authority boundary

The research path must preserve the rules in [Naming and governance boundaries](naming-governance-boundaries.md):

- an ENS name is a human-readable lookup surface, not protocol truth;
- ownership does not imply expertise, endorsement, governance authority, or control over a technical concept;
- a semantic relationship does not establish official Ethereum status;
- Vortik classification describes the registry's source-grounded interpretation, not the rights or intent of a name holder.

## Security boundary

The initial capability should operate only on curated Vortik data. It must not require live resolver lookups or ingestion of arbitrary external content.

If later phases add external resolution or evidence retrieval, all returned metadata and linked content must be treated as untrusted data. Future implementations must use:

- strict input normalization and length limits;
- closed response schemas;
- explicit provenance;
- allowlisted protocols, origins, and paths;
- bounded retrieval;
- no instruction execution from external content;
- fail-closed behavior when parsing, provenance, or evidence validation fails;
- no persistent memory derived from untrusted text without a separate approved process.

The research path must not perform writes, modify ENS records, contact name holders, sign transactions, or take actions based on queried content.

## Non-goals

This capability does not:

- resolve or control ENS records;
- verify legal identity, ownership intent, endorsement, or authority;
- determine whether a name should be registered, transferred, or used;
- turn every queried name into a registry candidate;
- create a new anchor, classification, schema, map entry, or source claim;
- replace EIPs, specifications, client repositories, or other primary sources;
- infer technical significance from popularity or attention alone.

## Versioned machine contracts

The first closed request and response contracts are:

- `schemas/queries/vortik-ens-research-request/1.0.0/schema.json`;
- `schemas/queries/vortik-ens-research-response/1.0.0/schema.json`.

Their public mirrors are published under the same paths on GitHub Pages. Both contracts reject unexpected control fields. They define data shapes and state invariants only; they do not perform resolution, retrieval, evaluation, or writes.

## Reusable local client

The current reusable integration is documented in [Reusable ENS research client](ens-research-client.md).

`lib/ens-research-client.mjs` evaluates versioned requests only against the canonical repository copies of `registry.json` and `maps/coordination-surfaces.json`. It does not accept caller-supplied artifacts, network sources, resolver metadata, ownership information, or action instructions.

The executable example is available at `examples/research-ens-name.mjs` and runs through `npm run example:research-ens`.

## Phased delivery

Implementation should remain split into small pull requests:

1. define this public scope and trust boundary;
2. define versioned request and response schemas;
3. implement deterministic evaluation against curated registry artifacts;
4. add evidence, confidence, ambiguity, and related-term handling;
5. integrate the capability with the reusable client and public discovery surfaces;
6. add adversarial tests, documentation, and non-authoritative examples.

Each later phase must preserve backward compatibility or provide explicit versioning. Registry-state changes, new anchors, and source updates remain separate reviewable work.

## Acceptance criteria for later implementation

A conforming implementation should:

- produce the same semantic method for names owned by Vortik, third parties, or unknown holders;
- return an explicit untracked or indeterminate state instead of inventing evidence;
- separate exact anchor matches from related terminology;
- expose provenance for substantive claims;
- keep external metadata outside the trusted control plane;
- avoid changing registry state as a side effect of a query;
- remain useful without any private data or privileged access.
