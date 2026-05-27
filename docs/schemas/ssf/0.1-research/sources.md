<!-- AUTO-GENERATED:START -->
# single-slot finality (SSF) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `fastfinality.eth`.

It supports the machine-readable and human-readable layers of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.4
- **Registry ID:** `ssf`
- **Associated ENS:** `fastfinality.eth`
- **Canonical term:** single-slot finality (SSF)
- **Classification:** repairable
- **Status:** research
- **Status label:** emerging
- **Stage:** research
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

finality primitive and roadmap surface targeting single-slot confirmation semantics, with ENS naming that approximates but does not exactly match the canonical SSF terminology

---

## Linked Files

- **Anchor document:** `anchors/fastfinality.md`
- **Schema:** `schemas/ssf/0.1-research/schema.json`

---

## Naming Context

- **ENS anchor:** `fastfinality.eth`
- **Canonical term:** single-slot finality (SSF)

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

- **Ethereum.org — Single Slot Finality**
  - URL: https://ethereum.org/roadmap/single-slot-finality/
  - Relevance: Ethereum.org roadmap page describing single-slot finality as the concept of proposing and finalizing blocks in the same slot.
  - Registry use: Supports `single-slot finality (SSF)` as the canonical technical surface tracked by the registry, while preserving `fastfinality.eth` as a repairable naming approximation rather than a canonical term.

- **Ethereum.org — A More Secure Ethereum**
  - URL: https://ethereum.org/roadmap/security/
  - Relevance: Ethereum.org roadmap context explaining SSF as a way to reduce finalization delay and improve resistance to certain recent-block reorganization risks.
  - Registry use: Supports the security and finality context for SSF without claiming that `fastfinality.eth` is an official Ethereum naming surface.

- **Ethereum.org — Ethereum Roadmap**
  - URL: https://ethereum.org/roadmap/
  - Relevance: Ethereum.org roadmap page listing Single Slot Finality as one of Ethereum’s long-term technical upgrade areas.
  - Registry use: Supports SSF as a roadmap-level research direction, not as a deployed protocol feature.

- **A Simple Single Slot Finality Protocol**
  - URL: https://ethresear.ch/t/a-simple-single-slot-finality-protocol/14920
  - Relevance: Ethereum Research discussion presenting a simple SSF protocol and discussing economic finality / accountable safety.
  - Registry use: Supports SSF as an active research primitive while keeping the anchor in `research` status.

- **Single Slot Finality**
  - URL: https://ethresear.ch/t/single-slot-finality/16700
  - Relevance: Ethereum Research discussion focused on SSF and design approaches for faster finality.
  - Registry use: Supports SSF terminology directly and reinforces that the tracked canonical term is `single-slot finality (SSF)`, not `fast finality`.

- **Single Slot Finality Based on Discrete Deposits**
  - URL: https://ethresear.ch/t/single-slot-finality-based-on-discrete-deposits/18199
  - Relevance: Ethereum Research discussion exploring SSF design constraints around validator sets, deposits, security, and decentralization.
  - Registry use: Supports cautious classification by documenting that SSF remains a complex research area rather than a finalized implementation.

- **3-Slot-Finality: SSF Is Not About "Single" Slot**
  - URL: https://ethresear.ch/t/3-slot-finality-ssf-is-not-about-single-slot/20927
  - Relevance: Ethereum Research discussion introducing 3-slot finality and widening the design space around faster finality.
  - Registry use: Supports the broader finality research context while reinforcing that `fastfinality.eth` is only an approximate ENS surface and should remain `repairable`.

- **Topics Tagged `single-slot-finality` on Ethereum Research**
  - URL: https://ethresear.ch/tag/single-slot-finality
  - Relevance: Topic index collecting Ethereum Research discussions tagged with single-slot finality.
  - Registry use: Useful as an ongoing research index for monitoring SSF-related discussion, not as a formal specification.

## Source Notes

`fastfinality.eth` is intentionally classified as `repairable`: the underlying finality direction is technically meaningful and visible in Ethereum roadmap and research materials, but the ENS name does not match the canonical technical term `single-slot finality (SSF)`.

The registry tracks `single-slot finality (SSF)` as the canonical term. The phrase `fast finality` is treated as an approximate and broader descriptive phrase, not as the formal Ethereum protocol label.

These references support SSF as a long-term Ethereum finality research surface. They do not imply that `fastfinality.eth` is an official Ethereum specification, an official protocol endpoint, or a canonical Ethereum naming surface.

This source list should be used to support cautious technical positioning only. It should not be used to claim that SSF has reached deployment, fork inclusion, or implementation convergence.
<!-- MANUAL-SOURCES:END -->
