# Primitive Document Specification

## Purpose

This document defines the criteria required for a concept to be recognized as a valid primitive or semantic surface within the Vortik Semantic Registry.

It establishes the internal standard used to:

- accept or reject primitives  
- classify semantic surfaces  
- maintain consistency across the registry  

---

## Definition

A primitive is a **structural element of coordination** within Ethereum.

It must represent:

- a protocol-level mechanism  
- a coordination role  
- or a technically grounded interaction surface  

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
- consensus rules  
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
- visibility  
- builder coordination  
- inclusion  
- execution  
- finality  

---

### 4. Observable Usage

The term appears in:

- research discussions  
- implementation contexts  
- protocol-related communication  

---

## Invalid Primitives

A concept must be rejected if:

- it does not map to a real coordination role or mechanism  
- it cannot be positioned within the pipeline  
- it exists only as a broad abstraction (e.g. “market” without structure)  
- it has no observable usage in research or implementation  

---

## Semantic Surfaces

Not all valid entries are primitives.

Some are **semantic surfaces**, which:

- represent emerging terminology  
- describe coordination patterns not yet formalized  
- may later converge into primitives  

These must be explicitly classified as non-canonical.

---

## Naming Requirements

Each primitive must have:

- a canonical technical term  
- a clearly defined conceptual scope  
- explicit separation between canonical naming and ENS naming  

If ENS naming deviates:

→ it must be classified (e.g. repairable)

---

## Classification Rules

Each entry must be assigned one classification:

- **core** — protocol-aligned and structurally defined  
- **valid** — real coordination surface, not canonically fixed  
- **premature** — unstable or early-stage terminology  
- **speculative** — dependent on future evolution  
- **repairable** — valid concept, naming mismatch  
- **external** — tracked but not owned  

---

## Required Fields (Schema Alignment)

Each primitive must map to a schema containing:

- identifier  
- canonical_term  
- classification  
- conceptual_scope  
- pipeline_stage  
- status  
- sources  
- last_reviewed  

---

## Consistency Rules

- A primitive cannot exist without pipeline relevance  
- A primitive cannot be classified without justification  
- A primitive cannot be included without observable grounding  

---

## Evolution Rules

Primitives may change classification over time:

- premature → valid  
- valid → core  
- repairable → aligned  

The registry must reflect:

→ **semantic convergence, not assumption**

---

## Design Constraint

The registry does not create primitives.

It only recognizes and structures them.

---

## Final Principle

If a concept cannot be placed:

- in the pipeline  
- in coordination  
- or in observable protocol evolution  

→ it does not belong in the registry.
