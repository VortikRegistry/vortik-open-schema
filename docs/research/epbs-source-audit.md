# ePBS source audit

## Purpose

This public audit records the source state for enshrined proposer-builder separation (ePBS) as tracked by Vortik without changing registry state. It does not add an anchor, alter `registry.json`, modify schemas, create a separate PTC anchor, or claim official Ethereum status.

## Sources reviewed

Primary and repository sources for this audit:

- EIP-7732 — Enshrined Proposer-Builder Separation: <https://eips.ethereum.org/EIPS/eip-7732>
- EIP-7773 — Hardfork Meta: Glamsterdam: <https://eips.ethereum.org/EIPS/eip-7773>
- Existing source notes: `schemas/epbs/1.0-draft/sources.md`
- Existing anchor documentation: `anchors/epbs.md`

## How Vortik tracks ePBS

Vortik tracks `epbs.eth` as the registry anchor for the canonical term "enshrined proposer-builder separation (ePBS)". The registry treats ePBS as a protocol-facing coordination primitive because the term maps to proposer-builder separation, builder bids, payload commitments, payload reveal, PTC timing checks, and delayed validation in the EIP-7732 design.

The ENS anchor is a semantic entry point for a registry record. It is not protocol authority and does not create Ethereum protocol truth.

## Source-state distinctions

### Primary specification source

EIP-7732 is the primary ePBS specification source for this repository. It defines ePBS as a Draft Core EIP, describes separating an Ethereum block into consensus and execution parts, introduces in-protocol builders, defines signed bid and payload-envelope containers, and describes the Payload Timeliness Committee (PTC) and delayed validation as components of the design.

Vortik may mention PTC and delayed validation only as EIP-7732 components and source-supported ePBS design elements. This audit does not create a separate PTC anchor.

### Scheduled inclusion source-state

EIP-7773 is the Glamsterdam meta-EIP source for fork inclusion state. As of this audit, EIP-7773 lists EIP-7732 / Enshrined Proposer-Builder Separation as Scheduled for Inclusion in Glamsterdam.

That is a scheduled-inclusion source state, not a mainnet activation claim.

### Implementation-facing relevance

The existing registry state describes ePBS as implementation-facing. That framing is supported by the EIP-7732 specification surface and the repository's source notes: implementers and reviewers must reason about builder bids, payload commitments, signed containers, payload reveal, PTC attestations, and delayed execution validation.

Implementation-facing relevance does not mean final deployment or live activation.

### Final deployment

This audit does not claim final fork deployment. EIP-7773's inclusion state may inform repository source notes, but Vortik must not collapse scheduled inclusion into final deployment.

### Live mainnet activation

This audit does not claim that ePBS is live on Ethereum mainnet. It does not assign a mainnet activation date and does not imply that activation has occurred.

## Non-claims

This audit does not claim:

- ePBS is active on Ethereum mainnet;
- ePBS has reached final fork deployment;
- Vortik is an official Ethereum source or endpoint;
- `epbs.eth` is an official Ethereum namespace;
- ENS names create protocol truth;
- ePBS creates a nontechnical ENS valuation claim.

## Registry-state boundary

No registry state changes are made by this audit. Any future change to registry status, classification, type, schema fields, schema `const` values, or anchors requires a separate PR and validation.
