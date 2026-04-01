# Inclusion Lists (FOCIL)

**Associated ENS:** `inclusionlist.eth`  
**Canonical term:** Inclusion Lists / Fork-Choice Enforced Inclusion Lists (FOCIL)  
**Registry ID:** `inclusionlist`  
**Status:** Draft EIP  
**Classification:** Core

---

## Summary

This anchor tracks **Inclusion Lists**, including **Fork-Choice Enforced Inclusion Lists (FOCIL)**, as a protocol-level mechanism for enforcing transaction inclusion constraints within Ethereum.

Rather than coordinating transaction selection, inclusion lists impose **constraints on block construction**, limiting the ability of proposers and builders to exclude specific transactions.

---

## Context

Inclusion lists are designed to mitigate transaction censorship in block construction by introducing protocol-level constraints on inclusion.

They ensure that certain transactions cannot be indefinitely excluded from the execution pipeline.

FOCIL extends this mechanism by integrating inclusion enforcement directly into fork-choice rules, making inclusion constraints part of consensus dynamics rather than optional coordination.

The primary specification associated with this surface is **EIP-7805**.

---

## Pipeline Position

Inclusion (Constraint Layer)

---

## Coordination Role

Inclusion lists do not coordinate actors directly.

Instead, they constrain coordination by:

- limiting proposer discretion over transaction inclusion  
- restricting builder optimization strategies  
- enforcing inclusion requirements through fork-choice dynamics  

They reshape how transaction selection interacts with consensus.

---

## Constraint Dynamics

FOCIL introduces a structural tension between:

- **block value maximization** (builder incentives)  
- **mandatory inclusion constraints** (protocol enforcement)  

This creates a constrained optimization environment in which builders and proposers must satisfy inclusion requirements while attempting to preserve economic efficiency.

---

## Protocol Grounding

This mechanism is grounded in:

- EIP-7805  
- Ethereum research on inclusion enforcement  
- fork-choice rule modifications  
- censorship resistance design work  

---

## Structural Importance

FOCIL represents a shift from **discretionary inclusion** to **protocol-constrained inclusion**.

This changes:

- how transaction selection power is exercised  
- how censorship resistance is enforced  
- how builder and proposer roles interact under constraints  

It introduces inclusion as a **protocol-enforced boundary condition**, not a coordination outcome.

---

## Semantic Stability

The term **Inclusion Lists** is broadly used, while **FOCIL** provides a more precise reference to fork-choice enforced implementations.

Semantic convergence is ongoing but progressing toward stable terminology.

---

## Naming Alignment

- **ENS anchor:** `inclusionlist.eth`  
- **Canonical terms:** Inclusion Lists / FOCIL  

Naming is partially stabilized, with increasing adoption of FOCIL in technical discussions.

---

## Registry Role

- Track semantic convergence between inclusion lists and FOCIL  
- Document constraint-based inclusion mechanisms  
- Distinguish inclusion enforcement from coordination layers  
- Map inclusion constraints within Ethereum’s coordination pipeline  

---

## Status

Draft EIP with high protocol relevance and active research development.

---

## Sources

Primary research references are documented in:

`schemas/inclusionlist/`
