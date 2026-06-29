# Vortik Registry documentation index

## Purpose

This page is a navigation hub for public Vortik Registry documentation. It helps technical readers understand what to read first, where source-of-truth data lives, how validation works, and how research notes should be interpreted.

## Start here

Recommended reading path:

1. [`README.md`](../README.md)
2. [`docs/how-to-read-this-registry.md`](how-to-read-this-registry.md)
3. [`docs/trust-and-validation.md`](trust-and-validation.md)
4. [`docs/taxonomy-promotion-rules.md`](taxonomy-promotion-rules.md)
5. [`registry.json`](../registry.json)
6. `schemas/{anchor}/{version}/schema.json`
7. `schemas/{anchor}/{version}/sources.md`
8. `anchors/{anchor}.md`

## Source-of-truth files

- [`../registry.json`](../registry.json) — central registry index for tracked anchors and their schema and anchor-note paths.
- [`../registry.schema.json`](../registry.schema.json) — JSON schema for the central registry index.
- [`../schemas/`](../schemas/) — formal versioned registry definitions and source trails.
- [`../anchors/`](../anchors/) — human-readable interpretations for selected ENS anchors.
- [`../maps/`](../maps/) — generated or supporting maps for registry interpretation and navigation.
- [`../market.index.json`](../market.index.json) — legacy or visibility index; not a source of protocol truth.

## Core docs

- [`how-to-read-this-registry.md`](how-to-read-this-registry.md) — explains how to inspect one registry entry from the central index through schema, sources, anchor notes, promotion rules, and validation.
- [`trust-and-validation.md`](trust-and-validation.md) — summarizes the trust model, source-of-truth hierarchy, validation commands, drift checks, and public-safety boundaries.
- [`taxonomy-promotion-rules.md`](taxonomy-promotion-rules.md) — defines conservative rules for promoting, holding, degrading, rejecting, or leaving terms outside registry state.

## Research notes

- [`research/multi-agent-verification-2026-06-28.md`](research/multi-agent-verification-2026-06-28.md) — records a conservative verification pass over AI-surfaced Ethereum and ENS candidate terms using primary-source review.
- [`research/repo-positioning-trust-audit.md`](research/repo-positioning-trust-audit.md) — reviews how the public repository appears to a technical Ethereum or ENS reader and identifies navigation and trust improvements.
- [`research/bal-block-access-list-source-notes.md`](research/bal-block-access-list-source-notes.md) — records primary-source-backed notes about Block-Level Access Lists, `block_access_list_hash`, and related support surfaces.

Research notes are interpretive support. They do not automatically modify registry state, promote terms, add anchors, reclassify entries, or change source-of-truth files.

## Trust and validation

Public validation includes:

```bash
npm run check:public-safety
npm run validate
```

Validation checks include:

- JSON parseability;
- registry/schema consistency;
- anchor/schema/index integrity;
- generated docs/index synchronization;
- public-safety boundaries.

## What not to infer

- ENS anchors do not create protocol truth.
- Registry inclusion does not imply official Ethereum status.
- Research notes do not automatically promote terms.
- AI-generated reports are discovery inputs only.
- Public documentation must not include private or commercial strategy.
- New registry entries or reclassifications require separate PRs.

## Contributor path

1. Read the source-of-truth model.
2. Check primary sources.
3. Confirm taxonomy rules.
4. Keep changes small.
5. Avoid private or commercial strategy.
6. Run validation.
7. Submit a separate PR for registry changes.
