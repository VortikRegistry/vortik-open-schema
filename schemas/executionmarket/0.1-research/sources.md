<!-- AUTO-GENERATED:START -->
# execution (ambiguous) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `executionmarket.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `executionmarket`
- **Associated ENS:** `executionmarket.eth`
- **Canonical term:** execution (ambiguous)
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

non-canonical market framing that does not map cleanly to any single protocol primitive, role, constraint, or execution object, and is increasingly pressured by narrower terms such as payload, commitment, builder, inclusion list, and block access list

---

## Linked Files

- **Anchor document:** `anchors/executionmarket.md`
- **Schema:** `schemas/executionmarket/0.1-research/schema.json`

---

## Naming Context

- **ENS anchor:** `executionmarket.eth`
- **Canonical term:** execution (ambiguous)

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

- [EIP-7732 — Enshrined Proposer-Builder Separation](https://eips.ethereum.org/EIPS/eip-7732): defines proposer-builder interactions and payload handling.
- [EIP-7928 — Block-Level Access Lists](https://eips.ethereum.org/EIPS/eip-7928): defines block access data used for execution and state processing.
- [EIP-8037 — State Creation Gas Cost Increase](https://eips.ethereum.org/EIPS/eip-8037) and [EIP-8038 — State-access gas cost update](https://eips.ethereum.org/EIPS/eip-8038): address distinct gas-accounting changes.
- [EIP-7773 — Glamsterdam](https://eips.ethereum.org/EIPS/eip-7773): records these proposals as Scheduled for Inclusion.

## Source Notes

**Reviewed: 2026-09-30.** Glamsterdam brings specific execution, block-production, and resource-accounting changes. BALs, payload bids, state creation, and state access have different meanings and must not be collapsed into one mechanism.

The cited specifications do not define a bounded L1 object called an execution market. Vortik retains `deprecated` for that broad registry abstraction. This is not a claim that execution-related economic activity is disappearing, or that Glamsterdam has activated on mainnet.
<!-- MANUAL-SOURCES:END -->
