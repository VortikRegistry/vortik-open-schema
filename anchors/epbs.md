# Enshrined Proposer-Builder Separation (ePBS)

**Associated ENS:** `epbs.eth`  
**Canonical term:** Enshrined Proposer-Builder Separation (ePBS)  
**Registry ID:** `epbs`  
**Status:** Draft EIP  
**Classification:** Core

---

## Summary

This anchor tracks **Enshrined Proposer-Builder Separation (ePBS)** as a protocol-level coordination primitive within Ethereum.

ePBS formalizes the separation between block proposal and execution payload construction at the protocol level.

It is one of the clearest examples of semantic convergence toward canonical terminology in Ethereum’s coordination architecture.

---

## Context

Proposer-Builder Separation (PBS) emerged as a mechanism to separate block construction from block proposal in order to mitigate MEV concentration and improve validator neutrality.

Enshrined Proposer-Builder Separation extends this model by integrating the separation directly into Ethereum’s protocol.

The primary specification associated with this primitive is **EIP-7732**.

By moving PBS into the protocol layer, ePBS restructures:

- block construction responsibilities  
- proposer roles  
- execution payload selection  

---

## Pipeline Position

Builder Coordination → Inclusion

---

## Coordination Role

ePBS defines a protocol-level coordination interface between:

- proposers  
- builders  
- execution payload selection mechanisms  

It replaces off-protocol coordination with an enshrined mechanism inside the protocol.

---

## Protocol Grounding

This primitive is grounded in:

- EIP-7732  
- Ethereum consensus-layer roadmap discussions  
- research on proposer-builder separation  
- implementation planning for enshrined PBS  

---

## Naming Alignment

- **ENS anchor:** `epbs.eth`  
- **Canonical primitive name:** Enshrined Proposer-Builder Separation (ePBS)  

Naming is aligned and stable.

---

## Registry Role

- Track semantic stabilization of ePBS  
- Distinguish enshrined PBS from off-protocol PBS infrastructure  
- Provide a canonical semantic anchor for proposer-builder separation  
- Enable machine-readable mapping of this primitive  

---

## Status

Draft EIP with active protocol relevance.

---

## Sources

Primary research references are documented in:

`schemas/epbs/`
