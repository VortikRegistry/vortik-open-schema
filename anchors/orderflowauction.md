# orderflowauction

## ENS
`orderflowauction.eth`

## Summary
Semantic anchor for Ethereum order flow auctions (OFA) and auction-based transaction routing infrastructure.

## Context
Order flow auctions refer to mechanisms where transaction flow is auctioned among competing execution agents before inclusion in a block.

This concept appears across multiple Ethereum research discussions related to:

- MEV mitigation
- private order flow routing
- solver competition
- intent-based transaction execution
- block builder coordination

Order flow auctions are often proposed as a mechanism to reduce harmful MEV extraction while improving execution efficiency.

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

## Notes
This anchor is used by the Vortik Semantic Registry to document terminology convergence around transaction routing infrastructure in Ethereum research.

It does not imply protocol standardization or formal adoption.
