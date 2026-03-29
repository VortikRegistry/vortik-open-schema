# Anchors

This directory contains the human-readable layer of the **Vortik Semantic Registry**.

Each file corresponds to a semantic anchor representing a **protocol primitive, coordination mechanism, structural role, or technically grounded research surface** within Ethereum’s evolving coordination architecture.

---

## Purpose

Anchors provide minimal, structured descriptions of each tracked concept.

They are not intended to define the protocol, but to:

- document emerging terminology
- track semantic convergence
- distinguish canonical naming from approximate or ENS-based representations

---

## Canonical vs ENS Naming

Each anchor is associated with an ENS domain.

However:

**the ENS does not define the primitive**  
**the canonical technical term defines the primitive**

When mismatches exist, they are explicitly documented and classified.

---

## Anchor Scope

Anchors correspond to real surfaces within Ethereum’s coordination pipeline, including:

- proposer-builder separation (ePBS)
- inclusion enforcement (FOCIL)
- proposer commitments
- preconfirmation systems
- builder competition
- solver networks
- order flow auctions
- finality research (SSF)

Each anchor must map to:

- a real protocol primitive
- a coordination role
- or a technically grounded research surface

---

## Anchor Index

The following anchors are currently tracked:

### Core (protocol-aligned)
- `epbs.eth` — Enshrined Proposer-Builder Separation
- `inclusionlist.eth` — Inclusion Lists / FOCIL

### Valid (real but non-canonical surfaces)
- `buildermarket.eth` — Builder markets
- `orderflowauction.eth` — Order Flow Auctions (OFA)

### Premature (unstable or evolving terminology)
- `commitmentlayer.eth` — Commitment signaling / preconfirmation commitments
- `preconflayer.eth` — Preconfirmation systems
- `executionmarket.eth` — Execution coordination surface (ambiguous term)

### Repairable (valid concept, naming mismatch)
- `fastfinality.eth` — Single-Slot Finality (SSF)
- `solverlayer.eth` — Solver networks

---

## Relationship With Schemas

Anchor documents are descriptive.

Formal metadata is defined in `/schemas/`, where each anchor has a versioned JSON schema specifying:

- identifier
- conceptual scope
- semantic classification
- research sources
- status
- last reviewed

Schemas represent the **machine-readable layer of the registry**.

---

## Relationship With the Registry

All anchors are indexed in `registry.json`, which provides the canonical mapping:

ENS → canonical term → schema → anchor document

This enables:

- programmatic discovery
- structured analysis
- future interoperability with tooling

---

## Design Model

The system is composed of three layers:

### ENS Anchors
Stable identifiers used as semantic entry points.

### Anchor Documents
Minimal human-readable interpretation of each primitive or surface.

### Schemas
Structured, versioned, machine-readable definitions.

---

## Conceptual Model

Ethereum is interpreted as a coordination pipeline:

1. Order Flow
2. Visibility
3. Builder Coordination
4. Inclusion
5. Execution
6. Finality

Each anchor maps to one or more stages of this pipeline.

---

## Design Philosophy

- Semantic structure precedes standardization
- Canonical naming overrides ENS wording
- Precision is prioritized over coverage
- Early mapping is only valuable if technically grounded

---

## System Status

The registry is transitioning from:

conceptual semantic mapping  
→ structured semantic infrastructure

The current focus is consolidating high-quality primitive representations before expanding coverage.
