# orderflowauction.eth

Semantic anchor representing **order flow auctions (OFA)** and auction-based transaction routing infrastructure in Ethereum.

## Context

Order flow auctions refer to mechanisms where transaction flow is auctioned among competing execution agents before inclusion in a block.

This concept appears across multiple Ethereum research discussions related to:

- MEV mitigation
- private order flow routing
- solver competition
- intent-based transaction execution
- block builder coordination

Order flow auctions are often proposed as mechanisms to improve execution efficiency while reducing harmful MEV extraction.

## Coordination Surface

Order flow auctions operate at the **transaction routing layer**, before solver execution and block construction.

Conceptually:

order flow auctions  
↓  
solver networks  
↓  
execution markets  
↓  
builder markets  
↓  
ePBS

## Registry Role

- Track terminology convergence around order flow auction infrastructure
- Document routing-layer coordination mechanisms in Ethereum execution infrastructure
- Distinguish order flow auctions from solver competition and block construction markets

## Associated ENS Anchor

`orderflowauction.eth`

## Status

Research coordination surface (not a canonical L1 primitive today)

## Sources

Primary research sources and terminology references are documented in:

`schemas/orderflowauction/`

## Notes

This anchor documents terminology used across Ethereum execution infrastructure research and ecosystem discussions.

It does not imply protocol standardization or formal adoption.
