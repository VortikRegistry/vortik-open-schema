# Vortik Semantic Registry Model

The Vortik Semantic Registry documents coordination primitives and semantic surfaces emerging across Ethereum’s protocol research and implementation landscape.

Its goal is not to define protocol rules, but to track **semantic stabilization** as coordination structures become explicit.

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

This separation allows:

- stable naming through ENS  
- evolving semantic structure via schemas  
- independent interpretation layers  

---

# Anchors

Anchors represent **coordination primitives, roles, and semantic surfaces** observed in Ethereum’s architecture.

They do not define the system.

They expose how the system is being described and understood.

Anchors may represent:

- protocol-defined primitives  
- coordination roles  
- enforcement mechanisms  
- emerging or unstable terminology surfaces  

Examples include:

- enshrined proposer-builder separation (ePBS)  
- inclusion enforcement (FOCIL)  
- builder (protocol role)  
- commitment signaling  
- preconfirmation systems  
- solver coordination  
- order flow auctions  
- execution coordination (ambiguous term)  
- single-slot finality (SSF)  

---

# ENS as Semantic Anchors

ENS identifiers act as stable semantic references for tracked primitives and surfaces.

Example mappings:

epbs.eth → enshrined proposer-builder separation  
inclusionlist.eth → inclusion enforcement (FOCIL)  
preconflayer.eth → preconfirmation systems  
commitmentlayer.eth → commitment signaling  
buildermarket.eth → legacy builder market abstraction (non-canonical)  
solverlayer.eth → solver coordination  
executionmarket.eth → execution coordination (ambiguous term)  
orderflowauction.eth → order flow auctions  
fastfinality.eth → single-slot finality (SSF)  

These identifiers provide:

- stability across naming changes  
- continuity across research phases  
- anchoring for semantic interpretation  

---

# Registry Scope

The registry tracks coordination structures across Ethereum, including:

- protocol primitives (ePBS, inclusion enforcement)  
- coordination roles (builder, proposer, solver)  
- enforcement mechanisms (FOCIL, commitments)  
- execution coordination surfaces  
- preconfirmation and confirmation mechanisms  
- finality evolution (SSF)  
- order flow and routing systems  

Surfaces are only included when they are:

→ grounded in real protocol behavior or research  
→ observable across multiple sources  

---

# System Model (Current Interpretation)

Ethereum is evolving toward a system defined by:

→ **roles**  
→ **commitments**  
→ **constraints**  
→ **asynchronous coordination pipelines**

Key structural shifts:

- execution is decoupled from consensus (ePBS)  
- commitments replace immediate execution validation  
- inclusion is enforced via protocol-level constraints (FOCIL)  
- confirmation emerges as an intermediate coordination layer  

The registry reflects this shift by prioritizing:

- protocol-aligned primitives  
- coordination roles  
- enforceable mechanisms  

over:

- market-based abstractions  
- informal layering models  

---

# Neutrality

The Vortik registry is not a governance system and does not define standards.

It operates as a **semantic infrastructure layer** that:

- reduces ambiguity  
- tracks terminology convergence  
- maps coordination structures  

---

# Design Principle

The registry does not invent primitives.

It:

- observes  
- structures  
- tracks  

semantic convergence emerging from:

- protocol research  
- client implementations  
- coordination mechanisms  

---

# Semantic Classification

Each entry is classified as:

- **core** — protocol-aligned primitive  
- **valid** — stable coordination surface  
- **repairable** — valid concept with naming misalignment  
- **premature** — ambiguous or unstable terminology  
- **deprecated** — concept losing structural relevance  

Classification evolves with protocol convergence.

---

# Final Note

Ethereum coordination is becoming structurally explicit.

Semantic structure emerges before standardization.

The registry exists to capture that structure while it is still forming.
