# Vortik Semantic Registry

Independent semantic registry mapping terminology stabilization across Ethereum coordination primitives and execution pipeline surfaces.

🌐 Registry site:  
https://vortikregistry.github.io/vortik-open-schema/

---

## Overview

The Vortik Semantic Registry documents how coordination terminology stabilizes across Ethereum’s execution and consensus architecture.

Rather than defining protocol rules, the registry operates as a semantic coordination layer:

- maps coordination primitives and surfaces  
- tracks naming convergence across research and implementation  
- positions each concept within the coordination pipeline  

Its purpose is to provide a **consistent semantic reference layer** across protocol research, infrastructure, and coordination discussions.

---

## Research Layer

Vortik includes independent structural research exploring coordination dynamics across Ethereum.

### Security Hourglass — Coordination Compression Model

A structural model describing how coordination pressure compresses across Ethereum layers:

- order flow & execution  
- builder coordination (ePBS context)  
- inclusion enforcement (FOCIL)  
- commitment and preconfirmation layers  
- finality (SSF research track)  

📄 Read the full document:  
https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/security-hourglass/Security_Hourglass_Model_V5_1E_Final_Designed.pdf

📂 Explore the section:  
https://github.com/VortikRegistry/vortik-open-schema/tree/main/docs/security-hourglass

This model provides the conceptual framing behind the registry.

---

## Core Anchors

| Anchor | Canonical Surface | Classification |
|--------|------------------|---------------|
| `epbs.eth` | enshrined proposer-builder separation (EIP-7732) | core |
| `inclusionlist.eth` | fork-choice enforced inclusion lists (FOCIL) | core |
| `commitmentlayer.eth` | commitment signaling (preconfirmation-related) | repairable |
| `preconflayer.eth` | preconfirmation systems | repairable |
| `fastfinality.eth` | single-slot finality (SSF) | repairable |
| `buildermarket.eth` | builder coordination / builder markets | valid |
| `solverlayer.eth` | solver networks | repairable |
| `orderflowauction.eth` | order flow auctions (OFA) | valid |
| `executionmarket.eth` | execution coordination (ambiguous term) | premature |

These anchors reflect emerging semantic convergence across Ethereum coordination architecture.

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
Inclusion  
↓  
Commitment Signaling  
↓  
Preconfirmations  
↓  
Finality (SSF)

---

## Coordination Stack

Ethereum is increasingly understood as a coordination system rather than only an execution engine.

This repository maps how coordination becomes explicit across the stack:

Order Flow  
→ Order Flow Auctions  
→ Solver Networks  
→ Builder Coordination  
→ Inclusion  
→ Commitments  
→ Preconfirmations  
→ Finality  

Explore the structured map:

→ [`maps/coordination-stack.json`](maps/coordination-stack.json)  
→ [`maps/README.md`](maps/README.md)

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

- terminology stabilizes before formal standardization  
- primitives are classified by protocol grounding and stability  
- ambiguous terminology is explicitly marked and not canonized prematurely  

Each surface is documented through:

- structured JSON schemas  
- protocol references (EIPs, research threads)  
- canonical terminology mapping  

---

## Strategic Context

As Ethereum coordination layers evolve:

- terminology tends to stabilize before standards  
- coordination surfaces compress into fewer critical layers  
- naming becomes infrastructure  

This registry operates at that intersection.

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

## Positioning

Vortik acts as a semantic interface between:

- emerging coordination primitives  
- infrastructure-level implementation  
- terminology stabilization across the ecosystem  

It does not define the protocol.

It maps how the protocol is becoming structured.

---

## Notes

- independent research artifact  
- not affiliated with Ethereum Foundation  
- terminology and classifications may evolve  

---

## Contact

GitHub Issues / Discussions  

Secondary:  
contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
