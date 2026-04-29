# Vortik Semantic Registry — Architecture

## Overview

Vortik is an independent semantic registry for Ethereum coordination.

It maps, structures, and tracks terminology emerging across Ethereum protocol research, implementation-facing discussion, infrastructure, and selected ENS-anchored naming surfaces.

The system does not define Ethereum protocol rules.

It does not introduce new primitives.

Its function is to make Ethereum coordination language structurally legible as it stabilizes across:

- primitives
- roles
- constraints
- external coordination surfaces
- deprecated or misaligned abstractions

Vortik is not an official Ethereum specification.

---

## Core Objective

The core objective of Vortik is to provide a structured, machine-readable registry that tracks semantic convergence.

It focuses on terminology as it becomes more precise through:

- protocol specifications
- active EIPs
- client and implementation discussions
- Ethereum research
- infrastructure usage
- persistent ecosystem terminology

The registry tracks convergence.

It does not invent convergence.

---

## System Model

Ethereum coordination is increasingly described through explicit protocol and infrastructure objects rather than broad market narratives.

Important coordination elements include:

- proposer-builder separation
- signed bids
- payload commitments
- payload reveal behavior
- inclusion constraints
- validator and committee enforcement
- pre-reveal coordination
- external order-flow, solver, proving, and sequencing systems
- finality and consensus timing

The protocol defines:

- valid message types
- role responsibilities
- constraint enforcement rules
- validation conditions
- state-transition requirements

Economic behavior may emerge around these structures, but broad market language is not treated as canonical unless it maps clearly to a stable technical object or coordination surface.

---

## System Scope

The registry tracks:

- protocol primitives
- protocol-facing roles
- protocol-facing constraints
- repairable ENS surfaces
- premature but meaningful concepts
- external coordination actors
- external coordination mechanisms
- broader coordination surfaces
- deprecated or misaligned abstractions retained for comparison

The registry excludes:

- unsupported narrative abstractions
- purely speculative primitives
- generic ecosystem labels without technical grounding
- market terminology that does not map to a stable role, primitive, constraint, or external surface

Inclusion in the registry does not imply Ethereum standardization.

---

## Source of Truth

The formal source of truth is:

- `/schemas/`

The central index is:

- `registry.json`

This distinction matters.

`registry.json` provides the current registry index and points to the relevant schema and anchor documents.

Schemas provide the versioned machine-readable definitions for each anchor.

Anchors provide human-readable interpretation.

Maps provide interpretive views.

Generated public files provide navigation and presentation.

---

## System Components

### 1. Registry Index

Location:

- `registry.json`

The registry index connects each tracked anchor to its structured and human-readable definitions.

Each entry may include:

- identifier
- ENS mapping
- canonical term
- classification
- status
- status label
- stage
- type
- role description
- schema path
- anchor document path
- market visibility metadata

`registry.json` should be treated as the central index of the system, not as the only semantic authority.

---

### 2. Schemas

Location:

- `/schemas/{anchor}/{version}/schema.json`

Schemas define the formal machine-readable structure of each tracked anchor.

They are:

- versioned
- explicit
- structured
- synchronized with the registry index for core fields
- intended for machine-readable interpretation

Schemas may include:

- `id`
- `version`
- `canonical_term`
- `classification`
- `status`
- `type`
- `summary`
- `coordination_role`
- `protocol_grounding`
- `naming`
- `sources`

Schemas are the formal source of truth declared by the registry.

---

### 3. Source Documents

Location:

- `/schemas/{anchor}/{version}/sources.md`

Source documents provide source context and terminology support for each anchor.

Each `sources.md` file contains:

- an auto-generated metadata section
- a protected manual source section

The auto-generated section is produced from `registry.json`.

The manual section is reserved for curated references, implementation notes, protocol links, and research context.

Manual source references must be added only inside the protected manual section.

---

### 4. Anchors

Location:

- `/anchors/`

Anchors are human-readable semantic documents.

Each anchor:

- describes the tracked concept
- explains naming alignment or mismatch
- clarifies protocol, external, repairable, premature, or deprecated status
- documents why the concept is included
- separates canonical terminology from ENS wording

Anchors do not define Ethereum protocol rules.

They explain how Vortik interprets and indexes the tracked semantic surface.

---

### 5. Maps

Location:

- `/maps/`

Maps are interpretive views over the registry.

They may include:

- coordination surfaces
- coordination stack views
- emerging signal watchlists

Maps are non-authoritative.

They help explain relationships, but they do not replace the registry index or schemas.

Emerging watchlist signals should remain in maps until they gain enough technical grounding to become registry anchors.

---

### 6. Public Docs

Location:

- `/docs/`

The `docs` directory contains the public GitHub Pages interface.

It may include:

- public registry views
- app interface
- market interface
- copied registry data
- copied maps
- copied schemas
- copied anchors
- generated indexes

The public docs are presentation and distribution surfaces.

They are not the source of truth.

---

### 7. Scripts

Location:

- `/scripts/`

Scripts support generation, synchronization, and validation.

