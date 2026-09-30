<!-- AUTO-GENERATED:START -->
# blockspace markets — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `blockspacemarket.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `blockspacemarket`
- **Associated ENS:** `blockspacemarket.eth`
- **Canonical term:** blockspace markets
- **Classification:** deprecated
- **Status:** research
- **Status label:** deprecated
- **Stage:** research
- **Type:** misaligned_abstraction
- **Market priority:** low
- **Visibility:** background

---

## Semantic Classification

Legacy, broad, or market-oriented abstraction with reduced precision relative to protocol-native terminology.

---

## Type Interpretation

Broad abstraction retained for comparison but not treated as canonical.

---

## Registry Role

legacy pre-ePBS market framing increasingly displaced by protocol-native roles, commitments, payloads, inclusion constraints, and narrower execution-resource terminology

---

## Linked Files

- **Anchor document:** `anchors/blockspacemarket.md`
- **Schema:** `schemas/blockspacemarket/0.1-research/schema.json`

---

## Naming Context

- **ENS anchor:** `blockspacemarket.eth`
- **Canonical term:** blockspace markets

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

- [EIP-1559 — Fee market change for ETH 1.0 chain](https://eips.ethereum.org/EIPS/eip-1559): the Final specification for the congestion-responsive base fee, transaction fee caps, and priority fees.
- [EIP-7732 — Enshrined Proposer-Builder Separation](https://eips.ethereum.org/EIPS/eip-7732): distinguishes builder bids and proposer payments from transaction fee accounting.
- [EIP-7773 — Glamsterdam](https://eips.ethereum.org/EIPS/eip-7773): records the fork scope, including execution and gas-accounting changes.

## Source Notes

**Reviewed: 2026-09-30.** EIP-1559 provides a concrete fee-market reference. Blockspace remains an economic concept for scarce inclusion and execution capacity; protocol role definitions do not make fees or competition obsolete.

Vortik's `deprecated` label is retained for its broad semantic abstraction. It does not mean that Ethereum has deprecated blockspace markets. A transaction fee mechanism, a builder bid, and an inclusion constraint are distinct objects with their own specifications. This source review makes no claim about market size, adoption trends, or mainnet activation of Glamsterdam.
<!-- MANUAL-SOURCES:END -->
