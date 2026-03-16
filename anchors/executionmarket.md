# executionmarket.eth

Semantic anchor representing **execution markets** within Ethereum transaction execution infrastructure.

## Context

Execution markets describe coordination environments where transactions, intents, liquidity and routing logic interact to determine how execution outcomes are produced before block construction.

This concept appears across research discussions involving:

- intent-based execution architectures
- solver competition
- order flow auctions
- MEV-aware routing systems
- builder coordination

Execution markets represent an intermediate coordination layer between transaction routing and block construction.

## Coordination Surface

Conceptually the execution pipeline can be described as:

order flow auctions  
↓  
solver networks  
↓  
execution markets  
↓  
builder markets  
↓  
ePBS

Execution markets therefore sit between **solver competition** and **block construction markets**.

## Registry Role

- Document terminology convergence around execution market structures
- Track boundaries between solver coordination and block building infrastructure
- Provide a neutral semantic anchor for execution-layer research discussions

## Associated ENS Anchor

`executionmarket.eth`

## Status

Research coordination surface (not a canonical L1 primitive today)

## Sources

Primary research sources and terminology references are documented in:

`schemas/executionmarket/`

## Notes

This anchor documents terminology used across Ethereum execution infrastructure research and ecosystem discussions.

It does not imply protocol standardization or formal adoption.
