<!-- AUTO-GENERATED:START -->
# preconfirmation (emergent) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `preconflayer.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.4
- **Registry ID:** `preconflayer`
- **Associated ENS:** `preconflayer.eth`
- **Canonical term:** preconfirmation (emergent)
- **Classification:** premature
- **Status:** research
- **Status label:** emerging
- **Stage:** research
- **Type:** external_mechanism
- **Market priority:** medium
- **Visibility:** standard

---

## Semantic Classification

Real or emerging concept that is not yet stable enough to treat as canonical.

---

## Type Interpretation

External or off-protocol mechanism related to Ethereum coordination.

---

## Registry Role

emergent off-protocol guarantee mechanism concerning likely inclusion, ordering, or execution outcome before final protocol confirmation, with naming mismatch in ENS suffix

---

## Linked Files

- **Anchor document:** `anchors/preconflayer.md`
- **Schema:** `schemas/preconflayer/0.1-draft/schema.json`

---

## Naming Context

- **ENS anchor:** `preconflayer.eth`
- **Canonical term:** preconfirmation (emergent)

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

- **Based Preconfirmations**
  - URL: https://ethresear.ch/t/based-preconfirmations/17353
  - Relevance: Foundational Ethereum Research discussion describing based preconfirmations as fast promises for based rollups and based sequencing contexts.
  - Registry use: Supports preconfirmation as an important emerging coordination mechanism while preserving the `premature` classification because the naming and implementation landscape remains unsettled.

- **Future-Proofing Preconfirmations**
  - URL: https://ethresear.ch/t/future-proofing-preconfirmations/22618
  - Relevance: Research discussion examining how preconfirmation protocols may interact with upcoming Ethereum protocol changes and how they can remain compatible with evolving L1 mechanics.
  - Registry use: Supports tracking preconfirmations as a live research surface, without treating `preconflayer.eth` as a canonical protocol term.

- **Based Preconfirmations with Multi-round MEV-Boost**
  - URL: https://ethresear.ch/t/based-preconfirmations-with-multi-round-mev-boost/20091
  - Relevance: Research discussion connecting based preconfirmations with the existing PBS / MEV-Boost pipeline and analyzing multi-round auction designs within a slot.
  - Registry use: Supports the relationship between preconfirmations, builder/proposer coordination, MEV infrastructure, and sequencing guarantees.

- **Preconfirmation Fair Exchange**
  - URL: https://ethresear.ch/t/preconfirmation-fair-exchange/21891
  - Relevance: Research discussion focused on fair exchange problems and enforcement considerations for preconfirmation protocols.
  - Registry use: Supports the idea that preconfirmations are not merely UX language, but a coordination and enforcement research problem involving promises, timing, and economic guarantees.

- **Preconfirmations Under the NO Lens**
  - URL: https://ethresear.ch/t/preconfirmations-under-the-no-lens/19975
  - Relevance: Research discussion analyzing preconfirmations from the perspective of node operators, delegation, and validator-facing coordination.
  - Registry use: Supports the connection between preconfirmations, validator/operator participation, and off-protocol coordination structures.

- **Nethermind — Awesome Preconfirmations**
  - URL: https://github.com/NethermindEth/awesome-preconfirmations
  - Relevance: Curated technical resource collecting preconfirmation-related materials, calls, references, and implementation context.
  - Registry use: Useful as an ecosystem map for the preconfirmation research area, but not a substitute for primary protocol specifications.

- **Towards an Implementation of Based Preconfirmations Leveraging Restaking**
  - URL: https://ethresear.ch/t/towards-an-implementation-of-based-preconfirmations-leveraging-restaking/19211
  - Relevance: Research discussion exploring implementation-oriented designs for based preconfirmations using restaking and proposer commitments.
  - Registry use: Supports the practical direction of preconfirmation infrastructure while keeping the anchor below core registry status.

- **Strawmanning Based Preconfirmations**
  - URL: https://ethresear.ch/t/strawmanning-based-preconfirmations/19695
  - Relevance: Research discussion examining simplified preconfirmation models, shortcomings, and design challenges.
  - Registry use: Supports cautious classification by documenting that preconfirmation designs remain contested and technically unsettled.

## Source Notes

`preconflayer.eth` is intentionally classified as `premature`: preconfirmations are a real and important research surface, but they do not currently have a single canonical Ethereum protocol specification, stable naming convergence, or one dominant implementation model.

The canonical term tracked by the registry is `preconfirmation (emergent)`, not `preconf layer`. The ENS suffix `layer` introduces naming risk and should be treated as a non-canonical abstraction.

These references support preconfirmations as an emerging coordination mechanism involving inclusion promises, execution guarantees, sequencing, validator/operator participation, and fair-exchange questions.

They do not imply that `preconflayer.eth` is an official Ethereum specification, an official protocol endpoint, or a canonical Ethereum naming surface.

This source list should be used to support cautious technical positioning only. It should not be used to claim that Ethereum has standardized a standalone “preconfirmation layer” as a formal protocol component.
<!-- MANUAL-SOURCES:END -->
