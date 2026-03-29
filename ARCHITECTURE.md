# Vortik Semantic Registry — Architecture

## Overview

Vortik is a semantic registry designed to map and stabilize emerging terminology across Ethereum's coordination stack.

The system focuses on identifying, structuring and documenting:

- protocol primitives
- coordination roles
- pipeline stages
- technical surfaces

It is not a branding layer and not a speculative domain portfolio.

It is intended to function as a **semantic infrastructure layer** between:

- research
- implementation
- human interpretation

---

## Core Objective

To create a structured, machine-readable layer that captures **semantic convergence before formal standardization**.

---

## System Components

### 1. Registry

Location: `/registry.json`

The registry acts as the canonical index of all semantic anchors.

Each entry includes:

- ENS identifier
- canonical technical term
- classification
- role
- status
- associated schema
- anchor document

---

### 2. Anchors

Location: `/anchors/`

Each anchor represents one of:

- a protocol primitive
- a coordination mechanism
- a structural role
- a relevant economic or technical surface

Each anchor document provides:

- human-readable explanation
- semantic positioning
- naming justification
- contextual interpretation

---

### 3. Schemas

Location: `/schemas/{anchor}/`

Schemas define the structure of each primitive or surface.

They are:

- versioned
- machine-readable
- designed for future standardization

---

### 4. Sources

Located within each anchor directory.

Sources are categorized into:

- EIP references
- research threads
- technical discussions
- implementation signals

---

### 5. External Primitives

Location: `registry.json → external_primitives`

Tracks important primitives and concepts not currently represented by owned ENS domains.

Purpose:

- identify semantic gaps
- track naming convergence outside the registry
- monitor potential expansion areas

---

## Conceptual Model

Ethereum is modeled as a coordination pipeline:

1. Order Flow  
2. Visibility (Mempool / Encryption)  
3. Builder Coordination  
4. Inclusion  
5. Execution  
6. Finality  

The registry maps terminology to specific stages within this pipeline.

---

## Primitive vs Market

The system prioritizes:

👉 primitives and roles

over:

👉 broad market abstractions

Markets are treated as secondary semantic surfaces.

---

## Naming Principles

- Canonical technical naming takes priority over ENS wording
- Semantic precision is favored over narrative convenience
- Early terminology is tracked, but not assumed to be stable
- Naming mismatches are explicitly documented

---

## Classification System

Each anchor is classified as one of:

- **core** — aligned with protocol-level primitives
- **valid** — real surface, not canonically fixed
- **premature** — unstable or emerging naming
- **speculative** — dependent on future evolution
- **repairable** — concept valid, naming misaligned
- **external** — not owned, tracked separately

---

## Design Philosophy

- Semantic structure precedes adoption
- Naming clarity reduces interpretative fragmentation
- Infrastructure value comes from precision, not coverage
- Early mapping is only valuable if it remains technically grounded

---

## System Status

Vortik is currently transitioning from:

- conceptual semantic mapping

to:

- structured registry infrastructure

The focus is on consolidating high-quality primitive documents before expanding coverage.
