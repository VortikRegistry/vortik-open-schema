# Enshrined Proposer-Builder Separation (ePBS)

**Associated ENS:** `epbs.eth`  
**Canonical term:** enshrined proposer-builder separation (ePBS)  
**Registry ID:** `epbs`  
**Status:** Implemented / active devnet relevance  
**Classification:** core  

---

## Summary

This anchor tracks **Enshrined Proposer-Builder Separation (ePBS)** as a protocol-level coordination primitive within Ethereum.

ePBS formalizes the separation between block proposal and execution payload construction directly at the protocol level.

It represents one of the clearest cases of semantic convergence toward a protocol-aligned primitive in Ethereum, especially as implementation-facing discussion increasingly converges around builder commitments, proposer selection, and protocol-native block production pathways.

---

## Context

Proposer-Builder Separation (PBS) emerged as a mechanism to separate block construction from block proposal in order to mitigate MEV concentration and improve validator neutrality.

Enshrined Proposer-Builder Separation extends this model by integrating the separation directly into Ethereum’s protocol.

The primary specification associated with this primitive is **EIP-7732**.

As Ethereum coordination becomes more explicit, ePBS increasingly functions not just as a research concept, but as a concrete protocol-facing surface tied to implementation, devnet iteration, and semantic convergence across the ecosystem.

By moving PBS into the protocol layer, ePBS restructures:

- block construction responsibilities  
- proposer roles  
- execution payload selection  
- commitment-based coordination between actors  

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

This makes ePBS one of the clearest examples of coordination moving from external infrastructure into protocol-native structure.

---

## Protocol Grounding

This primitive is grounded in:

- EIP-7732  
- Ethereum consensus-layer roadmap discussions  
- proposer-builder separation research  
- active implementation-facing discussion and devnet relevance for enshrined PBS  

---

## Semantic Stability

The term **ePBS** has reached strong semantic convergence across research, client discussions, roadmap planning, and implementation-facing protocol language.

Its coupling to **EIP-7732** and its growing role in implementation discussions make it highly likely to remain stable as a canonical primitive within Ethereum coordination architecture.

---

## Structural Importance

ePBS represents a transition from **off-protocol coordination** to **protocol-enforced coordination**.

This shift marks a fundamental change in Ethereum’s execution architecture, redefining how block construction, proposer roles, commitments, and payload selection interact at the consensus boundary.

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

ePBS remains tied to a draft EIP process in formal specification terms, but it now has active implementation relevance and strong protocol-facing semantic stability.

It should be understood as a core coordination primitive with growing implementation significance, not merely as a loose research abstraction.

---

## Sources

Primary research references are documented in:

`schemas/epbs/`
