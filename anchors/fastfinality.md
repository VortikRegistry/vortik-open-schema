# Single-Slot Finality (SSF)

**Associated ENS:** `fastfinality.eth`  
**Canonical term:** single-slot finality (SSF)  
**Registry ID:** `ssf`  
**Status:** Research  
**Classification:** repairable  

---

## Summary

This anchor tracks **Single-Slot Finality (SSF)** as an Ethereum consensus research and roadmap surface.

SSF refers to efforts aimed at reducing Ethereum finality latency so that finality can be achieved within a single slot or near-single-slot timeframe.

The ENS identifier `fastfinality.eth` captures the broad direction of faster finality, but does not match the more precise term increasingly used across Ethereum research: **single-slot finality (SSF)**.

For that reason, this anchor is classified as **repairable** rather than canonical.

---

## Context

SSF research explores changes to Ethereum’s consensus architecture, including:

- validator coordination  
- consensus timing assumptions  
- committee design  
- signature aggregation requirements  
- validator set scaling  
- latency and security trade-offs  

It is closely related to broader efforts around:

- consensus efficiency  
- finality guarantees  
- validator participation  
- aggregation performance  
- long-term roadmap design  

SSF remains a high-signal roadmap concept, but it is not currently treated in Vortik as an immediate core anchor comparable to ePBS or inclusion lists.

---

## Pipeline Position

Finality / Consensus Roadmap Surface

---

## Coordination Role

SSF impacts coordination at the consensus level, particularly around:

- validator agreement speed  
- finality checkpoint formation  
- slot timing assumptions  
- aggregation of validator signatures  
- transition from inclusion to irreversible finality  

If achieved, SSF would change how quickly Ethereum moves from proposed blocks to final settlement.

---

## Protocol Grounding

This surface is grounded in:

- Ethereum consensus-layer research on finality reduction  
- roadmap discussions around single-slot finality  
- validator set scaling research  
- signature aggregation and latency constraint research  
- related discussions around validator effective balance and consensus efficiency  

SSF should currently be treated as a roadmap and research surface rather than as a finalized protocol primitive.

---

## Semantic Stability

The term **single-slot finality (SSF)** has strong semantic recognition across Ethereum research.

It is more precise than broader descriptions such as **fast finality**.

The phrase **fast finality** remains understandable, but it is increasingly less exact than SSF as the canonical research term.

---

## Structural Importance

SSF represents a potential shift in Ethereum’s consensus architecture, affecting:

- finality latency guarantees  
- validator coordination models  
- scalability constraints tied to validator set size  
- user confirmation expectations  
- settlement timing assumptions  

If achieved, it would significantly alter the temporal dynamics of Ethereum consensus.

---

## Naming Alignment

- **ENS anchor:** `fastfinality.eth`  
- **Canonical term:** single-slot finality (SSF)  

The ENS name is semantically related but does not match the canonical term used in research.

**Fast finality** is a descriptive approximation, while **SSF** is the more precise and widely adopted terminology.

This creates a naming mismatch, but not a complete semantic failure.

---

## Registry Role

- Track semantic stabilization of SSF terminology  
- Distinguish between canonical naming and ENS approximation  
- Document finality-reduction research as a consensus roadmap surface  
- Monitor whether SSF continues to displace broader fast-finality language  
- Preserve a repairable semantic surface around Ethereum finality evolution  

---

## Status

Active research and roadmap surface within Ethereum consensus evolution.

The underlying concept has high structural relevance, but the ENS label remains an approximation rather than a canonical match.

---

## Sources

Primary research references and technical material are documented in:

`schemas/ssf/`
