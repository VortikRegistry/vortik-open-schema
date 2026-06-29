<!-- AUTO-GENERATED:START -->
# enshrined proposer-builder separation (ePBS) — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with `epbs.eth`.

It supports the machine-readable schema set and human-readable documentation set of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** vortik-semantic-registry
- **Registry version:** 0.6.4
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

- EIP-7732 — Enshrined Proposer-Builder Separation  
  https://eips.ethereum.org/EIPS/eip-7732

- EIP-7773 — Hardfork Meta: Glamsterdam  
  https://eips.ethereum.org/EIPS/eip-7773

- Why enshrine Proposer-Builder Separation? A viable path to ePBS  
  https://ethresear.ch/t/why-enshrine-proposer-builder-separation-a-viable-path-to-epbs/15710

- ePBS Design Constraints  
  https://ethresear.ch/t/epbs-design-constraints/18728

## Source Notes

ePBS is treated by Vortik as a core protocol-facing primitive because EIP-7732 defines Enshrined Proposer-Builder Separation and maps proposer-builder separation into Ethereum's consensus-layer design. EIP-7773 currently lists EIP-7732 / ePBS as Scheduled for Inclusion in Glamsterdam, which supports ePBS as a strong protocol-facing primitive. This is scheduled-inclusion and implementation-facing source state, not a claim of mainnet activation or finalized fork deployment.

This anchor is grounded in the transition from relay-mediated proposer-builder coordination toward protocol-defined proposer-builder interaction. EIP-7732 introduces in-protocol builders and the Payload Timeliness Committee (PTC); this source note treats PTC as an ePBS role/component, not as an independent registry anchor.

EIP-7732 defines the following ePBS containers and signed containers:

- `ExecutionPayloadBid`
- `SignedExecutionPayloadBid`
- `ExecutionPayloadEnvelope`
- `SignedExecutionPayloadEnvelope`

EIP-7732 describes delayed validation by decoupling consensus validation from execution validation. PTC members attest to payload timeliness without fully validating the execution payload, and execution validation is deferred until the next beacon block validation path.

The strongest semantic objects to monitor around this anchor are:

- builder
- proposer
- bid
- payload
- commitment
- signed bid
- payload reveal
- payload timeliness
- Payload Timeliness Committee (PTC)
- delayed validation

These references and notes are curated to support source traceability and semantic interpretation.

They should be updated only when primary protocol references, implementation materials, or Ethereum core development discussions materially change.
<!-- MANUAL-SOURCES:END -->
