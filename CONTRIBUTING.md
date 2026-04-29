# Contributing to Vortik Semantic Registry

Thank you for your interest in improving the **Vortik Semantic Registry**.

This repository tracks **semantic stabilization and terminology convergence** across Ethereum coordination primitives, roles, constraints, external coordination surfaces, and deprecated or misaligned abstractions.

The registry is a documentation, research, and semantic infrastructure tool.

It is not a governance process.

It does not define Ethereum protocol standards.

---

## Contribution Principles

Vortik operates as a research-first semantic registry.

Contributions should:

- reference primary sources whenever possible
- distinguish protocol-native terms from external infrastructure terms
- avoid speculative or marketing terminology
- focus on terminology stabilization
- preserve minimal schema design
- avoid protocol advocacy or design proposals
- maintain alignment with the current registry classification model

The goal of the registry is semantic clarity, not protocol governance.

---

## Classification Model

Contributions should align with the current classification model:

| Classification | Meaning |
|---|---|
| `core` | Strong protocol-facing semantic alignment |
| `repairable` | Valid underlying concept with imperfect ENS naming |
| `premature` | Real but not yet semantically stable |
| `external` | Ethereum-adjacent surface outside current L1 core |
| `deprecated` | Legacy or broad abstraction with reduced precision |

Classification reflects semantic status.

It does not imply official Ethereum standardization.

---

## Reporting Terminology Drift

If you observe terminology divergence across research, implementation, or infrastructure discussions, please open an Issue including:

- source links
- observed terminology
- affected anchor, if any
- suggested canonical term, if appropriate
- explanation of why the terminology matters structurally

This helps the registry track how terminology evolves across Ethereum coordination language.

---

## Proposing New Anchors

When proposing a new anchor, please include:

- clear description of the semantic surface
- proposed canonical term
- proposed classification
- proposed type
- at least two primary or high-quality technical references when possible
- evidence that the terminology appears across multiple relevant discussions or artifacts

Anchors may represent:

- protocol primitives
- protocol-facing roles
- protocol-facing constraints
- external actors
- external mechanisms
- coordination surfaces
- deprecated abstractions worth preserving for comparison

Anchors must not represent:

- products
- companies
- applications
- unsupported narratives
- purely speculative terms
- marketing-only terminology

Not every emerging term should become an anchor.

Some terms should remain in `maps/emerging-signals.json` until stronger grounding appears.

---

## Proposing Schema Updates

Schemas represent versioned machine-readable semantic metadata.

Schema updates should:

- remain minimal
- preserve compatibility with existing schema structure
- align with the registry classification model
- align with `registry.json` for core structural fields
- include references to primary sources where relevant
- avoid unsupported protocol assumptions

Avoid:

- speculative fields
- narrative-only categories
- duplicating large protocol definitions
- adding fields that cannot be maintained consistently

Schemas are the formal source of truth declared by the registry.

---

## Updating Sources

Source documents live under:

- `/schemas/{anchor}/{version}/sources.md`

Each `sources.md` file contains:

- an auto-generated section
- a protected manual source section

Do not edit the auto-generated section manually.

Curated references and source notes should be added only inside:

`<!-- MANUAL-SOURCES:START -->`

and

`<!-- MANUAL-SOURCES:END -->`

Sources should prioritize primary technical material, including:

- EIPs
- official specifications
- Ethereum Research discussions
- client or implementation references
- core developer discussions
- protocol roadmap materials
- primary technical blog posts

Avoid unsupported secondary commentary, price speculation, or marketing material.

Sources validate semantic positioning, not promotional interpretation.

---

## Editing Existing Anchors

Anchor documents are human-readable semantic interpretation files.

When editing anchors:

- avoid turning them into protocol specifications
- preserve conceptual neutrality
- ensure terminology reflects primary sources
- maintain alignment with the corresponding schema
- maintain alignment with `registry.json`
- document naming mismatch clearly when ENS wording differs from the canonical term
- avoid overstating external surfaces as protocol-native

Detailed structured metadata should remain in the corresponding schema.

---

## Editing Maps

Maps are interpretive views over the registry.

They may describe:

- coordination surfaces
- coordination stack views
- emerging semantic signals

Maps should not replace `registry.json` or `/schemas/`.

Emerging watchlist terms should stay in `maps/emerging-signals.json` unless there is enough technical grounding to promote them into the registry.

---

## Pull Request Guidelines

Before submitting a pull request:

- confirm that references are valid
- ensure terminology is consistent with existing anchors
- align with the current classification model
- avoid speculative claims about protocol adoption
- avoid editing generated files unless necessary
- run or verify the validation workflow when possible

When possible, include links to relevant EIPs, Ethereum Research discussions, client references, or implementation-facing materials.

---

## Generated Files

Some files are generated or synchronized by scripts.

Avoid manual edits to generated outputs unless you are intentionally changing the generation process.

Generated or derived outputs may include:

- `anchors.index.json`
- `market.index.json`
- files under `/docs/`
- auto-generated sections in `sources.md`

If a generated file is wrong, update the relevant source file or script.

---

## Scope Reminder

Vortik documents:

- semantic surfaces
- protocol primitives
- roles
- constraints
- external coordination systems
- deprecated terminology
- terminology convergence

It does not document:

- official Ethereum standards
- governance decisions
- product endorsements
- company profiles
- speculative investment claims

The registry exists to make Ethereum’s coordination architecture:

- more legible
- more consistent
- more structured
- and more machine-readable
