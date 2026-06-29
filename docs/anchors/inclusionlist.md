# Fork-Choice Enforced Inclusion Lists (FOCIL)

**Associated ENS:** `inclusionlist.eth`  
**Canonical term:** fork-choice enforced inclusion lists (FOCIL)  
**Registry ID:** `inclusionlist`  
**Status:** eip-active  
**Classification:** core  
**Type:** constraint  

---

## Summary

This anchor tracks **fork-choice enforced inclusion lists (FOCIL)** as a protocol-facing inclusion constraint within Ethereum research and specification work.

Inclusion lists describe mechanisms that constrain block construction by requiring specified transactions, or transaction sets, to be considered for inclusion under protocol-defined conditions.

FOCIL narrows that concept toward fork-choice enforced inclusion constraints. The registry treats this as a technical constraint surface related to censorship resistance, validator coordination, proposer behavior, and block-construction rules.

This document is not an official Ethereum specification. It is not pricing guidance, not buyer targeting, and not a claim that FOCIL is deployed on Ethereum mainnet or included in any specific fork.

---

## Context

Inclusion-list research addresses how Ethereum can improve censorship resistance by making transaction inclusion constraints more explicit in protocol-facing block production.

The relevant semantic object is the inclusion constraint itself: a mechanism by which validators, proposers, or related consensus-facing roles can require eligible transactions to be surfaced, considered, or enforced during block construction.

FOCIL-style framing is tracked because it gives the broader inclusion-list concept a more precise fork-choice enforcement context.

EIP-7805 remains the primary EIP source for FOCIL. EIP-7773 currently lists EIP-7805 / FOCIL as **Declined for Inclusion** in Glamsterdam. That source state does not erase FOCIL as a technical term, research object, or specification object, but it does mean this repository must not imply that FOCIL is included in Glamsterdam. `inclusionlist.eth` remains a semantic anchor for the inclusion-list / FOCIL constraint surface, not a deployment claim.

The registry status is **eip-active** because the terminology and mechanism family have active specification relevance. This status should not be read as a mainnet activation claim, Glamsterdam inclusion claim, official Ethereum endorsement, fork-scheduling claim, or commercial signal.

---

## Pipeline Position

**Protocol-facing inclusion constraint**

Inclusion lists sit near the coordination boundary between:

- validator responsibilities
- proposer responsibilities
- transaction inclusion constraints
- block-construction rules
- fork-choice or consensus-facing enforcement
- censorship-resistance mechanisms

This makes `inclusionlist.eth` a core registry anchor because it maps to a concrete protocol-facing constraint rather than to a broad market abstraction.

---

## Coordination Role

FOCIL-style inclusion lists constrain how transactions are surfaced and enforced during block production.

They are relevant to coordination among:

- validators
- proposers
- inclusion-list committees or related enforcement roles
- consensus-facing block validation logic
- fork-choice enforcement logic
- censorship-resistance mechanisms

In Vortik's ontology, `inclusionlist` is classified as a **core constraint** because it tracks a protocol-facing rule surface rather than an external actor, pricing surface, or buyer segment.

---

## Protocol Grounding

This anchor is grounded in:

- fork-choice enforced inclusion list research
- inclusion-list specification work
- censorship-resistance and transaction inclusion discussions
- validator-facing enforcement concepts
- protocol-level block-construction constraints

The anchor should remain technically scoped. It should not be used to claim mainnet deployment, fork inclusion, pricing relevance, buyer demand, or Ethereum Foundation purchasing intent.

---

## Semantic Classification

- **ENS anchor:** `inclusionlist.eth`
- **Canonical term tracked:** fork-choice enforced inclusion lists (FOCIL)
- **Registry ID:** `inclusionlist`
- **Type:** constraint
- **Status:** eip-active
- **Classification:** core

The ENS label `inclusionlist.eth` is treated as strongly aligned because it captures the durable human-readable inclusion-list surface. The canonical term is more specific because the registry tracks FOCIL-style fork-choice enforced inclusion constraints.

---

## Boundary Conditions and Non-Claims

This anchor should not be interpreted as saying that:

- FOCIL is deployed on Ethereum mainnet
- FOCIL is included in Glamsterdam or any specific fork
- `inclusionlist.eth` is an official Ethereum endpoint
- `inclusionlist.eth` is controlled by the Ethereum Foundation
- inclusion lists are a pricing signal
- inclusion lists imply buyer targeting or commercial demand
- this anchor modifies BALs, EIPs, schemas, pricing, or internal watchlists

The accurate framing is narrower:

```txt
FOCIL tracks protocol-facing inclusion constraints and censorship-resistance semantics.
```

---

## Schema Reference

```txt
schemas/inclusionlist/0.1-draft/schema.json
```

Source context:

```txt
schemas/inclusionlist/0.1-draft/sources.md
```
