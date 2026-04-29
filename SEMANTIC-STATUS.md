# Semantic Status

This document tracks the current semantic maturity of anchors referenced by the **Vortik Semantic Registry**.

Status reflects **semantic stabilization and registry classification**, not official Ethereum protocol authority.

The registry distinguishes between protocol-native terminology, repairable ENS surfaces, premature concepts, external coordination surfaces, and deprecated abstractions.

---

## Core

Core anchors are protocol-aligned anchors with strong semantic grounding.

They are the highest-confidence surfaces currently tracked by Vortik.

| Anchor ID | ENS | Canonical term | Type | Status |
|---|---|---|---|---|
| `epbs` | `epbs.eth` | enshrined proposer-builder separation (ePBS) | primitive | implemented |
| `inclusionlist` | `inclusionlist.eth` | fork-choice enforced inclusion lists (FOCIL) | constraint | eip-active |

These represent:

- protocol-facing coordination primitives or constraints
- high semantic convergence
- strong alignment between ENS naming and technical terminology
- priority anchors within the current registry

---

## Repairable

Repairable anchors capture a valid underlying concept, but include imperfect ENS wording, approximate terminology, or partial naming mismatch.

| Anchor ID | ENS | Canonical term | Type | Status |
|---|---|---|---|---|
| `commitmentlayer` | `commitmentlayer.eth` | commitment | primitive | research |
| `ssf` | `fastfinality.eth` | single-slot finality (SSF) | primitive | research |

These represent:

- useful semantic surfaces
- concepts with meaningful technical relevance
- naming that does not perfectly match the strongest canonical term
- anchors that should be monitored rather than treated as fully canonical

Examples:

- `commitmentlayer.eth` captures the important concept of **commitment**, but the suffix `layer` is not protocol-native.
- `fastfinality.eth` captures the direction of faster finality, but **single-slot finality (SSF)** is the more precise term.

---

## Premature

Premature anchors track real or emerging concepts that are not yet stable enough to treat as canonical.

| Anchor ID | ENS | Canonical term | Type | Status |
|---|---|---|---|---|
| `preconflayer` | `preconflayer.eth` | preconfirmation (emergent) | external_mechanism | research |

These represent:

- meaningful but still evolving concepts
- terminology that may converge, fragment, or be replaced
- surfaces with technical relevance but incomplete semantic stabilization

`preconflayer.eth` is tracked because preconfirmation is a real and important Ethereum-adjacent coordination phenomenon, but the ENS suffix `layer` remains non-canonical.

---

## External

External anchors track Ethereum-adjacent coordination surfaces that remain outside the current Ethereum L1 protocol core.

| Anchor ID | ENS | Canonical term | Type | Status |
|---|---|---|---|---|
| `solverlayer` | `solverlayer.eth` | solver (external) | external_actor | research |
| `orderflowauction` | `orderflowauction.eth` | order flow auctions (OFA) | coordination_surface | research |
| `provingmarket` | `provingmarket.eth` | proving markets | coordination_surface | research |
| `sequencingmarket` | `sequencingmarket.eth` | sequencing markets | coordination_surface | research |

These represent:

- off-protocol or Ethereum-adjacent actors and mechanisms
- rollup, intent, order-flow, proof-generation, or sequencing infrastructure
- useful semantic surfaces that should not be overstated as Ethereum L1 core primitives

External does not mean irrelevant.

It means the anchor is relevant to Ethereum coordination or adjacent infrastructure, but not currently protocol-native at L1.

---

## Deprecated

Deprecated anchors preserve older, broad, or market-oriented abstractions whose precision has decreased relative to current protocol-native terminology.

| Anchor ID | ENS | Canonical term | Type | Status |
|---|---|---|---|---|
| `buildermarket` | `buildermarket.eth` | builder | misaligned_abstraction | research |
| `executionmarket` | `executionmarket.eth` | execution (ambiguous) | misaligned_abstraction | research |
| `blockspacemarket` | `blockspacemarket.eth` | blockspace markets | misaligned_abstraction | research |

These represent:

- legacy ecosystem framing
- broad market-oriented terminology
- abstractions with weak mapping to current protocol objects
- surfaces retained for historical and comparative interpretation

They are tracked because semantic drift matters.

A term can lose precision while still remaining useful for understanding the evolution of Ethereum coordination language.

---

## Structural Shift

Ethereum coordination is increasingly described through:

- protocol-defined roles
- signed bids
- payload commitments
- reveal behavior
- inclusion constraints
- validator and committee enforcement
- external coordination surfaces
- implementation-facing objects

This weakens broad market-first terminology when that terminology does not map cleanly to protocol primitives, roles, constraints, or implementation-facing objects.

---

## Classification Summary

Vortik currently uses the following semantic classifications:

| Classification | Meaning |
|---|---|
| `core` | Strong protocol-facing semantic alignment |
| `repairable` | Valid underlying concept with imperfect ENS naming |
| `premature` | Real but not yet semantically stable |
| `external` | Ethereum-adjacent surface outside current L1 core |
| `deprecated` | Legacy or broad abstraction with reduced precision |

---

## Interpretation Rules

- Classification reflects semantic status, not official protocol status.
- Inclusion in the registry does not imply Ethereum standardization.
- ENS naming does not define the primitive; the canonical term does.
- Deprecated terms may remain useful for historical comparison.
- External terms may remain strategically important without being L1-native.
- Watchlist signals should not become anchors without strong technical grounding.

---

## Relationship to Registry

The current state of each anchor is indexed in:

- `registry.json`

Formal machine-readable definitions are maintained in:

- `schemas/*`

Human-readable interpretation is maintained in:

- `anchors/*`

Emerging watchlist signals are maintained separately in:

- `maps/emerging-signals.json`

---

## Current Focus

The current semantic focus of Vortik is:

- maintaining `epbs.eth` and `inclusionlist.eth` as core anchors
- tracking `commitmentlayer.eth` and `fastfinality.eth` as repairable but meaningful surfaces
- treating `preconflayer.eth` as premature but relevant
- preserving external surfaces without overstating L1 protocol alignment
- retaining deprecated market abstractions for comparison while prioritizing protocol-native terminology
- reducing drift across registry, schemas, anchors, maps, docs, and generated outputs

---

## Notes

- Terminology evolves as research, implementation, and protocol discussions converge.
- Classification may change over time as stronger technical evidence appears.
- Vortik is an independent semantic registry, not an official Ethereum specification.
