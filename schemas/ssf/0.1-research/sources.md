<!-- AUTO-GENERATED:START -->
# single-slot finality (SSF) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `fastfinality.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.5
- **Registry ID:** `ssf`
- **Associated ENS:** `fastfinality.eth`
- **Canonical term:** single-slot finality (SSF)
- **Classification:** repairable
- **Status:** research
- **Status label:** emerging
- **Stage:** research
- **Type:** primitive
- **Market priority:** medium
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

- **Ethereum Foundation Protocol Consensus — Fast Finality**
  - URL: https://consensus.ethereum.foundation/themes/fast-finality
  - Relevance: Names Fast Finality as an explicit research area focused on reducing Ethereum's finalization time while preserving dynamic availability, accountable safety, and validator-set decentralization.
  - Registry use: Supports `fast finality` as a source-backed umbrella research objective rather than merely an informal substitute for SSF.

- **Ethereum Foundation Protocol Consensus — Upgrading Finality 1: Decoupling Consensus**
  - URL: https://consensus.ethereum.foundation/blog/upgrading-finality-edition-1
  - Relevance: Describes Fast Finality as a broad program of incremental upgrades involving consensus architecture, validator-set management, aggregation, networking, and timing.
  - Registry use: Supports a wider scope than exact same-slot finality and reinforces the distinction between the umbrella program and a specific SSF target.

- **Ethereum Foundation Protocol Consensus — Finality Stakeholder Research**
  - URL: https://consensus.ethereum.foundation/articles/stakeholder-research
  - Relevance: Evaluates stakeholder requirements and trade-offs for faster finality, including meaningful improvements below one minute without requiring an exact one-slot outcome.
  - Registry use: Supports Fast Finality as a practical research and design surface with multiple possible timing targets.

- **Ethereum.org — Single Slot Finality**
  - URL: https://ethereum.org/roadmap/single-slot-finality/
  - Relevance: Defines SSF as proposing and finalizing blocks in the same slot and states that SSF remains in the research phase.
  - Registry use: Supports `single-slot finality (SSF)` as the canonical technical term retained by the `ssf` registry entry and as a narrower target within the wider Fast Finality space.

- **EIP-8062 — Add sweep withdrawal fee for `0x01` validators**
  - URL: https://eips.ethereum.org/EIPS/eip-8062
  - Relevance: Uses explicit fast-finality roadmap language and connects that roadmap to reducing the active validator set through consolidation.
  - Registry use: Supports Fast Finality as roadmap-level terminology while preserving that EIP-8062 is not itself a finality specification or deployment schedule.

- **A Simple Single Slot Finality Protocol**
  - URL: https://ethresear.ch/t/a-simple-single-slot-finality-protocol/14920
  - Relevance: Presents an SSF protocol and discusses economic finality and accountable safety.
  - Registry use: Supports SSF as a recognized research primitive while keeping the anchor in `research` status.

- **Single Slot Finality**
  - URL: https://ethresear.ch/t/single-slot-finality/16700
  - Relevance: Explores SSF design approaches and constraints.
  - Registry use: Supports SSF terminology directly without implying that SSF exhausts the broader Fast Finality research area.

- **Single Slot Finality Based on Discrete Deposits**
  - URL: https://ethresear.ch/t/single-slot-finality-based-on-discrete-deposits/18199
  - Relevance: Explores SSF constraints around validator sets, deposits, security, and decentralization.
  - Registry use: Supports cautious research classification rather than deployment or implementation claims.

- **3-Slot-Finality: SSF Is Not About "Single" Slot**
  - URL: https://ethresear.ch/t/3-slot-finality-ssf-is-not-about-single-slot/20927
  - Relevance: Widens the design space beyond exact same-slot finality and demonstrates that faster-finality work can include alternative timing targets.
  - Registry use: Supports Fast Finality as the broader umbrella while SSF remains one design family within it.

- **Fast Finality source audit**
  - Path: `docs/research/fast-finality-source-audit.md`
  - Relevance: Records the primary-source comparison between Fast Finality and SSF and the decision boundary for this conservative update.
  - Registry use: Documents why the public anchor framing changed without modifying registry constants or classification.

## Source Notes

The registry continues to track `single-slot finality (SSF)` as the canonical term for registry ID `ssf`, with `classification: repairable`, `status: research`, and `type: primitive` unchanged.

Current official terminology distinguishes two related scopes:

```text
Fast Finality
  = broader Ethereum consensus research objective and program surface

Single-slot finality (SSF)
  = a specific same-slot target or design family within that broader surface
```

`fastfinality.eth` is therefore strongly aligned with the official umbrella research-area label, while remaining non-identical in scope to the narrower canonical term stored by the registry. The retained `repairable` classification reflects that scope difference; it does not treat Fast Finality as invalid, informal, less legitimate, or displaced by SSF.

These sources support active research relevance only. They do not imply fork scheduling, activation dates, mainnet deployment, implementation convergence, or official status for the ENS name.
<!-- MANUAL-SOURCES:END -->
