# Solver Networks — Sources

## Overview

This document compiles primary references and terminology associated with **solver networks** within Ethereum execution infrastructure.

It supports the semantic anchoring of `solverlayer.eth` within the Vortik Semantic Registry.

---

## Research Context

Solver networks refer to coordination mechanisms where specialised actors (solvers) compete to determine optimal execution outcomes for user intents.

These systems emerge primarily within intent-based architectures, where users express desired outcomes rather than explicit transactions.

Solver networks are responsible for:

- interpreting user intents  
- computing valid execution paths  
- selecting optimal outcomes under constraints  

They represent a shift from transaction submission toward **outcome-based execution coordination**.

---

## Structural Role

Solver networks operate at the **solver coordination stage** of Ethereum’s execution pipeline.

They sit downstream from:

- order flow access  

and upstream from:

- builder coordination  
- preconfirmation systems  
- protocol-level inclusion  

Their role is to transform user intents into executable payload candidates.

---

## Coordination Dynamics

Solver networks introduce competition over:

- execution outcomes  
- routing strategies  
- constraint satisfaction  

Rather than competing for block space directly, solvers compete to produce **valid and optimal execution bundles** that can be forwarded to builders.

---

## Research Surface

Discussion around solver networks appears across Ethereum research and ecosystem exploration of:

- intent-based execution  
- solver competition models  
- execution routing  
- outcome-based coordination  

Representative discussions can be found across:

- Ethereum Research forum  
  https://ethresear.ch/

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- solver networks  
- intent solvers  
- execution solvers  
- solver layer (non-canonical)  

This terminology is still evolving, with no fully stabilized canonical naming.

---

## Status

Active research coordination surface (2026).

Solver networks are already present in production intent frameworks, but remain an evolving and non-canonical component of Ethereum’s coordination architecture.

---

## Notes

Solver networks externalize execution decision-making from the protocol.

They form a critical part of the system where:

- execution is determined  
- but not yet enforced  

This makes them a key coordination surface in Ethereum’s transition toward externally coordinated execution and protocol-enforced validation.
