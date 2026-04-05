# Builder Markets — Sources

## Overview

This document compiles primary references and terminology associated with **builder markets** within Ethereum’s execution and block construction ecosystem.

It supports the semantic anchoring of `buildermarket.eth` within the Vortik Semantic Registry and situates builder markets within the broader coordination pipeline.

---

## Research Context

Builder markets describe the competitive environment in which block builders construct execution payloads and compete to supply blocks to proposers.

They emerged as a consequence of proposer-builder separation (PBS), where block construction and block proposal are decoupled.

This separation creates a market structure in which:

- builders compete to construct execution payloads  
- proposers select among competing bids  
- execution value is aggregated prior to inclusion  

However, with the progression toward **enshrined PBS (ePBS)**, this coordination is increasingly defined at the protocol level.

As a result, builder markets are better understood as a **transitional abstraction**, rather than a stable architectural component.

---

## Structural Role

Builder markets operate at the **block construction stage** of the execution pipeline.

They sit downstream from:

- order flow access  
- solver-generated execution strategies  

and upstream from:

- proposer selection  
- protocol-level inclusion (ePBS / FOCIL)  

They describe how execution payloads are constructed and competed over before inclusion.

---

## Structural Shift

The role of builder markets is evolving due to protocol changes.

With ePBS:

- builder roles become protocol-defined  
- payload construction becomes standardized  
- proposer-builder interaction is formalized  

This shifts the system from:

- market-based coordination  

to:

- role-based, protocol-enforced coordination  

As a result, the concept of “builder markets” loses precision as a primary descriptor of system behavior.

---

## Research Surface

Discussion of builder markets appears across:

- PBS and MEV supply chain research  
- MEV-Boost and relay-based architectures  
- block construction competition models  

Representative discussions can be found across:

- Ethereum Research  
  https://ethresear.ch/

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- builder markets  
- builder competition  
- block building markets  
- PBS markets  

This terminology shows **historical convergence**, but is increasingly being replaced by:

- builder roles  
- payload construction  
- proposer-builder interfaces  

---

## Status

Transitional / declining coordination abstraction (2026).

Builder markets remain relevant as a descriptive model of block construction competition, but are being superseded by protocol-level definitions of builder roles and interactions.

They are not a canonical L1 primitive and are tracked as a **legacy abstraction within the execution pipeline**.

---

## Notes

This surface captures how block construction was historically organized under market-based coordination.

Its role is being redefined as Ethereum transitions toward protocol-enforced builder semantics under ePBS.
