# Vortik Open Schema (v0.1-alpha)

## Overview
Vortik is a research-oriented initiative focused on semantic stabilization and namespace coordination for emerging Ethereum L1 primitives. 

This repository contains early-stage, public artefacts intended to support clearer terminology mapping across protocol discussions, documentation, and coordination layers.

## The Approach: Semantic Anchors
Vortik explores the use of ENS (Ethereum Name Service) identifiers as root pointers for a decentralized metadata layer. 

The goal is to reduce interpretative drift in decentralized protocol ecosystems by:
1. **Mapping** high-signal protocol primitives to stable identifiers.
2. **Expressing** those identifiers with minimal, machine-readable schema artefacts.
3. **Maintaining** a research-grade posture (no claims of official authority).

## Stewardship Model
Vortik operates under a stewardship-first model. 

Our objective is the eventual transfer (or stewardship alignment) of critical namespace anchors to protocol-aligned entities where appropriate, to support long-term integrity of Ethereum’s L1 identity layer and reduce fragmentation.

## Non-goals (Important)
* This repository **does not claim governance authority** or official affiliation with the Ethereum Foundation, client teams, Flashbots, or any protocol organization.
* This is not a production implementation, standard, or client specification.
* This repository does not represent protocol endorsement or official roadmaps.

## Status
**Active research artefacts.** No production claims.

## Active Monitoring & Alignment

### [Feb 26, 2026] — Post-ACDE #231 Observations
Vortik is currently calibrating its schema artefacts based on today's All Core Devs Execution call:

* **Glamsterdam Upgrade (ePBS):** We are aligning `epbs-schema-v1.json` with the latest discussions on **EIP-7732** payload attributes and the state of `epbs-devnet-0`. The focus is on ensuring `epbs.eth` serves as a stable semantic anchor for proposer-builder coordination.
* **Hegotá Upgrade (FOCIL):** Following the headliner candidacy of **EIP-7805 (FOCIL)** for the Hegotá upgrade, we are prioritizing the stabilization of `inclusionlist.eth`. Our research tracks the semantic boundary between mandatory inclusion and proposer duties.
* **Encrypted Mempools:** Observing technical presentations on **LUCID**. We are evaluating the necessity of a dedicated namespace for privacy-preserving mempool primitives.

## Repository contents
* `epbs-schema-v1.json` — Semantic anchor schema for EIP-7732 / ePBS.
* `inclusionlist-schema-v0.1.json` — Semantic anchor schema for FOCIL / Inclusion Lists.
* `commitmentlayer-schema-v0.1.json` — Semantic anchor schema for commitment / preconfirmation layer.

## Contact / Stewardship inquiries
For research discussion, coordination, or stewardship conversations:

* **X (Twitter):** [https://x.com/VortikRegistry](https://x.com/VortikRegistry)
* **Institutional Inquiry:** contact.preconf@gmail.com

---
*© 2026 Vortik Semantic Registry.*
