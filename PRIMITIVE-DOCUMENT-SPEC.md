# Primitive Document Specification

## Purpose

This document defines the criteria required for a concept to be recognized as a valid primitive or coordination surface within the Vortik Semantic Registry.

It establishes the internal standard used to:

- accept or reject entries  
- classify coordination surfaces  
- maintain consistency across the registry  

---

## Definition

A primitive is a **structural element of coordination** within Ethereum.

It must represent:

- a protocol-level mechanism  
- a coordination role  
- or a technically grounded coordination surface  

A primitive is not:

- a narrative concept  
- a marketing abstraction  
- or a speculative label without grounding  

---

## Validation Criteria

A concept must satisfy at least one of the following:

### 1. Protocol Grounding

The primitive is explicitly defined or implied within:

- an EIP  
- consensus mechanisms  
- execution layer mechanics  

---

### 2. Coordination Function

The primitive performs a distinct role in coordination between actors, such as:

- proposer  
- builder  
- validator  
- solver  
- user / order flow origin  

---

### 3. Pipeline Position

The primitive maps to a defined stage within the Ethereum coordination pipeline:

- order flow  
- solver coordination  
- builder coordination  
- inclusion  
- finality  

Pipeline positioning is **interpretive**, but must be defensible.

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
- it cannot be positioned within the pipeline  
- it exists only as a broad abstraction without structure  
- it has no observable usage in research or implementation  

---

## Coordination Surfaces

Not all valid entries are primitives.

Some are **coordination surfaces**, which:

- represent emerging terminology  
- describe coordination patterns not yet formalized  
- may later converge into primitives  

These must be explicitly classified using the registry classification system.

---

## Naming Requirements

Each entry must have:

- a canonical technical term  
- a clearly defined conceptual scope  
- explicit separation between canonical naming and ENS naming  

If ENS naming deviates:

→ it must be explicitly classified (e.g. repairable)

---

## Classification Rules

Each entry must be assigned one classification:

- **core** — protocol-aligned primitive  
- **valid** — stable coordination surface  
- **repairable** — valid concept with naming misalignment  
- **premature** — ambiguous or unstable terminology  

Classification is applied at the schema level and may evolve over time.

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
- pipeline_position  
- coordination_role  
- protocol_grounding  
- naming  
- sources  

Schemas represent the **machine-readable semantic layer**.

---

## Consistency Rules

- An entry cannot exist without pipeline relevance  
- An entry cannot be classified without justification  
- An entry cannot be included without observable grounding  

---

## Evolution Rules

Entries may change classification over time:

- premature → valid  
- valid → core  
- repairable → aligned  

The registry reflects:

→ **semantic convergence, not assumption**

---

## Design Constraint

The registry does not create primitives.

It only recognizes and structures them.

---

## Final Principle

If a concept cannot be placed:

- in the coordination pipeline  
- in a coordination role  
- or in observable protocol evolution  

→ it does not belong in the registry.
