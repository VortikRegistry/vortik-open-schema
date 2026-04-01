# Order Flow Auctions

**Associated ENS:** `orderflowauction.eth`  
**Canonical term:** Order Flow Auctions (OFA)  
**Registry ID:** `orderflowauction`  
**Status:** Research  
**Classification:** Semi-stable

---

## Summary

This anchor tracks **Order Flow Auctions (OFA)** as a coordination mechanism governing **access to transaction flow** within Ethereum’s execution pipeline.

Rather than simple routing, OFA define how order flow is **captured, priced, and allocated** before entering block construction.

---

## Context

Order flow auctions are mechanisms in which transaction flow is auctioned among competing execution agents.

They are used to:

- route transactions through competitive mechanisms  
- internalize and redistribute MEV  
- enable competition between solvers and execution strategies  

This surface has emerged alongside:

- private order flow systems  
- intent-based execution  
- solver networks  
- MEV mitigation strategies  

---

## Pipeline Position

Order Flow (Access Layer) → Solver Networks → Builder Markets → ePBS

---

## Coordination Role

OFA do not only route transactions.

They coordinate **who gets access to order flow**, shaping:

- which transactions reach builders  
- how execution opportunities are distributed  
- which actors capture upstream value  

They act as a gateway between user intent and execution.

---

## Flow Control Dynamics

OFA introduce competition for control over transaction flow:

- wallets and frontends originate flow  
- auction mechanisms determine routing  
- solvers and builders compete for access  

This creates a layered control structure over how transactions enter the execution pipeline.

---

## Protocol Grounding

This surface is grounded in:

- Ethereum research on MEV mitigation  
- private mempool and order flow systems  
- intent-based execution architectures  
- auction-based routing mechanisms  

---

## Structural Importance

OFA represent control over the **entry point of the system**.

They determine:

- who sees transactions first  
- how execution opportunities are distributed  
- whether order flow is public or privately routed  

This makes OFA a critical upstream surface in Ethereum’s coordination architecture.

---

## Semantic Stability

The term **Order Flow Auctions (OFA)** is widely used and shows strong semantic convergence across research and ecosystem discussions.

---

## Naming Alignment

- **ENS anchor:** `orderflowauction.eth`  
- **Canonical term:** Order Flow Auctions (OFA)  

Naming is aligned and widely adopted.

---

## Registry Role

- Track stabilization of order flow auction terminology  
- Document upstream coordination over transaction flow  
- Distinguish flow access from execution and inclusion layers  
- Map entry control within Ethereum’s coordination pipeline  

---

## Status

Research-aligned surface with high ecosystem relevance and growing structural importance.

---

## Sources

Primary research references are documented in:

`schemas/orderflowauction/`
