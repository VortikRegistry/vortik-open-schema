# Changelog

All notable changes to this registry are documented in this file.

This project follows a lightweight versioning approach aligned with registry maturity and semantic infrastructure development, not Ethereum protocol standardization.

---

## [0.6.5] — 2026-07-25

### Added

- Added public release, trust, maintenance, and repository-health documentation for the `0.6.5` registry state.
- Added primary-source research audits for:
  - current ePBS / Glamsterdam implementation evidence;
  - FOCIL source state across Glamsterdam and Hegotá;
  - EIP-8146 Block Access List sidecars;
  - Fast Finality and single-slot finality terminology.
- Added repository-only protocol-signal coverage for:
  - EIP-8146;
  - Block Access List sidecars;
  - BAL commitment;
  - BAL availability;
  - execution-state prefetch.
- Added validation for:
  - `registry.json` against `registry.schema.json`;
  - semantic-status synchronization;
  - exact registry coverage in coordination maps;
  - public-safety constraints;
  - generated and mirrored file synchronization.

### Updated

- Updated ePBS evidence to record EIP-7732 as Scheduled for Inclusion in Glamsterdam and to distinguish multi-client devnet progress from activation or deployment.
- Updated FOCIL evidence to preserve its fork-scoped state:
  - declined for Glamsterdam;
  - Scheduled for Inclusion in Hegotá;
  - no announced activation values.
- Updated Fast Finality / SSF framing so:
  - Fast Finality is the broader Ethereum consensus research area;
  - single-slot finality is a specific same-slot target or design family within that area;
  - `id: ssf`, its canonical term, classification, status, and type remain unchanged.
- Updated the repository-only watchlist to distinguish EIP-7805 as Scheduled for Inclusion from EIP-8146 as Proposed for Inclusion in Hegotá.
- Updated generated registry roles, semantic-status material, anchor indexes, source notes, and emerging-signal maps to remove stale displacement framing.
- Updated canonical registry metadata and synchronized index timestamps through `2026-07-25`.

### Automation and validation

- Centralized the complete derived-output pipeline under:

  ```bash
  npm run generate
  ```

- Replaced permissive dependency installation with deterministic `npm ci`.
- Changed the main validation workflow to read-only operation:
  - it no longer commits or pushes generated files to `main`;
  - it fails when generation leaves uncommitted drift.
- Made generated anchor and market index timestamps deterministic from `registry.json.last_updated`.
- Restricted manual mutating workflows to explicit non-default branches so their outputs remain reviewable through pull requests.
- Added `.gitignore` coverage for `node_modules/` so dependency installation does not create false drift findings.

### Registry-state boundaries

- No registry entries or ENS anchors were added or removed.
- No ENS names were bought, sold, listed, transferred, or presented as official Ethereum namespaces.
- No schema constants were changed as part of the Fast Finality framing update.
- Research notes, protocol-signal watchlists, generated maps, and strategic visibility documents remain separate from authoritative registry state.
- Fork scheduling, implementation progress, deployment, and activation remain explicitly distinct source states.

### Notes

Version `0.6.5` is a documentation, evidence, consistency, and operational-hardening release. It improves the reliability and auditability of the existing 12-anchor registry without introducing a new registry model or promoting research candidates into authoritative anchors.

---

## [0.6.4] — 2026-05-21

### Fixed

- Corrected invalid JSON Schema root `type` values in research schemas:
  - `schemas/blockspacemarket/0.1-research/schema.json`
  - `schemas/provingmarket/0.1-research/schema.json`
  - `schemas/sequencingmarket/0.1-research/schema.json`

- Updated those schemas so the JSON Schema root type is now correctly set to:

  ```json
  "type": "object"
  ```

- Preserved semantic type values inside `properties.type.const` instead of using semantic labels as root JSON Schema types.

- Fixed source marker structure in core source documents:
  - `schemas/epbs/1.0-draft/sources.md`
  - `schemas/inclusionlist/0.1-draft/sources.md`

- Ensured each source document contains exactly one:
  - `AUTO-GENERATED:START`
  - `AUTO-GENERATED:END`
  - `MANUAL-SOURCES:START`
  - `MANUAL-SOURCES:END`

### Changed

- Updated `schemas/index.md` to reflect the current classification model:
  - `core`
  - `repairable`
  - `premature`
  - `external`
  - `deprecated`

- Added missing schema references for:
  - `provingmarket`
  - `sequencingmarket`
  - `blockspacemarket`

- Reframed the generated strategic visibility document from:

  ```txt
  Vortik Market Layer
  ```

  to:

  ```txt
  Vortik Strategic Anchors
  ```

