# Vortik Semantic Registry

Independent semantic registry mapping terminology stabilization across Ethereum coordination primitives, protocol roles, constraints, commitments, and evolving coordination surfaces.

🌐 Registry site:  
https://vortikregistry.github.io/vortik-open-schema/

---

## Overview

The Vortik Semantic Registry documents how coordination terminology stabilizes across Ethereum’s evolving execution and consensus architecture.

Rather than defining protocol rules, the registry operates as a semantic coordination layer:

- maps protocol primitives and coordination surfaces
- tracks naming convergence across research, implementation, and infrastructure
- distinguishes protocol-defined primitives from ecosystem abstractions
- preserves unstable or transitional terms without prematurely canonizing them

Its purpose is to provide a consistent semantic reference layer across protocol research, infrastructure, and coordination discussions.

---

## Research Layer

Vortik includes independent structural research exploring coordination dynamics across Ethereum.

### Security Hourglass — Coordination Compression Model

A structural model describing how coordination pressure compresses across Ethereum coordination surfaces:

- order flow access
- solver coordination
- builder / proposer coordination under ePBS
- inclusion constraints (FOCIL)
- commitments and preconfirmation systems
- confirmation and finality evolution

📄 Read the full document:  
https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/security-hourglass/Security_Hourglass_Model_V5_1E_Final_Designed.pdf

📂 Explore the section:  
https://github.com/VortikRegistry/vortik-open-schema/tree/main/docs/security-hourglass

---

## Core Anchors

| Anchor | Canonical Surface | Classification |
|---|---|---|
| `epbs.eth` | enshrined proposer-builder separation (EIP-7732) | core |
| `inclusionlist.eth` | fork-choice enforced inclusion lists (FOCIL) | core |
| `commitmentlayer.eth` | commitment signaling / commitment surfaces | repairable |
| `preconflayer.eth` | preconfirmation systems | repairable |
| `fastfinality.eth` | single-slot finality (SSF) | repairable |
| `buildermarket.eth` | builder markets | premature |
| `solverlayer.eth` | solver networks | repairable |
| `orderflowauction.eth` | order flow auctions (OFA) | valid |
| `executionmarket.eth` | execution coordination (ambiguous term) | premature |

---

## Coordination Model

The registry does not define a strict execution sequence.

Instead, Ethereum is interpreted as an evolving coordination system composed of:

- protocol-defined roles
- verifiable commitments
- enforced constraints
- execution and confirmation flows
- coordination surfaces across research and implementation

Recurring coordination dimensions include:

- order flow access and routing
- solver participation
- builder / proposer coordination
- inclusion constraints
- commitment and preconfirmation systems
- confirmation and finality

Some ecosystem abstractions operate across these dimensions, but are not treated as canonical protocol categories.

---

## ENS Anchor Model

The registry uses ENS identifiers as semantic anchors for coordination primitives and surfaces.

Each anchor connects four layers:

ENS identifier  
↓  
registry.json entry  
↓  
machine-readable schema  
↓  
human-readable anchor document

This architecture separates:

- stable naming surfaces (ENS)
- evolving semantic structure (registry + schemas)
- human-readable semantic interpretation (anchors)

---

## Methodology

The registry follows a semantic-first approach:

- terminology stabilizes before formal standardization
- protocol-defined primitives take precedence over market abstractions
- ambiguous terminology is explicitly tracked and not prematurely canonized
- transitional abstractions are preserved when they still help explain coordination shifts

Each surface is documented through:

- structured JSON schemas
- protocol references (EIPs, research threads, implementation signals)
- canonical terminology mapping

---

## Strategic Context

As Ethereum coordination evolves:

- coordination is increasingly enforced at the protocol level
- market-based abstractions lose precision over time
- naming converges around primitives, roles, commitments, constraints, and protocol objects
- execution and confirmation are becoming more structurally distinct under post-ePBS designs

This registry operates at the point where semantic convergence precedes implementation lock-in.

---

## Scope

The registry tracks coordination surfaces emerging from:

- proposer-builder separation (ePBS)
- inclusion enforcement (FOCIL)
- preconfirmation systems
- solver-based execution
- order flow access mechanisms
- finality and confirmation evolution
- related commitment structures

It does not:

- define protocol specifications
- replace EIPs
- introduce new standards

---

## Machine-Readable Registry

https://vortikregistry.github.io/vortik-open-schema/registry.json

Supporting artifacts:

- `registry.json` — canonical index
- `anchors.index.json` — anchor catalogue
- `schemas/<anchor>/<version>/schema.json`
- `anchors/<anchor>.md`

---

## Classification System

The registry uses the following semantic classifications:

- `core` — protocol-aligned primitive
- `valid` — real coordination surface with stable meaning
- `repairable` — valid concept with naming misalignment
- `premature` — ambiguous, unstable, or structurally weak terminology
- `deprecated` — superseded abstraction or semantically obsolete category

---

## Status (April 2026)

Ethereum coordination is transitioning from research-dominant framing toward implementation-grade semantic stabilization.

Some terms are now strongly convergent:

- ePBS
- inclusion lists / FOCIL
- builder
- proposer

Other terms remain unstable or transitional:

- preconfirmations
- solver naming surfaces
- execution market abstractions
- market / layer framings inherited from older coordination models

---

## Positioning

Vortik acts as a semantic interface between:

- protocol primitives
- coordination mechanisms
- evolving terminology across the ecosystem

It does not define the protocol.

It maps how the protocol is becoming structurally legible.

---

## Notes

- independent research artifact
- not affiliated with the Ethereum Foundation
- terminology and classifications may evolve as implementation and convergence progress

---

## Contact

GitHub Issues / Discussions

Secondary:  
contact.preconf@gmail.com

---

© 2026 Vortik Semantic Registry
