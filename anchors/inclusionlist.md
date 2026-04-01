# Inclusion Lists (FOCIL)

**Associated ENS:** `inclusionlist.eth`  
**Canonical term:** Inclusion Lists / Fork-Choice Enforced Inclusion Lists (FOCIL)  
**Registry ID:** `inclusionlist`  
**Status:** Draft EIP  
**Classification:** Core

---

## Summary

This anchor tracks **Inclusion Lists**, including **Fork-Choice Enforced Inclusion Lists (FOCIL)**, as a protocol-level mechanism for enforcing **transaction inclusion constraints** within Ethereum.

Rather than coordinating transaction selection, inclusion lists introduce **consensus-enforced constraints on block construction**, limiting the ability of proposers and builders to exclude specific transactions.

---

## Context

Inclusion lists are designed to mitigate **transaction censorship** by introducing protocol-level guarantees on inclusion.

They ensure that certain transactions cannot be indefinitely excluded from the execution pipeline.

**FOCIL** extends this concept by embedding inclusion enforcement directly into **fork-choice rules**, making inclusion constraints part of **consensus behavior**, rather than optional coordination or external policy.

The primary specification associated with this mechanism is **EIP-7805**.

---

## Pipeline Position

Constraint Layer (Post-Order Flow, Pre-Finalization)

---

## Coordination Role

Inclusion lists do not coordinate actors directly.

Instead, they **constrain coordination outcomes** by:

- limiting proposer discretion over transaction inclusion  
- restricting builder optimization strategies  
- enforcing inclusion requirements through fork-choice dynamics  

They redefine how transaction selection interacts with consensus by introducing **hard inclusion constraints**.

---

## Constraint Dynamics

FOCIL introduces a structural tension between:

- **block value maximization** (builder incentives)  
- **mandatory inclusion constraints** (protocol enforcement)  

This results in a **constrained optimization problem**, where builders and proposers must satisfy inclusion requirements while attempting to preserve economic efficiency.

---

## Protocol Grounding

This mechanism is grounded in:

- EIP-7805  
- Ethereum research on inclusion enforcement  
- fork-choice rule modifications  
- censorship resistance design  

It represents a **consensus-layer intervention**, not an application-layer coordination mechanism.

---

## Structural Importance

FOCIL represents a shift from:

**discretionary inclusion → protocol-constrained inclusion**

This transformation affects:

- transaction selection authority  
- censorship resistance guarantees  
- proposer–builder interaction under constraints  

Inclusion becomes a **protocol-enforced boundary condition**, rather than an emergent coordination outcome.

---

## Semantic Stability

- **"Inclusion Lists"** → broadly adopted umbrella term  
- **"FOCIL"** → precise reference to fork-choice enforced implementations  

Semantic convergence is ongoing, but the concept is **progressively stabilizing** within protocol research.

---

## Naming Alignment

- **ENS anchor:** `inclusionlist.eth`  
- **Canonical terms:** Inclusion Lists / FOCIL  

The ENS aligns with a **high-confidence semantic surface**, closely tied to protocol development.

---

## Registry Role

- Track semantic convergence between inclusion lists and FOCIL  
- Document constraint-based inclusion mechanisms  
- Distinguish inclusion enforcement from coordination layers  
- Map inclusion constraints within Ethereum’s execution and consensus pipeline  

---

## Status

Draft EIP with high protocol relevance and strong likelihood of semantic persistence.

---

## Sources

Primary research references are documented in:

`schemas/inclusionlist/`
