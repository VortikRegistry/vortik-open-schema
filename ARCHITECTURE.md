# Vortik Semantic Registry — Architecture

## Overview

Vortik is a semantic registry of Ethereum protocol primitives.

It maps, structures, and tracks terminology emerging from the protocol as it converges toward a stable coordination model.

The system does not define protocol rules and does not introduce new primitives.

Its function is to make the protocol **structurally legible** as:

- primitives (protocol objects)
- roles (protocol actors)
- constraints (protocol-enforced rules)

---

## Core Objective

To establish a structured, machine-readable layer that captures:

→ **canonical protocol terminology**  
→ **as it stabilizes through specification and implementation**

The registry tracks convergence — it does not anticipate or invent it.

---

## System Model

Ethereum is evolving into a **mechanism design system**, not a pipeline or layered stack.

Key properties:

- execution is separated from consensus (ePBS)
- commitments replace full payload visibility at proposal time
- constraints (e.g. inclusion lists) restrict builder behavior
- validation is partially asynchronous and multi-stage

The protocol defines:

- valid message types
- role responsibilities
- constraint enforcement rules

Economic behavior emerges within these constraints but is not itself part of the protocol definition.

---

## System Scope

The registry focuses strictly on protocol-aligned elements:

- primitives  
- roles  
- constraints  

And selectively tracks:

- coordination surfaces (only when grounded in real mechanisms)

The registry excludes:

- purely narrative abstractions  
- unstable market terminology  
- non-protocol layers  

---

## System Components

### 1. Registry

Location: `/registry.json`

The registry is the **source of truth**.

It provides a minimal index of semantic anchors and links to their definitions.

Each entry includes:

- identifier (id)  
- ENS mapping  
- reference to schema  
- reference to anchor document  

The registry does not encode full semantics.

It acts as a **stable pointer layer**.

---

### 2. Schemas

Location: `/schemas/{anchor}/{version}/schema.json`

Schemas define the **canonical semantic structure** of each entry.

They are:

- versioned  
- explicit  
- protocol-grounded  

Schemas include:

- canonical_term  
- classification  
- type (primitive / role / constraint / surface)  
- protocol grounding  
- naming alignment  

Schemas represent the **machine-readable semantic layer**.

---

### 3. Anchors

Location: `/anchors/`

Anchors are minimal human-readable representations.

Each anchor:

- describes a real protocol element  
- aligns naming with canonical terminology  
- clarifies semantic positioning  

Anchors do not define primitives.

They expose how primitives are **interpreted and referenced**.

---

### 4. Docs Layer

Location: `/docs/`

Public representation of the registry.

Includes:

- index views  
- semantic navigation  
- market-facing layer (derived, non-canonical)  

This layer is presentation, not source of truth.

---

### 5. Maps (Non-Canonical)

Location: `/maps/`

Maps are **interpretive views** of the system.

They are:

- derived from registry data  
- non-authoritative  
- subject to change  

They do not define structure and should not be treated as canonical representations of Ethereum.

---

## Conceptual Model

Ethereum is modeled as a coordination mechanism composed of:

### Primitives
Protocol-defined objects:

- ExecutionPayload  
- ExecutionHeader  
- BuilderBid  
- InclusionList  

### Roles
Protocol-defined actors:

- proposer  
- builder  
- attester  
- committees (PTC, IL)

### Constraints
Protocol-enforced rules:

- inclusion requirements  
- payload timeliness  
- bid validity  

### Surfaces (Secondary)
Observed coordination interfaces:

- builder interaction surfaces  
- order flow entry points  
- commitment exposure layers  

Surfaces are tracked only when grounded in real mechanisms.

---

## Primitive vs Surface Distinction

The registry prioritizes:

→ primitives  
→ roles  
→ constraints  

Over:

→ markets  
→ layers  
→ narrative abstractions  

Market language is treated as:

→ descriptive (external)  
→ not canonical (internal to protocol)

---

## Naming Principles

- Canonical protocol terminology overrides ENS naming  
- Precision is prioritized over familiarity  
- Misalignment is explicitly classified  
- Terminology must map to observable protocol structures  

---

## Classification System

Each entry is classified as:

- **core** — protocol-aligned primitive or role  
- **valid** — real coordination surface  
- **repairable** — valid concept with naming misalignment  
- **premature** — unstable or weakly defined term  
- **deprecated** — structurally invalid or obsolete term  

Classification evolves with protocol convergence.

---

## Design Philosophy

- Protocol defines structure, not narrative  
- Semantic clarity reduces coordination ambiguity  
- Value emerges from alignment, not speculation  
- Only observable mechanisms are indexed  

---

## System Constraints

- No speculative primitives  
- No narrative-driven entries  
- No abstraction without protocol grounding  
- No duplication of protocol definitions  

---

## System Status

The registry is transitioning from:

→ semantic exploration  

to:

→ protocol-aligned semantic infrastructure  

Current focus:

- consolidation of canonical primitives  
- removal of misaligned terminology  
- alignment with EIP-level convergence  

---

## Final Note

Vortik is not a protocol, layer, or market.

It is a **semantic registry of Ethereum’s coordination primitives**.

Its role is to make the protocol legible as it converges toward its final structural form.
