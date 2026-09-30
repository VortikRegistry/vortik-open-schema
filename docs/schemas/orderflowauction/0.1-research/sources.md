<!-- AUTO-GENERATED:START -->
# order flow auctions (OFA) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `orderflowauction.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `orderflowauction`
- **Associated ENS:** `orderflowauction.eth`
- **Canonical term:** order flow auctions (OFA)
- **Classification:** external
- **Status:** research
- **Status label:** external
- **Stage:** implemented
- **Type:** coordination_surface
- **Market priority:** medium
- **Visibility:** standard

---

## Semantic Classification

Ethereum-adjacent or external coordination surface outside the current Ethereum L1 protocol core.

---

## Type Interpretation

Broad coordination surface across infrastructure or ecosystem behavior.

---

## Registry Role

external order-flow routing and auction surface operating before protocol-level builder coordination, with relevance under pressure from encrypted flow, sealed transactions, and commit-before-reveal mechanisms

---

## Linked Files

- **Anchor document:** `anchors/orderflowauction.md`
- **Schema:** `schemas/orderflowauction/0.1-research/schema.json`

---

## Naming Context

- **ENS anchor:** `orderflowauction.eth`
- **Canonical term:** order flow auctions (OFA)

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

- [Flashbots — MEV-Share introduction](https://docs.flashbots.net/flashbots-mev-share/introduction): primary implementation documentation identifying MEV-Share as an order flow auction protocol.
- [EIP-7805 — Fork-choice enforced Inclusion Lists](https://eips.ethereum.org/EIPS/eip-7805): a distinct protocol proposal for inclusion constraints.
- [EIP-8081 — Hegotá](https://eips.ethereum.org/EIPS/eip-8081): records EIP-7805 as Scheduled for Inclusion, with activation dates unset.

## Source Notes

**Reviewed: 2026-09-30.** MEV-Share supplies a concrete external OFA reference. Auction rules and transaction visibility depend on the implementation; this source does not establish that all order flow uses auctions.

FOCIL scheduling does not establish the disappearance, replacement, or reduced adoption of OFAs. Inclusion constraints and upstream order-flow allocation have different scopes. Vortik retains the `external` classification and makes no forecast about auction dominance or adoption.
<!-- MANUAL-SOURCES:END -->
