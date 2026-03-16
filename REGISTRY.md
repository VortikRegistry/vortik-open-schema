# Vortik Semantic Registry Model

The Vortik Semantic Registry documents conceptual primitives emerging in the Ethereum protocol research ecosystem.

Its goal is not to define protocol rules, but to track **semantic stabilization** across research areas and coordination primitives.

---

# Conceptual Model

Each tracked primitive is represented through four layers:

ENS identifier  
↓  
Registry entry (`registry.json`)  
↓  
Versioned schema (`/schemas/`)  
↓  
Human-readable anchor documentation (`/anchors/`)

This separation allows stable naming through ENS while allowing the semantic model and metadata to evolve through versioned schemas.

---

# Anchors

Anchors represent conceptual coordination surfaces appearing across Ethereum protocol research and execution infrastructure discussions.

Examples include:

- proposer-builder separation
- inclusion enforcement models
- commitment signaling
- preconfirmation coordination
- builder markets
- solver networks
- execution markets
- order flow auctions
- single-slot finality research

Anchors are intentionally minimal and serve as orientation documents rather than full specifications.

---

# ENS as Semantic Anchors

ENS identifiers are used as neutral conceptual anchors for primitives tracked by the registry.

Example mappings include:

epbs.eth → proposer-builder separation  
inclusionlist.eth → inclusion enforcement models  
preconflayer.eth → preconfirmation coordination  
commitmentlayer.eth → commitment signaling primitives  
buildermarket.eth → block builder market structures  
solverlayer.eth → solver coordination networks  
executionmarket.eth → execution market coordination  
orderflowauction.eth → order flow auction mechanisms  
fastfinality.eth → single-slot finality research  

These identifiers provide stable conceptual anchors independent of implementation changes or terminology drift.

---

# Registry Scope

The registry currently tracks primitives related to:

- proposer-builder separation (PBS / ePBS)
- builder markets and block construction coordination
- inclusion enforcement (FOCIL and related models)
- commitment signaling layers
- preconfirmation coordination
- solver coordination networks
- execution markets
- order flow auction systems
- intent-based execution architectures
- single-slot finality research

New anchors may be added when research areas converge around stable terminology.

---

# Neutrality

The Vortik registry is not a governance body and does not define protocol standards.

It exists purely as a documentation and semantic alignment layer for emerging Ethereum coordination primitives.
