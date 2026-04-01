# Vortik Semantic Registry Model

The Vortik Semantic Registry documents coordination primitives and surfaces across the Ethereum protocol research ecosystem.

Its goal is not to define protocol rules, but to track **semantic stabilization** across coordination layers and research domains.

---

# Conceptual Model

Each tracked entry is represented through four layers:

ENS identifier  
↓  
Registry entry (`registry.json`)  
↓  
Versioned schema (`/schemas/`)  
↓  
Human-readable anchor documentation (`/anchors/`)

This separation allows stable naming through ENS while enabling the semantic model and metadata to evolve via versioned schemas.

---

# Anchors

Anchors represent **coordination primitives and coordination surfaces** emerging across Ethereum research and execution infrastructure.

Examples include:

- proposer-builder separation  
- inclusion enforcement mechanisms  
- commitment signaling  
- preconfirmation systems  
- builder coordination environments  
- solver networks  
- execution coordination (ambiguous surface)  
- order flow auctions  
- single-slot finality research  

Anchors are intentionally minimal and serve as **orientation layers**, not specifications.

---

# ENS as Semantic Anchors

ENS identifiers are used as neutral conceptual anchors for tracked primitives and surfaces.

Example mappings:

epbs.eth → enshrined proposer-builder separation  
inclusionlist.eth → inclusion enforcement (FOCIL)  
preconflayer.eth → preconfirmation systems  
commitmentlayer.eth → commitment signaling  
buildermarket.eth → builder coordination  
solverlayer.eth → solver networks  
executionmarket.eth → execution coordination (ambiguous term)  
orderflowauction.eth → order flow auctions  
fastfinality.eth → single-slot finality (SSF)  

These identifiers provide stable conceptual anchors independent of implementation changes or terminology drift.

---

# Registry Scope

The registry tracks coordination surfaces emerging across the Ethereum coordination pipeline, including:

- proposer-builder separation (PBS / ePBS)  
- builder coordination and block construction  
- inclusion enforcement (FOCIL and related mechanisms)  
- commitment signaling layers  
- preconfirmation systems  
- solver coordination networks  
- execution coordination (ambiguous surface)  
- order flow auction routing systems  
- single-slot finality research  

New anchors may be introduced when research areas demonstrate **observable semantic convergence**.

---

# Neutrality

The Vortik registry is not a governance body and does not define protocol standards.

It exists as a **semantic and documentation layer** for Ethereum coordination primitives and surfaces.

Its role is to:

- reduce ambiguity  
- track terminology convergence  
- provide a consistent semantic reference across research and infrastructure  

---

# Design Principle

The registry does not create primitives.

It recognizes, structures, and tracks them as they emerge from:

- protocol research  
- implementation patterns  
- coordination mechanisms  

---

# Final Note

Semantic structure precedes standardization.

The registry exists to make that structure explicit.
