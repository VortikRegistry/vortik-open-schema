# Single-Slot Finality (SSF) — Sources

## Overview

This document compiles primary references and terminology associated with **Single-Slot Finality (SSF)** within Ethereum consensus research.

It supports the semantic anchoring of `fastfinality.eth` within the Vortik Semantic Registry.

---

## Research Context

Single-Slot Finality (SSF) refers to a class of research efforts aimed at reducing Ethereum finality latency such that blocks may become final within a single slot or near-single-slot timeframe.

This surface is associated with research into:

- accelerated consensus finality  
- validator coordination dynamics  
- committee design and scaling  
- signature aggregation  
- consensus-path latency constraints  

SSF represents a major research direction in the evolution of Ethereum consensus.

---

## Structural Role

SSF operates at the **finality stage** of Ethereum’s coordination architecture.

It affects how quickly consensus transitions from:

- probabilistic inclusion  
- to economically irreversible finality  

This positions SSF as a core research surface for understanding how Ethereum may compress the latency between block proposal and reliable settlement.

---

## Related EIPs (Context / Prerequisites)

- EIP-7251 — Increase the MAX_EFFECTIVE_BALANCE  
  https://eips.ethereum.org/EIPS/eip-7251

---

## Research Surface

Primary discussion of this surface appears across Ethereum consensus research, including work on:

- single-slot finality  
- near-single-slot finality  
- validator set scaling  
- consensus performance constraints  

Representative research discussions can be found across:

- Ethereum Research  
  https://ethresear.ch/

---

## Terminology Surface

Common terminology associated with this surface includes:

- single-slot finality  
- SSF  
- near-single-slot finality  
- fast finality (non-canonical / adjacent)  

Terminology across the ecosystem converges strongly on **SSF** as the canonical shorthand, while “fast finality” remains a descriptive approximation rather than a formally adopted term.

---

## Status

Research track (2026).

SSF is a major consensus research direction and should be understood as a structurally significant finality primitive, not merely a latency optimization.

---

## Roadmap Context

Within Ethereum roadmap discussions, faster finality is treated as a long-term consensus objective.

SSF is the primary research surface associated with this transition and should be understood as a major consensus evolution vector rather than a simple performance improvement.

---

## Notes

This document reflects an active consensus research surface with strong semantic convergence around the term **SSF**.

It supports a repairable ENS anchor (`fastfinality.eth`) whose wording is adjacent, but not canonical.
