# Semantic Status

This document tracks the current research maturity of primitives and coordination surfaces referenced by the Vortik Semantic Registry.

Status labels describe how stabilized the terminology and design space of each surface currently is.

---

## Draft EIP Primitives

These primitives are defined through active Ethereum Improvement Proposals but may still evolve before protocol inclusion.

- epbs — enshrined proposer-builder separation (EIP-7732)  
- inclusionlist — fork-choice enforced inclusion lists (FOCIL, EIP-7805)  

These represent **protocol-bound primitives under active specification**.

---

## Active Research Surfaces

These coordination surfaces appear across Ethereum research discussions but are not currently standardized as canonical L1 primitives.

- commitmentlayer — commitment signaling (preconfirmation-related)  
- preconflayer — preconfirmation systems  
- buildermarket — builder coordination / builder markets  
- solverlayer — solver networks  
- executionmarket — execution coordination (ambiguous term)  
- orderflowauction — order flow auctions (OFA)  

These represent **coordination surfaces with observable usage but incomplete semantic stabilization**.

---

## Consensus Research

These primitives relate to long-term consensus evolution and protocol design.

- ssf — single-slot finality (SSF)  

This represents a **high-impact consensus research direction with evolving design space**.

---

## Interpretation

The registry distinguishes between:

- **protocol primitives** → grounded in EIPs or consensus mechanisms  
- **coordination surfaces** → emerging structures across execution and coordination layers  
- **consensus research directions** → long-term protocol evolution paths  

Status reflects **semantic maturity**, not implementation readiness or adoption.

---

## Notes

- Terminology may evolve as research converges  
- Classification is defined at the schema level and may change over time  
- Inclusion in this document does not imply protocol standardization
