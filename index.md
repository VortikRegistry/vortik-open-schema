---
layout: default
title: Vortik Semantic Registry
---

<div align="center">

# Vortik Semantic Registry

### Semantic Infrastructure for Ethereum Coordination

<p><strong>Mapping terminology stabilization across primitives, roles, commitments, constraints, and emerging coordination structures.</strong></p>

<p>
<code>ethereum</code>
<code>coordination</code>
<code>semantic infrastructure</code>
<code>ens-anchored schemas</code>
</p>

</div>

---

> **Ethereum coordination is becoming structurally legible.**  
> The Vortik Semantic Registry maps how coordination structure stabilizes across protocol evolution.

---

## Overview

The **Vortik Semantic Registry** is an independent, machine-readable semantic registry tracking how terminology converges across Ethereum coordination architecture.

It connects:

- **protocol primitives**
- **coordination roles**
- **enforcement mechanisms**
- **semantic abstractions**
- **emerging terminology**

to stable **ENS identifiers** and **versioned schemas**.

It does **not** define protocol rules.  
It documents how coordination structure becomes semantically stable **before standardization**.

---

## Structural Thesis

Ethereum is not a simple linear execution pipeline.

It is a coordination system composed of:

- **roles**
- **commitments**
- **constraints**
- **execution flows**
- **confirmation layers**

As primitives become explicit:

- abstractions either stabilize  
- or lose precision  

The registry operates at that semantic boundary.

---

## Coordination Model

Order Flow Access  
↓  
Solver Coordination  
↓  
Payload Construction  
↓  
Proposer-Builder Separation (ePBS)  
↓  
Inclusion Enforcement (FOCIL)  
↓  
Commitments & Preconfirmations  
↓  
Finality (SSF)

---

This model is:

- **interpretive**
- **not strictly sequential**
- **partially overlapping**
- **structurally evolving**

Ethereum coordination is increasingly defined by:

roles → commitments → constraints → coordination stages

---

## Registry Architecture

ENS identifier  
↓  
registry.json  
↓  
versioned schemas (/schemas/)  
↓  
anchor documentation (/anchors/)  

---

This architecture separates:

- **stable naming surfaces** → ENS  
- **machine-readable semantic structure** → registry + schemas  
- **human-readable interpretation** → anchors  

---

## Core Primitives

| Anchor | Canonical Surface | Classification |
|--------|------------------|----------------|
| epbs.eth | enshrined proposer-builder separation (EIP-7732) | core |
| inclusionlist.eth | fork-choice enforced inclusion (FOCIL / EIP-7805) | core |

---

## Coordination Mechanisms

| Anchor | Surface | Classification |
|--------|--------|----------------|
| commitmentlayer.eth | commitment signaling | repairable |
| preconflayer.eth | preconfirmation systems | repairable |
| fastfinality.eth | single-slot finality (SSF) | repairable |

---

## Coordination Surfaces

| Anchor | Surface | Classification |
|--------|--------|----------------|
| solverlayer.eth | solver coordination | repairable |
| orderflowauction.eth | order flow auctions (OFA) | valid |

---

## Ambiguous / Transitional Surfaces

| Anchor | Surface | Classification |
|--------|--------|----------------|
| executionmarket.eth | execution coordination (ambiguous term) | premature |
| buildermarket.eth | builder markets (legacy abstraction) | premature |

---

## Why this registry exists

Terminology in Ethereum research stabilizes before formal standardization.

Different teams describe similar coordination structures using different terms, creating fragmentation across:

- research  
- implementation  
- infrastructure  
- protocol discussions  

The registry exists to:

- track semantic convergence  
- provide stable ENS anchors  
- enable machine-readable coordination mapping  
- distinguish primitives from abstractions  
- preserve unstable terminology without premature canonization  

---

## Classification Model

| Classification | Meaning |
|---|---|
| core | protocol-aligned primitive |
| valid | stable coordination surface |
| repairable | structurally valid with naming misalignment |
| premature | ambiguous or unstable terminology |
| deprecated | superseded abstraction |

---

## Strategic Context

Ethereum coordination is evolving toward:

- role-based interaction  
- commitment-driven validation  
- constraint-enforced inclusion  
- asynchronous execution  
- multi-stage settlement  

As this stabilizes:

- abstractions lose precision  
- primitives become dominant  
- terminology converges around roles, commitments, constraints, and protocol objects  

Vortik operates at that semantic edge.

---

## Navigation

- Anchors (anchors/)  
- Schemas (schemas/)  
- Registry (registry.json)  
- Maps (maps/)  
- Research (docs/)  
- GitHub (https://github.com/VortikRegistry/vortik-open-schema)

---

## Registry Endpoint

https://vortikregistry.github.io/vortik-open-schema/registry.json

---

## Disclaimer

Independent research artifact.  
Not affiliated with the Ethereum Foundation.

Terminology and classifications may evolve.

---

<div align="center">

### Vortik Semantic Registry  
<sub>semantic infrastructure for coordination before standardization</sub>

</div>
