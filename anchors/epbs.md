# Enshrined Proposer-Builder Separation (ePBS)

**Associated ENS:** `epbs.eth`  
**Canonical term:** enshrined proposer-builder separation (ePBS)  
**Registry ID:** `epbs`  
**Status:** Draft EIP  
**Classification: core

---

## Summary

This anchor tracks **Enshrined Proposer-Builder Separation (ePBS)** as a protocol-level coordination primitive within Ethereum.

ePBS formalizes the separation between block proposal and execution payload construction directly at the protocol level.

It represents one of the clearest cases of semantic convergence toward a protocol-level primitive in Ethereum.

---

## Context

Proposer-Builder Separation (PBS) emerged as a mechanism to separate block construction from block proposal in order to mitigate MEV concentration and improve validator neutrality.

Enshrined Proposer-Builder Separation extends this model by integrating the separation directly into Ethereum’s protocol.

The primary specification associated with this primitive is **EIP-7732**.

By moving PBS into the protocol layer, ePBS restructures:

- block construction responsibilities  
- proposer roles  
- execution payload selection  
- coordination pathways between actors  

---

## Pipeline Position

Block Construction / Proposer-Builder Interface

---

## Coordination Role

ePBS defines a protocol-level coordination interface between:

- proposers  
- builders  
- execution payload selection mechanisms  

It replaces off-protocol coordination (for example, relay-based PBS) with an enshrined mechanism enforced by the protocol.

---

## Protocol Grounding

This primitive is grounded in:

- EIP-7732  
- Ethereum consensus-layer roadmap discussions  
- research on proposer-builder separation  
- implementation planning for enshrined PBS  

---

## Semantic Stability

The term **ePBS** has reached strong semantic convergence across research, client discussions, and roadmap planning.

Its direct coupling to a protocol-level specification (EIP-7732) makes it highly likely to remain stable as a canonical primitive within Ethereum.

---

## Structural Importance

ePBS represents a transition from **off-protocol coordination** to **protocol-enforced coordination**.

This shift marks a fundamental change in Ethereum’s execution architecture, redefining how block construction and proposer roles interact at the consensus level.

---

## Naming Alignment

- **ENS anchor:** `epbs.eth`  
- **Canonical term:** enshrined proposer-builder separation (ePBS)  

Naming is aligned, stable, and widely adopted across the ecosystem.

---

## Registry Role

- Track semantic stabilization of ePBS  
- Distinguish enshrined PBS from off-protocol PBS infrastructure  
- Provide a canonical semantic anchor for proposer-builder separation  
- Enable machine-readable mapping of this primitive  

---

## Status

Draft EIP with active protocol relevance and high likelihood of long-term semantic stability.

---

## Sources

Primary research references are documented in:

`schemas/epbs/`
