# Vortik Semantic Registry Model

The **Vortik Semantic Registry** documents Ethereum coordination primitives, roles, constraints, external coordination surfaces, deprecated abstractions, and ENS-anchored naming surfaces.

Its goal is not to define Ethereum protocol rules.

Its goal is to track **semantic stabilization** as coordination structures become explicit across protocol research, implementation, infrastructure, and public terminology.

Vortik is an independent semantic registry.

It is not an official Ethereum specification.

---

## Conceptual Model

Each tracked entry is represented through several coordinated files and surfaces:

ENS identifier  
↓  
Registry index (`registry.json`)  
↓  
Versioned schema (`/schemas/`)  
↓  
Human-readable anchor documentation (`/anchors/`)  
↓  
Public and machine-readable outputs (`/docs/`, `/maps/`, generated indexes)

This separation allows:

- stable naming through ENS
- structured indexing through `registry.json`
- formal machine-readable definitions through schemas
- human-readable interpretation through anchors
- public navigation through generated documentation
- emerging signal tracking through maps

---

## Source of Truth

The formal source of truth is:

- `/schemas/`

The central index is:

- `registry.json`

`registry.json` maps each tracked anchor to:

- ENS name
- canonical term
- classification
- status
- type
- schema path
- anchor document
- market visibility metadata

Schemas provide the structured machine-readable definition for each anchor.

Anchors provide human-readable interpretation.

Maps provide interpretive views.

Generated outputs should not replace the registry or schemas as the canonical structured model.

---

## Anchors

Anchors represent semantic surfaces observed across Ethereum’s coordination architecture.

They do not define the protocol.

They document how the system is being described, stabilized, differentiated, or deprecated.

Anchors may represent:

- protocol primitives
- protocol-facing roles
- protocol-facing constraints
- external actors
- external mechanisms
- external coordination surfaces
- repairable ENS surfaces
- deprecated or misaligned abstractions

Examples include:

- enshrined proposer-builder separation (ePBS)
- fork-choice enforced inclusion lists (FOCIL)
- commitment
- preconfirmation
- solver
- order flow auctions
- proving markets
- sequencing markets
- single-slot finality (SSF)
- builder-market, execution-market, and blockspace-market legacy abstractions

---

## ENS as Semantic Anchors

ENS identifiers act as stable semantic entry points for tracked concepts.

However, the ENS name does not define the primitive.

The canonical technical term defines the concept.

Example mappings:

| ENS | Canonical term | Registry interpretation |
|---|---|---|
| `epbs.eth` | enshrined proposer-builder separation (ePBS) | Core protocol primitive |
| `inclusionlist.eth` | fork-choice enforced inclusion lists (FOCIL) | Core protocol-facing constraint |
| `commitmentlayer.eth` | commitment | Repairable primitive with `layer` mismatch |
| `preconflayer.eth` | preconfirmation (emergent) | Premature external mechanism |
| `fastfinality.eth` | single-slot finality (SSF) | Repairable finality primitive |
| `solverlayer.eth` | solver (external) | External actor |
| `orderflowauction.eth` | order flow auctions (OFA) | External coordination surface |
| `provingmarket.eth` | proving markets | External coordination surface |
| `sequencingmarket.eth` | sequencing markets | External coordination surface |
| `buildermarket.eth` | builder | Deprecated market abstraction |
| `executionmarket.eth` | execution (ambiguous) | Deprecated misaligned abstraction |
| `blockspacemarket.eth` | blockspace markets | Deprecated market abstraction |

These identifiers provide:

- continuity across research phases
- stable entry points for semantic interpretation
- a way to track divergence between ENS naming and canonical terminology
- a public naming surface for protocol, external, or deprecated semantic categories

---

## Registry Scope

The registry tracks coordination structures across Ethereum and Ethereum-adjacent infrastructure, including:

- protocol primitives
- protocol roles
- protocol constraints
- external actors
- external mechanisms
- order-flow and routing surfaces
- proof-generation infrastructure
- sequencing and ordering coordination
- preconfirmation and latency guarantee mechanisms
- finality evolution
- deprecated market-oriented abstractions

