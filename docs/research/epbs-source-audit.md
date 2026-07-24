# ePBS source audit

## Purpose

This public audit records the source state for enshrined proposer-builder separation (ePBS) as tracked by Vortik without changing registry state. It does not add an anchor, alter `registry.json`, modify schemas, create a separate PTC anchor, or claim official Ethereum status.

## Sources reviewed

Primary and repository sources for this audit:

- EIP-7732 — Enshrined Proposer-Builder Separation: <https://eips.ethereum.org/EIPS/eip-7732>
- EIP-7773 — Hardfork Meta: Glamsterdam: <https://eips.ethereum.org/EIPS/eip-7773>
- Ethereum Foundation — Protocol Cluster Updates: May 2026: <https://blog.ethereum.org/2026/05/11/protocol-update-may-26>
- Ethereum consensus specifications: <https://github.com/ethereum/consensus-specs>
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

EIP-7773 is the Glamsterdam meta-EIP source for fork inclusion state. It lists EIP-7732 / Enshrined Proposer-Builder Separation as Scheduled for Inclusion in Glamsterdam.

That is a scheduled-inclusion source state, not a mainnet activation claim. EIP-7773 remains Draft, and its activation table currently provides no values for Sepolia, Holešky, or mainnet.

### Implementation-facing evidence

The Ethereum Foundation's May 2026 Protocol Cluster update reports that ePBS had stabilized sufficiently for a multi-client Glamsterdam devnet to run, with an external-builders pipeline tested end-to-end across nearly all clients. The same update states that Glamsterdam devnets are live and that the immediate focus is hardening and shipping the upgrade.

The official `ethereum/consensus-specs` repository also maintains unstable Gloas specifications and tests for ePBS-related payload attestations and payload-envelope behavior. Unstable specification and devnet evidence support implementation-facing relevance; they do not establish activation or final mainnet deployment.

### Final deployment

This audit does not claim final fork deployment. EIP-7773's Scheduled for Inclusion state, implementation progress, devnet operation, and specification tests may inform repository source notes, but Vortik must not collapse any of them into final deployment.

### Live mainnet activation

This audit does not claim that ePBS is live on Ethereum mainnet. It does not assign a mainnet activation date and does not imply that activation has occurred.

## Non-claims

This audit does not claim:

- ePBS is active on Ethereum mainnet;
- ePBS has reached final fork deployment;
- a live multi-client devnet is equivalent to mainnet activation;
- the word "stabilized" is equivalent to a Final EIP or guaranteed deployment;
- Glamsterdam activation dates have been announced in EIP-7773;
- Vortik is an official Ethereum source or endpoint;
- `epbs.eth` is an official Ethereum namespace;
- ENS names create protocol truth;
- ePBS creates a nontechnical ENS valuation claim.

## Registry-state boundary

No registry state changes are made by this audit. Any future change to registry status, classification, type, schema fields, schema `const` values, or anchors requires a separate PR and validation.
