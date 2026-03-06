# Changelog

All notable changes to this registry are documented in this file.

This project follows a lightweight versioning approach aligned with registry maturity (not protocol standardization).

## [0.2] — 2026-03-06

### Added
- New semantic anchors documenting execution coordination layers:
  - `executionmarket.eth` (execution market coordination surface)
  - `orderflowauction.eth` (order flow auction routing surface)

### Updated
- Conceptual registry map expanded to include execution-layer coordination primitives.
- Index and navigation pages updated to reflect the extended anchor set.

---

## [0.1] — 2026-03-05

### Added
- Public registry index (`registry.json`) mapping semantic anchors to anchor docs and (where available) versioned schemas.
- GitHub Pages landing (`index.md`) with navigation to anchors, schemas, and the registry index.
- Anchors directory with minimal orientation docs:
  - `epbs.eth` (ePBS / EIP-7732)
  - `inclusionlist.eth` (FOCIL / EIP-7805)
  - `commitmentlayer.eth` (commitment signaling + L1 preconfirmation coordination)
  - `preconflayer.eth` (based preconfirmations / latency networks)
  - `fastfinality.eth` (SSF surface)
  - `buildermarket.eth` (builder market terminology surface; schema pending)
  - `solverlayer.eth` (solver terminology surface; schema pending)

### Changed
- Aligned SSF semantics under the `ssf` surface while keeping `fastfinality.eth` as the associated ENS anchor.
- Updated registry paths to reference versioned schemas where present.

### Notes
- Builder-market and solver-layer anchors are tracked conservatively as terminology surfaces; schemas may be added only if primary sources and stabilization justify it.
