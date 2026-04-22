# Inclusion Lists (FOCIL)

**Associated ENS:** `inclusionlist.eth`  
**Canonical term:** fork-choice enforced inclusion lists (FOCIL)  
**Registry ID:** `inclusionlist`  
**Status:** EIP-active / fork-scoped relevance  
**Classification:** core  

---

## Summary

This anchor tracks **Inclusion Lists**, including **Fork-Choice Enforced Inclusion Lists (FOCIL)**, as a protocol-level mechanism for enforcing **transaction inclusion constraints** within Ethereum.

Rather than coordinating transaction selection directly, inclusion lists introduce **protocol-enforced constraints on block construction**, limiting the ability of proposers and builders to exclude specific transactions.

As Ethereum coordination becomes more explicit, inclusion enforcement increasingly behaves like a first-class protocol constraint rather than a soft social expectation.

---

## Context

Inclusion lists are designed to mitigate **transaction censorship** by introducing protocol-level guarantees on inclusion.

They ensure that certain transactions cannot be indefinitely excluded from the execution pipeline.

**FOCIL** extends this concept by embedding inclusion enforcement directly into **fork-choice rules**, making inclusion constraints part of **consensus behavior**, rather than optional coordination or external policy.

The primary specification associated with this mechanism is **EIP-7805**.

As protocol discussion and implementation-facing work have progressed, FOCIL has strengthened the semantic position of inclusion lists as a durable constraint surface within Ethereum coordination architecture.

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
- introducing validator- and committee-linked enforcement surfaces around inclusion guarantees  

They redefine how transaction selection interacts with consensus by introducing **hard inclusion constraints**.

---

## Constraint Dynamics

FOCIL introduces a structural tension between:

- **block value maximization** (builder incentives)  
- **mandatory inclusion constraints** (protocol enforcement)  

This results in a **constrained optimization problem**, where builders and proposers must satisfy inclusion requirements while attempting to preserve economic efficiency.

Inclusion is no longer treated only as an emergent outcome of incentives, but as a protocol-facing boundary condition with growing structural importance.

---

## Protocol Grounding

This mechanism is grounded in:

- EIP-7805  
- Ethereum research on inclusion enforcement  
- fork-choice rule modifications  
- validator and committee-linked enforcement discussion  
- censorship resistance and inclusion guarantees design  

It represents a **consensus-layer intervention**, not an application-layer coordination mechanism.

---

## Structural Importance

FOCIL represents a shift from:

**discretionary inclusion → protocol-constrained inclusion**

This transformation affects:

- transaction selection authority  
- censorship resistance guarantees  
- proposer-builder interaction under constraints  
- the boundary between optimization and mandatory protocol behavior  

Inclusion becomes a **protocol-enforced boundary condition**, rather than an emergent coordination outcome.

---

## Semantic Stability

- **"Inclusion Lists"** → durable umbrella term with strong human-readable clarity  
- **"FOCIL"** → precise reference to fork-choice enforced implementations  

Semantic convergence is no longer just exploratory. It is increasingly tied to protocol-facing terminology, making this one of the strongest constraint surfaces in the current registry.

---

## Naming Alignment

- **ENS anchor:** `inclusionlist.eth`  
- **Canonical term:** fork-choice enforced inclusion lists (FOCIL)  

The ENS aligns with a **high-confidence semantic surface**, closely tied to protocol development and inclusion-enforcement language.

---

## Registry Role

- Track semantic convergence between inclusion lists and FOCIL  
- Document constraint-based inclusion mechanisms  
- Distinguish inclusion enforcement from coordination layers  
- Map inclusion constraints within Ethereum’s execution and consensus pipeline  

---

## Status

FOCIL remains tied to an active EIP process in formal specification terms, but it now carries strong fork-scoped relevance and high protocol significance.

It should be understood as a core constraint surface with growing implementation and governance relevance, not merely as a loose research concept.

---

## Sources

Primary research references are documented in:

`schemas/inclusionlist/`
