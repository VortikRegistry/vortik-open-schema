<!-- AUTO-GENERATED:START -->
# enshrined proposer-builder separation (ePBS) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `epbs.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `epbs`
- **Associated ENS:** `epbs.eth`
- **Canonical term:** enshrined proposer-builder separation (ePBS)
- **Classification:** core
- **Status:** implementation-facing
- **Status label:** core
- **Stage:** canonical
- **Type:** primitive
- **Market priority:** high
- **Visibility:** featured

---

## Semantic Classification

Protocol-aligned anchor with strong semantic grounding.

---

## Type Interpretation

Protocol or research primitive tracked as a semantic object.

---

## Registry Role

protocol-defined proposer-builder separation with active implementation-facing relevance, commitment-based block production, signed bid flow, payload reveal semantics, and growing consensus-specs convergence

---

## Linked Files

- **Anchor document:** `anchors/epbs.md`
- **Schema:** `schemas/epbs/1.0-draft/schema.json`

---

## Naming Context

- **ENS anchor:** `epbs.eth`
- **Canonical term:** enshrined proposer-builder separation (ePBS)

The ENS name is treated as a semantic entry point.

The canonical term is treated as the technical reference used by the registry.

If the ENS name and canonical term diverge, the mismatch should be documented in the corresponding anchor document and schema naming fields.

---

## Source Policy

Sources should prioritize:

- primary EIPs
- official specifications
- client or implementation references
- Ethereum research discussions
- protocol roadmap materials
- directly relevant technical documents

Avoid treating social commentary, price speculation, or unsupported market claims as formal sources.

---

## Maintenance Notes

This section is generated from `registry.json`.

Do not manually edit the auto-generated section unless the generation script is being changed.

Curated references and source notes should be placed in the protected section below.
<!-- AUTO-GENERATED:END -->

<!-- MANUAL-SOURCES:START -->
## Curated References

Primary and implementation-facing sources reviewed on **2026-09-13**:

- EIP-7732 — Enshrined Proposer-Builder Separation  
  https://eips.ethereum.org/EIPS/eip-7732
- EIP-7773 — Hardfork Meta: Glamsterdam  
  https://eips.ethereum.org/EIPS/eip-7773
- EIP-8282 — Builder Execution Requests  
  https://eips.ethereum.org/EIPS/eip-8282
- Ethereum consensus specifications  
  https://github.com/ethereum/consensus-specs
- Ethereum Foundation — Announcing the Platåberget Testnet (2026-08-17)  
  https://blog.ethereum.org/2026/08/17/plataberget-testnet
- ethPandaOps — Glamsterdam devnet-9 specification  
  https://notes.ethereum.org/@ethpandaops/glamsterdam-devnet-9
- ethereum.org — Glamsterdam roadmap  
  https://ethereum.org/roadmap/glamsterdam/

## Source Notes

### Source state as of 2026-09-13

- EIP-7732 is a **Review** Standards Track Core EIP. It is no longer accurately described as Draft.
- EIP-7773 lists EIP-7732 as **Scheduled for Inclusion** in Glamsterdam. Scheduled inclusion is not mainnet activation.
- Platåberget is an Ethereum Foundation-announced, public early testing ground for Glamsterdam. It provides public implementation evidence for post-Glamsterdam behavior and explicitly exposes breaking assumptions around hard-capped gas limits.
- Glamsterdam devnet-9 began on 2026-09-01, forked to Gloas on 2026-09-02, and exercises a large pre-fork state plus non-finality recovery. Its EIP list includes EIP-7732 and EIP-7928 and records EIP-7610 as removed.
- EIP-8282 is a Review Core EIP Scheduled for Inclusion in Glamsterdam. It adds dedicated builder deposit and exit request types and contracts for EIP-7732 builders, making builder lifecycle coordination more explicit.
- ethereum.org currently describes Glamsterdam as testing on devnets, with a **Sepolia fork target of 2026-10-06** and mainnet expected in Q4 2026 with no confirmed mainnet date.

### Interpretation boundary

These sources support `epbs.eth` as an implementation-facing semantic anchor. They do **not** establish that ePBS is active on Ethereum mainnet, that Vortik has protocol authority, or that `epbs.eth` is an official Ethereum namespace.
<!-- MANUAL-SOURCES:END -->
