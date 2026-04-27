# Preconfirmation

**Associated ENS:** `preconflayer.eth`  
**Canonical term:** preconfirmation (emergent)  
**Registry ID:** `preconflayer`  
**Status:** Research  
**Classification:** premature  

---

## Summary

This anchor tracks **preconfirmation** as an emergent external coordination mechanism within Ethereum-adjacent execution systems.

Preconfirmations are not currently a single protocol-defined primitive. They describe mechanisms that provide early inclusion, ordering, or execution-related assurances before final L1 confirmation.

The ENS identifier `preconflayer.eth` captures a real and important phenomenon — preconfirmation — but introduces a non-canonical architectural suffix: **layer**. For that reason, this anchor is classified as **premature** rather than canonical.

---

## Context

Preconfirmations reduce latency by allowing actors to provide early guarantees or signals about transaction inclusion, ordering, or execution outcome before final settlement.

They may combine:

- commitment signaling  
- builder or proposer cooperation  
- low-latency coordination infrastructure  
- access to order flow and routing systems  
- economic guarantees outside the core L1 protocol  

This surface has emerged alongside:

- proposer commitments  
- based preconfirmation research  
- order flow routing  
- builder coordination  
- latency-sensitive applications  

The concept is real, but the terminology has not fully stabilized into a protocol-native object.

---

## Pipeline Position

Preconfirmation / External Latency Guarantee Surface

---

## Coordination Role

Preconfirmations do not directly enforce final protocol inclusion.

They provide early assurances that may influence:

- user execution expectations  
- transaction routing decisions  
- builder or proposer coordination  
- latency-sensitive application behavior  
- perceived confirmation before final L1 settlement  

They sit between transaction initiation and final protocol confirmation.

---

## Guarantee Dynamics

Preconfirmations introduce a separation between:

- **economic or actor-level guarantees**  
- **protocol-level inclusion and finality guarantees**  

This creates a dual expectation system where a transaction may be treated as practically accepted before it is finalized on-chain.

That distinction is important: preconfirmation is not the same as finality, and it is not yet a protocol-enforced inclusion constraint.

---

## Dependency Structure

Preconfirmation systems may depend on:

- access to order flow  
- builder and proposer cooperation  
- commitment mechanisms  
- low-latency communication infrastructure  
- reputation or enforcement outside the base protocol  

This makes them tightly coupled to external coordination systems and actor credibility.

---

## Risk Surface

Preconfirmations introduce new systemic risks:

- guarantees may fail or be revoked  
- commitments may depend on actor credibility  
- correlated failures can propagate across systems  
- economic guarantees may collapse independently of protocol health  
- users may confuse early assurance with final settlement  

This creates a gap between perceived execution and actual protocol finality.

---

## Protocol Grounding

This surface is grounded in:

- Ethereum research on preconfirmations  
- proposer commitment mechanisms  
- based preconfirmation discussions  
- latency coordination systems  
- external execution and routing infrastructure  

It should currently be treated as an external or emergent mechanism rather than as a finalized protocol primitive.

---

## Structural Importance

Preconfirmations may redefine how users perceive execution:

- transactions may be treated as accepted before final inclusion  
- user experience may become partially decoupled from protocol finality  
- execution expectations may shift from protocol guarantees to economic or actor-level assurances  

This makes preconfirmation an important area to monitor, even if the naming and formal architecture remain unsettled.

---

## Naming Alignment

- **ENS anchor:** `preconflayer.eth`  
- **Canonical term:** preconfirmation (emergent)  

The ENS name has partial alignment.

The word **preconf** maps to a real and actively discussed coordination phenomenon. The word **layer** introduces a broader architectural abstraction that does not currently map cleanly to protocol terminology.

This creates a naming mismatch and keeps the anchor in a premature state.

---

## Semantic Stability

Terminology around preconfirmations is still evolving.

The concept has meaningful ecosystem traction, but it has not fully converged as a protocol-defined primitive or canonical L1 object.

The registry therefore tracks this anchor as an emergent external mechanism rather than as a stable core primitive.

---

## Registry Role

- Track semantic stabilization of preconfirmation terminology  
- Document the separation between economic guarantees and protocol guarantees  
- Distinguish latency assurances from inclusion constraints and finality  
- Map emergent coordination behavior around Ethereum execution  
- Monitor whether preconfirmation terminology converges, fragments, or gets replaced by more precise labels  

---

## Status

Active research surface with relevance to execution design and user experience.

The underlying phenomenon is important, but the ENS framing remains premature because `layer` is not currently the dominant protocol-native term.

---

## Sources

Primary research references are documented in:

`schemas/preconflayer/`
