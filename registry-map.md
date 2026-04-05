Vortik Semantic Registry — Conceptual Coordination Map

The Vortik registry tracks terminology convergence across Ethereum coordination primitives and coordination surfaces.

These surfaces do not form a strict linear pipeline.

Instead, they represent interacting coordination domains across the Ethereum execution and consensus system.

---

Coordination Surfaces (Interpretive Model)

The registry groups recurring coordination functions into the following surfaces:

- order flow access
- solver coordination
- builder coordination
- inclusion
- commitments and preconfirmations
- finality

Some ecosystem abstractions (e.g. order flow auctions, builder markets) operate within or across these surfaces.

Ambiguous terminology (e.g. execution coordination) is tracked but not treated as a distinct layer.

---

Anchor Mapping

The registry currently tracks the following anchors:

Anchor| Coordination Surface
"orderflowauction.eth"| order flow access
"solverlayer.eth"| solver coordination
"buildermarket.eth"| builder coordination (ecosystem abstraction)
"epbs.eth"| builder coordination (protocol-defined primitive)
"inclusionlist.eth"| inclusion
"commitmentlayer.eth"| commitment signaling
"preconflayer.eth"| preconfirmation systems
"fastfinality.eth"| finality

Ambiguous surface:

Anchor| Interpretation
"executionmarket.eth"| overlapping coordination behaviors (non-canonical)

---

Interpretation

The coordination model reflects how responsibilities and guarantees are distributed across the system:

- upstream surfaces manage access to transaction flow and execution opportunities
- mid-layer surfaces coordinate execution and block construction roles
- protocol-level primitives enforce inclusion constraints and selection rules
- downstream surfaces provide execution guarantees and finality

These surfaces are not strictly sequential and may overlap or interact dynamically.

---

Structural Note

Ethereum is evolving toward a system where:

- execution is externally coordinated
- validation and inclusion are protocol-enforced
- visibility and access to flow become controlled surfaces
- terminology converges around primitives, roles, and objects

As this structure stabilizes, some abstractions (e.g. market-based layers) lose precision, while protocol-defined constructs become dominant.

---

Registry Role

Vortik does not implement protocol logic.

Instead, the registry:

- documents semantic convergence across Ethereum research
- tracks coordination primitives and surfaces
- provides structured schemas for machine-readable semantic metadata

Its purpose is to act as a semantic interface layer across research, infrastructure, and protocol discussions.
