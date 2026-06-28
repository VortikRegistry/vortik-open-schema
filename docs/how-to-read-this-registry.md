# How to read this registry

## Purpose

This guide shows a technical Ethereum or ENS reader how to inspect one Vortik Registry entry from the central registry index through its schema, source notes, anchor documentation, promotion rules, and local validation.

The goal is to make the registry readable without treating ENS names as protocol authority. ENS anchors are entry points for registry records; they do not create Ethereum protocol truth, official status, or implementation authority.

## Core idea

Read one entry in this order:

```text
registry.json → schema.json → sources.md → anchor.md → docs/generated outputs
```

This order separates the registry index, the versioned schema definition, source trails, human-readable interpretation, and public explanatory or generated material.

## Source-of-truth model

Use the repository with this source model in mind:

- `schemas/` are the formal source of truth for versioned registry definitions.
- `registry.json` is the central index for tracked anchors and points to schemas and anchor notes.
- `sources.md` records source trails, evidence, curated references, and manual source notes for a schema version.
- `anchors/` provide human-readable interpretation for selected ENS anchors.
- `docs/` contains generated public interfaces and explanatory material.
- Research docs are interpretive support; they do not automatically modify registry status.

## Worked example: `epbs.eth`

This guide uses the existing ePBS entry only.

| Field | Value |
| --- | --- |
| ENS anchor | `epbs.eth` |
| Registry ID | `epbs` |
| Canonical term | enshrined proposer-builder separation (ePBS) |
| Schema path | `schemas/epbs/1.0-draft/schema.json` |
| Source notes path | `schemas/epbs/1.0-draft/sources.md` |
| Anchor note path | `anchors/epbs.md` |

## Step-by-step walkthrough

### 1. Start at `registry.json`

Find the entry whose `id` is `epbs`. For this entry, inspect these fields:

- `id`
- `ens`
- `canonical_term`
- `classification`
- `status`
- `type`
- `schema`
- `anchor_doc`

For the ePBS entry, these fields connect `epbs.eth` to the canonical term, classification, maturity status, semantic type, schema path, and anchor note path. Treat this as the central index record, not as an official Ethereum specification.

### 2. Open the schema

Open `schemas/epbs/1.0-draft/schema.json`.

The schema is the formal semantic definition for this versioned registry entry. For ePBS, it defines the required object shape and constrains the registry meaning through fields that exist in the schema, including:

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

Use these fields to understand what the registry can validate for the ePBS entry. Do not infer additional fields or registry meaning that the schema does not define.

### 3. Open `sources.md`

Open `schemas/epbs/1.0-draft/sources.md`.

This file records the source trail for the versioned ePBS entry. It includes generated registry metadata, linked files, source policy, curated references, and manual source notes. Use it to understand what evidence supports the registry interpretation and where source-maintenance notes live.

### 4. Open `anchors/epbs.md`

Open `anchors/epbs.md`.

The anchor note is the human-readable interpretation for `epbs.eth`. It explains why the entry is tracked, how the registry classifies it, what coordination role it describes, and what boundaries or non-claims apply. It is interpretive documentation, not an official Ethereum specification.

### 5. Check promotion rules

Read `docs/taxonomy-promotion-rules.md` before proposing any status, classification, or registry-facing change.

The promotion rules define how evidence is evaluated, how AI-generated reports may be used only as discovery inputs, and why docs or research notes do not automatically change registry status. Registry changes require a separate registry PR and passing validation.

### 6. Validate locally

Run the public-safety scanner first, then the full validation suite:

```bash
npm run check:public-safety
npm run validate
```

These commands check for public-safety issues and validate registry structure, schema consistency, integrity, generated-output synchronization, and related repository constraints.

## What not to infer

Do not infer any of the following from a registry entry:

- ENS names do not create protocol truth.
- Registry inclusion does not mean official Ethereum status.
- Research docs do not automatically promote a term.
- AI-generated reports are discovery inputs only.
- Public docs must not include private ENS or commercial strategy.

## Contributor checklist

Before proposing a future registry change, check:

- Is the term supported by primary sources?
- Does the schema support the change?
- Are `canonical_term`, `classification`, `status`, and `type` consistent?
- Is the anchor note human-readable and neutral?
- Does the change avoid private or commercial strategy?
- Do validation commands pass?
