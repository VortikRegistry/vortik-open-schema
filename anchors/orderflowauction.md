# Order Flow Auctions

**Associated ENS:** `orderflowauction.eth`  
**Canonical term:** Order Flow Auctions (OFA)  
**Registry ID:** `orderflowauction`  
**Status:** Research  
**Classification:** Semi-stable

---

## Summary

This anchor tracks **order flow auctions (OFA)** as a coordination mechanism for transaction routing within Ethereum’s execution pipeline.

Order flow auctions represent a structured environment where transaction flow is competitively allocated before execution and block construction.

---

## Context

Order flow auctions are mechanisms in which transaction flow is auctioned among competing execution agents.

They are used to:

- route transactions efficiently  
- reduce harmful MEV extraction  
- enable competition between solvers and execution strategies  

This concept appears across research discussions involving:

- MEV mitigation  
- private order flow  
- intent-based execution  
- solver competition  

---

## Pipeline Position

Order Flow → Solver Networks → Builder Markets → ePBS

---

## Coordination Role

Order flow auctions coordinate:

- transaction routing  
- access to user order flow  
- competition between execution agents  

They define how transactions enter the execution pipeline.

---

## Protocol Grounding

This surface is grounded in:

- Ethereum research on MEV mitigation  
- private mempool designs  
- intent-based execution systems  
- auction-based routing mechanisms  

---

## Naming Alignment

- **ENS anchor:** `orderflowauction.eth`  
- **Canonical term:** Order Flow Auctions (OFA)  

The term is widely used across research and ecosystem discussions and shows strong semantic convergence.

---

## Registry Role

- Track stabilization of order flow auction terminology  
- Document routing-layer coordination mechanisms  
- Distinguish transaction routing from execution and block construction  
- Map entry points into Ethereum’s coordination pipeline  

---

## Status

Research-aligned surface with strong ecosystem relevance.

---

## Sources

Primary research references are documented in:

`schemas/orderflowauction/`
