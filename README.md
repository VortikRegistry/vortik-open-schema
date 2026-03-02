# Vortik Semantic Registry

Independent research initiative tracking semantic stabilization  
across emerging Ethereum L1 coordination primitives.

---

## Core Anchors

| Anchor | Primitive Surface | Status |
|--------|-------------------|--------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (EIP-7732) | Draft EIP |
| `inclusionlist.eth` | Inclusion Enforcement / FOCIL (EIP-7805) | Draft EIP |
| `commitmentlayer.eth` | Commitment & L1 preconfirmation coordination | Active Research |
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

- Enshrined PBS (Glamsterdam upgrade path)
- Inclusion enforcement models (FOCIL and alternatives)
- Commitment signaling & preconfirmation layers
- Based sequencing research
- Single-slot finality research
- Emerging encrypted mempool models

Roadmap identifiers may evolve.  
Vortik tracks conceptual anchors first, implementation references second.

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

## Repository Structure

Each schema directory includes:

- `schema.json`
- `sources.md`
- (optional) terminology and status documentation

---

## Status (March 2026)

Most tracked primitives remain under research or draft EIP status.  
No hard fork inclusion is assumed unless explicitly referenced in primary sources.

---

## Contact

Primary contact: GitHub Issues / Discussions  
Stewardship inquiries: contact.preconf@gmail.com  

---

© 2026 Vortik Semantic Registry
