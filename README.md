# Vortik Semantic Registry

Independent research registry tracking semantic stabilization across emerging Ethereum coordination primitives.

🌐 Registry site:  
https://vortikregistry.github.io/vortik-open-schema/

---

## Overview

The Vortik Semantic Registry documents how terminology evolves across Ethereum’s execution and consensus pipeline.

Rather than defining protocol rules, the registry focuses on:

- identifying coordination primitives  
- tracking naming convergence  
- mapping concepts to their position in the execution pipeline  

The goal is to provide a consistent semantic reference layer across research, infrastructure and protocol discussions.

---

## Core Anchors

| Anchor | Primitive Surface | Classification |
|--------|------------------|---------------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (EIP-7732) | core |
| `inclusionlist.eth` | Inclusion enforcement / FOCIL (EIP-7805) | emerging |
| `commitmentlayer.eth` | Commitment signaling coordination | emerging |
| `preconflayer.eth` | Preconfirmation coordination networks | emerging |
| `fastfinality.eth` | Single Slot Finality (SSF) | emerging |
| `buildermarket.eth` | Builder coordination environments | adjacent |
| `solverlayer.eth` | Solver-based execution coordination | adjacent |
| `orderflowauction.eth` | Order flow auction routing systems | adjacent |
| `executionmarket.eth` | Execution coordination (ambiguous term) | premature |

---

## Coordination Pipeline (Conceptual)

Order Flow  
↓  
Order Flow Auctions  
↓  
Solver Coordination  
↓  
Execution Coordination (ambiguous)  
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

The registry uses ENS identifiers as semantic anchors for coordination primitives.

Each anchor connects four layers:

ENS identifier ↓ registry.json entry ↓ machine-readable schema ↓ human-readable anchor

This architecture separates:

- stable conceptual naming (ENS)  
- evolving research metadata (schemas + registry)

---

## Methodology

The registry follows a semantic-first approach:

- terminology is tracked before standardization  
- primitives are classified by stability and protocol grounding  
- ambiguous terms are explicitly marked and not prematurely canonized  

Each primitive is documented through:

- structured JSON schemas  
- source mapping (EIPs, research threads)  
- terminology surfaces  

---

## Schema Model

Schemas describe coordination surfaces using:

- canonical_term  
- classification (core / emerging / adjacent / premature)  
- pipeline_position  
- coordination_role  
- protocol_grounding  
- naming (ENS mapping)  

This enables consistent comparison across layers of the Ethereum stack.

---

## Scope

The registry tracks coordination primitives emerging from:

- proposer-builder separation (ePBS)  
- inclusion enforcement (FOCIL)  
- preconfirmation systems  
- solver-based execution and routing  
- builder coordination environments  
- order flow auctions  
- finality research (SSF)  

It does not aim to:

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

Most tracked primitives remain under active research.

Terminology across coordination layers is still evolving and has not yet fully stabilized.

---

## Notes

- Independent research work  
- Not affiliated with Ethereum Foundation  
- Terminology may evolve  

---

## Contact

GitHub Issues / Discussions  

Secondary:  
contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