Current automation includes:

- syncing selected schema fields from `registry.json`
- generating `sources.md` auto-generated sections
- generating `anchors.index.json`
- generating `market.index.json`
- generating market documentation
- generating market HTML
- syncing public docs
- validating file existence and integrity

Generated outputs should not be edited manually unless explicitly intended.

---

## Conceptual Model

Vortik currently models Ethereum coordination through the following semantic categories.

### Primitives

Protocol or research primitives tracked as semantic objects.

Examples:

- ePBS
- commitment
- single-slot finality

### Roles

Actors or role-like surfaces.

Examples:

- proposer
- builder
- validator committees
- external solvers

### Constraints

Coordination rules or enforcement surfaces.

Examples:

- inclusion lists
- FOCIL-style inclusion enforcement
- builder or proposer constraints

### External Actors

Actors outside the current Ethereum L1 protocol core.

Examples:

- solvers
- external routing participants
- Ethereum-adjacent execution actors

### External Mechanisms

Off-protocol or Ethereum-adjacent mechanisms related to coordination.

Examples:

- preconfirmation
- external guarantees
- latency-oriented coordination mechanisms

### Coordination Surfaces

Broad but technically grounded infrastructure surfaces.

Examples:

- order flow auctions
- proving markets
- sequencing markets

### Misaligned Abstractions

Legacy or broad abstractions retained for historical and comparative purposes.

Examples:

- builder markets
- execution markets
- blockspace markets

---

## Primitive vs Surface Distinction

The registry prioritizes:

- primitives
- roles
- constraints
- implementation-facing objects

over:

- broad market narratives
- informal layer terminology
- unsupported abstractions

Market language may still be tracked when it has historical, ecosystem, or external infrastructure relevance.

However, it is not treated as protocol-native unless it maps clearly to a specific primitive, role, constraint, or implementation-facing object.

---

## Naming Principles

- Canonical technical terminology overrides ENS wording.
- ENS names act as semantic entry points, not definitions.
- Precision is prioritized over familiarity.
- Misalignment is explicitly classified.
- External relevance should not be overstated as protocol-native status.
- Deprecated terminology can remain useful for historical comparison.
- Watchlist terms should not become anchors without strong technical grounding.

---

## Classification System

Each entry is classified using the current registry model.

| Classification | Meaning |
|---|---|
| `core` | Strong protocol-facing semantic alignment |
| `repairable` | Valid underlying concept with imperfect ENS naming |
| `premature` | Real but not yet semantically stable |
| `external` | Ethereum-adjacent surface outside current L1 core |
| `deprecated` | Legacy or broad abstraction with reduced precision |

Classification may evolve as protocol research, implementation, and terminology converge.

---

## Type System

The registry may use types such as:

| Type | Meaning |
|---|---|
| `primitive` | Protocol or research primitive tracked as a semantic object |
| `constraint` | Constraint surface affecting coordination behavior |
| `external_actor` | External actor or participant outside the current L1 protocol core |
| `external_mechanism` | External or off-protocol mechanism related to Ethereum coordination |
| `coordination_surface` | Broad coordination surface across infrastructure or ecosystem behavior |
| `misaligned_abstraction` | Broad abstraction retained for comparison but not treated as canonical |

This type system helps distinguish what each anchor represents structurally.

---

## Automation Model

The registry pipeline is designed to reduce drift between files.

Current automated flow:

1. Validate `registry.json`
2. Validate required maps
3. Sync schema fields from `registry.json`
4. Generate `sources.md` auto-generated sections
5. Clean schema formatting where applicable
6. Generate anchor index
7. Generate market index
8. Generate market documentation and HTML
9. Sync public docs
10. Validate integrity
11. Commit generated updates when running on push

The automation is designed to update derived or structured fields.

It should not overwrite curated manual source references.

Manual source references belong inside the protected manual sections of `sources.md`.

---

## System Constraints

Vortik should avoid:

- speculative primitives
- narrative-driven anchor creation
- unsupported market abstractions
- treating external surfaces as L1-native without evidence
- duplicating protocol definitions as if they were official specifications
- editing generated files manually when they are derived from scripts

Vortik should preserve:

- semantic discipline
- source grounding
- classification clarity
- distinction between core, external, premature, repairable, and deprecated surfaces
- separation between automated and curated content

---

## System Status

The registry is transitioning from semantic exploration to structured semantic infrastructure.

Current focus:

- maintaining `epbs.eth` and `inclusionlist.eth` as core anchors
- keeping schemas aligned with the registry index
- preserving curated source sections
- separating stable anchors from watchlist signals
- reducing drift across registry, schemas, anchors, maps, docs, and generated outputs
- avoiding overexpansion into weak or unsupported terminology

---

## Final Note

Vortik is not a protocol, official standard, governance body, market, or execution system.

It is an independent semantic registry for Ethereum coordination language.

Its role is to make Ethereum’s coordination terminology easier to inspect, compare, classify, and track as the protocol and its surrounding infrastructure evolve.
