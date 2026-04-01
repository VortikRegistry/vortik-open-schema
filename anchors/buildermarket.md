# Builder Markets

**Associated ENS:** `buildermarket.eth`  
**Canonical term:** Builder Markets  
**Registry ID:** `buildermarket`  
**Status:** Research  
**Classification:** Ecosystem-Aligned  

---

## Summary

This anchor tracks **builder markets** as an ecosystem-level coordination surface within Ethereum’s block construction pipeline.

While not a formal protocol primitive, builder markets are a widely used abstraction describing competitive block construction and order flow access within the MEV supply chain.

Their exact structure is not formally specified and may evolve alongside changes in PBS and ePBS designs.

---

## Context

Ethereum block production involves multiple interacting surfaces including:

- order flow routing  
- solver participation  
- builder competition  
- proposer selection  

Builder markets emerged alongside proposer-builder separation (PBS) and continue to play a role as designs evolve toward enshrined PBS (ePBS).

They represent the competitive environment in which block builders construct execution payloads and compete for inclusion.

---

## Semantic Position

Builder markets represent an **economic coordination surface**, not a protocol-defined layer or primitive.

They are commonly associated with:

- solver networks  
- order flow auctions  
- proposer-builder interfaces  

This positioning is interpretive and reflects observed ecosystem structure rather than protocol specification.

---

## Coordination Role

Builder markets coordinate:

- competition between block builders  
- access to and pricing of order flow  
- relationships with relays and proposers  

They define the competitive dynamics through which execution payloads are assembled prior to block proposal.

---

## Protocol Grounding

This surface is grounded in:

- PBS (Proposer-Builder Separation)  
- ePBS (EIP-7732)  
- MEV supply chain architecture  
- relay-based block construction systems  

---

## Semantic Note

Builder markets should not be interpreted as a protocol-enforced mechanism.

They represent an emergent economic abstraction describing competitive behavior within the block construction process.

Their structure may shift significantly as protocol-level changes (such as ePBS) alter coordination pathways.

---

## Naming Alignment

- **ENS anchor:** `buildermarket.eth`  
- **Canonical term:** Builder Markets  

The term is widely used across ecosystem discussions but is not formally defined at the protocol level.

It is considered **ecosystem-aligned**, reflecting common usage rather than canonical specification.

---

## Registry Role

- Track semantic usage of builder market terminology  
- Document competitive dynamics in block construction  
- Distinguish economic coordination from protocol mechanisms  
- Map builder participation within Ethereum’s coordination pipeline  

---

## Status

Research-aligned surface with strong ecosystem usage but no formal protocol definition.

---

## Registry Context

This anchor represents builder coordination and market-based block construction dynamics.

It is included as an ecosystem abstraction within the coordination stack and should not be interpreted as a protocol-level component.

See:
- `docs/security-hourglass/`

These interpretations reflect observed ecosystem behavior and are not protocol-level definitions.

---

## Sources

Primary research references are documented in:

`schemas/buildermarket/`
