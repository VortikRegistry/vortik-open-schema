# Ethereum Protocol Primitives

The Vortik Semantic Registry tracks protocol primitives and related semantic surfaces emerging from Ethereum’s coordination architecture.

This document explains what Vortik means by **primitive**.

A primitive is a protocol-facing or research-grounded element that maps to a structurally meaningful object, role, constraint, or mechanism.

Not every registry anchor is a primitive.

Some anchors are external surfaces, repairable ENS names, premature concepts, or deprecated abstractions retained for comparison.

Vortik does not define Ethereum protocol rules.

It tracks:

- semantic convergence
- structural alignment
- terminology stabilization
- distinction between protocol-native and non-protocol-native terminology

as they emerge through specification, implementation, research, and infrastructure usage.

---

## System Model

Ethereum coordination is increasingly described through explicit protocol and infrastructure objects such as:

- protocol-defined roles
- signed bids
- payload commitments
- reveal behavior
- constraint enforcement
- validator and committee participation
- external coordination systems

It should not be reduced to a simple pipeline, layer stack, or market system.

Broad market and layer terminology may still appear in ecosystem discourse, but Vortik treats those terms cautiously unless they map to a stable technical object, role, constraint, or external coordination surface.

---

## Primitive Categories

Vortik uses the term **primitive** for high-signal semantic units that have strong structural grounding.

---

### 1. Roles

Roles are actors or actor-like functions with defined or emerging responsibilities.

Examples:

- proposer
- builder
- attester
- validator committee
- Payload Timeliness Committee (PTC)

Some roles are protocol-native.

Others may be external or emerging.

Vortik distinguishes between:

- protocol-facing roles
- external actors
- ecosystem-level participants

Example:

- `builder` is protocol-facing under ePBS.
- `solver` is currently treated as external.

---

### 2. Objects and Data Structures

Objects are protocol or implementation-facing structures that are committed, transmitted, revealed, or verified.

Examples:

- execution payload
- payload header
- builder bid
- signed execution payload bid
- inclusion list
- block access list

These terms matter because they often become more precise than broad market abstractions.

---

### 3. Commitments

Commitments are mechanisms or objects that allow coordination before full data revelation or final verification.

Examples:

- payload commitments
- signed bids
- pre-reveal commitments
- commit-before-reveal flows

This reflects the shift toward commitment-based coordination in block production and adjacent mechanisms.

---

### 4. Constraints

Constraints are rules or enforcement surfaces that restrict role behavior or block validity.

Examples:

- inclusion constraints
- FOCIL-style inclusion enforcement
- payload validity rules
- timing constraints
- reveal constraints

Constraints are important because they define what actors are allowed or required to do.

---

### 5. External Coordination Surfaces

Not all meaningful Ethereum coordination terminology is protocol-native.

Some surfaces are external but still important.

Examples:

- solver systems
- order flow auctions
- proving markets
- sequencing markets
- preconfirmation systems

These are not treated as core Ethereum L1 primitives unless stronger protocol grounding emerges.

They may still be tracked in the registry under external, premature, or repairable classifications.

---

## What Is Not a Protocol Primitive

The following are not treated as protocol primitives by default:

- broad markets
- generic layers
- vague flows
- unsupported narratives
- purely speculative concepts
- terms without technical grounding

Examples:

- execution market
- builder market
- blockspace market
- coordination layer
- execution layer as a generic abstraction

These may still be tracked as:

- deprecated abstractions
- external surfaces
- premature concepts
- historical framing

but they should not be mistaken for protocol primitives.

---

## Structural Shift

Ethereum coordination is moving from broad economic descriptions toward more explicit technical structures.

Earlier framing often described Ethereum through:

- markets
- layers
- generalized blockspace narratives
- informal execution pipelines

Newer protocol-facing language increasingly emphasizes:

- proposer-builder separation
- builder roles
- signed bids
- payload commitments
- inclusion lists
- fork-choice enforcement
- validator or committee participation
- reveal and timing behavior

This shift directly affects how Vortik classifies anchors.

---

## Primitive vs External Coordination

### Primitive

A primitive is typically:

- protocol-facing
- structurally bounded
- technically grounded
- represented in specifications, EIPs, implementation work, or stable research terminology

### External Coordination

External coordination is typically:

- off-protocol or Ethereum-adjacent
- dependent on infrastructure or markets
- not directly enforced by Ethereum L1
- still relevant to Ethereum’s broader coordination ecosystem

Examples:

| Term | Vortik treatment |
|---|---|
| builder | protocol-facing role |
| inclusion list | constraint |
| commitment | repairable primitive surface |
| solver | external actor |
| preconfirmation | premature external mechanism |
| order flow auction | external coordination surface |
| proving market | external coordination surface |
| sequencing market | external coordination surface |
| builder market | deprecated abstraction |
| execution market | deprecated abstraction |
| blockspace market | deprecated abstraction |

---

## Registry Position

Vortik:

- indexes protocol primitives
- tracks external coordination surfaces
- preserves deprecated abstractions for comparison
- aligns ENS naming with canonical technical terms
- separates canonical, repairable, premature, external, and deprecated surfaces
- tracks semantic convergence over time

It does not:

- define Ethereum protocol rules
- replace EIPs or specifications
- claim official protocol authority
- treat every ecosystem term as canonical
- convert watchlist terms into anchors without strong technical grounding

---

## Classification Relationship

The registry currently uses these classifications:

| Classification | Meaning |
|---|---|
| `core` | Strong protocol-facing semantic alignment |
| `repairable` | Valid underlying concept with imperfect ENS naming |
| `premature` | Real but not yet semantically stable |
| `external` | Ethereum-adjacent surface outside current L1 core |
| `deprecated` | Legacy or broad abstraction with reduced precision |

Primitive status should not be confused with registry inclusion.

A term can be included in Vortik without being a protocol primitive.

---

## Final Principle

A term has stronger primitive status when it maps to:

- a protocol-defined object
- a protocol-facing role
- a protocol-facing constraint
- an implementation-facing structure
- a stable research concept with clear technical boundaries

Terms that do not meet this standard may still be useful, but they should be classified carefully as external, premature, repairable, or deprecated.

Vortik’s value comes from this distinction.
