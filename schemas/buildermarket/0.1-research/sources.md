# Builder Markets — Sources

## Overview

This document compiles primary references and terminology associated with **builder markets** within Ethereum’s execution and block construction ecosystem.

It supports the semantic anchoring of `buildermarket.eth` within the Vortik Semantic Registry and situates builder markets within the broader coordination pipeline.

---

## Research Context

Builder markets describe the competitive environment in which block builders construct execution payloads and compete to supply blocks to proposers.

They emerged as a consequence of proposer-builder separation (PBS), where block construction and block proposal are decoupled.

This separation creates a market structure in which:

- builders compete to construct the most valuable blocks  
- proposers select among competing bids  
- execution value is aggregated and priced before inclusion  

Builder markets are therefore not a protocol primitive, but an **emergent coordination surface** resulting from how execution is organized.

---

## Structural Role

Builder markets operate at the **block construction stage** of the execution pipeline.

They sit downstream from:

- order flow access (OFA)  
- solver-generated execution strategies  

and upstream from:

- proposer selection  
- protocol-level inclusion (ePBS / FOCIL)  

They represent the point where execution strategies are materialized into concrete blocks.

---

## Coordination Dynamics

Builder markets coordinate:

- competition between block builders  
- aggregation of transaction bundles  
- pricing of execution value  
- interaction between builders and proposers  

They create a competitive environment where multiple candidate blocks are produced for each slot.

---

## Relationship to Protocol Design

Builder markets exist because the protocol does not directly perform block construction.

Instead:

- execution is externalized  
- coordination emerges through market mechanisms  
- builders compete under incentive constraints  

This dynamic persists across both PBS and enshrined PBS (ePBS) designs.

---

## Primary Research Threads

- ePBS Design Constraints  
  https://ethresear.ch/t/epbs-design-constraints/18728  

- Why Enshrine Proposer-Builder Separation — A viable path to ePBS  
  https://ethresear.ch/t/why-enshrine-proposer-builder-separation-a-viable-path-to-epbs/15710  

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- builder markets  
- builder market  
- block builder market  
- block building market  
- builder competition  

This terminology reflects ecosystem convergence rather than formal protocol naming.

---

## System Position

Within Ethereum’s coordination pipeline:

Order Flow → Solver Networks → Builder Markets → ePBS → Inclusion → Finality  

Builder markets represent the stage where execution strategies are transformed into candidate blocks competing for inclusion.

---

## Status

Research-aligned coordination surface with strong ecosystem presence.

Builder markets remain a core component of Ethereum’s execution pipeline despite not being a protocol-defined primitive.

---

## Notes

This document reflects observed coordination behavior and research discussion.

It does not define a protocol specification.
