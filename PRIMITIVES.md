# Ethereum Coordination Primitives

The Vortik Semantic Registry tracks conceptual primitives across Ethereum protocol research.

These primitives represent coordination mechanisms that repeatedly appear across research discussions, EIP proposals and infrastructure architecture debates.

The registry documents terminology convergence across these primitives without defining protocol rules.

---

# Execution Infrastructure Primitives

These primitives appear in execution infrastructure layers before block construction.

## Order Flow Auctions

Anchor: orderflowauction.eth

Order flow auctions refer to mechanisms where transaction flow is auctioned or routed before reaching block builders.

Research areas include:

- order flow auctions (OFAs)
- RFQ-style execution environments
- private order flow routing
- intent routing systems

Order flow auctions interact closely with solver networks and execution coordination surfaces.

---

## Solver Networks

Anchor: solverlayer.eth

Solver networks appear in intent-based architectures where off-chain agents compete to satisfy user intents.

These systems coordinate:

- order flow
- liquidity
- transaction execution strategies

Solvers determine optimal execution outcomes before block construction.

---

## Execution Coordination Surfaces

Anchor: executionmarket.eth

Execution coordination surfaces refer to conceptual environments where transaction execution rights are routed or allocated across competing actors.

These surfaces may involve:

- execution routing environments
- competitive blockspace allocation
- solver-driven execution systems
- cross-domain execution coordination

Terminology in this area remains fluid across research discussions and has not yet stabilized around a single canonical term.

---

# Block Construction Primitives

These primitives relate directly to how blocks are assembled and delivered to proposers.

## Builder Markets

Anchor: buildermarket.eth

Builder markets represent the competitive environment where block builders construct blocks and compete to supply them to proposers.

These markets emerge naturally from proposer-builder separation and the MEV supply chain.

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

# Inclusion and Ordering Guarantees

These primitives focus on censorship resistance and transaction ordering guarantees.

## Inclusion Enforcement

Anchor: inclusionlist.eth

Inclusion enforcement mechanisms attempt to mitigate transaction censorship.

Research areas include:

- inclusion lists
- FOCIL proposals
- censorship resistance mechanisms

These designs aim to guarantee that proposers cannot indefinitely exclude valid transactions.

---

## Commitment Signaling

Anchor: commitmentlayer.eth

Commitment signaling mechanisms coordinate promises made by block builders or proposers before block publication.

These systems may involve:

- proposer commitments
- ordering guarantees
- conditional inclusion logic

These mechanisms are closely related to preconfirmation systems.

---

## Preconfirmations

Anchor: preconflayer.eth

Preconfirmations refer to mechanisms allowing transaction ordering guarantees before final block inclusion.

Research areas include:

- proposer commitments
- sequencing guarantees
- latency coordination between actors

These mechanisms are being explored across rollup and L1 coordination models.

---

# Consensus Evolution

## Single Slot Finality (SSF)

Anchor: fastfinality.eth

Single Slot Finality (SSF) is a research direction aimed at reducing Ethereum finality time to a single slot.

This primitive affects:

- validator coordination
- fork choice rules
- protocol safety assumptions

While the ecosystem often refers to "fast finality", terminology in research strongly converges on **Single Slot Finality (SSF)** as the canonical name for this consensus evolution.
