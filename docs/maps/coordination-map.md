# Coordination Surfaces Map (Ethereum)

Model: vortik-coordination-model v2.1.0
Type: interpretive

## Principles
- not strictly sequential
- partially overlapping
- role-based coordination
- commitment-driven validation
- constraint-enforced inclusion
- external surfaces are mapped separately from protocol-defined primitives
- deprecated abstractions are tracked for semantic drift, not treated as canonical protocol language

---

## Domains

### Order Flow Access & Routing
- id: orderflow
- description: Access to transaction flow, routing logic, order flow auctions, and user intent entry points before protocol-level block construction.
- anchors: orderflowauction
- downstream: solver, sequencing
- interacts_with: solver, sequencing, execution, blockspace

### Solver Coordination
- id: solver
- description: Coordination of execution strategies and intent resolution across competing solvers and off-protocol actors.
- anchors: solverlayer
- upstream: orderflow
- downstream: payload, sequencing
- interacts_with: orderflow, payload, execution, sequencing

### Sequencing Coordination
- id: sequencing
- description: External transaction ordering and sequencing coordination across rollups, ordering rights, shared sequencing systems, and cross-domain execution surfaces.
- anchors: sequencingmarket
- upstream: orderflow, solver
- downstream: payload, execution
- interacts_with: orderflow, solver, payload, execution, blockspace

### Payload Construction
- id: payload
- description: Aggregation of transactions and execution outcomes into candidate block payloads, including legacy builder-market framing under semantic drift.
- anchors: buildermarket
- upstream: solver, sequencing
- downstream: builder
- interacts_with: solver, sequencing, builder, execution, blockspace

### Proposer-Builder Separation
- id: builder
- description: Protocol-level separation of block construction and proposal through ePBS and proposer-builder coordination semantics.
- anchors: epbs
- upstream: payload
- downstream: inclusion
- interacts_with: payload, inclusion, commitment

### Inclusion Enforcement
- id: inclusion
- description: Constraint mechanisms ensuring transaction inclusion, censorship resistance, and fork-choice enforced inclusion guarantees.
- anchors: inclusionlist
- upstream: builder
- downstream: commitment
- interacts_with: builder, commitment, blockspace

### Commitment & Preconfirmation
- id: commitment
- description: Coordination of early execution guarantees, commitment signaling, pre-reveal coordination, and preconfirmation-adjacent mechanisms.
- anchors: commitmentlayer, preconflayer
- upstream: inclusion, builder
- downstream: finality
- interacts_with: builder, inclusion, finality, proving

### Proof Generation & Proving Coordination
- id: proving
- description: External proof generation, proof aggregation, distributed proving infrastructure, and validity-proof coordination surfaces across zk and rollup systems.
- anchors: provingmarket
- upstream: execution, payload, commitment
- downstream: finality
- interacts_with: execution, payload, commitment, sequencing, finality

### Finality
- id: finality
- description: Consensus-level confirmation and irreversibility of state, including the SSF research direction and fast-finality terminology surface.
- anchors: ssf
- upstream: commitment, proving
- interacts_with: commitment, proving

### Execution Coordination (Ambiguous)
- id: execution
- description: Non-canonical coordination surface spanning routing, solver activity, sequencing, execution strategy, and payload construction.
- anchors: executionmarket
- upstream: orderflow, sequencing
- downstream: payload, proving
- interacts_with: solver, sequencing, payload, proving, blockspace

### Blockspace Allocation (Legacy / Ambiguous)
- id: blockspace
- description: Legacy blockspace-market framing increasingly displaced by protocol-native roles, payloads, commitments, inclusion constraints, and narrower execution-resource terminology.
- anchors: blockspacemarket
- upstream: orderflow
- downstream: payload, inclusion
- interacts_with: orderflow, sequencing, payload, builder, inclusion, execution

---

## Relationships

- flow: orderflow → solver
- flow: solver → sequencing
- flow: sequencing → payload
- flow: solver → payload
- flow: payload → builder
- flow: builder → inclusion
- flow: inclusion → commitment
- flow: commitment → finality
- flow: execution → proving
- flow: proving → finality
- overlap: solver ↔ execution
- overlap: execution ↔ payload
- overlap: sequencing ↔ orderflow
- overlap: sequencing ↔ payload
- overlap: blockspace ↔ payload
- overlap: blockspace ↔ inclusion
- overlap: proving ↔ finality

---

## Notes

- This model is interpretive and does not represent protocol execution order.
- Domains may overlap and interact dynamically.
- Protocol-defined primitives are separated from external, premature, repairable, and deprecated naming surfaces.
- Builder markets, execution markets, and blockspace markets are tracked as legacy or non-canonical abstractions under semantic drift.
- Sequencing and proving are modeled as external coordination surfaces because they are relevant to Ethereum-adjacent infrastructure without being treated here as canonical L1 protocol primitives.
- All 12 registry anchors in registry v0.6.5 are represented in this map.
