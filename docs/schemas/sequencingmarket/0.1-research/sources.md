<!-- AUTO-GENERATED:START -->
# sequencing markets — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `sequencingmarket.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `sequencingmarket`
- **Associated ENS:** `sequencingmarket.eth`
- **Canonical term:** sequencing markets
- **Classification:** external
- **Status:** research
- **Status label:** external
- **Stage:** research
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

external transaction ordering and sequencing coordination surface across rollups, shared sequencing systems, ordering rights, cross-domain execution, and settlement-adjacent infrastructure

---

## Linked Files

- **Anchor document:** `anchors/sequencingmarket.md`
- **Schema:** `schemas/sequencingmarket/0.1-research/schema.json`

---

## Naming Context

- **ENS anchor:** `sequencingmarket.eth`
- **Canonical term:** sequencing markets

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

- [Based rollups — superpowers from L1 sequencing](https://ethresear.ch/t/based-rollups-superpowers-from-l1-sequencing/15016): primary research describing rollups whose sequencing uses L1 proposers together with L1 builders and searchers.
- [EIP-7732 — Enshrined Proposer-Builder Separation](https://eips.ethereum.org/EIPS/eip-7732): specifies the L1 proposer-builder interface, distinct from any particular rollup's sequencing rules.

## Source Notes

**Reviewed: 2026-09-30.** Sequencing designs differ. Based sequencing can use L1 actors, so it is inaccurate to imply that every rollup sequencer is wholly separate from L1 block production. The cited based-rollup post is a 2023 research proposal, not a new deployment announcement.

Vortik's `external` classification applies to the broad sequencing-market category. The sources do not create a canonical L1 object called a sequencing market, prove adoption of a specific design, or promise latency or fairness guarantees for all rollups.
<!-- MANUAL-SOURCES:END -->
