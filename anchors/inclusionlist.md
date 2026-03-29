# Inclusion Lists (FOCIL)

**Associated ENS:** `inclusionlist.eth`  
**Canonical term:** Inclusion Lists / Fork-Choice Enforced Inclusion Lists (FOCIL)  
**Registry ID:** `inclusionlist`  
**Status:** Draft EIP  
**Classification:** Core

---

## Summary

This anchor tracks **Inclusion Lists**, including **Fork-Choice Enforced Inclusion Lists (FOCIL)**, as a protocol-level mechanism for enforcing transaction inclusion guarantees within Ethereum.

This surface represents a coordination mechanism focused on censorship resistance and inclusion enforcement.

---

## Context

Inclusion lists are mechanisms designed to mitigate transaction censorship in block construction.

They introduce constraints that ensure certain transactions cannot be indefinitely excluded from the block production pipeline.

FOCIL extends this concept by integrating inclusion enforcement directly into fork choice rules.

The primary specification associated with this surface is **EIP-7805**.

Inclusion lists aim to strengthen censorship resistance while preserving Ethereum’s consensus properties.

---

## Pipeline Position

Inclusion

---

## Coordination Role

Inclusion lists introduce constraints on proposer behavior by requiring the inclusion of specific transactions.

They affect coordination between:

- proposers  
- transaction selection logic  
- mempool visibility mechanisms  

---

## Protocol Grounding

This mechanism is grounded in:

- EIP-7805  
- Ethereum research discussions on inclusion enforcement  
- fork-choice rule modifications  
- censorship resistance design work  

---

## Naming Alignment

- **ENS anchor:** `inclusionlist.eth`  
- **Canonical terms:** Inclusion Lists / FOCIL  

Naming is partially stabilized, with ongoing convergence between generic terminology and specific mechanism naming.

---

## Registry Role

- Track semantic convergence between inclusion lists and FOCIL  
- Document inclusion enforcement mechanisms  
- Provide a stable semantic reference for inclusion-related primitives  
- Map inclusion guarantees within Ethereum’s coordination pipeline  

---

## Status

Draft EIP with active research and specification development.

---

## Sources

Primary research references are documented in:

`schemas/inclusionlist/`
