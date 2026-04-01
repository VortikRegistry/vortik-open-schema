# Vortik Semantic Registry — Conceptual Coordination Map

The Vortik registry tracks terminology convergence across Ethereum coordination primitives and coordination surfaces.

These surfaces form a layered conceptual structure representing how transaction flow, execution coordination, and protocol guarantees interact across the Ethereum coordination pipeline.

---

## Conceptual Layers

Order Flow (User Intents / Transactions)  
↓  
Order Flow Routing (Order Flow Auctions)  
↓  
Solver Coordination  
↓  
Execution Coordination (ambiguous surface)  
↓  
Builder Coordination  
↓  
Inclusion  
↓  
Commitment Signaling  
↓  
Preconfirmation  
↓  
Finality (SSF research)

---

## Anchor Mapping

The registry currently tracks the following anchors:

| Anchor | Conceptual Layer |
|------|------|
| `orderflowauction.eth` | Order Flow Routing |
| `solverlayer.eth` | Solver Coordination |
| `executionmarket.eth` | Execution Coordination (ambiguous) |
| `buildermarket.eth` | Builder Coordination |
| `epbs.eth` | Builder Coordination (protocol-enforced separation) |
| `inclusionlist.eth` | Inclusion |
| `commitmentlayer.eth` | Commitment Signaling |
| `preconflayer.eth` | Preconfirmation |
| `fastfinality.eth` | Finality |

---

## Interpretation

The coordination pipeline reflects how responsibility shifts across actors and mechanisms:

- early stages handle **transaction flow and routing**
- middle layers coordinate **execution and block construction**
- later stages enforce **inclusion guarantees and ordering commitments**
- final stages provide **consensus-level finality**

Not all layers correspond to protocol primitives.

Some represent **coordination surfaces** where terminology and structure are still evolving.

---

## Registry Role

Vortik does not implement protocol logic.

Instead, the registry:

- documents semantic convergence across Ethereum research  
- tracks coordination primitives and surfaces  
- provides structured schemas for machine-readable semantic metadata  

Its purpose is to act as a **semantic interface layer** across research, infrastructure, and protocol discussions.
