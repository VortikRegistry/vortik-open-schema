Anchors

This directory contains the human-readable layer of the Vortik Semantic Registry.

Each file corresponds to a semantic anchor representing a protocol primitive, coordination mechanism, or research surface within Ethereum’s evolving coordination architecture.

---

Purpose

Anchors provide minimal, structured descriptions of each tracked concept.

They are not intended to define the protocol, but to:

- document emerging terminology
- track semantic convergence
- distinguish canonical technical concepts from approximate or ecosystem-level naming

---

Canonical vs ENS Naming

Each anchor is associated with an ENS domain.

However:

the ENS does not define the primitive
the canonical technical term defines the primitive

When mismatches exist, they are explicitly documented and classified.

---

Anchor Scope

Anchors correspond to structurally relevant coordination surfaces observed across Ethereum research, infrastructure, and implementation.

These include:

- protocol primitives (ePBS, FOCIL)
- coordination mechanisms (preconfirmations, commitments)
- execution coordination surfaces (solver networks)
- ecosystem abstractions (order flow auctions, builder markets)

Inclusion is selective.

Each anchor must map to:

- a protocol-defined primitive
- a persistent coordination function
- or a technically grounded research surface

---

Anchor Index

The following anchors are currently tracked:

Core (protocol-aligned primitives)

- "epbs.eth" — Enshrined Proposer-Builder Separation
- "inclusionlist.eth" — Inclusion Lists / FOCIL

Repairable (valid but imperfect or transitional abstractions)

- "buildermarket.eth" — Builder markets
- "orderflowauction.eth" — Order Flow Auctions (OFA)
- "commitmentlayer.eth" — Preconfirmation commitments
- "preconflayer.eth" — Preconfirmation systems
- "solverlayer.eth" — Solver networks
- "fastfinality.eth" — Single Slot Finality (SSF)

Premature (unstable or ambiguous terminology)

- "executionmarket.eth" — Execution coordination (ambiguous term)

---

Relationship With Schemas

Anchor documents are descriptive.

Formal metadata is defined in "/schemas/", where each anchor has a versioned JSON schema specifying:

- identifier
- conceptual scope
- semantic classification
- research grounding
- status

Schemas represent the machine-readable layer of the registry.

---

Relationship With the Registry

All anchors are indexed in "registry.json", which provides the canonical mapping:

ENS → canonical term → schema → anchor document

This enables:

- programmatic discovery
- structured analysis
- interoperability with tooling

---

Design Model

The system is composed of three layers:

ENS Anchors

Stable identifiers used as semantic entry points

Anchor Documents

Minimal human-readable interpretation

Schemas

Structured, versioned, machine-readable definitions

---

Semantic Interpretation

The registry may group anchors into recurring coordination clusters such as:

1. Order flow access
2. Solver coordination
3. Builder coordination
4. Inclusion
5. Commitments and preconfirmations
6. Finality

These groupings are interpretive and do not define a strict execution sequence.

---

Relation to Research Layer

Some anchors relate to the structural interpretation developed in:

- "docs/security-hourglass/"

This should be understood as a research layer complementing the registry, not a protocol specification.

---

Design Philosophy

- Semantic structure precedes standardization
- Canonical naming overrides ENS wording
- Precision is prioritized over coverage
- Protocol-defined primitives supersede market abstractions
- Early mapping is only valuable if technically grounded

---

System Status

The registry is transitioning from:

conceptual semantic mapping
→ structured semantic infrastructure

Current focus:

- consolidating protocol-aligned primitives
- refining coordination surfaces
- identifying unstable terminology before convergence locks in
