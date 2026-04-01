# Inclusion Lists / FOCIL — Sources

## Overview

This document compiles primary references and terminology associated with **Inclusion Lists**, including **Fork-Choice Enforced Inclusion Lists (FOCIL)**.

It supports the semantic anchoring of `inclusionlist.eth` within the Vortik Semantic Registry.

---

## Canonical Specification

- EIP-7805 — Fork-Choice Enforced Inclusion Lists (FOCIL)  
  https://eips.ethereum.org/EIPS/eip-7805

---

## Research Context

Inclusion lists are mechanisms designed to mitigate transaction censorship in Ethereum block production.

FOCIL extends this concept by integrating inclusion enforcement directly into fork-choice rules.

Rather than coordinating transaction selection, this mechanism imposes **protocol-level constraints on inclusion**, limiting the ability of proposers and builders to exclude transactions.

---

## Structural Role

Inclusion lists operate at the **inclusion stage** of Ethereum’s coordination architecture.

They act as a **constraint mechanism**, not a coordination layer, enforcing rules that shape how transactions must be included in blocks.

---

## Constraint Dynamics

FOCIL introduces a structural tension between:

- **block value maximization** (builder incentives)  
- **mandatory inclusion constraints** (protocol enforcement)  

This creates a constrained optimization environment where block construction must satisfy inclusion requirements.

---

## Primary Research Threads

- FOCIL: A simple committee-based inclusion list proposal  
  https://ethresear.ch/t/fork-choice-enforced-inclusion-lists-focil-a-simple-committee-based-inclusion-list-proposal/19870

---

## Terminology Surface

Common terminology associated with this mechanism includes:

- inclusion lists  
- FOCIL  
- fork-choice enforced inclusion lists  
- inclusion enforcement  
- censorship resistance  

This terminology is converging, with **FOCIL** emerging as the precise reference for fork-choice enforced implementations.

---

## Status

Draft EIP (active research and specification phase).

Inclusion in Ethereum depends on:

- protocol refinement  
- implementation readiness  
- consensus among core developers  

---

## Notes

This document reflects an inclusion **constraint mechanism**, not a coordination market or layer.

It captures a protocol-enforced boundary condition within Ethereum’s coordination architecture.
