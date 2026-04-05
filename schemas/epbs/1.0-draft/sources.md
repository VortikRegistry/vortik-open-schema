# ePBS — Sources

## Overview

This document compiles primary references and terminology associated with **Enshrined Proposer-Builder Separation (ePBS)**.

It supports the semantic anchoring of `epbs.eth` within the Vortik Semantic Registry.

---

## Canonical Specification

- EIP-7732 — Enshrined Proposer-Builder Separation  
  https://eips.ethereum.org/EIPS/eip-7732  

---

## Research Context

ePBS represents the protocol-level integration of proposer-builder separation within Ethereum consensus.

It formalizes the separation between:

- block proposal  
- execution payload construction  

and removes reliance on external relay infrastructure by embedding coordination directly into the protocol.

This transition reflects a broader shift toward **protocol-enforced coordination**, where execution is externalized but validation and selection are enforced by consensus.

---

## Structural Role

ePBS operates at the boundary between:

- builder coordination  
- inclusion  

It defines a **protocol-level interface** between proposers and builders, restructuring how execution payloads are constructed, selected, and included.

---

## Architectural Impact

ePBS introduces a fundamental architectural shift:

- from **off-protocol coordination** (e.g. MEV-Boost, relays)  
- to **protocol-enforced coordination**  

This changes:

- how block construction is organized  
- how proposer roles interact with builders  
- how execution flows interface with consensus  

Under ePBS, builder roles become protocol-defined and payloads become consensus-validated objects.

---

## Core Research Themes

Research discussions around ePBS focus on:

- protocol-level builder selection  
- payload commitment mechanisms  
- proposer-builder coordination  
- block production structure  
- MEV supply chain redesign  

---

## Primary Research Threads

- Why Enshrine Proposer-Builder Separation — A viable path to ePBS  
  https://ethresear.ch/t/why-enshrine-proposer-builder-separation-a-viable-path-to-epbs/15710  

- ePBS Design Constraints  
  https://ethresear.ch/t/epbs-design-constraints/18728  

---

## Roadmap Context

ePBS is part of Ethereum’s evolution toward a structured coordination pipeline for block production.

- Vitalik Buterin — “Finally, the block building pipeline”  
  https://firefly.social/post/x/2027405  

---

## Terminology Surface

Common terminology associated with this primitive includes:

- enshrined PBS  
- proposer-builder separation  
- builder selection  
- payload commitment  
- block construction pipeline  

This terminology shows strong semantic convergence across research and core development discussions.

---

## Status

Draft EIP (active research and specification phase).

ePBS has high protocol relevance and strong likelihood of long-term adoption, pending:

- client implementation readiness  
- consensus among core developers  

---

## Notes

This document reflects canonical specification and active research convergence.

It describes a **protocol-level interface primitive** with structural impact on Ethereum’s coordination pipeline.
