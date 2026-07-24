<!-- AUTO-GENERATED:START -->
# fork-choice enforced inclusion lists (FOCIL) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `inclusionlist.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `inclusionlist`
- **Associated ENS:** `inclusionlist.eth`
- **Canonical term:** fork-choice enforced inclusion lists (FOCIL)
- **Classification:** core
- **Status:** eip-active
- **Status label:** core
- **Stage:** canonical
- **Type:** constraint
- **Market priority:** high
- **Visibility:** featured

---

## Semantic Classification

Protocol-aligned anchor with strong semantic grounding.

---

## Type Interpretation

Constraint surface affecting coordination behavior.

---

## Registry Role

protocol-enforced inclusion constraint with fork-scoped relevance, validator committee enforcement, and direct alignment with FOCIL-style inclusion guarantees

---

## Linked Files

- **Anchor document:** `anchors/inclusionlist.md`
- **Schema:** `schemas/inclusionlist/0.1-draft/schema.json`

---

## Naming Context

- **ENS anchor:** `inclusionlist.eth`
- **Canonical term:** fork-choice enforced inclusion lists (FOCIL)

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

- EIP-7805 — Fork-Choice Enforced Inclusion Lists  
  https://eips.ethereum.org/EIPS/eip-7805

- EIP-7773 — Hardfork Meta: Glamsterdam  
  https://eips.ethereum.org/EIPS/eip-7773

- EIP-8081 — Hardfork Meta: Hegotá  
  https://eips.ethereum.org/EIPS/eip-8081

- Ethereum Foundation — Checkpoint #9: Apr 2026  
  https://blog.ethereum.org/2026/04/10/checkpoint-9

- Ethereum Foundation — Soldøgn Interop Recap  
  https://blog.ethereum.org/2026/05/02/soldogn-interop-recap

- Ethereum Foundation — Protocol Cluster Updates: May 2026  
  https://blog.ethereum.org/2026/05/11/protocol-update-may-26

- Ethereum Research — Inclusion Lists and FOCIL-related discussions  
  https://ethresear.ch/

## Source Notes

Inclusion lists are treated by Vortik as a core protocol-facing constraint because they map directly to transaction inclusion guarantees and fork-choice enforced censorship-resistance mechanisms. EIP-7805 / FOCIL is the primary EIP source for this constraint surface.

Fork inclusion must be read with fork-specific context. EIP-7773 lists EIP-7805 / FOCIL as Declined for Inclusion in Glamsterdam. EIP-8081 lists EIP-7805 / FOCIL as Scheduled for Inclusion in Hegotá. These states are not contradictory: they describe different network upgrades.

Ethereum Foundation updates report functional early FOCIL prototypes and identify multi-client interoperability and a dedicated FOCIL devnet as immediate implementation steps. This supports implementation-facing relevance, but it does not establish deployment or activation.

EIP-8081 remains a Draft meta EIP and currently provides no activation values for Sepolia, Hoodi, or mainnet. Scheduled for Inclusion must not be interpreted as activated, deployed, or guaranteed final delivery.

This anchor is grounded in the transition from discretionary transaction inclusion toward protocol-constrained inclusion behavior.

The strongest semantic objects to monitor around this anchor are:

- inclusion list
- FOCIL
- inclusion guarantee
- fork-choice enforcement
- validator committee
- censorship resistance
- builder constraint
- proposer constraint
- transaction inclusion requirement

The ENS anchor `inclusionlist.eth` is treated as strongly aligned because it captures the durable human-readable inclusion-list category, while the canonical term tracks the more precise FOCIL mechanism. The ENS anchor is a semantic entry point for the inclusion-list / FOCIL constraint surface, not a deployment claim or protocol authority.

These references and notes are curated to support source traceability and semantic interpretation.

They should be updated only when primary protocol references, implementation materials, or Ethereum core development discussions materially change.
<!-- MANUAL-SOURCES:END -->
