Vortik Semantic Registry

📄 Canonical Registry Document (PDF)
A structured overview of the registry, coordination primitives, and semantic anchoring.

→ "Download PDF" (docs/vortik-semantic-registry.pdf)

---

Independent machine-readable registry tracking terminology convergence and semantic stabilization across Ethereum coordination primitives and coordination surfaces.

The registry maps emerging primitives and coordination concepts discussed in Ethereum research to stable ENS identifiers and versioned schemas.

---

Why this registry exists

Terminology in Ethereum research often stabilizes before formal standardization.

Different teams may refer to similar coordination mechanisms using different terms, creating fragmentation across discussions.

The Vortik Semantic Registry exists to:

- track terminology convergence across research threads
- provide stable semantic anchors through ENS identifiers
- enable machine-readable referencing of coordination primitives
- distinguish protocol-defined primitives from ecosystem abstractions

This registry does not define standards.

It documents how terminology stabilizes before protocol-level convergence.

---

Navigation

- "Anchors" (anchors/)
- "Schemas" (schemas/)
- "Registry index (registry.json)" (registry.json)
- "Repository on GitHub" (https://github.com/VortikRegistry/vortik-open-schema)

---

Core Anchors (Protocol-Aligned)

- "epbs.eth" (anchors/epbs.md) — enshrined proposer-builder separation (EIP-7732)
- "inclusionlist.eth" (anchors/inclusionlist.md) — fork-choice enforced inclusion lists (FOCIL / EIP-7805)

---

Coordination Mechanisms

- "commitmentlayer.eth" (anchors/commitmentlayer.md) — preconfirmation commitments
- "preconflayer.eth" (anchors/preconflayer.md) — preconfirmation systems
- "fastfinality.eth" (anchors/fastfinality.md) — single-slot finality (SSF research track)

---

Execution Coordination Surfaces

- "solverlayer.eth" (anchors/solverlayer.md) — solver networks
- "buildermarket.eth" (anchors/buildermarket.md) — builder markets (transitional abstraction)
- "orderflowauction.eth" (anchors/orderflowauction.md) — order flow auctions (OFA)
- "executionmarket.eth" (anchors/executionmarket.md) — execution coordination (ambiguous term)

---

Disclaimer

This is an independent research artifact.

It does not represent the Ethereum Foundation or any core development team.

Terminology and classifications may evolve as research progresses.