- Updated `scripts/generate-market-doc.mjs` so generated public documentation no longer presents the registry as a market layer.

- Updated `maps/emerging-signals.json` with expanded non-canonical watchlist terms related to:
  - execution rights
  - execution tickets
  - slot futures
  - proposer rights
  - PTC
  - BAL
  - payload reveal
  - builder commitments
  - inclusion commitments
  - execution commitments
  - flow markets
  - routing markets
  - neutral blockspace
  - credible neutrality

### Improved

- Strengthened `scripts/validate-integrity.mjs` to detect:
  - invalid schema root types
  - missing schema metadata
  - missing required schema constants
  - mismatches between `registry.json` and linked schemas
  - malformed `sources.md` marker blocks
  - duplicated source markers
  - docs synchronization drift

### Versioning

- Bumped project version to `0.6.4`.
- Aligned:
  - `package.json`
  - `registry.json`
  - `CITATION.cff`
  - `CHANGELOG.md`

### Notes

This release is a technical cleanup release.

It does not restructure the registry, promote emerging signals to primary anchors, rename existing anchors, or change the strategic classification of the current ENS entries.

The main goal of `0.6.4` is to make the repository technically consistent, stricter under validation, and more credible before ENS record updates, marketplace configuration, or institutional outreach.

---

## [0.6.3] — 2026-04-26

### Added

- Added automated generation of `sources.md` metadata sections from `registry.json`.
- Added protected manual source sections in schema source documents.
- Added source preservation logic so curated manual references are not overwritten by automation.
- Added or refreshed emerging watchlist coverage in `maps/emerging-signals.json`.

### Updated

- Updated `registry.json` to version `0.6.3`.
- Removed `external_primitives` from the main registry model in favor of separate watchlist tracking through maps.
- Refined the registry model around the current classification system:
  - `core`
  - `repairable`
  - `premature`
  - `external`
  - `deprecated`
- Updated public and conceptual documentation to align with the current model:
  - `README.md`
  - `REGISTRY.md`
  - `ARCHITECTURE.md`
  - `PRIMITIVES.md`
  - `SEMANTIC-STATUS.md`
  - `registry-map.md`
- Clarified that `/schemas/` is the formal source of truth and `registry.json` is the central index.
- Updated anchor descriptions and documentation to reduce outdated market-first, layer-based, and rigid pipeline framing.
- Expanded registry documentation to include external and deprecated anchors:
  - `provingmarket.eth`
  - `sequencingmarket.eth`
  - `blockspacemarket.eth`

### Automation

- Added schema synchronization from `registry.json`.
- Added source document generation from `registry.json`.
- Added automated generation of:
  - `anchors.index.json`
  - `market.index.json`
  - public `docs/*` sync
- Updated validation workflow to include schema sync, source generation, index generation, docs sync, and integrity validation.
- Confirmed GitHub Actions pipeline is green after automation updates.

### Semantic Notes

- `epbs.eth` remains classified as `core` and `primitive`.
- `inclusionlist.eth` remains classified as `core` and `constraint`.
- `commitmentlayer.eth` remains `repairable`, with `commitment` treated as the meaningful underlying primitive and `layer` as the mismatch.
- `preconflayer.eth` remains `premature`, tracking preconfirmation as an emergent external mechanism.
- `solverlayer.eth`, `orderflowauction.eth`, `provingmarket.eth`, and `sequencingmarket.eth` are treated as external coordination surfaces.
- `buildermarket.eth`, `executionmarket.eth`, and `blockspacemarket.eth` are treated as deprecated or misaligned abstractions.

### Notes

- Watchlist terms are intentionally separated from registry anchors.
- Manual curated references should be added only inside protected `MANUAL-SOURCES` sections.
- Generated sections should not be manually edited unless the generation scripts are being changed.

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

- Anchor set extended and aligned with the semantic model active at the time.
- Schema directory expanded with new surfaces and consistent structure.
- Naming normalization applied across anchors (canonical term vs ENS alignment).

### Notes

- `executionmarket.eth` was tracked as a premature / ambiguous surface at the time.
- Order flow auctions (OFA) were positioned as an entry coordination mechanism, not just routing.
- Some terminology in this historical entry reflects the registry model used at that stage and has since been refined.

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

- SSF semantics aligned under the canonical term **single-slot finality (SSF)** while maintaining `fastfinality.eth` as a non-canonical ENS anchor.
- Registry structure updated to consistently reference versioned schemas.
- Terminology alignment introduced across anchors and schemas.

### Notes

- Several anchors represented coordination surfaces under active research, not finalized protocol primitives.
- The registry tracks semantic convergence, and terminology may evolve as Ethereum architecture stabilizes.
