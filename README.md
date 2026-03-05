# Vortik Semantic Registry

🌐 Registry site:
https://vortikregistry.github.io/vortik-open-schema/

Independent research registry tracking semantic stabilization across emerging Ethereum L1 coordination primitives.

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

## Associated ENS Anchors

The following ENS names correspond to conceptual anchors for primitives referenced in this registry:

- epbs.eth  
- inclusionlist.eth  
- commitmentlayer.eth  
- preconflayer.eth  
- buildermarket.eth  
- solverlayer.eth  

These identifiers are referenced as semantic anchors for emerging Ethereum infrastructure primitives and research areas.

---

## Purpose

Vortik exists to:

- Track terminology stabilization across Ethereum L1 primitives
- Separate canonical primitives from naming drift
- Provide minimal semantic metadata schemas
- Document conceptual boundaries across coordination layers

This registry does **not** define protocol rules.  
It documents naming surfaces and research convergence across primitives.

---

## Scope

Vortik monitors conceptual convergence across research areas including:

- Enshrined proposer-builder separation
- Inclusion enforcement models (FOCIL and related proposals)
- Commitment signaling and preconfirmation coordination
- Based sequencing research
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

## Repository

[View the repository on GitHub](https://github.com/VortikRegistry/vortik-open-schema)

---

## How to Use

Schemas in this registry can be referenced for:

- documentation metadata
- research coordination
- tooling experiments
- terminology alignment discussions

To suggest improvements or report terminology drift, open a GitHub Issue and include primary research sources.

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
Stewardship inquiries (secondary): contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
