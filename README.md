# Vortik Semantic Registry

🌐 Registry site:  
https://vortikregistry.github.io/vortik-open-schema/

Independent research registry tracking semantic stabilization across emerging Ethereum coordination primitives.

---

## Core Anchors

| Anchor | Primitive Surface | Status |
|------|-----------------|------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (EIP-7732) | Draft EIP |
| `inclusionlist.eth` | Inclusion Enforcement / FOCIL (EIP-7805) | Draft EIP |
| `commitmentlayer.eth` | Commitment signaling & L1 preconfirmation coordination | Active Research |
| `preconflayer.eth` | Based preconfirmations & latency coordination networks | Active Research |
| `fastfinality.eth` | Single Slot Finality (SSF research track) | Active Research |

Each anchor is accompanied by a versioned JSON schema artifact under `/schemas/`.

---

## ENS Anchor Model

The Vortik registry uses **ENS identifiers as semantic anchors** for emerging Ethereum coordination primitives.

Each anchor connects four layers:

ENS identifier  
↓  
registry entry (`registry.json`)  
↓  
machine-readable schema  
↓  
human-readable anchor documentation

Example structure:

epbs.eth  
↓  
registry.json entry  
↓  
schemas/epbs/1.0-draft/schema.json  
↓  
anchors/epbs.md

This architecture separates **stable conceptual naming (ENS)** from **evolving research metadata (schemas and registry entries)**.

ENS identifiers therefore act as **neutral conceptual anchors**, while the registry documents terminology convergence and research evolution across coordination primitives.

---

## Associated ENS Anchors

The following ENS names correspond to conceptual anchors for primitives referenced in this registry:

- epbs.eth  
- inclusionlist.eth  
- commitmentlayer.eth  
- preconflayer.eth  
- buildermarket.eth  
- solverlayer.eth  
- executionmarket.eth  
- orderflowauction.eth  

These identifiers are referenced as semantic anchors for emerging Ethereum infrastructure primitives and research areas.

---

## Purpose

Vortik exists to:

- Track terminology stabilization across Ethereum coordination primitives
- Separate canonical primitives from naming drift
- Provide minimal semantic metadata schemas
- Document conceptual boundaries across coordination layers

This registry does **not** define protocol rules.  
It documents naming surfaces and terminology convergence across coordination primitives discussed in Ethereum research.

---

## Scope

Vortik monitors conceptual convergence across research areas including:

- Enshrined proposer-builder separation
- Inclusion enforcement models (FOCIL and related proposals)
- Commitment signaling and preconfirmation coordination
- Based sequencing research
- Solver networks and intent-based execution systems
- Execution markets and block construction coordination
- Order flow auctions and transaction routing infrastructure
- Single-slot finality research (SSF and variants)
- Emerging encrypted mempool designs

Roadmap identifiers may evolve as research progresses.  
Vortik prioritizes conceptual anchors over implementation-era naming.

---

## Repository Structure

Each schema directory includes:

- `schema.json` — minimal semantic metadata structure
- `sources.md` — primary research references
- optional documentation describing terminology and status

Schemas are versioned (for example `0.1-draft`, `1.0-draft`, `0.1-research`) to reflect maturity and revision history.

---

## Anchors Directory

The `/anchors/` directory contains minimal orientation documents for each semantic anchor tracked by the registry.

Each anchor file describes:

- the conceptual primitive
- its research context
- the coordination surface it represents

Detailed machine-readable metadata is defined in the corresponding schemas under `/schemas/`.

---

## Machine-Readable Registry

The canonical machine-readable index is available at:

https://vortikregistry.github.io/vortik-open-schema/registry.json

Supporting registry artifacts:

- `registry.json` — canonical registry index  
- `anchors.index.json` — anchor catalogue  
- `schemas/<anchor>/<version>/schema.json` — semantic metadata  
- `anchors/<anchor>.md` — conceptual documentation  

These files allow tools and documentation systems to reference the registry programmatically.

---

## Repository

GitHub repository:

https://github.com/VortikRegistry/vortik-open-schema

---

## How to Use

Schemas in this registry can be referenced for:

- documentation metadata
- research coordination
- tooling experiments
- terminology alignment discussions

Tools and documentation systems may reference registry entries through:

`registry.json`

or by directly linking to schema versions under:

`/schemas/<anchor>/<version>/schema.json`

To suggest improvements or report terminology drift, open a GitHub Issue and include primary research sources.

---

## How to Cite

If you reference this registry in research or documentation:

Vortik Semantic Registry  
https://vortikregistry.github.io/vortik-open-schema/

Citation metadata is also available through the repository's `CITATION.cff` file.

---

## Stewardship Policy

Vortik operates as an independent research registry.

- No governance mandate  
- No protocol authority  
- No formal affiliation with client teams or the Ethereum Foundation  
- No commercial claim over protocol primitives  

Identifiers are stewarded under a research-first, neutrality-preserving posture.

Alignment discussions may occur when appropriate.

---

## Status (March 2026)

Most tracked primitives remain under research or draft EIP status.  
No hard-fork inclusion is assumed unless explicitly referenced in primary sources.

---

## Contact

Primary contact: GitHub Issues / Discussions  

Stewardship inquiries (secondary):  
contact.preconf@gmail.com  

---

## Tracked Ethereum Primitives

The registry currently tracks several coordination primitives discussed across Ethereum protocol research.

These primitives appear across research threads related to proposer-builder separation, censorship resistance, transaction ordering guarantees, execution markets and block construction infrastructure.

### Primitives

- epbs — Enshrined Proposer-Builder Separation  
- inclusionlist — Inclusion enforcement mechanisms  
- preconflayer — Preconfirmation coordination models  
- commitmentlayer — Commitment signaling systems  
- buildermarket — Block builder market structures  
- solverlayer — Intent solver coordination networks  
- executionmarket — Execution market coordination layer  
- orderflowauction — Order flow auction routing infrastructure  
- fastfinality — Single slot finality research  

These anchors are documented through schemas and reference sources in the registry.

---

© 2026 Vortik Semantic Registry
