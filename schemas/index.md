# Schema Directory

This directory contains machine-readable semantic schemas for coordination primitives, roles, constraints, external coordination surfaces, and deprecated abstractions tracked by the Vortik Semantic Registry.

Schemas are designed to support structured interpretation of Ethereum coordination terminology.

They do not define protocol rules.

They are research-support artifacts, not official Ethereum specifications.

---

## Purpose

The schema layer provides a machine-readable structure for each tracked semantic anchor.

Each schema connects:

- a registry identifier
- an ENS anchor
- a canonical technical term
- a classification
- a semantic type
- naming alignment
- protocol or research grounding
- source references

The registry uses schemas to preserve semantic discipline while terminology evolves.

---

## Available Schemas

### Core

Protocol-aligned anchors with strong semantic grounding.

- **epbs** — enshrined proposer-builder separation (ePBS)  
  `schemas/epbs/1.0-draft/schema.json`

- **inclusionlist** — fork-choice enforced inclusion lists (FOCIL)  
  `schemas/inclusionlist/0.1-draft/schema.json`

---

### Repairable

Valid underlying concepts with imperfect ENS alignment or terminology mismatch.

- **commitmentlayer** — commitment  
  `schemas/commitmentlayer/0.1-draft/schema.json`

- **ssf** — single-slot finality (SSF)  
  `schemas/ssf/0.1-research/schema.json`

---

### Premature

Real or emerging concepts that are not yet stable enough to treat as canonical.

- **preconflayer** — preconfirmation (emergent)  
  `schemas/preconflayer/0.1-draft/schema.json`

---

### External

Ethereum-adjacent or external coordination surfaces outside the current Ethereum L1 protocol core.

- **solverlayer** — solver (external)  
  `schemas/solverlayer/0.1-research/schema.json`

- **orderflowauction** — order flow auctions (OFA)  
  `schemas/orderflowauction/0.1-research/schema.json`

- **provingmarket** — proving markets  
  `schemas/provingmarket/0.1-research/schema.json`

- **sequencingmarket** — sequencing markets  
  `schemas/sequencingmarket/0.1-research/schema.json`

---

### Deprecated

Legacy, broad, or market-oriented abstractions with reduced precision relative to protocol-native terminology.

- **buildermarket** — builder  
  `schemas/buildermarket/0.1-research/schema.json`

- **executionmarket** — execution (ambiguous)  
  `schemas/executionmarket/0.1-research/schema.json`

- **blockspacemarket** — blockspace markets  
  `schemas/blockspacemarket/0.1-research/schema.json`

---

## Classification Model

| Classification | Meaning |
|---|---|
| `core` | Protocol-aligned anchor with strong semantic grounding |
| `repairable` | Valid concept with imperfect ENS alignment or terminology mismatch |
| `premature` | Real or emerging concept not yet stable enough to treat as canonical |
| `external` | Ethereum-adjacent or external coordination surface outside the current L1 protocol core |
| `deprecated` | Legacy, broad, or market-oriented abstraction with reduced precision relative to protocol-native terminology |

---

## Type Model

| Type | Meaning |
|---|---|
| `primitive` | Protocol or research primitive tracked as a semantic object |
| `constraint` | Constraint surface affecting coordination behavior |
| `external_actor` | External actor or participant outside the current L1 protocol core |
| `external_mechanism` | External or off-protocol mechanism related to Ethereum coordination |
| `coordination_surface` | Broad coordination surface across infrastructure or ecosystem behavior |
| `misaligned_abstraction` | Broad abstraction retained for comparison but not treated as canonical |

---

## Schema Structure

Each schema should use JSON Schema syntax and keep the semantic type inside `properties.type.const`.

The root JSON Schema type must always be:

```json
"type": "object"
```

The semantic type must be represented like this:

```json
"type": {
  "type": "string",
  "const": "coordination_surface"
}
```

Do not use semantic values such as `market`, `coordination_surface`, or `primitive` as the root JSON Schema `type`.

---

## Required Fields

Each schema should define, at minimum:

- `id`
- `version`
- `canonical_term`
- `classification`
- `status`
- `type`
- `summary`
- `pipeline_position`
- `coordination_role`
- `protocol_grounding`
- `naming`
- `sources`

The registry and schema should remain aligned for:

- `id`
- `canonical_term`
- `classification`
- `status`
- `type`

---

## Naming Alignment

Each schema includes a `naming` object that connects the ENS anchor to the canonical technical term.

Naming may be aligned or mismatched.

Examples:

- `epbs.eth` aligns directly with `enshrined proposer-builder separation (ePBS)`
- `inclusionlist.eth` aligns broadly with inclusion lists while the canonical term tracks FOCIL more precisely
- `fastfinality.eth` maps to `single-slot finality (SSF)` and is therefore repairable rather than fully canonical
- `commitmentlayer.eth` captures an important semantic object but uses a less precise `layer` suffix

---

## Source Policy

Schema source references should prioritize:

- primary EIPs
- official specifications
- Ethereum Research discussions
- client or implementation references
- roadmap materials
- directly relevant technical documents

Avoid treating social commentary, price speculation, or unsupported market claims as formal sources.

---

## Registry Relationship

`registry.json` is the primary index.

Schemas are versioned machine-readable definitions linked from the registry.

Anchor documents provide human-readable interpretation.

Source documents provide curated references and notes.

The expected relationship is:

```txt
registry.json
  ↓
schemas/{anchor}/{version}/schema.json
  ↓
schemas/{anchor}/{version}/sources.md
  ↓
anchors/{anchor}.md
```

---

## Current Focus

The current registry focus is:

- ePBS as a core proposer-builder separation primitive
- inclusion lists / FOCIL as a core protocol-facing constraint
- commitment as a repairable but important semantic primitive
- preconfirmation as an emergent external mechanism
- solver, proving, sequencing, and order-flow systems as external coordination surfaces
- market-based abstractions as deprecated where protocol-native terminology is more precise

---

## Non-Canonical Signals

Emerging signals such as:

- execution tickets
- proposer rights
- PTC
- BAL
- bid
- payload
- payload reveal
- builder commitments
- inclusion commitments
- execution rights
- slot futures
- neutral blockspace

should be tracked in:

```txt
maps/emerging-signals.json
```

They should not be promoted to primary registry anchors without stronger evidence of:

- EIP presence
- client or implementation relevance
- roadmap visibility
- semantic convergence
- independent implementation, operational, or ecosystem usage signals

---

## Version

This schema directory is aligned with the Vortik Semantic Registry v0.6.4 release process.

The registry remains a research-support and semantic infrastructure artifact.

It does not claim official Ethereum protocol authority.
