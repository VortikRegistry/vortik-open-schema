# Vortik — Ethereum Semantic Registry

Vortik is a semantic registry of Ethereum protocol primitives.

It tracks how Ethereum’s coordination system becomes legible as:

- primitives  
- roles  
- constraints  

---

## 🔥 Strategic Anchors

The following ENS anchors are directly aligned with Ethereum protocol evolution and upcoming changes in block production and coordination.

### Core (Protocol-Aligned)

- **epbs.eth** — enshrined proposer-builder separation (in-protocol PBS)  
- **inclusionlist.eth** — fork-choice enforced inclusion lists (FOCIL)  

---

### Emerging / Transitional

- commitmentlayer.eth — commitment signaling (naming misaligned)  
- preconflayer.eth — preconfirmation systems (non-canonical)  
- fastfinality.eth — single-slot finality (SSF, naming generalized)  

---

### External Coordination (Non-Protocol)

- solverlayer.eth — solver coordination (off-protocol role)  
- orderflowauction.eth — order flow routing mechanisms (OFA)  

---

### Lower Alignment / Legacy Framing

- buildermarket.eth — abstraction replaced by protocol-native builder role  
- executionmarket.eth — ambiguous execution coordination term  

---

## Why this matters

Ethereum is undergoing a structural shift.

Block production is no longer:

- a validator task  
- a linear pipeline  
- or a simple market  

It is becoming a protocol-defined mechanism where:

- builders construct execution  
- proposers commit without full visibility  
- constraints enforce inclusion  
- validation becomes partially asynchronous  

The language of the protocol is changing.

Vortik tracks that change.

---

## What Vortik does

Vortik indexes:

- protocol primitives (ExecutionPayload, BuilderBid, InclusionList)  
- protocol roles (proposer, builder, attester)  
- protocol constraints (inclusion, validity, timing)  
- naming surfaces aligned with protocol convergence  

It does NOT:

- define new primitives  
- speculate on future abstractions  
- model markets or narrative layers  

---

## System

registry.json → source of truth  
schemas/*     → canonical definitions  
anchors/*     → semantic mapping  
docs/*        → public interface  
maps/*        → interpretive views (non-canonical)  

---

## Public Interfaces

- Registry Home: `./docs/index.html`  
- Interactive App: `./docs/app.html`  
- Strategic Anchors: `./docs/market.html`  

Machine-readable:

- Registry: `./docs/registry.json`  
- Market Layer: `./docs/market.index.json`  
- Coordination Stack: `./docs/maps/coordination-stack.json`  
- Coordination Surfaces: `./docs/maps/coordination-surfaces.json`  

---

## Example

The protocol is shifting from:

block = execution + consensus  

to:

block = commitment  
execution = deferred  

This introduces:

- builder bids  
- payload commitments  
- constraint-enforced inclusion  

These are the primitives Vortik tracks.

---

## ENS Layer

Each entry is mapped to an ENS identifier when possible.

Examples:

- epbs.eth  
- inclusionlist.eth  

These represent naming surfaces aligned with protocol convergence.

---

## Core Model

Ethereum is best described as a coordination system composed of:

- protocol-defined roles  
- verifiable commitments  
- enforced constraints  
- asynchronous validation  

Not:

- markets  
- layers  
- pipelines  

---

## Primitive Categories

### Roles
- proposer  
- builder  
- attester  

### Objects
- ExecutionPayload  
- ExecutionHeader  
- BuilderBid  
- InclusionList  

### Commitments
- execution payload commitments  
- bid commitments  

### Constraints
- inclusion constraints (FOCIL)  
- validity rules  
- timing enforcement  

---

## Primitive vs External Coordination

Primitive:
- protocol-defined  
- enforced  
- deterministic  

External:
- off-chain  
- emergent  
- unstable  

Examples:

- builder → primitive  
- solver → external  
- order flow routing → external  

---

## Strategic Access

Selected ENS anchors are surfaced through the strategic layer:

→ `market.html`

This is not a marketplace.  
It is a positioning layer derived from:

- protocol alignment  
- semantic convergence  
- structural relevance  

---

## Status (2026)

The registry aligns with:

- ePBS (EIP-7732)  
- Inclusion Lists (EIP-7805 / FOCIL)  
- emerging commitment-based coordination  

The protocol is fixing its language.

Vortik indexes it.

---

## Contact

- X: https://x.com/vortik  
- GitHub: Issues / Discussions  

If you are working on:

- block building (ePBS)  
- inclusion enforcement (FOCIL)  
- preconfirmation systems  
- solver / intent infrastructure  
- coordination primitives  

→ reach out or open a discussion.

---

## Notes

- independent research artifact  
- not affiliated with the Ethereum Foundation  
- terminology evolves with protocol convergence  

---

© 2026 Vortik
