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

- protocol primitives  
- coordination roles  
- pipeline stages  
- technically grounded surfaces  

All entries must map to real or actively researched components within Ethereum.

---

## System Components

### 1. Registry

Location: `/registry.json`

The registry is the canonical index of all tracked primitives and surfaces.

Each entry includes:

- ENS identifier  
- canonical technical term  
- classification  
- coordination role  
- pipeline position  
- status  
- schema reference  
- anchor document  

The registry defines the **authoritative mapping layer** of the system.

---

### 2. Anchors

Location: `/anchors/`

Anchors are minimal human-readable representations of each tracked primitive or surface.

Each anchor must:

- describe a real coordination element  
- position the concept within the pipeline  
- clarify naming alignment vs canonical terminology  

Anchors do not define the primitive.

They expose its **semantic interpretation layer**.

---

### 3. Schemas

Location: `/schemas/{anchor}/`

Schemas define the machine-readable structure of each primitive or surface.

They are:

- versioned  
- explicit  
- non-interpretative  

Each schema specifies:

- identifier  
- canonical naming  
- semantic classification  
- conceptual scope  
- status  
- references  
- last reviewed  

Schemas represent the **formal semantic layer** of the registry.

---

### 4. Sources

Located within each anchor directory.

Sources are strictly tied to observable signals:

- EIP specifications  
- research discussions  
- implementation references  
- coordination mechanisms in development  

Sources are used to validate semantic positioning, not to interpret it.

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
2. Visibility (mempool / encrypted propagation)  
3. Builder Coordination  
4. Inclusion  
5. Execution  
6. Finality  

Each primitive or surface must map to one or more stages of this pipeline.

---

## Primitive vs Market

The registry prioritizes:

→ protocol primitives  
→ coordination roles  

over:

→ market abstractions  

Market-related concepts are treated as secondary and only included when technically grounded.

---

## Naming Principles

- Canonical technical terminology overrides ENS naming  
- Semantic precision is prioritized over readability  
- Early terminology is tracked but not assumed stable  
- Naming mismatches are explicitly classified and documented  

---

## Classification System

Each entry is classified as:

- **core** — aligned with protocol-level primitives  
- **valid** — real surface, not canonically fixed  
- **premature** — unstable or evolving terminology  
- **speculative** — dependent on future protocol direction  
- **repairable** — valid concept, misaligned naming  
- **external** — tracked outside ENS ownership  

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