Surfaces are included only when they are grounded in at least one of the following:

- protocol specifications
- active EIPs
- Ethereum research
- implementation-facing terminology
- persistent ecosystem usage
- strategic semantic relevance
- historically important terminology whose precision is changing

Inclusion does not imply protocol standardization.

---

## Current System Interpretation

Ethereum coordination is increasingly described through:

- protocol-defined roles
- signed bids
- payload commitments
- reveal behavior
- inclusion constraints
- validator and committee enforcement
- external coordination surfaces
- implementation-facing objects

The registry reflects this shift by prioritizing:

- protocol-native terminology
- primitive / role / constraint distinctions
- external vs core separation
- naming precision
- explicit classification of deprecated abstractions

over:

- broad market-first abstractions
- informal layer terminology
- generic ecosystem labels without technical grounding

---

## Neutrality

The Vortik registry is not a governance system.

It does not define Ethereum standards.

It does not replace EIPs, specifications, client implementations, research threads, or Ethereum governance processes.

It operates as an independent semantic registry that:

- reduces ambiguity
- tracks terminology convergence
- maps ENS-anchored semantic surfaces
- distinguishes canonical and non-canonical terminology
- preserves deprecated abstractions for comparison
- separates protocol-native surfaces from external infrastructure surfaces

---

## Design Principle

The registry does not invent primitives.

It:

- observes
- structures
- classifies
- tracks
- preserves context

Semantic convergence is tracked from:

- protocol research
- active EIPs
- implementation discussions
- client-facing terminology
- coordination mechanisms
- persistent infrastructure usage

Early mapping is only valuable when technically grounded.

---

## Semantic Classification

Each entry is classified using the current registry model.

| Classification | Meaning |
|---|---|
| `core` | Strong protocol-facing semantic alignment |
| `repairable` | Valid underlying concept with imperfect ENS naming |
| `premature` | Real but not yet semantically stable |
| `external` | Ethereum-adjacent surface outside current L1 core |
| `deprecated` | Legacy or broad abstraction with reduced precision |

Classification evolves as protocol research, implementation, and terminology converge.

---

## Type Model

The registry may use types such as:

| Type | Meaning |
|---|---|
| `primitive` | Protocol or research primitive tracked as a semantic object |
| `constraint` | Constraint surface affecting coordination behavior |
| `external_actor` | External actor or participant outside the current L1 protocol core |
| `external_mechanism` | External or off-protocol mechanism related to Ethereum coordination |
| `coordination_surface` | Broad coordination surface across infrastructure or ecosystem behavior |
| `misaligned_abstraction` | Broad abstraction retained for comparison but not treated as canonical |

This type model helps distinguish what an anchor represents structurally.

---

## Relationship to Automation

The registry pipeline supports automated generation and synchronization for:

- schema structural fields
- `sources.md` auto-generated metadata sections
- `anchors.index.json`
- `market.index.json`
- public `docs/*` synchronization
- integrity validation

Manual references should be added only inside the protected manual section of each `sources.md` file.

Generated sections should not be manually edited unless the generation script itself is being changed.

---

## Relationship to Watchlist Signals

Not every emerging term becomes a registry anchor.

Emerging signals are tracked separately in:

- `maps/emerging-signals.json`

Watchlist signals may include candidate roles, mechanisms, primitives, or coordination surfaces that are not yet stable enough for anchor status.

A watchlist term should only move into the main registry when it gains stronger grounding through:

- EIPs
- specifications
- implementation usage
- client terminology
- persistent research convergence

---

## Final Note

Ethereum coordination is becoming structurally explicit.

Semantic structure often appears before standardization.

The Vortik Semantic Registry exists to capture that structure while preserving the distinction between:

- protocol-native terminology
- external infrastructure terminology
- emerging research terminology
- deprecated or misaligned abstractions

The registry’s value depends on disciplined classification, source grounding, and restraint.
