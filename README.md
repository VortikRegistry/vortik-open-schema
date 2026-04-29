# Vortik — Ethereum Semantic Registry

[![Live Registry](https://img.shields.io/badge/live-registry-0b0f14?style=flat-square&logo=githubpages&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/)
[![Interactive App](https://img.shields.io/badge/explore-app-111722?style=flat-square&logo=vercel&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/app.html)
[![Strategic Anchors](https://img.shields.io/badge/strategic-anchors-0d131d?style=flat-square&logo=ethereum&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/market.html)
[![Registry JSON](https://img.shields.io/badge/source-registry.json-0b1220?style=flat-square&logo=json&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/registry.json)
[![Pipeline](https://img.shields.io/badge/pipeline-active-1e2735?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/VortikRegistry/vortik-open-schema/actions)

---

Vortik is an independent semantic registry for Ethereum coordination.

It indexes protocol primitives, roles, constraints, external coordination surfaces, and selected ENS-anchored naming surfaces as Ethereum’s coordination architecture becomes more explicit.

Vortik does not define Ethereum protocol rules.

It tracks how protocol and infrastructure terminology stabilizes across:

- primitives
- roles
- constraints
- external coordination surfaces
- deprecated or misaligned abstractions

---

## Explore Vortik

Vortik can be explored through three public entry points.

### Registry

The canonical public interface.

Use it to understand the registry, its semantic model, and how Ethereum coordination surfaces are indexed.

→ https://vortikregistry.github.io/vortik-open-schema/

### Interactive App

A navigable exploration interface.

Use it to browse anchors, domains, classifications, status, schema links, and semantic structure.

→ https://vortikregistry.github.io/vortik-open-schema/app.html

### Strategic Anchors

The strategic visibility interface for selected ENS naming surfaces.

Use it to explore protocol-aligned and externally relevant anchors connected to Ethereum’s evolving coordination architecture.

→ https://vortikregistry.github.io/vortik-open-schema/market.html

---

## Strategic Anchors

### Core

Protocol-aligned anchors with strong semantic grounding.

- **epbs.eth** — enshrined proposer-builder separation (ePBS)
- **inclusionlist.eth** — fork-choice enforced inclusion lists (FOCIL)

### Repairable

Valid underlying concept, but with imperfect ENS alignment or terminology mismatch.

- **commitmentlayer.eth** — commitment
- **fastfinality.eth** — single-slot finality (SSF)

### Premature

Real or emerging concept, but not yet stable enough to treat as canonical.

- **preconflayer.eth** — preconfirmation (emergent)

### External

External or Ethereum-adjacent coordination surfaces that remain outside the current Ethereum L1 protocol core.

- **solverlayer.eth** — solver (external)
- **orderflowauction.eth** — order flow auctions (OFA)
- **provingmarket.eth** — proving markets
- **sequencingmarket.eth** — sequencing markets

### Deprecated

Legacy, broad, or market-oriented abstractions with reduced precision relative to current protocol-native terminology.

- **buildermarket.eth** — builder
- **executionmarket.eth** — execution (ambiguous)
- **blockspacemarket.eth** — blockspace markets

---

## Why this matters

Ethereum is undergoing a structural shift.

Block production and coordination are increasingly described through:

- protocol-defined roles
- signed bids
- payload commitments
- reveal behavior
- inclusion constraints
- validator and committee enforcement
- external coordination surfaces

This makes precise terminology more important.

Broad market abstractions are becoming less useful when they do not map cleanly to protocol primitives, roles, constraints, or implementation-facing objects.

---

## What Vortik does

Vortik indexes and preserves semantic relationships between:

- ENS anchors
- canonical technical terms
- classifications
- protocol or external status
- schema definitions
- human-readable anchor documents
- interpretive maps
- generated public interfaces

It is designed to help distinguish:

- protocol-native terminology
- external infrastructure terminology
- emerging research terminology
- deprecated or misaligned abstractions

---

## What Vortik does not do

Vortik does not:

- define Ethereum protocol rules
- replace EIPs or specifications
- claim official protocol authority
- treat every ecosystem term as canonical
- convert watchlist signals into anchors without strong technical grounding

---

## System Structure

The system is organized as follows:

- `registry.json` — central index for tracked anchors
- `schemas/*` — versioned machine-readable definitions and formal source of truth
- `anchors/*` — human-readable semantic interpretation
- `maps/*` — interpretive views and emerging signal maps
- `docs/*` — public GitHub Pages interface
- `scripts/*` — generation, synchronization, and validation tooling

Generated files should not be edited manually unless explicitly intended.

---

## Automation

The registry pipeline currently supports automated generation and synchronization for:

- schema structural fields
- `sources.md` auto-generated metadata sections
- `anchors.index.json`
- `market.index.json`
- public `docs/*` synchronization
- integrity validation

Manual source references should be added only inside the protected manual section of each `sources.md` file.

---

## Machine-readable outputs

- https://vortikregistry.github.io/vortik-open-schema/registry.json
- https://vortikregistry.github.io/vortik-open-schema/anchors.index.json
- https://vortikregistry.github.io/vortik-open-schema/market.index.json
- https://vortikregistry.github.io/vortik-open-schema/maps/coordination-stack.json
- https://vortikregistry.github.io/vortik-open-schema/maps/coordination-surfaces.json

---

## Core Model

Ethereum coordination can be read through recurring semantic categories:

- primitive
- role
- constraint
- external actor
- external mechanism
- coordination surface
- misaligned abstraction

Vortik tracks these categories without treating interpretive maps as protocol specifications.

---

## Current Focus

Current registry focus:

- ePBS as a core proposer-builder separation primitive
- inclusion lists / FOCIL as a core protocol-facing constraint
- commitment as a repairable but important semantic primitive
- preconfirmation as an emergent external mechanism
- solver, proving, sequencing, and order-flow systems as external coordination surfaces
- market-based abstractions as deprecated where protocol-native terminology is more precise

---

## Status

Current version:

- Registry version: `0.6.3`
- Source of truth: `schemas`
- Central index: `registry.json`
- Public interface: GitHub Pages
- Validation: GitHub Actions

---

## Contact

- X → https://x.com/VortikRegistry
- GitHub → Issues / Discussions

---

© 2026 Vortik
