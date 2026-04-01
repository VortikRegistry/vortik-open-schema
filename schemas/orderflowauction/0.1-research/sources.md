# Order Flow Auctions (OFA) — Sources

## Overview

This document compiles primary references and terminology associated with **order flow auctions (OFA)** within Ethereum transaction routing and execution infrastructure.

It supports the semantic anchoring of `orderflowauction.eth` within the Vortik Semantic Registry.

---

## Research Context

Order flow auctions refer to coordination mechanisms where **access to transaction flow is auctioned** among competing execution participants prior to block construction.

These mechanisms operate at the **entry and routing stage** of the execution pipeline and are closely associated with:

- private order flow routing  
- solver competition  
- intent-based execution systems  
- builder market interactions  

Order flow auctions determine:

- who sees transaction flow first  
- how execution opportunities are distributed  
- how upstream MEV is internalized and allocated  

They represent a key coordination surface controlling **access to execution opportunities before inclusion**.

---

## Research Surface

Discussion of order flow auctions appears across Ethereum research and ecosystem exploration of:

- MEV supply chain structure  
- transaction routing mechanisms  
- private order flow systems  
- solver-based execution architectures  

Representative discussions can be found across:

- Ethereum Research  
  https://ethresear.ch/

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- order flow auctions (OFA)  
- order flow auction  
- orderflow auction  
- OFA  
- private order flow  
- transaction routing auction  
- order flow routing  

This terminology shows **strong semantic convergence** across research and ecosystem discussions.

---

## Status

Research-aligned coordination surface (2026).

Order flow auctions are a structurally important upstream mechanism in Ethereum’s execution pipeline, particularly in relation to:

- transaction routing  
- solver competition  
- MEV redistribution  

They are not currently defined as a canonical L1 protocol primitive, but represent a **critical coordination layer preceding execution and inclusion**.

---

## Notes

This surface represents control over the **entry point of the execution pipeline**, shaping how transaction flow is exposed, priced, and routed across competing execution participants.
