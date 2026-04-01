# Single-Slot Finality (SSF) — Sources

## Overview

This document compiles primary references and terminology associated with **Single-Slot Finality (SSF)** within Ethereum consensus research.

It supports the semantic anchoring of `fastfinality.eth` within the Vortik Semantic Registry.

---

## Research Context

Single-Slot Finality (SSF) refers to research aimed at reducing Ethereum finality latency so that blocks can become final within a single slot or near-single-slot timeframes.

This surface is associated with research into:

- faster consensus finality  
- validator coordination  
- committee structure  
- signature aggregation  
- consensus-path latency constraints  

SSF is one of the major research directions in Ethereum consensus evolution.

---

## Structural Role

SSF operates at the **finality stage** of Ethereum’s coordination architecture.

It affects how quickly consensus transitions from:

- probabilistic inclusion  
- to irreversible finality  

This makes SSF a core research surface for understanding how Ethereum may compress the time between block proposal and economically reliable settlement.

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

Terminology across the ecosystem strongly converges on **SSF** as the canonical shorthand, while “fast finality” remains only a descriptive approximation.

---

## Status

Research track (2026).

SSF is a major consensus research direction and should be understood as a structurally important finality primitive, not merely a latency optimization.

---

## Roadmap Context

Within Ethereum roadmap discussions, faster finality is treated as a major long-term consensus objective.

SSF is the research surface most commonly associated with this transition and should be understood as a major consensus evolution vector rather than a simple latency improvement.

---

## Notes

This document reflects an active consensus research surface with strong semantic convergence around the term **SSF**.

It supports a repairable ENS anchor (`fastfinality.eth`) whose wording is adjacent, but not canonical.
