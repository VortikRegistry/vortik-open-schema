# Coordination Surfaces Map (Ethereum)

Model: vortik-coordination-model v2.0.0
Type: interpretive

## Principles
- not strictly sequential
- partially overlapping
- role-based coordination
- commitment-driven validation
- constraint-enforced inclusion

---

## Domains

### Order Flow Access & Routing
- id: orderflow
- description: Access to transaction flow, routing logic, and user intent entry points.
- anchors: orderflowauction
- downstream: solver
- interacts_with: solver

### Solver Coordination
- id: solver
- description: Coordination of execution strategies and intent resolution across competing solvers.
- anchors: solverlayer
- upstream: orderflow
- downstream: payload
- interacts_with: orderflow, payload, execution

### Payload Construction
- id: payload
- description: Aggregation of transactions and execution outcomes into candidate block payloads.
- anchors: buildermarket
- upstream: solver
- downstream: builder
- interacts_with: solver, builder

### Proposer-Builder Separation
- id: builder
- description: Protocol-level separation of block construction and proposal (ePBS).
- anchors: epbs
- upstream: payload
- downstream: inclusion
- interacts_with: payload, inclusion

### Inclusion Enforcement
- id: inclusion
- description: Constraint mechanisms ensuring transaction inclusion and censorship resistance.
- anchors: inclusionlist
- upstream: builder
- downstream: commitment
- interacts_with: builder, commitment

### Commitment & Preconfirmation
- id: commitment
- description: Coordination of early execution guarantees and commitment signaling.
- anchors: commitmentlayer, preconflayer
- upstream: inclusion
- downstream: finality
- interacts_with: inclusion, finality

### Finality
- id: finality
- description: Consensus-level confirmation and irreversibility of state (SSF research direction).
- anchors: ssf
- upstream: commitment
- interacts_with: commitment

### Execution Coordination (Ambiguous)
- id: execution
- description: Non-canonical coordination surface spanning routing, solver activity, and payload construction.
- anchors: executionmarket
- upstream: orderflow
- downstream: payload
- interacts_with: solver, payload

---

## Relationships

- flow: orderflow → solver
- flow: solver → payload
- flow: payload → builder
- flow: builder → inclusion
- flow: inclusion → commitment
- flow: commitment → finality
- overlap: solver ↔ execution
- overlap: execution ↔ payload

---

## Notes

- This model is interpretive and does not represent protocol execution order.
- Domains may overlap and interact dynamically.
- Some domains represent transitional or ambiguous terminology surfaces.
- Builder markets are modeled as a legacy abstraction within payload construction.
- Execution coordination is intentionally classified as ambiguous and non-canonical.
