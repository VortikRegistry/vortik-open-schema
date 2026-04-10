# Preconfirmation Systems — Sources

## Overview

This document compiles primary references and terminology associated with **preconfirmation systems** within Ethereum execution and sequencing research.

It supports the semantic anchoring of `preconflayer.eth` within the Vortik Semantic Registry.

---

## Research Context

Preconfirmation systems refer to coordination mechanisms that provide **early execution assurances** prior to final block inclusion.

These systems reduce latency and improve execution certainty by enabling proposers or related sequencing actors to issue **credible commitments regarding inclusion or ordering**.

They operate in the gap between:

- execution coordination  
- final inclusion  

Preconfirmation systems interact with multiple adjacent coordination surfaces, including:

- commitment signaling mechanisms  
- proposer commitments  
- inclusion enforcement systems (e.g. inclusion lists)  
- based sequencing architectures  

They shape execution expectations and user-facing guarantees **before consensus-level finalization**.

---

## Structural Role

Preconfirmation systems operate at the **preconfirmation stage** of Ethereum’s coordination pipeline.

They function as a **pre-inclusion coordination mechanism**, enabling early assurances about execution outcomes before protocol-level inclusion and finality are enforced.

Their role is especially relevant in latency-sensitive environments where users or applications require stronger short-term guarantees than raw mempool visibility provides.

---

## Primary Research Threads

- Becoming based: a path towards decentralised sequencing  
  https://ethresear.ch/t/becoming-based-a-path-towards-decentralised-sequencing/21733

- Uncrowdable inclusion lists: the tension between chain neutrality, preconfirmations and proposer commitments  
  https://ethresear.ch/t/uncrowdable-inclusion-lists-the-tension-between-chain-neutrality-preconfirmations-and-proposer-commitments/19372

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- preconfirmation systems  
- preconfirmations  
- based preconfirmations  
- L1 preconfirmations  
- proposer commitments  

This terminology shows **moderate convergence**, but still overlaps with adjacent surfaces such as commitment signaling.

---

## Status

Active research coordination mechanism (2026).

Preconfirmation systems are a structurally important latency and coordination surface within Ethereum’s execution pipeline, particularly in relation to:

- early execution guarantees  
- proposer commitments  
- sequencing coordination  

They are not currently defined as a canonical L1 protocol primitive and remain an evolving research surface.

---

## Notes

This surface captures **pre-inclusion coordination**, where execution expectations are shaped before transactions are finalized on-chain.

It is closely coupled with commitment signaling but remains a **distinct coordination mechanism** focused on latency and user-facing guarantees.
