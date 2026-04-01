# Anchors

This directory contains the human-readable layer of the **Vortik Semantic Registry**.

Each file corresponds to a semantic anchor representing a **protocol primitive, coordination mechanism, market-adjacent structure, or technically grounded research surface** within Ethereum’s evolving architecture.

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

Anchors correspond to real surfaces discussed across Ethereum research, infrastructure, and implementation, including:

- proposer-builder separation (ePBS)
- inclusion enforcement (FOCIL)
- commitment signaling
- preconfirmation systems
- builder competition
- solver networks
- order flow auctions
- finality research (SSF)

Each anchor must map to:

- a real protocol primitive
- a market or coordination structure
- or a technically grounded research surface

---

## Anchor Index

The following anchors are currently tracked:

### Core (protocol-aligned)
- `epbs.eth` — Enshrined Proposer-Builder Separation
- `inclusionlist.eth` — Inclusion Lists / FOCIL

### Valid (real but non-canonical or non-enshrined surfaces)
- `buildermarket.eth` — Builder markets
- `orderflowauction.eth` — Order Flow Auctions (OFA)
- `fastfinality.eth` — Single Slot Finality (SSF)

### Repairable (valid concept, naming mismatch or imperfect fit)
- `commitmentlayer.eth` — Commitment signaling / preconfirmation commitments
- `preconflayer.eth` — Preconfirmation systems
- `solverlayer.eth` — Solver networks

### Premature (unstable or ambiguous terminology)
- `executionmarket.eth` — Execution coordination surface (ambiguous term)

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

## Semantic Interpretation

The registry may group anchors into recurring semantic clusters such as:

1. Order Flow
2. Routing / Auctions
3. Builder Coordination
4. Inclusion
5. Commitments / Preconfirmations
6. Finality

This grouping is interpretive.

It does **not** imply a strict protocol architecture or a canonical execution sequence.

---

## Relation to Research Layer

Some anchors also relate to the structural interpretation developed in:

- `docs/security-hourglass/`

That document should be read as a research layer complementing the registry,
not as a replacement for protocol definitions.

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
