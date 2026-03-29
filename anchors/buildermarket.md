# Builder Markets

**Associated ENS:** `buildermarket.eth`  
**Canonical term:** Builder Markets  
**Registry ID:** `buildermarket`  
**Status:** Research  
**Classification:** Semi-stable

---

## Summary

This anchor tracks **builder markets** as a coordination surface within Ethereum’s block construction ecosystem.

While not a formal protocol primitive, builder markets are a well-established component of the MEV supply chain and remain relevant across both PBS and ePBS designs.

---

## Context

Ethereum block production involves a multi-stage coordination pipeline including:

- order flow routing  
- solver participation  
- builder competition  
- proposer selection  

Builder markets emerged alongside proposer-builder separation (PBS) and continue to play a role as designs evolve toward enshrined PBS (ePBS).

They represent the competitive environment in which block builders construct execution payloads.

---

## Pipeline Position

Execution Coordination → Builder Markets → ePBS

---

## Coordination Role

Builder markets coordinate:

- block construction competition  
- access to order flow  
- relationships with relays and proposers  

They define how execution payloads are assembled before being proposed to the network.

---

## Protocol Grounding

This surface is grounded in:

- PBS (Proposer-Builder Separation)  
- ePBS (EIP-7732)  
- MEV supply chain architecture  
- relay-based block construction systems  

---

## Naming Alignment

- **ENS anchor:** `buildermarket.eth`  
- **Canonical term:** Builder Markets  

The term is widely used across research and ecosystem discussions, though not formalized as a protocol primitive.

---

## Registry Role

- Track semantic stabilization of builder market terminology  
- Document the role of builders in block construction  
- Distinguish builder coordination from solver and execution layers  
- Map builder participation within Ethereum’s coordination pipeline  

---

## Status

Research-aligned surface with strong ecosystem adoption.

---

## Sources

Primary research references are documented in:

`schemas/buildermarket/`
