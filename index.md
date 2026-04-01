# Vortik Semantic Registry

Independent machine-readable registry tracking terminology convergence and semantic stabilization across Ethereum coordination primitives and coordination surfaces.

The registry maps emerging protocol terminology to stable ENS-based semantic anchors and versioned schema artifacts.

---

## Why this registry exists

Terminology in Ethereum research tends to stabilize before formal standardization.

Different teams often refer to similar coordination mechanisms using divergent terms, leading to semantic fragmentation across research threads.

The Vortik Semantic Registry exists to:

- track terminology convergence across Ethereum research discussions  
- provide stable semantic anchors via ENS identifiers  
- enable machine-readable referencing of coordination primitives  

This registry does not define protocol standards.

It documents how terminology stabilizes across the Ethereum research ecosystem.

---

## Registry structure

Each anchor consists of:

- an ENS identifier (semantic anchor)  
- a versioned JSON schema (machine-readable definition)  
- a human-readable anchor document  

The registry is designed as a lightweight semantic layer, not an implementation layer.

---

## Navigation

- [Anchors](anchors/)
- [Schemas](schemas/)
- [Registry index (registry.json)](registry.json)
- [Repository](https://github.com/VortikRegistry/vortik-open-schema)

---

## Core Coordination Anchors

- [epbs.eth](anchors/epbs.md) — Enshrined Proposer-Builder Separation (EIP-7732)  
- [inclusionlist.eth](anchors/inclusionlist.md) — Inclusion enforcement (FOCIL / EIP-7805)  
- [commitmentlayer.eth](anchors/commitmentlayer.md) — commitment signaling & L1 preconfirmation coordination  
- [preconflayer.eth](anchors/preconflayer.md) — based preconfirmations & latency coordination networks  
- [fastfinality.eth](anchors/fastfinality.md) — Single Slot Finality (SSF research track)  

---

## Execution & Coordination Infrastructure

- [buildermarket.eth](anchors/buildermarket.md) — block builder market structures  
- [solverlayer.eth](anchors/solverlayer.md) — intent solver coordination networks  
- [executionmarket.eth](anchors/executionmarket.md) — execution coordination surfaces  

---

## Order Flow Layer

- [orderflowauction.eth](anchors/orderflowauction.md) — order flow auction routing infrastructure  

---

## Registry scope

The registry focuses on:

- coordination primitives  
- execution pipeline components  
- emerging research terminology  
- semantic stabilization signals  

It intentionally excludes:

- finalized standards specifications  
- implementation-specific logic  
- non-coordination-related concepts  

---

## Disclaimer

This is an independent research artifact.

It does not represent the Ethereum Foundation or any core development team.

Terminology and classifications may evolve as research progresses.
