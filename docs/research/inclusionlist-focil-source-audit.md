# Inclusionlist / FOCIL source audit

**Source state reviewed: 2026-09-30.**

## Purpose

This public audit records the source state for inclusion lists and fork-choice enforced inclusion lists (FOCIL) as tracked by Vortik without changing registry state. It does not add an anchor, alter `registry.json`, modify schemas, downgrade or upgrade registry status, or claim official Ethereum status.

## Sources reviewed

Primary and repository sources for this audit:

- EIP-7805 — Fork-choice enforced Inclusion Lists (FOCIL): <https://eips.ethereum.org/EIPS/eip-7805>
- EIP-7773 — Hardfork Meta: Glamsterdam: <https://eips.ethereum.org/EIPS/eip-7773>
- EIP-8081 — Hardfork Meta: Hegotá: <https://eips.ethereum.org/EIPS/eip-8081>
- Ethereum Foundation — Checkpoint #9: Apr 2026: <https://blog.ethereum.org/2026/04/10/checkpoint-9>
- Ethereum Foundation — Soldøgn Interop Recap: <https://blog.ethereum.org/2026/05/02/soldogn-interop-recap>
- Ethereum Foundation — Protocol Cluster Updates: May 2026: <https://blog.ethereum.org/2026/05/11/protocol-update-may-26>
- Existing source notes: `schemas/inclusionlist/0.1-draft/sources.md`
- Existing anchor documentation: `anchors/inclusionlist.md`

## How Vortik tracks inclusion lists and FOCIL

Vortik tracks `inclusionlist.eth` as the registry anchor for the canonical term "fork-choice enforced inclusion lists (FOCIL)". The anchor captures a protocol-facing inclusion constraint surface: validators, proposers, builders, and attesters may need to reason about inclusion-list data, transaction inclusion requirements, fork-choice enforcement, and censorship-resistance semantics.

The ENS anchor is a semantic entry point for a registry record. It is not protocol authority and does not create Ethereum protocol truth.

## Source-state distinctions

### Primary EIP source

EIP-7805 remains the primary EIP source for FOCIL. It defines a committee-based, fork-choice enforced inclusion-list mechanism intended to preserve censorship-resistance properties by guaranteeing timely transaction inclusion.

This establishes continued technical and specification relevance for the term. Fork inclusion, implementation readiness, and activation remain separate source states.

### Current Glamsterdam boundary

EIP-7773 is the Glamsterdam meta-EIP source for that fork's inclusion state. EIP-7805 / FOCIL is absent from its current scheduled set. Older source snapshots recorded a Declined-for-Inclusion section; that historical description must not be presented as a section still present in the current meta EIP.

The repository must not imply that FOCIL is included in Glamsterdam.

### Scheduled Hegotá inclusion

EIP-8081 is the Hegotá meta-EIP source for that fork's inclusion state. It lists EIP-7805 / FOCIL as Scheduled for Inclusion in Hegotá.

Scheduled for Inclusion is stronger than a research-only or considered state, but it is not an activation claim. EIP-8081 remains a Draft meta EIP, and its activation table does not yet provide Sepolia, Hoodi, or mainnet activation values.

### Implementation-facing evidence

The April and May 2026 Ethereum Foundation updates cited above reported early prototypes and planned interoperability work. They remain dated implementation history, not a current statement of the next development milestone. The current fork scheduling claim comes from EIP-8081.

### Continued technical relevance

FOCIL's absence from the Glamsterdam scheduled set and its scheduled Hegotá state describe different fork scopes. EIP-7805 remains the primary specification object, while EIP-7773 and EIP-8081 provide fork-scoped inclusion context.

The repository may therefore describe FOCIL as technically active, implementation-facing, and scheduled for Hegotá, while continuing to state that it was not included in Glamsterdam and is not active on mainnet.

### Mainnet activation and endorsement boundaries

This audit does not claim that FOCIL is active on Ethereum mainnet, that Hegotá activation dates have been set, that scheduled inclusion guarantees final deployment, or that Ethereum endorses Vortik or `inclusionlist.eth` as an official namespace.

## Non-claims

This audit does not claim:

- FOCIL is active on Ethereum mainnet;
- FOCIL is included in Glamsterdam;
- Hegotá has an announced activation date;
- Scheduled for Inclusion is equivalent to deployed or activated;
- Vortik is an official Ethereum source or endpoint;
- `inclusionlist.eth` is an official Ethereum namespace;
- ENS names create protocol truth;
- inclusion lists create a nontechnical ENS valuation claim.

## Registry-state boundary

No registry state changes are made by this audit. Any future change to registry status, classification, type, schema fields, schema `const` values, or anchors requires a separate PR and validation.
