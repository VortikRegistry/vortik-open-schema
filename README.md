Vortik Semantic Registry

Independent semantic registry mapping terminology stabilization across Ethereum coordination primitives and execution pipeline surfaces.

🌐 Registry site:
https://vortikregistry.github.io/vortik-open-schema/

---

Overview

The Vortik Semantic Registry documents how coordination terminology stabilizes across Ethereum’s execution and consensus architecture.

Rather than defining protocol rules, the registry operates as a semantic coordination layer:

- maps coordination primitives and surfaces
- tracks naming convergence across research and implementation
- distinguishes protocol-defined primitives from ecosystem abstractions

Its purpose is to provide a consistent semantic reference layer across protocol research, infrastructure, and coordination discussions.

---

Research Layer

Vortik includes independent structural research exploring coordination dynamics across Ethereum.

Security Hourglass — Coordination Compression Model

A structural model describing how coordination pressure compresses across Ethereum layers:

- order flow access
- solver coordination
- builder coordination (ePBS context)
- inclusion enforcement (FOCIL)
- commitment and preconfirmation layers
- finality (SSF research track)

📄 Read the full document:
https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/security-hourglass/Security_Hourglass_Model_V5_1E_Final_Designed.pdf

📂 Explore the section:
https://github.com/VortikRegistry/vortik-open-schema/tree/main/docs/security-hourglass

---

Core Anchors

Anchor| Canonical Surface| Classification
"epbs.eth"| enshrined proposer-builder separation (EIP-7732)| core
"inclusionlist.eth"| fork-choice enforced inclusion lists (FOCIL)| core
"commitmentlayer.eth"| preconfirmation commitments| repairable
"preconflayer.eth"| preconfirmation systems| repairable
"fastfinality.eth"| single-slot finality (SSF)| repairable
"buildermarket.eth"| builder markets| repairable
"solverlayer.eth"| solver networks| repairable
"orderflowauction.eth"| order flow auctions (OFA)| repairable
"executionmarket.eth"| execution coordination (ambiguous term)| premature

---

Coordination Model (Interpretive)

The registry does not define a strict execution sequence.

However, recurring coordination surfaces can be grouped as:

- order flow access
- solver coordination
- builder coordination
- inclusion
- commitments and preconfirmations
- finality

Some ecosystem abstractions (e.g. order flow auctions, builder markets) operate within or across these surfaces.

Ambiguous terms (e.g. execution coordination) are tracked but not treated as distinct layers.

---

ENS Anchor Model

The registry uses ENS identifiers as semantic anchors for coordination primitives.

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

Methodology

The registry follows a semantic-first approach:

- terminology stabilizes before formal standardization
- protocol-defined primitives take precedence over market abstractions
- ambiguous terminology is explicitly tracked and not prematurely canonized

Each surface is documented through:

- structured JSON schemas
- protocol references (EIPs, research threads)
- canonical terminology mapping

---

Strategic Context

As Ethereum coordination evolves:

- coordination is increasingly enforced at the protocol level
- market-based abstractions lose precision over time
- naming converges around primitives, roles, and objects

This registry operates at the point where semantic convergence precedes implementation lock-in.

---

Scope

The registry tracks coordination surfaces emerging from:

- proposer-builder separation (ePBS)
- inclusion enforcement (FOCIL)
- preconfirmation systems
- solver-based execution
- order flow access mechanisms
- finality research (SSF)

It does not:

- define protocol specifications
- replace EIPs
- introduce new standards

---

Machine-Readable Registry

https://vortikregistry.github.io/vortik-open-schema/registry.json

Supporting artifacts:

- "registry.json" — canonical index
- "anchors.index.json" — anchor catalogue
- "schemas/<anchor>/<version>/schema.json"
- "anchors/<anchor>.md"

---

Status (March 2026)

Most coordination surfaces remain under active research.

Terminology is still evolving, but key primitives and roles are beginning to stabilize.

---

Positioning

Vortik acts as a semantic interface between:

- protocol primitives
- coordination mechanisms
- evolving terminology across the ecosystem

It does not define the protocol.

It maps how the protocol is becoming structurally legible.

---

Notes

- independent research artifact
- not affiliated with Ethereum Foundation
- terminology and classifications may evolve

---

Contact

GitHub Issues / Discussions

Secondary:
contact.preconf@gmail.com

---

© 2026 Vortik Semantic Registry
