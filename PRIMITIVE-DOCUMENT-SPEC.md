# Primitive Document Specification

## Purpose

This document defines the criteria required for a concept to be recognized as a valid primitive, role, or coordination surface within the Vortik Semantic Registry.

It establishes the internal standard used to:

- accept or reject entries  
- classify coordination structures  
- maintain semantic consistency  

---

## Definition

A valid entry represents a **structural element of coordination** within Ethereum.

This may include:

- protocol primitives  
- coordination roles  
- enforcement mechanisms  
- coordination surfaces  

A valid entry is not:

- a narrative concept  
- a marketing abstraction  
- a speculative label without grounding  

---

## Validation Criteria

A concept must satisfy at least one of the following:

### 1. Protocol Grounding

The concept is defined or implied within:

- EIPs  
- consensus mechanisms  
- execution layer mechanics  

---

### 2. Coordination Role

The concept represents a distinct role in coordination, such as:

- proposer  
- builder  
- validator  
- solver  
- user / order flow origin  

---

### 3. Structural Position

The concept can be placed within Ethereum’s coordination structure, including:

- order flow access  
- solver coordination  
- payload construction  
- proposer-builder interaction (ePBS)  
- inclusion constraints (FOCIL)  
- commitment signaling  
- preconfirmation systems  
- finality  

Positioning is **interpretive**, not strictly sequential.

---

### 4. Observable Usage

The term appears in:

- research discussions  
- implementation contexts  
- protocol-related communication  

---

## Invalid Entries

A concept must be rejected if:

- it does not map to a real coordination role or mechanism  
- it cannot be positioned within coordination structure  
- it exists only as a broad abstraction without structure  
- it has no observable usage  

---

## Coordination Surfaces

Not all valid entries are primitives.

Some are **coordination surfaces**, which:

- describe interaction domains  
- capture emerging terminology  
- may not be protocol-defined  

These must be explicitly classified.

---

## Ambiguous Surfaces

Some entries represent unstable terminology clusters.

These:

- overlap multiple coordination domains  
- lack clear boundaries  
- should not be treated as canonical  

Example:

- execution coordination (executionmarket.eth)

---

## Legacy / Deprecated Concepts

Some concepts lose precision over time due to protocol evolution.

These must be classified as:

- **deprecated** (or equivalent classification)

Example:

- builder markets (replaced by protocol-defined builder roles under ePBS)

---

## Naming Requirements

Each entry must include:

- canonical technical term  
- clearly defined conceptual scope  
- explicit separation between canonical naming and ENS naming  

Naming mismatches must be classified (e.g. repairable).

---

## Classification Rules

Each entry must be assigned one classification:

- **core** — protocol-aligned primitive  
- **valid** — stable coordination surface  
- **repairable** — valid concept with naming misalignment  
- **premature** — ambiguous or unstable terminology  
- **deprecated** — concept losing structural relevance  

Classification evolves with semantic convergence.

---

## Required Fields (Schema Alignment)

Each entry must map to a schema containing:

- id  
- version  
- canonical_term  
- classification  
- status  
- type  
- summary  
- pipeline_position (interpretive)  
- coordination_role  
- protocol_grounding  
- naming  
- sources  

Schemas define the **machine-readable semantic layer**.

---

## Consistency Rules

- An entry must have structural relevance  
- Classification must be justified  
- Inclusion requires observable grounding  

---

## Evolution Rules

Entries may change classification over time:

- premature → valid  
- valid → core  
- repairable → aligned  
- valid → deprecated  

The registry reflects:

→ **semantic convergence, not assumption**

---

## Design Constraint

The registry does not create primitives.

It:

- observes  
- structures  
- tracks  

---

## Final Principle

If a concept cannot be placed within:

- coordination roles  
- coordination structure  
- or observable protocol evolution  

→ it does not belong in the registry.
