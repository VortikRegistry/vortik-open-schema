# Changelog

All notable changes to this registry are documented in this file.

This project follows a lightweight versioning approach aligned with registry maturity (not protocol standardization).

---

## [0.2] — 2026-03-06

### Added

New semantic anchors documenting coordination surfaces in Ethereum execution infrastructure:

- `buildermarket.eth` — builder markets (builder coordination surface)  
- `executionmarket.eth` — execution coordination (ambiguous term)  
- `orderflowauction.eth` — order flow auctions (routing / access layer)  

### Updated

- Conceptual coordination pipeline expanded to reflect upstream and mid-pipeline surfaces:
  - order flow  
  - solver coordination  
  - builder coordination  
  - inclusion  

- Anchor set extended and aligned with current semantic model.  
- Schema directory expanded with new surfaces and consistent structure.  
- Naming normalization applied across anchors (canonical term vs ENS alignment).  

### Notes

- `executionmarket.eth` is explicitly tracked as a **premature / ambiguous surface**.  
- Order flow auctions (OFA) are now positioned as an **entry-layer coordination mechanism**, not just routing.  

---

## [0.1] — 2026-03-05

### Added

- Public registry index (`registry.json`) mapping semantic anchors to anchor docs and versioned schemas.  
- GitHub Pages landing (`index.md`) with navigation to anchors, schemas, and registry index.  
- Anchors directory with initial semantic surfaces:

  - `epbs.eth` — Enshrined Proposer-Builder Separation (ePBS)  
  - `inclusionlist.eth` — Fork-choice enforced inclusion lists (FOCIL)  
  - `commitmentlayer.eth` — commitment signaling coordination  
  - `preconflayer.eth` — preconfirmation systems  
  - `fastfinality.eth` — Single-Slot Finality (SSF)  
  - `solverlayer.eth` — solver networks  

### Changed

- SSF semantics aligned under the canonical term **single-slot finality (SSF)** while maintaining `fastfinality.eth` as a **non-canonical ENS anchor**.  
- Registry structure updated to consistently reference **versioned schemas**.  
- Terminology alignment introduced across anchors and schemas.  

### Notes

- Several anchors represent **coordination surfaces under active research**, not finalized protocol primitives.  
- The registry tracks **semantic convergence**, and terminology may evolve as Ethereum architecture stabilizes.
