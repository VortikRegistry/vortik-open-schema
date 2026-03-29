# Order Flow Auctions (OFA) — Sources

## Overview

This document compiles primary references and terminology associated with **order flow auctions (OFA)** within Ethereum transaction routing and execution infrastructure.

It supports the semantic anchoring of `orderflowauction.eth` within the Vortik Semantic Registry.

---

## Research Context

Order flow auctions refer to coordination mechanisms where transaction order flow is auctioned or routed among competing execution participants prior to block construction.

These mechanisms operate at the transaction routing stage of the execution pipeline and are closely associated with:

- private order flow routing  
- solver competition  
- execution markets  
- builder market interactions  

Order flow auctions play a key role in determining how transactions are distributed across execution participants before inclusion in a block.

---

## Research Surface

Discussion of order flow auctions appears across Ethereum research and ecosystem exploration of:

- MEV supply chain structures  
- transaction routing mechanisms  
- private order flow systems  
- execution market design  

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

---

## Status

Research coordination surface (2026).

Order flow auctions are actively explored within Ethereum execution infrastructure, particularly in relation to routing efficiency, MEV mitigation, and coordination across execution participants.

They are not currently defined as a canonical L1 protocol primitive.
