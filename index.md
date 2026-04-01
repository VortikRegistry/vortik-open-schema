# Vortik Semantic Registry

📄 **Canonical Registry Document (PDF)**  
A structured overview of the registry, coordination primitives, and semantic anchoring.

→ [Download PDF](docs/vortik-semantic-registry.pdf)

---

Independent machine-readable registry tracking terminology convergence and semantic stabilization across Ethereum coordination primitives and coordination surfaces.

The registry maps conceptual primitives discussed in Ethereum research to stable ENS identifiers and versioned schemas.

---

## Why this registry exists

Terminology in Ethereum research often stabilizes before formal standardization.

Different teams may refer to similar coordination mechanisms using different terms, creating fragmentation across discussions.

The Vortik Semantic Registry exists to:

- track terminology convergence across research threads  
- provide stable semantic anchors through ENS identifiers  
- enable machine-readable referencing of coordination primitives  

This registry does not define standards.

It documents how terminology stabilizes across the Ethereum research ecosystem.

---

## Navigation

- [Anchors](anchors/)
- [Schemas](schemas/)
- [Registry index (registry.json)](registry.json)
- [Repository on GitHub](https://github.com/VortikRegistry/vortik-open-schema)

---

## Core Anchors

- [epbs.eth](anchors/epbs.md) — Enshrined Proposer-Builder Separation (EIP-7732)  
- [inclusionlist.eth](anchors/inclusionlist.md) — Inclusion enforcement (FOCIL / EIP-7805)  
- [commitmentlayer.eth](anchors/commitmentlayer.md) — commitment signaling & L1 preconfirmation coordination  
- [preconflayer.eth](anchors/preconflayer.md) — based preconfirmations & latency coordination networks  
- [fastfinality.eth](anchors/fastfinality.md) — Single Slot Finality (SSF research track)  

---

## Execution Infrastructure Anchors

- [buildermarket.eth](anchors/buildermarket.md) — block builder market structures  
- [solverlayer.eth](anchors/solverlayer.md) — intent solver coordination networks  
- [executionmarket.eth](anchors/executionmarket.md) — execution coordination surface  

---

## Order Flow Layer

- [orderflowauction.eth](anchors/orderflowauction.md) — order flow auction routing infrastructure  

---

## Disclaimer

This is an independent research artifact.

It does not represent the Ethereum Foundation or any core development team.

Terminology and classifications may evolve as research progresses.
