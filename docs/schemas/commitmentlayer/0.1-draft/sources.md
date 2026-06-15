<!-- AUTO-GENERATED:START -->
# commitment — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `commitmentlayer.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.4
- **Registry ID:** `commitmentlayer`
- **Associated ENS:** `commitmentlayer.eth`
- **Canonical term:** commitment
- **Classification:** repairable
- **Status:** research
- **Status label:** emerging
- **Stage:** emerging
- **Type:** primitive
- **Market priority:** medium
- **Sale strategy:** selective_inquiry
- **Visibility:** standard

---

## Semantic Classification

Valid underlying concept with imperfect ENS alignment or terminology mismatch.

---

## Type Interpretation

Protocol or research primitive tracked as a semantic object.

---

## Registry Role

protocol-relevant commitment primitive used for pre-reveal coordination, bid-based block production, proposer-builder interaction, encrypted flow, and delayed verification patterns, with naming mismatch in ENS suffix

---

## Linked Files

- **Anchor document:** `anchors/commitmentlayer.md`
- **Schema:** `schemas/commitmentlayer/0.1-draft/schema.json`

---

## Naming Context

- **ENS anchor:** `commitmentlayer.eth`
- **Canonical term:** commitment

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

- **EIP-7732 — Enshrined Proposer-Builder Separation**
  - URL: https://eips.ethereum.org/EIPS/eip-7732
  - Relevance: Primary protocol proposal for ePBS. Supports the commitment-related context around builder bids, proposer selection, payload reveal, and protocol-facing proposer-builder coordination.
  - Registry use: Supports `commitment` as a protocol-relevant primitive adjacent to ePBS, while preserving the `repairable` classification because `commitmentlayer.eth` contains a non-canonical `layer` suffix.

- **Payload Timeliness Committee (PTC) — an ePBS design**
  - URL: https://ethresear.ch/t/payload-timeliness-committee-ptc-an-epbs-design/16054
  - Relevance: Research discussion describing a committee-based ePBS design for payload timeliness. Useful for understanding why reveal timing, payload availability, and commitment satisfaction matter structurally.
  - Registry use: Supports the relationship between commitments, reveal guarantees, and validator-facing timing checks without treating `commitmentlayer.eth` as a canonical protocol term.

- **Future-Proofing Preconfirmations**
  - URL: https://ethresear.ch/t/future-proofing-preconfirmations/22618
  - Relevance: Research discussion examining how preconfirmation protocols interact with upcoming Ethereum protocol changes and how different guarantee types may remain compatible with evolving L1 mechanics.
  - Registry use: Supports the broader commitment context around future guarantees, while keeping preconfirmation-related semantics below core registry status.

- **Auditable Builder Bids with Optimistic Attestations in ePBS**
  - URL: https://ethresear.ch/t/auditable-builder-bids-with-optimistic-attestations-in-epbs/22224
  - Relevance: Research discussion connecting ePBS, auditable builder bids, attestations, inclusion-list adherence, and payload/block accountability.
  - Registry use: Supports the connection between bid-based block production, commitment accountability, and verification-facing builder behavior in Ethereum block-building research.

- **Builder Bidding Behaviors in ePBS**
  - URL: https://ethresear.ch/t/builder-bidding-behaviors-in-epbs/20129
  - Relevance: Research discussion analyzing how builder bidding strategies change under ePBS rules and reduced latency advantages.
  - Registry use: Provides adjacent context for bid-based block production and commitment-sensitive builder behavior without promoting `commitmentlayer.eth` to a core protocol anchor.

- **Based Preconfirmations**
  - URL: https://ethresear.ch/t/based-preconfirmations/17353
  - Relevance: Research discussion introducing based preconfirmations as fast promises in based sequencing and rollup contexts.
  - Registry use: Provides adjacent context for commitments as forward promises, but should not be used to promote `commitmentlayer.eth` to `core`.

## Source Notes

`commitmentlayer.eth` is intentionally classified as `repairable`: the underlying term `commitment` is technically relevant across ePBS, payload reveal, builder accountability, bid-based block production, and preconfirmation research, but the ENS suffix `layer` is not a canonical protocol term.

These references support commitment semantics as an emerging and protocol-adjacent primitive family. They do not imply that `commitmentlayer.eth` is an official Ethereum specification, an official protocol endpoint, or a canonical Ethereum naming surface.

This source list should be used to support cautious technical positioning only. It should not be used to imply that Ethereum has standardized a standalone “commitment layer” as a formal protocol component.
<!-- MANUAL-SOURCES:END -->
