# Builder Markets

**Associated ENS:** `buildermarket.eth`  
**Canonical term:** Builder Markets  
**Registry ID:** `buildermarket`  
**Status:** Research  
**Classification:** valid  

---

## Summary

This anchor tracks **builder markets** as a coordination surface within Ethereum’s block construction ecosystem.

While not a formal protocol primitive, builder markets are a well-established component of the MEV supply chain and remain relevant across both PBS and ePBS designs.

---

## Context

Ethereum block production involves multiple interacting surfaces including:

- order flow routing  
- solver participation  
- builder competition  
- proposer selection  

Builder markets emerged alongside proposer-builder separation (PBS) and continue to play a role as designs evolve toward enshrined PBS (ePBS).

They represent the competitive environment in which block builders construct execution payloads.

---

## Semantic Position

This surface is typically associated with builder coordination and block construction.

It may be grouped with adjacent surfaces such as:

- solver networks  
- order flow auctions  
- proposer-builder interfaces  

This positioning is interpretive and does not imply a strict protocol sequence.

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
- Map builder participation across coordination surfaces  

---

## Status

Research-aligned surface with strong ecosystem adoption.

---

## Registry Context

This anchor represents builder coordination and market-based block construction.

It is tracked as a valid coordination surface and may be interpreted within broader structural models of execution and coordination dynamics.

See:
- `docs/security-hourglass/`

These interpretations reflect observed ecosystem behavior and are not protocol-level definitions.

---

## Sources

Primary research references are documented in:

`schemas/buildermarket/`
