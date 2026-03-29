# Vortik Semantic Registry — Conceptual Coordination Map

The Vortik registry tracks terminology convergence across Ethereum coordination primitives.

These primitives form a layered conceptual structure representing how transaction flow, execution coordination, and protocol guarantees interact in the Ethereum ecosystem.

---

## Conceptual Layers

User Intents / Transactions  
↓  
Order Flow Routing (Order Flow Auctions)  
↓  
Solver Coordination Networks  
↓  
Execution Coordination Surfaces  
↓  
Builder Markets  
↓  
Proposer / Builder Separation (ePBS)  
↓  
Inclusion Enforcement (FOCIL / Inclusion Lists)  
↓  
Commitment Signaling Layers  
↓  
Preconfirmation Networks  
↓  
Finality Systems (SSF research)

---

## Anchor Mapping

The registry currently tracks the following anchors:

| Anchor | Conceptual Layer |
|------|------|
| orderflowauction.eth | Order Flow Routing |
| solverlayer.eth | Solver Coordination Networks |
| executionmarket.eth | Execution Coordination Surface |
| buildermarket.eth | Builder Market Structures |
| epbs.eth | Proposer-Builder Separation |
| inclusionlist.eth | Inclusion Enforcement |
| commitmentlayer.eth | Commitment Signaling |
| preconflayer.eth | Preconfirmation Networks |
| fastfinality.eth | Finality Research |

---

## Registry Role

Vortik does not implement protocol logic.

Instead, the registry documents semantic convergence across Ethereum research discussions and provides lightweight metadata schemas to track terminology stabilization across coordination primitives.
