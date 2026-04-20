# Ethereum Protocol Primitives

The Vortik Semantic Registry tracks protocol primitives emerging from Ethereum’s coordination architecture.

Primitives are **protocol-defined elements**, not abstractions or market concepts.

The registry does not define protocol rules.

It tracks:

- semantic convergence  
- structural alignment  
- terminology stabilization  

as they emerge through specification and implementation.

---

# System Model

Ethereum is evolving into a **mechanism design system** composed of:

- protocol-defined roles  
- commitment-based coordination  
- constraint enforcement  
- asynchronous validation  

It is not a pipeline, layer stack, or market system.

---

# Primitive Categories

## 1. Roles

Protocol-defined actors with enforced responsibilities:

- proposer  
- builder  
- attester  

Note:
"solver" is excluded as it is not a protocol role.

---

## 2. Objects (Data Structures)

Protocol-defined objects:

- ExecutionPayload  
- ExecutionHeader  
- BuilderBid  
- InclusionList  

These represent what is committed, transmitted, and verified.

---

## 3. Commitments

Mechanisms that allow coordination before full data revelation:

- execution payload commitments (ePBS)  
- signed bids (BuilderBid / SignedExecutionPayloadBid)  

This defines the shift toward:

→ commitment-based block production

---

## 4. Constraints

Protocol-enforced rules:

- inclusion constraints (FOCIL)  
- payload validity rules  
- timing constraints (payload delivery)  

Constraints restrict behavior of roles and objects.

---

# What is NOT a Primitive

The registry excludes:

- markets (execution market, builder market)  
- layers (execution layer, coordination layer)  
- flows (ordering flow, execution flow)  
- surfaces (order flow routing, solver networks)  

These are:

→ external coordination phenomena  
→ not protocol-defined elements  

---

# Structural Shift

Ethereum is transitioning from:

block = execution + consensus (synchronous)

to:

block = commitment (consensus)  
execution = deferred (asynchronous)

This introduces:

- builder as protocol role  
- bid as commitment object  
- separation of execution and validation  

---

# Primitive vs External Coordination

## Primitive
- defined in protocol  
- enforced by rules  
- deterministic  

## External Coordination
- off-chain or emergent  
- not enforced by protocol  
- subject to change  

Examples:

- builder → primitive  
- solver → external  
- order flow routing → external  

---

# Registry Position

Vortik:

- indexes protocol primitives  
- aligns naming with canonical terms  
- tracks semantic convergence  

It does not:

- define primitives  
- include external coordination systems  
- model execution markets  

---

# Final Principle

A term is only valid if:

→ it maps to a protocol-defined object, role, or constraint

Everything else is:

→ external  
→ unstable  
→ non-canonical
