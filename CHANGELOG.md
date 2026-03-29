# Changelog

All notable changes to this registry are documented in this file.

This project follows a lightweight versioning approach aligned with registry maturity (not protocol standardization).

---

## [0.2] — 2026-03-06

### Added

New semantic anchors documenting coordination layers in Ethereum execution infrastructure:

- `buildermarket.eth` — builder coordination surface  
- `executionmarket.eth` — execution coordination (ambiguous term)  
- `orderflowauction.eth` — order flow auction routing surface  

### Updated

- Conceptual registry map expanded to include additional coordination layers across the execution pipeline.  
- Index and navigation pages updated to reflect the extended anchor set.  

---

## [0.1] — 2026-03-05

### Added

- Public registry index (`registry.json`) mapping semantic anchors to anchor docs and versioned schemas where available.  
- GitHub Pages landing (`index.md`) with navigation to anchors, schemas, and the registry index.  
- Anchors directory with minimal orientation docs:

  - `epbs.eth` — ePBS / EIP-7732  
  - `inclusionlist.eth` — FOCIL / EIP-7805  
  - `commitmentlayer.eth` — commitment signaling coordination  
  - `preconflayer.eth` — preconfirmation coordination networks  
  - `fastfinality.eth` — SSF semantic surface  
  - `solverlayer.eth` — solver coordination surface  

### Changed

- Aligned SSF semantics under the `ssf` surface while keeping `fastfinality.eth` as the associated ENS anchor.  
- Updated registry paths to reference versioned schemas where present.  

### Notes

- Some anchors represent coordination surfaces under active research rather than finalized protocol primitives.  
- Terminology may evolve as coordination layers stabilize across Ethereum research discussions.
