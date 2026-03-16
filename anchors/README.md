# Anchors

This directory contains minimal documentation for each semantic anchor tracked by the Vortik Semantic Registry.

Each anchor represents a conceptual surface within emerging Ethereum coordination primitives.

Anchors correspond to ENS identifiers used as stable semantic references for research areas such as:

- ePBS (EIP-7732)
- Inclusion Lists / FOCIL
- Preconfirmations
- Commitment signaling layers
- Builder markets
- Solver layers
- Execution markets
- Order flow auctions

These files are intentionally minimal and serve as orientation documents for each anchor.

Detailed metadata is defined in the corresponding JSON schemas under `/schemas/`.

---

## Anchor Index

The following anchors are currently documented:

- `epbs.eth` — Enshrined Proposer-Builder Separation research
- `inclusionlist.eth` — Inclusion enforcement primitives (FOCIL and related models)
- `commitmentlayer.eth` — Commitment signaling infrastructure
- `preconflayer.eth` — Preconfirmation coordination layers
- `fastfinality.eth` — Single-slot finality research track
- `buildermarket.eth` — Block builder market structures
- `solverlayer.eth` — Intent solver coordination networks
- `executionmarket.eth` — Execution market coordination layer
- `orderflowauction.eth` — Order flow auction routing infrastructure

Each anchor document provides a short explanation of the research area and the terminology surface tracked by the registry.

---

## Relationship With Schemas

Anchor documents are descriptive.

Formal metadata is defined in the `/schemas/` directory, where each primitive has a versioned JSON schema describing:

- identifier
- conceptual scope
- status
- research sources
- last reviewed date

---

## Relationship With the Registry

All anchors listed here are indexed in `registry.json`, which provides the canonical machine-readable mapping between:

ENS identifier → anchor document → schema location.

This allows tooling and research datasets to discover anchors programmatically.

---

## Design Philosophy

The registry intentionally separates three layers:

**ENS Anchors**  
Stable identifiers used to reference coordination primitives.

**Anchor Documents**  
Minimal human-readable explanations of the research surface.

**Schemas**  
Machine-readable metadata describing scope, terminology and references.

This layered model helps reduce naming drift as Ethereum research evolves.
