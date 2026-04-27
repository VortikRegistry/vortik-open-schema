# Sequencing Markets

**Associated ENS:** `sequencingmarket.eth`  
**Canonical term:** sequencing markets  
**Registry ID:** `sequencingmarket`  
**Status:** Research  
**Classification:** external  

---

## Summary

This anchor tracks **sequencing markets** as an external coordination surface around transaction ordering, rollup sequencing, shared sequencing systems, and ordering rights.

Sequencing markets describe environments where sequencers, shared sequencing protocols, rollups, and ordering mechanisms coordinate around transaction ordering, latency, fairness, and value capture.

This surface is relevant to Ethereum-adjacent rollup infrastructure, but it is not currently a canonical Ethereum L1 protocol primitive.

---

## Context

As Ethereum scaling increasingly involves rollups and external execution environments, transaction ordering becomes a major coordination problem outside the base L1 protocol.

Sequencing systems may determine:

- transaction ordering  
- ordering rights  
- latency guarantees  
- cross-rollup coordination  
- MEV exposure or mitigation  
- fairness and censorship-resistance properties  
- interaction between rollups and Ethereum settlement  

The term **sequencing markets** captures this broad coordination surface around ordering rights and sequencing infrastructure.

However, the term remains external to the core Ethereum L1 protocol ontology.

---

## Pipeline Position

External Transaction Ordering / Rollup Sequencing Surface

---

## Coordination Role

Sequencing markets coordinate actors and systems involved in ordering transactions before settlement.

They may involve:

- sequencers  
- shared sequencing protocols  
- rollup operators  
- ordering-rights mechanisms  
- proposer or builder-adjacent routing systems  
- cross-domain coordination infrastructure  

These actors and mechanisms coordinate around ordering, latency, fairness, censorship resistance, and economic value capture.

---

## Structural Importance

Sequencing markets are important because transaction ordering can strongly influence execution outcomes, user experience, MEV distribution, and rollup interoperability.

They may affect:

- rollup transaction ordering  
- cross-rollup execution paths  
- latency-sensitive applications  
- MEV capture and redistribution  
- sequencing decentralization  
- settlement coordination with Ethereum L1  

This makes sequencing markets strategically important for Ethereum-adjacent infrastructure, even if they remain outside the core L1 protocol model.

---

## Protocol Grounding

This surface is grounded in:

- rollup sequencing infrastructure  
- shared sequencing research  
- cross-rollup coordination  
- MEV and ordering-rights discussions  
- rollup-centric scaling architecture  
- Ethereum settlement-layer interaction  

It should currently be treated as an external infrastructure coordination surface rather than as a protocol-native Ethereum primitive.

---

## Semantic Note

The term **sequencing markets** is useful as a category-level description of ordering coordination.

However, it does not yet correspond to a single canonical Ethereum protocol object.

It may remain as a broad market category, or fragment into more specific terms such as:

- shared sequencing  
- decentralized sequencing  
- sequencing rights  
- ordering rights  
- rollup sequencing  
- cross-domain ordering  

For this reason, Vortik tracks it as an external coordination surface.

---

## Naming Alignment

- **ENS anchor:** `sequencingmarket.eth`  
- **Canonical term:** sequencing markets  

The ENS aligns with a recognizable infrastructure category.

The term is broad, but still useful for tracking rollup and sequencing-related coordination surfaces outside the core Ethereum L1 protocol.

---

## Registry Role

- Track sequencing-market terminology as an external coordination surface  
- Document ordering coordination across rollups and shared sequencing systems  
- Distinguish sequencing infrastructure from Ethereum L1 protocol primitives  
- Monitor whether the category stabilizes or fragments into narrower sequencing-related terms  
- Preserve semantic coverage of rollup-adjacent ordering infrastructure  

---

## Status

Emerging external research and infrastructure surface tied to rollup-centric scaling, shared sequencing, and ordering coordination.

It should be monitored as part of Ethereum-adjacent scaling infrastructure, but not treated as a core L1 protocol primitive.

---

## Sources

Primary research references are documented in:

`schemas/sequencingmarket/`
