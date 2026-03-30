# Vortik Semantic Registry

Independent semantic registry mapping terminology stabilization across Ethereum coordination primitives and execution pipeline surfaces.

🌐 Registry site:  
https://vortikregistry.github.io/vortik-open-schema/

---

## Overview

The Vortik Semantic Registry documents how coordination terminology stabilizes across Ethereum’s execution and consensus architecture.

Rather than defining protocol rules, the registry:

- maps coordination primitives and surfaces  
- tracks naming convergence across research and implementation  
- positions each concept within the execution pipeline  

Its purpose is to provide a **consistent semantic reference layer** across protocol research, infrastructure, and coordination discussions.

---

## Core Anchors

| Anchor | Canonical Surface | Classification |
|--------|------------------|---------------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (EIP-7732) | core |
| `inclusionlist.eth` | Fork-choice enforced inclusion (FOCIL) | core |
| `commitmentlayer.eth` | Preconfirmation commitment signaling | repairable |
| `preconflayer.eth` | Preconfirmation systems | repairable |
| `fastfinality.eth` | Single Slot Finality (SSF) | valid |
| `buildermarket.eth` | Builder coordination (builder markets) | valid |
| `solverlayer.eth` | Solver networks | repairable |
| `orderflowauction.eth` | Order flow auctions (OFA) | valid |
| `executionmarket.eth` | Execution coordination (ambiguous term) | premature |

---

## Coordination Pipeline (Conceptual)

Order Flow  
↓  
Order Flow Auctions  
↓  
Solver Coordination  
↓  
Execution Coordination (ambiguous surface)  
↓  
Builder Coordination  
↓  
ePBS  
↓  
Inclusion Enforcement  
↓  
Commitment Signaling  
↓  
Preconfirmations  
↓  
Finality (SSF)

---

## ENS Anchor Model

The registry uses ENS identifiers as **semantic anchors** for coordination primitives.

Each anchor connects four layers:

ENS identifier  
↓  
registry.json entry  
↓  
machine-readable schema  
↓  
human-readable anchor  

This architecture separates:

- stable naming surfaces (ENS)  
- evolving semantic structure (registry + schemas)

---

## Methodology

The registry follows a semantic-first approach:

- terminology is tracked before formal standardization  
- primitives are classified by protocol grounding and stability  
- ambiguous terminology is explicitly marked and not canonized prematurely  

Each surface is documented through:

- structured JSON schemas  
- protocol references (EIPs, research threads)  
- canonical terminology mapping  

---

## Schema Model

Schemas describe coordination surfaces using:

- canonical_term  
- classification (core / valid / repairable / premature)  
- pipeline_position  
- coordination_role  
- protocol_grounding  
- naming (ENS mapping)  

This enables consistent comparison across layers of the Ethereum coordination stack.

---

## Scope

The registry tracks coordination surfaces emerging from:

- proposer-builder separation (ePBS)  
- inclusion enforcement (FOCIL)  
- preconfirmation systems  
- solver-based execution and routing  
- builder coordination environments  
- order flow auctions  
- finality research (SSF)  

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

## Status (March 2026)

Most coordination surfaces tracked remain under active research.

Terminology across execution and coordination layers is still evolving and not yet fully stabilized.

---

## Notes

- Independent research artifact  
- Not affiliated with Ethereum Foundation  
- Terminology and classifications may evolve  

---

## Contact

GitHub Issues / Discussions  

Secondary:  
contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
