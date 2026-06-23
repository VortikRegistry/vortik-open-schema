# Vortik Registry Constitution

## Purpose

This constitution defines the non-negotiable rules for Vortik Registry, Spec Kit, Codex, contributors, scripts, generated outputs, and pull requests.

Vortik Registry is an independent technical semantic registry. It is not an official Ethereum source, not a sales document, and not a private strategy repository.

## Core Principles

### I. Public Registry / Private Strategy Separation

The public registry MUST contain only technical, semantic, structural, and source-backed information.

The public registry MUST NOT contain:

* pricing
* buyer targeting
* outreach material
* negotiation notes
* sale strategy
* financial ranges
* private watchlists
* personal data
* tax data
* banking data
* local context
* commercial operating metadata

Public-safe content includes:

* technical terms
* categories
* source references
* schema fields
* evidence summaries
* semantic status
* public notes
* generated public outputs

Private-only content includes:

* pricing
* buyer names
* target entities
* outreach copy
* sale timing
* negotiation strategy
* acquisition strategy
* personal notes
* private lead lists
* internal ENS monetization notes

Any attempted public insertion of private strategy MUST be rejected.

### II. Evidence-First Semantic Promotion

No term may be added, promoted, or stabilized without verifiable evidence.

Acceptable evidence includes:

* official EIPs
* official Ethereum documentation
* official protocol specifications
* official client repositories
* official project documentation
* reputable research papers
* public technical discussions tied to a specification

Weak evidence, including social posts, newsletters, marketing pages, or unsupported AI-generated reports, may only justify WATCH status unless confirmed by stronger sources.

The registry MUST NOT claim that a term is scheduled, final, adopted, mainnet active, live, frozen, or official unless the cited source explicitly says so.

Unverified terms MUST remain in WATCH, PREPARE, NO ACTION, REJECT, or NO VERIFICABLE. They MUST NOT be promoted as stable public primitives.

### III. Schema-First Registry Integrity

The registry schema is the source of structural truth.

All public registry entries MUST conform to the current schema.

New properties MUST NOT be introduced casually. Any schema expansion MUST be deliberate, justified, reviewed, and validated.

The schema MUST NOT allow private commercial fields such as:

* buyer
* target_buyer
* asking_range
* floor_price
* stretch_price
* sale_window
* outreach
* sale_strategy
* private_strategy
* negotiation_notes
* estimated_market_value
* commercial_tier

Any field that creates a path for private strategy to enter public outputs is forbidden.

### IV. Generated Output Discipline

Generated files MUST NOT be edited manually.

Source files are human-edited inputs. Generated files are derived outputs produced by scripts.

If a generated output is wrong, the source file or generation script must be fixed, then the output must be regenerated.

Manual edits to generated outputs create drift and MUST be rejected unless explicitly documented as part of a controlled migration.

### V. Validation Before Merge

Every meaningful change MUST pass the project validation workflow before merge.

At minimum, contributors and Codex MUST run:

npm run validate

Validation results MUST NOT be invented.

A pull request MUST NOT claim validation passed unless the command was actually run.

### VI. Human Approval and Controlled Automation

Codex, Spec Kit, scripts, and AI assistants may propose changes, but they MUST NOT be treated as final authority.

No commit, push, merge, release, public registry promotion, or destructive action may be performed without human approval.

AI-generated reports are inputs, not sources of truth. They must be reviewed, verified, and sanitized before becoming repository changes.

## Additional Constraints

### Public Safety Constraints

The repository MUST block or reject public content containing:

* pricing
* currency ranges
* buyer targeting
* sale strategy
* outreach content
* private negotiation logic
* private ENS monetization notes
* personal data
* tax or banking information
* local environmental context
* unsupported claims of adoption, mainnet status, or official scheduling

### Source Constraints

Each public technical term SHOULD have an explicit source trail.

If a source cannot be verified, the term MUST remain in WATCH, PREPARE, NO ACTION, REJECT, or NO VERIFICABLE.

### Category Constraints

Terms MUST be classified carefully.

Categories such as market, auction, and layer require special caution because they are often overloaded by narrative or commercial language.

A term MUST NOT be classified as a primitive unless it names a concrete technical object, protocol object, or base semantic unit.

### ENS Strategy Constraints

ENS asset strategy, pricing, buyer analysis, outreach, and sale timing MUST remain outside the public registry and outside generated public outputs.

The registry may describe technical terms. It MUST NOT publish private sales strategy.

## Development Workflow

All changes SHOULD follow this sequence:

1. Create a dedicated branch.
2. Make the smallest coherent change.
3. Avoid mixing unrelated concerns in one PR.
4. Update source files first.
5. Regenerate derived outputs only through approved scripts.
6. Run validation.
7. Review public/private safety.
8. Open a PR.
9. Wait for CI.
10. Merge only after human approval.

Recommended branch naming:

* chore/spec-kit-constitution
* chore/public-safety-scan
* test/negative-fixtures
* docs/taxonomy-rules
* registry/glamsterdam-core-terms

Branch names MUST NOT include pricing, buyer names, sale strategy, or private commercial notes.

## Governance

This constitution supersedes informal project habits, AI-generated suggestions, and prior inconsistent instructions.

Amendments require:

* a dedicated branch
* a clear reason
* review of privacy and public safety impact
* validation
* human approval

Constitution changes MUST NOT be bundled with registry term updates unless explicitly approved.

## Versioning

Version: 1.0.0
Ratified: 2026-06-23
Last Amended: 2026-06-23

Initial constitution for Vortik Registry after Spec Kit and Codex bootstrap.
