# Inclusionlist / FOCIL source audit

## Purpose

This public audit records the source state for inclusion lists and fork-choice enforced inclusion lists (FOCIL) as tracked by Vortik without changing registry state. It does not add an anchor, alter `registry.json`, modify schemas, downgrade or upgrade registry status, or claim official Ethereum status.

## Sources reviewed

Primary and repository sources for this audit:

- EIP-7805 — Fork-choice enforced Inclusion Lists (FOCIL): <https://eips.ethereum.org/EIPS/eip-7805>
- EIP-7773 — Hardfork Meta: Glamsterdam: <https://eips.ethereum.org/EIPS/eip-7773>
- Existing source notes: `schemas/inclusionlist/0.1-draft/sources.md`
- Existing anchor documentation: `anchors/inclusionlist.md`

## How Vortik tracks inclusion lists and FOCIL

Vortik tracks `inclusionlist.eth` as the registry anchor for the canonical term "fork-choice enforced inclusion lists (FOCIL)". The anchor captures a protocol-facing inclusion constraint surface: validators, proposers, builders, and attesters may need to reason about inclusion-list data, transaction inclusion requirements, fork-choice enforcement, and censorship-resistance semantics.

The ENS anchor is a semantic entry point for a registry record. It is not protocol authority and does not create Ethereum protocol truth.

## Source-state distinctions

### Primary EIP source

EIP-7805 remains the primary EIP source for FOCIL. It defines the fork-choice enforced inclusion-list design area and describes a validator committee mechanism intended to preserve censorship-resistance properties by guaranteeing timely transaction inclusion.

This establishes continued technical and specification relevance for the term even though fork inclusion state is separate.

### Declined Glamsterdam inclusion

EIP-7773 is the Glamsterdam meta-EIP source for fork inclusion state. As of this audit, EIP-7773 lists EIP-7805 / Fork-choice enforced Inclusion Lists (FOCIL) as Declined for Inclusion in Glamsterdam.

That declined source state means this repository must not imply that FOCIL is included in Glamsterdam.

### Continued technical relevance

Declined Glamsterdam inclusion does not erase the term. EIP-7805 remains a primary source for FOCIL as a technical specification object, and the existing anchor can continue to describe inclusion-list and FOCIL semantics within repository boundaries.

The declined state does, however, prevent the repository from representing FOCIL as Scheduled for Inclusion, Glamsterdam-included, deployed, or activated.

### Mainnet activation and endorsement boundaries

This audit does not claim that FOCIL is active on Ethereum mainnet, included in Glamsterdam, endorsed by Ethereum as final protocol state, or connected to any nontechnical ENS valuation claim.

## Non-claims

This audit does not claim:

- FOCIL is active on Ethereum mainnet;
- FOCIL is included in Glamsterdam;
- Vortik is an official Ethereum source or endpoint;
- `inclusionlist.eth` is an official Ethereum namespace;
- ENS names create protocol truth;
- inclusion lists create a nontechnical ENS valuation claim.

## Registry-state boundary

No registry state changes are made by this audit. Any future change to registry status, classification, type, schema fields, schema `const` values, or anchors requires a separate PR and validation.
