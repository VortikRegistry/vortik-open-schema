# Ethereum Coordination Primitives

The Vortik Semantic Registry tracks coordination primitives and semantic surfaces emerging across Ethereum protocol evolution.

These primitives represent **real coordination mechanisms**, not narrative abstractions.

The registry does not define protocol rules.

Its role is to track:

- semantic convergence  
- structural alignment  
- terminology stability  

as they emerge across research, implementation, and production systems.

---

# Coordination Model (2026)

Ethereum is no longer accurately described as a linear pipeline or market-based system.

Instead, it operates as a coordination system composed of:

- protocol-defined roles  
- verifiable commitments  
- enforced constraints  
- execution and confirmation flows  

Primitives are mapped across these dimensions rather than fixed “layers” or “markets”.

---

# Core Coordination Dimensions

## Roles

Actors with explicit responsibilities in the system:

- proposer  
- builder  
- solver (off-protocol / emerging)  

---

## Commitments

Verifiable promises that structure coordination:

- execution payload commitments (ePBS)  
- bid commitments  
- confirmation guarantees (FCR direction)  

---

## Constraints

Rules enforced at the protocol level:

- inclusion constraints (FOCIL)  
- fork-choice enforced validity  
- protocol-level safety rules  

---

## Flows

Temporal coordination processes:

- ordering  
- execution (decoupled under ePBS)  
- confirmation  
- finality  

---

# Execution Surfaces

## Order Flow Auctions

Anchor: orderflowauction.eth

Order flow auctions describe mechanisms where transaction flow is routed or auctioned before reaching block builders.

Relevant systems include:

- OFAs  
- RFQ-style execution  
- private order flow routing  
- intent-based routing  

These operate **before protocol-level coordination** and feed into solver and builder activity.

---

## Solver Networks

Anchor: solverlayer.eth

Solver networks appear in intent-based architectures where off-chain agents compete to satisfy user intents.

They coordinate:

- order flow  
- liquidity  
- execution strategies  

Solvers determine execution outcomes **prior to builder participation**.

Note: “layer” is a naming mismatch; this surface corresponds to a role-based coordination system.

---

## Execution Coordination (Ambiguous)

Anchor: executionmarket.eth

This surface tracks a **non-canonical and unstable abstraction**.

“Execution market” is used informally to describe overlapping systems such as:

- solver coordination  
- order flow routing  
- execution strategy formation  
- builder interaction  

It does not map to a single primitive.

Status:
→ **premature / unstable terminology surface**

---

# Block Construction

## Builder Role (Protocol-Level)

Builder coordination is no longer accurately described as a market.

Under ePBS, builders are:

- protocol-recognized actors  
- responsible for execution payload construction  
- integrated into consensus coordination  

---

## Builder Markets (Legacy Abstraction)

Anchor: buildermarket.eth

Builder markets describe the historical competitive environment of block construction.

With ePBS:

- this abstraction becomes less precise  
- coordination shifts from market → protocol-defined roles  

Status:
→ **repairable / transitioning abstraction**

---

## Enshrined Proposer-Builder Separation (ePBS)

Anchor: epbs.eth

ePBS integrates proposer-builder separation directly into the protocol.

It introduces:

- execution payload commitments  
- separation of consensus and execution timing  
- builder participation in protocol-level coordination  

This is a **core primitive of Ethereum’s post-2026 architecture**.

---

# Inclusion and Constraints

## Inclusion Constraints (FOCIL)

Anchor: inclusionlist.eth

FOCIL enforces transaction inclusion through fork-choice rules.

It ensures:

- mandatory inclusion of specified transactions  
- censorship resistance at the protocol level  

This represents a shift from:

→ social guarantees  
to  
→ protocol-enforced constraints  

---

# Commitment & Confirmation

## Commitment Signaling

Anchor: commitmentlayer.eth

Commitment signaling refers to mechanisms where actors provide guarantees prior to execution or inclusion.

This includes:

- builder commitments  
- ordering guarantees  
- execution commitments  

This surface is evolving alongside ePBS and FCR.

---

## Preconfirmations

Anchor: preconflayer.eth

Preconfirmations provide early guarantees about transaction ordering or inclusion.

They are relevant to:

- latency-sensitive systems  
- rollups  
- bridging infrastructure  

Status:
→ emerging but not fully standardized  

Note: “layer” is a naming mismatch.

---

## Fast Confirmation (FCR Direction)

No single canonical ENS anchor yet.

Fast Confirmation Rule (FCR) introduces:

- ~12 second deterministic non-revert guarantees (under assumptions)  
- a new confirmation phase between inclusion and finality  

This creates a **three-tier settlement model**:

1. inclusion  
2. confirmation  
3. finality  

---

# Finality

## Single Slot Finality (SSF)

Anchor: fastfinality.eth

SSF aims to reduce finality time to a single slot.

Canonical terminology:
→ **Single Slot Finality (SSF)**

“Fast finality” is a non-canonical generalization.

This primitive impacts:

- validator coordination  
- fork-choice design  
- protocol safety  

---

# Summary

Ethereum coordination has shifted from:

❌ market-based abstractions  
❌ linear pipelines  

to:

✅ role-based coordination  
✅ commitment-driven execution  
✅ constraint-enforced inclusion  
✅ multi-stage settlement (inclusion → confirmation → finality)  

---

# Notes

This document reflects **active protocol convergence (2026)**.

Primitives are only included when grounded in:

- protocol changes  
- client implementation  
- sustained research convergence  

Non-canonical or unstable terms are tracked explicitly but not treated as core primitives.
