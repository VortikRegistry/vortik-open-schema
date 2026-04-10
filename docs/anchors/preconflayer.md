# Preconfirmation Systems

**Associated ENS:** `preconflayer.eth`  
**Canonical term:** Preconfirmation Systems  
**Registry ID:** `preconflayer`  
**Status:** Research  
**Classification:** Repairable

---

## Summary

This anchor tracks **preconfirmation systems** as an emergent coordination surface within Ethereum.

Rather than a single protocol primitive, preconfirmations represent a set of mechanisms providing **early execution guarantees** prior to final inclusion on L1.

The ENS identifier (`preconflayer.eth`) introduces a non-canonical architectural abstraction and is classified as a naming mismatch.

---

## Context

Preconfirmations reduce latency by allowing actors to provide early guarantees about transaction inclusion or ordering before finalization.

They typically combine:

- commitment signaling (early inclusion promises)  
- coordination networks (latency infrastructure)  
- access to order flow and execution pathways  

This surface has emerged alongside:

- order flow auctions  
- builder coordination  
- intent-based execution  
- latency-sensitive applications  

---

## Pipeline Position

Preconfirmation (Latency / Guarantee Surface)

---

## Coordination Role

Preconfirmations do not directly enforce inclusion.

They provide **early guarantees** that influence:

- user execution expectations  
- transaction routing decisions  
- coordination between upstream and execution-layer actors  

They sit between transaction initiation and protocol-level inclusion.

---

## Guarantee Dynamics

Preconfirmations introduce a separation between:

- **economic guarantees** (early commitments)  
- **protocol guarantees** (final inclusion / finality)  

This creates a dual-layer system where transactions may be considered "effectively executed" before they are finalized on-chain.

---

## Dependency Structure

Preconfirmation systems depend on:

- access to order flow (OFA and routing layers)  
- builder and proposer cooperation  
- coordination infrastructure capable of low-latency signaling  

This makes them tightly coupled to upstream control surfaces.

---

## Risk Surface

Preconfirmations introduce new systemic risks:

- guarantees may fail or be revoked  
- commitments depend on actor credibility  
- correlated failures can propagate across systems  
- economic guarantees may collapse independently of protocol health  

This creates a divergence between perceived execution and actual finality.

---

## Protocol Grounding

This surface is grounded in:

- Ethereum research on preconfirmations  
- proposer commitment mechanisms  
- latency coordination systems  
- emerging execution architectures  

---

## Structural Importance

Preconfirmations redefine how users perceive execution:

- transactions may be treated as "confirmed" before inclusion  
- user experience becomes decoupled from finality  
- execution expectations shift from protocol guarantees to economic assurances  

This represents a fundamental shift in how execution is experienced in Ethereum.

---

## Naming Alignment

- **ENS anchor:** `preconflayer.eth`  
- **Canonical term:** Preconfirmation Systems  

The ENS naming introduces a non-canonical abstraction ("layer"), while the underlying phenomenon spans multiple coordination surfaces.

This entry is classified as **repairable** due to naming misalignment.

---

## Semantic Stability

Terminology around preconfirmations is still evolving and has not fully converged.

The concept is widely discussed but not yet canonically defined.

---

## Registry Role

- Track semantic stabilization of preconfirmation systems  
- Document separation between economic and protocol guarantees  
- Distinguish latency guarantees from inclusion and finality  
- Map emergent coordination behavior within Ethereum’s execution pipeline  

---

## Status

Active research surface with high impact on execution design and user experience.

---

## Sources

Primary research references are documented in:

`schemas/preconflayer/`
