# Anchors

This directory contains the human-readable layer of the **Vortik Semantic Registry**.

Each file corresponds to a semantic anchor representing a protocol primitive, role, constraint, external coordination surface, or research-adjacent concept within Ethereum’s evolving coordination architecture.

---

## Purpose

Anchors provide structured human-readable descriptions of each tracked concept.

They are not intended to define Ethereum protocol rules.

They are intended to:

- document emerging terminology
- track semantic convergence
- distinguish protocol-native concepts from ecosystem-level abstractions
- preserve semantic context around ENS-anchored naming surfaces
- clarify when an ENS name is aligned, approximate, external, premature, or deprecated

---

## Canonical vs ENS Naming

Each anchor is associated with an ENS domain.

However:

- the ENS name does not define the primitive
- the canonical technical term defines the concept
- the registry records the relationship between ENS naming and technical terminology

When mismatches exist, they are explicitly documented and classified.

Examples:

- `epbs.eth` aligns strongly with ePBS.
- `inclusionlist.eth` aligns strongly with the human-readable inclusion-list surface around FOCIL.
- `commitmentlayer.eth` captures a valid primitive but includes the weaker suffix `layer`.
- `fastfinality.eth` captures the direction of the concept, but `single-slot finality (SSF)` is the more precise canonical term.
- `buildermarket.eth`, `executionmarket.eth`, and `blockspacemarket.eth` preserve older market-oriented abstractions that are increasingly less precise.

---

## Anchor Scope

Anchors correspond to structurally relevant coordination surfaces observed across Ethereum research, infrastructure, and implementation.

These may include:

- protocol primitives
- roles
- constraints
- external coordination actors
- external mechanisms
- ecosystem abstractions
- deprecated or misaligned terminology worth tracking for comparison

Inclusion is selective.

Each anchor must map to at least one of the following:

- a protocol-defined primitive
- a protocol-facing role
- a protocol-facing constraint
- a persistent external coordination function
- a technically grounded research surface
- a historically important semantic abstraction whose precision is changing

---

## Anchor Index

The following anchors are currently tracked.

### Core

Protocol-aligned anchors with strong semantic grounding.

- `epbs.eth` — enshrined proposer-builder separation (ePBS)
- `inclusionlist.eth` — fork-choice enforced inclusion lists (FOCIL)

### Repairable

Valid underlying concept, but with imperfect ENS alignment or terminology mismatch.

- `commitmentlayer.eth` — commitment
- `fastfinality.eth` — single-slot finality (SSF)

### Premature

Real or emerging concept, but not yet stable enough to treat as canonical.

- `preconflayer.eth` — preconfirmation (emergent)

### External

External or Ethereum-adjacent coordination surfaces that remain outside the current L1 protocol core.

- `solverlayer.eth` — solver (external)
- `orderflowauction.eth` — order flow auctions (OFA)
- `provingmarket.eth` — proving markets
- `sequencingmarket.eth` — sequencing markets

### Deprecated

Legacy, broad, or market-oriented abstractions with reduced precision relative to current protocol-native terminology.

- `buildermarket.eth` — builder
- `executionmarket.eth` — execution (ambiguous)
- `blockspacemarket.eth` — blockspace markets

---

## Relationship With Schemas

Anchor documents are descriptive.

Formal metadata is defined in `/schemas/`, where each anchor has a versioned JSON schema specifying structured properties such as:

- identifier
- canonical term
- semantic classification
- status
- type
- naming relationship
- research grounding
- source references

Schemas represent the machine-readable layer of the registry.

They should remain aligned with `registry.json` for core structural fields such as:

- `id`
- `canonical_term`
- `classification`
- `status`
- `type`
- `naming.ens`
- `naming.canonical`

---

## Relationship With the Registry

All anchors are indexed in `registry.json`, which provides the canonical mapping:

ENS → canonical term → classification → status → type → schema → anchor document

`registry.json` is the primary source of truth for the current state of each tracked anchor.

This enables:

- programmatic discovery
- structured analysis
- generated indexes
- semantic validation
- interoperability with tooling

---

## Design Model

The system is composed of three primary layers:

### ENS Anchors

Stable naming surfaces used as semantic entry points.

### Anchor Documents

Human-readable interpretation and contextual explanation.

### Schemas

Structured, versioned, machine-readable definitions.

---

## Semantic Interpretation

The registry may group anchors into recurring coordination domains such as:

- proposer-builder separation
- inclusion constraints
- commitments and reveal-based coordination
- preconfirmation and latency guarantees
- order flow access
- solver and intent resolution
- proof-generation coordination
- sequencing and ordering coordination
- finality and consensus timing

These groupings are interpretive.

They do not define a strict execution sequence and should not be treated as protocol specifications.

---

## Relationship to Maps

Some structural interpretations are represented in `/maps/`.

Maps should be understood as interpretive views over the registry, not as replacements for the registry itself.

Examples include:

- coordination surfaces
- coordination stack views
- emerging semantic signals

---

## Relationship to Research Layer

Some anchors may relate to broader structural interpretation developed in research-oriented documentation.

This should be understood as a complementary research layer, not as a protocol specification.

---

## Design Philosophy

- Semantic structure precedes standardization.
- Canonical naming overrides ENS wording.
- Precision is prioritized over coverage.
- Protocol-defined primitives supersede broad market abstractions.
- External coordination surfaces should be tracked without overstating L1 protocol alignment.
- Deprecated terminology can remain useful for historical comparison.
- Early mapping is only valuable if technically grounded.

---

## System Status

The registry is transitioning from conceptual semantic mapping to structured semantic infrastructure.

Current focus:

- consolidating protocol-aligned primitives
- separating primitive / role / constraint / external surface / deprecated abstraction
- reducing drift between registry, schemas, anchors, maps, and public docs
- identifying unstable terminology before convergence locks in
- preserving a clean boundary between stable anchors and emerging watchlist signals
