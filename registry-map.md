# Vortik Semantic Registry — Conceptual Coordination Map

The Vortik registry tracks semantic convergence across Ethereum coordination primitives, roles, constraints, external coordination surfaces, and deprecated abstractions.

These elements do not form a strict linear pipeline.

They represent interacting coordination domains across Ethereum’s increasingly explicit block production, inclusion, execution, and settlement architecture.

This document is interpretive.

It is not an Ethereum protocol specification.

---

## Coordination Model

Ethereum coordination can be interpreted through recurring semantic domains:

- proposer-builder separation
- block construction
- signed bids
- payload commitments
- payload reveal
- inclusion constraints
- validator and committee enforcement
- commitment and pre-reveal coordination
- preconfirmation and latency guarantees
- order flow access
- solver and intent resolution
- proof generation
- sequencing and ordering
- finality and consensus timing

These domains are:

- not strictly sequential
- partially overlapping
- differently grounded in protocol, research, and external infrastructure
- subject to semantic convergence or deprecation over time

---

## Structural Categories

The registry distinguishes between several semantic categories.

---

### 1. Core Protocol-Aligned Anchors

These anchors have strong semantic grounding and direct alignment with protocol-facing terminology.

| Anchor | Canonical term | Structural interpretation |
|---|---|---|
| `epbs.eth` | enshrined proposer-builder separation (ePBS) | Core proposer-builder separation primitive |
| `inclusionlist.eth` | fork-choice enforced inclusion lists (FOCIL) | Core inclusion constraint surface |

---

### 2. Repairable Anchors

These anchors capture a valid underlying concept, but the ENS wording is imperfect, approximate, or partially mismatched.

| Anchor | Canonical term | Structural interpretation |
|---|---|---|
| `commitmentlayer.eth` | commitment | Commitment primitive with naming mismatch caused by `layer` |
| `fastfinality.eth` | single-slot finality (SSF) | Finality roadmap primitive with approximate ENS wording |

---

### 3. Premature Anchors

These anchors track real or emerging concepts that are not yet stable enough to treat as canonical.

| Anchor | Canonical term | Structural interpretation |
|---|---|---|
| `preconflayer.eth` | preconfirmation (emergent) | External preconfirmation mechanism with naming mismatch caused by `layer` |

---

### 4. External Coordination Surfaces

These anchors track Ethereum-adjacent or off-protocol coordination surfaces that remain outside the current Ethereum L1 protocol core.

| Anchor | Canonical term | Structural interpretation |
|---|---|---|
| `solverlayer.eth` | solver (external) | External actor involved in intent resolution and execution strategy |
| `orderflowauction.eth` | order flow auctions (OFA) | External order-flow routing and auction surface |
| `provingmarket.eth` | proving markets | External proof-generation and zk infrastructure surface |
| `sequencingmarket.eth` | sequencing markets | External sequencing and ordering coordination surface |

---

### 5. Deprecated or Misaligned Abstractions

These anchors preserve older, broad, or market-oriented abstractions whose precision is reduced relative to current protocol-native terminology.

| Anchor | Canonical term | Structural interpretation |
|---|---|---|
| `buildermarket.eth` | builder | Legacy market framing displaced by protocol-native builder terminology |
| `executionmarket.eth` | execution (ambiguous) | Non-canonical execution-market abstraction with weak mapping to protocol objects |
| `blockspacemarket.eth` | blockspace markets | Legacy blockspace-market framing increasingly displaced by narrower primitives and roles |

---

## Current Anchor Map

| Anchor | Classification | Type | Status | Visibility |
|---|---:|---:|---:|---:|
| `epbs.eth` | core | primitive | implemented | featured |
| `inclusionlist.eth` | core | constraint | eip-active | featured |
| `commitmentlayer.eth` | repairable | primitive | research | standard |
| `preconflayer.eth` | premature | external_mechanism | research | standard |
| `fastfinality.eth` | repairable | primitive | research | standard |
| `solverlayer.eth` | external | external_actor | research | background |
| `orderflowauction.eth` | external | coordination_surface | research | standard |
| `provingmarket.eth` | external | coordination_surface | research | standard |
| `sequencingmarket.eth` | external | coordination_surface | research | standard |
| `buildermarket.eth` | deprecated | misaligned_abstraction | research | background |
| `executionmarket.eth` | deprecated | misaligned_abstraction | research | background |
| `blockspacemarket.eth` | deprecated | misaligned_abstraction | research | background |

---

## Interpretation

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

The registry therefore separates:

- protocol-native anchors
- repairable ENS surfaces
- premature but meaningful concepts
- external infrastructure surfaces
- deprecated or misaligned abstractions

---

## Structural Notes

Several semantic shifts are visible across the registry.

### ePBS

`epbs.eth` tracks proposer-builder separation becoming a protocol-facing primitive.

The important semantic cluster includes:

- proposer
- builder
- bid
- payload
- commitment
- payload reveal
- payload timeliness

---

### Inclusion Lists / FOCIL

`inclusionlist.eth` tracks inclusion lists as a protocol-facing constraint surface.

The important semantic cluster includes:

- inclusion list
- FOCIL
- inclusion guarantees
- fork-choice enforcement
- validator committee
- censorship resistance
- builder constraints
- proposer constraints

---

### Commitment

`commitmentlayer.eth` tracks commitment as a useful primitive, while preserving the mismatch introduced by the ENS suffix `layer`.

The concept is relevant across:

- ePBS
- signed bids
- payload reveal
- preconfirmations
- encrypted flow
- commit-before-reveal designs

---

### Preconfirmation

`preconflayer.eth` tracks preconfirmation as an emergent external mechanism.

The concept is important, but the naming remains unstable and the ENS suffix `layer` is not protocol-native.

---

### External Surfaces

Solver, order-flow, proving, and sequencing anchors remain useful as Ethereum-adjacent coordination surfaces.

They should not be interpreted as Ethereum L1 core primitives unless future protocol work gives them stronger grounding.

---

### Deprecated Abstractions

Builder-market, execution-market, and blockspace-market terms remain useful for historical and ecosystem comparison.

However, they are weaker than narrower terms such as:

- builder
- payload
- bid
- commitment
- inclusion list
- block access list
- proposer-builder interface

---

## Relationship to Maps

This document is a human-readable conceptual map.

Machine-readable or semi-structured views are maintained separately in:

- `registry.json`
- `anchors.index.json`
- `market.index.json`
- `maps/coordination-stack.json`
- `maps/coordination-surfaces.json`
- `maps/emerging-signals.json`

The maps are interpretive views over the registry.

They do not replace the registry and should not be treated as protocol specifications.

---

## Registry Role

Vortik does not implement Ethereum protocol logic.

It does not define official protocol terminology.

It:

- documents semantic convergence
- tracks ENS-anchored naming surfaces
- distinguishes canonical and non-canonical terminology
- separates protocol-native concepts from external infrastructure surfaces
- preserves deprecated abstractions for comparison
- provides structured schemas for machine-readable interpretation
- supports public navigation through generated registry interfaces

Its purpose is to act as an independent semantic registry for Ethereum coordination language.
