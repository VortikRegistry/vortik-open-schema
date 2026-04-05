# Preconfirmation Commitments — Sources

## Overview

This document compiles primary references and terminology associated with **preconfirmation commitments** within Ethereum execution, sequencing, and latency-sensitive coordination research.

It supports the semantic anchoring of `commitmentlayer.eth` within the Vortik Semantic Registry.

---

## Research Context

Preconfirmation commitments refer to mechanisms through which proposers, builders, or related sequencing actors provide **early, credible commitments** regarding future transaction inclusion, ordering, or execution outcomes.

These commitments are a core component of:

- preconfirmation systems  
- proposer commitments  
- transaction inclusion assurances  
- sequencing coordination  

They emerge in research focused on:

- reducing execution uncertainty  
- improving low-latency transaction experience  
- coordinating transaction flow before final block inclusion  
- separating economic guarantees from protocol guarantees  

---

## Structural Role

Preconfirmation commitments operate at the **preconfirmation stage** of Ethereum’s coordination pipeline.

They function as a **guarantee mechanism**, enabling actors to signal expected execution outcomes before protocol-level inclusion and finality.

They sit between:

- execution coordination  
- protocol-enforced inclusion  

and shape execution expectations prior to on-chain confirmation.

---

## Guarantee Dynamics

Preconfirmation commitments introduce a separation between:

- **economic guarantees** (early commitments, preconfirmations)  
- **protocol guarantees** (actual inclusion and finality)  

This distinction is critical, since execution may be perceived as confirmed before it is finalized on-chain.

---

## Primary Research Threads

- Uncrowdable inclusion lists: the tension between chain neutrality, preconfirmations and proposer commitments  
  https://ethresear.ch/t/uncrowdable-inclusion-lists-the-tension-between-chain-neutrality-preconfirmations-and-proposer-commitments/19372

- Becoming based: a path towards decentralised sequencing  
  https://ethresear.ch/t/becoming-based-a-path-towards-decentralised-sequencing/21733

---

## Terminology Surface

Common terminology associated with this surface includes:

- preconfirmation commitments  
- proposer commitments  
- preconfirmations  
- commitment signaling  

This terminology remains fluid and overlaps with adjacent surfaces such as preconfirmation systems.

---

## Status

Active research coordination mechanism (2026).

Preconfirmation commitments are a structurally important component of Ethereum’s execution pipeline, particularly in relation to:

- early execution guarantees  
- proposer commitments  
- sequencing coordination  

They are not currently defined as a canonical L1 protocol primitive and remain an evolving research surface.

---

## Notes

This document reflects observed research discussion and terminology convergence.

Preconfirmation commitments are closely coupled with preconfirmation systems, but represent a **more specific mechanism focused on signaling and guarantees**, rather than the full coordination surface.
