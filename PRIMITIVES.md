# Ethereum Coordination Primitives

The Vortik Semantic Registry tracks conceptual primitives emerging across Ethereum protocol research.

These primitives represent coordination surfaces that appear repeatedly across research discussions, EIP proposals and client implementation debates.

---

## Enshrined Proposer-Builder Separation (ePBS)

Anchor: epbs.eth

ePBS refers to integrating proposer-builder separation directly into the Ethereum protocol.

This primitive addresses:

- MEV supply chain structure
- block building decentralization
- proposer-builder coordination

Relevant discussions appear across research threads exploring the evolution of PBS toward enshrined designs.

---

## Inclusion Enforcement

Anchor: inclusionlist.eth

Inclusion enforcement mechanisms attempt to mitigate transaction censorship.

Research areas include:

- inclusion lists
- FOCIL proposals
- censorship resistance mechanisms

These designs aim to guarantee that proposers cannot indefinitely exclude valid transactions.

---

## Preconfirmations

Anchor: preconflayer.eth

Preconfirmations refer to mechanisms allowing transaction ordering guarantees before final block inclusion.

Research areas include:

- builder commitments
- sequencing guarantees
- latency coordination between actors

These mechanisms are being explored across rollup and L1 coordination models.

---

## Commitment Signaling

Anchor: commitmentlayer.eth

Commitment signaling mechanisms coordinate promises made by block builders or sequencers before block publication.

These systems may involve:

- builder commitments
- ordering guarantees
- conditional inclusion logic

---

## Builder Markets

Anchor: buildermarket.eth

Builder markets represent the competitive environment where block builders construct blocks and compete to supply them to proposers.

These markets emerge naturally from proposer-builder separation.

---

## Solver Networks

Anchor: solverlayer.eth

Solver networks appear in intent-based architectures where off-chain agents compete to satisfy user intents.

These systems coordinate:

- order flow
- liquidity
- transaction execution paths

---

## Execution Markets

Anchor: executionmarket.eth

Execution markets refer to coordination environments where transaction execution rights are routed or allocated across competing actors.

These systems may involve:

- execution routing markets
- competitive blockspace allocation
- solver-based execution environments
- cross-domain execution coordination

Execution markets sit between solver networks and builder markets, determining where and how transactions are executed before block construction.

---

## Order Flow Auctions

Anchor: orderflowauction.eth

Order flow auctions refer to mechanisms where transaction flow is auctioned before reaching block builders.

These mechanisms attempt to optimize execution outcomes by routing user transactions through competitive bidding environments.

Research areas include:

- order flow auctions (OFAs)
- RFQ-style execution markets
- intent routing systems
- flow internalization mechanisms

Order flow auctions interact closely with solver networks and execution markets.

---

## Single Slot Finality

Anchor: fastfinality.eth

Single-slot finality (SSF) is a research direction aimed at reducing Ethereum finality time to a single slot.

This primitive affects:

- validator coordination
- fork choice rules
- protocol safety assumptions

---

The registry documents terminology stabilization across these primitives without defining protocol rules.
