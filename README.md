# Vortik Semantic Registry

An independent semantic registry tracking terminology stabilization across emerging Ethereum Layer 1 protocol primitives.

Vortik provides structured, versioned JSON schemas referencing primary sources (EIPs, research threads, and public implementation discussions) in order to reduce naming ambiguity and documentation drift.

> Vortik is not affiliated with the Ethereum Foundation, any client team, or any protocol governance body.

---

## Purpose

Ethereum protocol research evolves rapidly. Terminology often fragments across:

- EIPs  
- Research threads  
- Client implementations  
- Community discussions  

Vortik exists to:

- Provide canonical terminology mapping (canonical vs aliases)  
- Offer versioned machine-readable schemas (JSON Schema 2020-12)  
- Reference primary sources for traceability  
- Anchor conceptual primitives via ENS namespaces  

This registry is documentation-oriented and coordination-focused.  
It does not define protocol standards.

---

## Core Anchors

| ENS Anchor | Canonical Primitive | Status |
|------------|--------------------|--------|
| `epbs.eth` | Enshrined Proposer-Builder Separation (ePBS) | EIP-7732 (Draft) |
| `inclusionlist.eth` | Fork-Choice Enforced Inclusion Lists (FOCIL) | EIP-7805 (Draft) |
| `commitmentlayer.eth` | Proposer Commitments / Preconfirmations | Research |
| `fastfinality.eth` | Single Slot Finality (SSF) | Research |

Note: “Fast finality” is commonly used descriptively.  
The canonical research term currently used in primary discussions is “Single Slot Finality (SSF)”.

---

## Scope

Vortik monitors conceptual convergence across:

- Enshrined PBS research and implementation attempts  
- Inclusion enforcement mechanisms (FOCIL / Inclusion Lists)  
- Preconfirmation coordination models  
- L1 finality compression research (SSF and related proposals)  
- Execution-layer constraint primitives  

Hard fork names and roadmap identifiers may change over time.  
Vortik tracks conceptual primitives first, fork branding second.

---

## Design Principles

1. Canonical terminology first  
   If the ecosystem converges on an acronym (e.g., FOCIL, SSF), that becomes canonical. Longer descriptive terms are treated as aliases.

2. No speculative assertions  
   All meaningful fields must reference:
   - An EIP, or  
   - A research thread, or  
   - A public implementation source  

3. Explicit versioning  
   Changes create new versions. No silent overwrites.

4. Machine validation  
   Schemas follow JSON Schema 2020-12 and include validation examples.

---

## Repository Structure

schemas/  
  epbs/  
    1.0-draft/  
      schema.json  
      sources.md  

  focil/  
    0.1-draft/  
      schema.json  
      sources.md  

  preconfirmations/  
    0.1-research/  
      schema.json  
      sources.md  

  ssf/  
    0.1-research/  
      schema.json  
      sources.md  

examples/  
  epbs/  
    valid.example.json  

  focil/  
    valid.example.json  

---

## Stewardship Policy

Vortik does not claim ownership over protocol terminology.

If EIP authors, client teams, or implementation groups request:

- Namespace coordination  
- Redirection  
- Co-maintenance  
- Stewardship transfer  

Vortik is open to technical discussion under a research-first posture.

The objective is semantic clarity and documentation integrity.

---

## Contact & Contribution

Primary coordination occurs via GitHub:

- Issues and Pull Requests are the preferred channel for technical discussion.
- All terminology updates should reference primary sources (EIP, research thread, or implementation repository).

X (public updates):  
https://x.com/VortikRegistry  

Direct stewardship inquiries (secondary channel):  
contact.preconf@gmail.com
