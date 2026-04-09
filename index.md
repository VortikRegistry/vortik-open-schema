# Vortik Semantic Registry

📄 Canonical Registry Document (PDF)  
A structured overview of the registry, coordination primitives, and semantic anchoring.

→ "Download PDF" (docs/vortik-semantic-registry.pdf)

---

Independent machine-readable registry mapping terminology convergence and semantic stabilization across Ethereum coordination primitives, roles, and emerging coordination structures.

The registry connects:

- protocol primitives  
- coordination roles  
- enforcement mechanisms  
- evolving terminology  

to stable ENS identifiers and versioned schemas.

---

## Why this registry exists

Terminology in Ethereum research often stabilizes before formal standardization.

Different teams may refer to similar coordination mechanisms using different terms, creating fragmentation across discussions.

The Vortik Semantic Registry exists to:

- track terminology convergence across research  
- provide stable semantic anchors via ENS  
- enable machine-readable referencing  
- distinguish protocol primitives from abstractions  

This registry does not define standards.

It documents how coordination structure becomes semantically stable.

---

## Navigation

- "Anchors" (anchors/)  
- "Schemas" (schemas/)  
- "Registry index (registry.json)" (registry.json)  
- "Repository on GitHub" (https://github.com/VortikRegistry/vortik-open-schema)  

---

## Core Primitives

- "epbs.eth" (anchors/epbs.md) — enshrined proposer-builder separation (EIP-7732)  
- "inclusionlist.eth" (anchors/inclusionlist.md) — fork-choice enforced inclusion (FOCIL / EIP-7805)  

---

## Coordination Mechanisms

- "commitmentlayer.eth" (anchors/commitmentlayer.md) — commitment signaling *(repairable)*  
- "preconflayer.eth" (anchors/preconflayer.md) — preconfirmation systems *(repairable)*  
- "fastfinality.eth" (anchors/fastfinality.md) — single-slot finality (SSF) *(repairable)*  

---

## Coordination Surfaces

- "solverlayer.eth" (anchors/solverlayer.md) — solver coordination *(repairable)*  
- "orderflowauction.eth" (anchors/orderflowauction.md) — order flow auctions (OFA) *(valid)*  

---

## Ambiguous / Transitional Surfaces

- "executionmarket.eth" (anchors/executionmarket.md) — execution coordination (ambiguous term) *(premature)*  
- "buildermarket.eth" (anchors/buildermarket.md) — builder markets (legacy abstraction) *(premature)*  

---

## Structural Context

Ethereum coordination is evolving toward:

- role-based interaction  
- commitment-driven validation  
- constraint-enforced inclusion  
- asynchronous execution pipelines  

The system is increasingly defined by:

→ roles  
→ commitments  
→ constraints  
→ coordination stages  

As a result:

- market-based abstractions lose precision  
- protocol-defined primitives become dominant  

---

## Disclaimer

This is an independent research artifact.

It is not affiliated with the Ethereum Foundation or any core development team.

Terminology and classifications may evolve as research progresses.
