# Vortik Semantic Registry — Architecture

## Overview

Vortik is a semantic registry designed to map, structure, and stabilize terminology emerging across Ethereum’s coordination architecture.

The system operates as a **semantic infrastructure layer**, positioned between:

- protocol research  
- implementation  
- human interpretation  

It does not define protocol rules and does not introduce new primitives.

Its function is to **track and organize semantic convergence** as it emerges.

---

## Core Objective

To establish a structured, machine-readable layer that captures:

→ **canonical terminology surfaces**  
→ **before formal standardization occurs**

---

## System Scope

The registry focuses on identifying and structuring:

- coordination primitives  
- coordination roles  
- pipeline stages  
- technically grounded surfaces  

All entries must map to real or actively researched components within Ethereum.

---

## System Components

### 1. Registry

Location: `/registry.json`

The registry is a **lightweight index of semantic anchors**.

Each entry includes:

- identifier (id)  
- ENS mapping  
- reference to a versioned schema  
- reference to a human-readable anchor document  

The registry does not encode full semantic descriptions.

Instead, it acts as a **stable reference layer**, delegating detailed metadata to schemas.

---

### 2. Anchors

Location: `/anchors/`

Anchors are minimal human-readable representations of each tracked primitive or surface.

Each anchor:

- describes a real coordination element  
- positions the concept within the pipeline  
- clarifies naming alignment vs canonical terminology  

Anchors do not define the primitive.

They expose its **semantic interpretation layer**.

---

### 3. Schemas

Location: `/schemas/{anchor}/{version}/schema.json`

Schemas define the machine-readable structure of each primitive or surface.

They are:

- versioned  
- explicit  
- non-interpretative  

Schemas may include:

- canonical_term  
- classification (core / valid / repairable / premature)  
- pipeline_position  
- coordination_role  
- protocol_grounding  
- related_terms  
- references  
- last_reviewed  

Schemas represent the **semantic layer** of the registry.

---

### 4. Sources

Located within each anchor directory.

Sources are tied to observable signals:

- EIP specifications  
- research discussions  
- implementation references  
- coordination mechanisms in development  

Sources validate semantic positioning, not interpret it.

---

### 5. External Primitives

Location: `registry.json → external_primitives`

Tracks relevant primitives not currently mapped to owned ENS identifiers.

Purpose:

- identify missing canonical surfaces  
- monitor terminology convergence outside the registry  
- guide future expansion  

---

## Conceptual Model

Ethereum is modeled as a coordination pipeline:

1. Order Flow  
2. Order Flow Routing  
3. Solver Coordination  
4. Execution Coordination  
5. Builder Coordination  
6. Inclusion  
7. Commitment Signaling  
8. Preconfirmation  
9. Finality  

Each primitive may map to one or more stages.

The model is conceptual and does not represent a strict protocol specification.

---

## Primitive vs Market

The registry prioritizes:

→ protocol primitives  
→ coordination roles  

over:

→ market abstractions  

Market-related concepts are included only when technically grounded in coordination mechanisms.

---

## Naming Principles

- Canonical technical terminology overrides ENS naming  
- Semantic precision is prioritized over readability  
- Early terminology is tracked without assuming stability  
- Naming mismatches are explicitly classified  

---

## Classification System

Each entry is classified as:

- **core** — protocol-aligned primitive  
- **valid** — real coordination surface, not canonical  
- **repairable** — valid concept with naming misalignment  
- **premature** — unstable or ambiguous terminology  

Classification is applied at the schema level and may evolve over time.

---

## Design Philosophy

- Semantic structure precedes standardization  
- Naming clarity reduces coordination friction  
- Infrastructure value derives from precision, not coverage  
- Mapping is only valid when grounded in real protocol surfaces  

---

## System Constraints

- No speculative primitives without technical basis  
- No reliance on branding or narrative framing  
- No assumption of future standardization  
- No abstraction without identifiable coordination relevance  

---

## System Status

The registry is transitioning from:

→ conceptual semantic mapping  

to:

→ structured semantic infrastructure  

Current focus:

- consolidation of high-confidence primitives  
- elimination of ambiguous surfaces  
- alignment with observable protocol evolution
