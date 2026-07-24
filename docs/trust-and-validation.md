# Trust and validation

## Purpose

This page summarizes how Vortik Registry protects source discipline, registry consistency, public-safety boundaries, and validation before changes are merged.

## Trust model

Vortik is an independent public semantic registry. It does not define Ethereum protocol rules, replace upstream specifications, or claim official Ethereum status.

Authority remains upstream and context-dependent:

- EIPs and Ethereum protocol specifications control protocol rules and proposal status.
- Client references control implementation-specific behavior.
- Ethereum Research can support research-context interpretation when it is cited as research rather than final protocol state.
- Official ENS sources control ENS architecture claims.

ENS anchors are registry entry points only. They help connect a selected name to a registry record, schema, source trail, and anchor note; they do not create protocol truth.

AI-generated reports may help discover candidates for review, but they are discovery inputs only. They are never authority and never source of truth.

## Source-of-truth model

Read repository files with this hierarchy in mind:

- `schemas/` are the formal source of truth for versioned registry entries.
- `registry.json` is the central index for tracked anchors and their schema and anchor-note paths.
- `anchors/` are human-readable interpretation for selected ENS anchors.
- `sources.md` files record evidence trails, source references, and source-maintenance notes for schema versions.
- `docs/` contains generated public interfaces and explanatory material.
- Research docs provide interpretive support; they do not automatically modify registry status.

## Validation commands

Run the public-safety scan first, then the full validation suite:

```bash
npm run check:public-safety
npm run validate
```

`npm run validate` includes:

- `validate:json`
- `validate:registry-schema`
- `validate:registry`
- `validate:semantic-status`
- `validate:integrity`
- `validate:derived-sync`
- `check:public-safety`

## What validation protects

- JSON validation protects parseable structured data.
- Registry-schema validation protects the shape of `registry.json` against `registry.schema.json`.
- Registry validation protects registry/schema consistency across anchor fields and linked files.
- Semantic-status sync validation keeps `SEMANTIC-STATUS.md` aligned with the current registry entries.
- Integrity validation protects linked anchors, schemas, source notes, and index alignment.
- Derived sync validation protects generated docs and index synchronization.
- The public-safety scan protects public registry-facing files from private or commercial-strategy leakage.

## Critical drift checks

Registry/schema drift in these fields is treated as a hard validation error:

- `canonical_term`
- `classification`
- `status`
- `type`

These checks keep the central registry index aligned with each entry's versioned schema definition.

## Public-safety boundaries

Public registry-facing files must stay technical, source-grounded, and non-operational. They must follow these boundaries:

- No pricing.
- No buyer targeting.
- No strategy for sales or disposition.
- No external-contact planning.
- No private leads.
- No custody claims.
- No monopoly claims.
- No personal data.
- No tax, banking, weather, or unrelated operational content.
- No AI-generated report may be used as source of truth.

## Review discipline

Registry changes require separate pull requests. Docs and research notes do not automatically modify registry status, classification, schema fields, anchors, or source-of-truth data.

Generated outputs should not be manually edited unless the repository convention explicitly requires it. If a generated output is wrong, update the appropriate source file or generation logic and regenerate through the project workflow.

All validation must pass before merge. Changes should be small, source-grounded, and limited to the narrow purpose of the pull request.

## Key trust documents

- [Vortik Registry Constitution](https://github.com/VortikRegistry/vortik-open-schema/blob/main/.specify/memory/constitution.md)
- [Taxonomy Promotion Rules](taxonomy-promotion-rules.md)
- [How to read this registry](how-to-read-this-registry.md)
- [Multi-Agent Verification Audit — 2026-06-28](research/multi-agent-verification-2026-06-28.md)
- [Repository Positioning and Trust Audit](research/repo-positioning-trust-audit.md)

## Reader takeaway

A reader should be able to verify what a term means, where its evidence lives, what validation protects it, and what the repository explicitly does not claim.
