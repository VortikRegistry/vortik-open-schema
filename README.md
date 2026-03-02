# Vortik Semantic Registry

Independent research initiative tracking semantic stabilization  
across emerging Ethereum L1 coordination primitives.

---

## Core Anchors

| Anchor | Primitive Surface | Status |
|--------|-------------------|--------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (EIP-7732) | Draft EIP |
| `inclusionlist.eth` | Inclusion Enforcement / FOCIL (EIP-7805) | Draft EIP |
| `commitmentlayer.eth` | Commitment signaling & L1 preconfirmation coordination | Active Research |
| `preconflayer.eth` | Based preconfirmations & latency networks | Active Research |
| `fastfinality.eth` | Single Slot Finality (SSF research track) | Research |

Each anchor is accompanied by a versioned JSON schema artefact under `/schemas/`.

---

## Purpose

Vortik exists to:

- Track terminology stabilization across Ethereum L1 primitives  
- Separate canonical primitives from naming drift  
- Provide minimal semantic metadata schemas  
- Document conceptual boundaries across coordination layers  

This registry does not define protocol rules.  
It documents naming surfaces and research convergence.

---

## Scope

Vortik monitors conceptual convergence across:

- Enshrined PBS (upgrade path; roadmap naming may evolve)
- Inclusion enforcement models (FOCIL and alternatives)
- Commitment signaling & preconfirmation layers
- Based sequencing research
- Single-slot finality research (SSF / variants)
- Emerging encrypted mempool models

Roadmap identifiers may evolve.  
Vortik tracks conceptual anchors first, implementation references second.

---

## Repository Structure

Each schema directory includes:

- `schema.json`
- `sources.md`
- (optional) terminology and status documentation

Schemas are versioned (e.g. `0.1-research`, `1.0-draft`) to reflect maturity and change history.

---

## How to Use

- Reference schema files as lightweight semantic metadata for documentation, tooling, or coordination discussions.
- If you want to propose improvements or report naming drift, open a GitHub Issue with primary sources.

---

## Stewardship Policy

Vortik operates as an independent registry.

- No governance mandate  
- No protocol authority  
- No formal affiliation with client teams or the Ethereum Foundation  
- No commercial claim over protocol primitives

Identifiers are stewarded under a research-first posture.  
Alignment with protocol-aligned entities may occur when appropriate.

---

## Status (March 2026)

Most tracked primitives remain under research or draft EIP status.  
No hard fork inclusion is assumed unless explicitly referenced in primary sources.

---

## Contact

Primary contact: GitHub Issues / Discussions  
Stewardship inquiries (secondary): contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
