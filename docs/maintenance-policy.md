# Maintenance and update policy

## Purpose

This policy defines the normal maintenance process for Vortik Registry after the v0.6.5 stable public baseline. It explains how future updates should be scoped, justified, reviewed, and validated so the repository remains incremental, source-grounded, and safe for public use.

This document is:

- a repository maintenance policy;
- not a protocol specification;
- not a registry-state change;
- not a new Ethereum claim;
- not commercial material, valuation material, sales material, buyer-targeting material, or external-contact material.

## Maintenance principles

Maintenance work should follow these principles:

- Make source-grounded updates only.
- Keep pull requests small, reviewable, and narrowly scoped.
- Do not bundle unrelated documentation, registry, schema, validation, release, or generated-output changes.
- Do not add private or commercial strategy to public files.
- Ground protocol claims in primary sources such as EIPs, official specifications, Ethereum client repositories, Ethereum specification repositories, or documented source notes.
- Keep generated outputs in sync with source files when generated outputs are part of the intended change.
- Run validation and require it to pass before merge.

## When to update source notes

`schemas/{anchor}/{version}/sources.md` files may be updated when source-grounded facts change or when existing notes need clearer public maintenance context. Appropriate reasons include:

- an EIP status changes;
- a primary specification changes;
- an official upgrade manifest changes;
- Ethereum client or specification repositories add relevant implementation detail;
- prior source notes become stale, ambiguous, incomplete, or need clarification.

Source notes must not be updated from AI-generated reports, screenshots, social posts, or non-public strategy notes unless primary sources independently verify the claim being recorded. Discovery material may help identify what to check, but it is not source authority.

## When to update registry state

Registry state changes require explicit pull requests and must be justified as registry-affecting changes. These changes include, but are not limited to:

- status changes;
- classification changes;
- type changes;
- new anchors;
- removed anchors;
- canonical term changes;
- schema version changes.

A registry-state pull request must explain:

- what changed;
- what primary source supports the change;
- why registry state must change rather than only source notes or documentation;
- which files changed;
- validation results.

Registry-state changes should not be hidden inside broad documentation, formatting, release, or tooling pull requests.

## Candidate intake

Candidate intake for emerging terms should remain conservative. Candidate notes may track emerging terms without making them registry entries, adding anchors, changing statuses, or implying future promotion.

Candidates should be evaluated by:

- primary-source support;
- semantic stability;
- protocol relevance;
- reuse across documents, specifications, repositories, or other durable technical materials;
- risk of being only narrative, marketing, temporary, or campaign-specific language;
- whether the term belongs in WATCH, PREPARE, ACT, REJECT, or OUT_OF_SCOPE style tracking.

Candidate discussion must use public technical relevance language only. It must not use ENS actionability, buyer-side language, sale signals, pricing, and must not use external-contact language, marketplace positioning, or private commercial strategy.

## When not to update

The repository should not be updated in response to:

- social media noise alone;
- AI-generated claims without primary-source verification;
- market speculation;
- private commercial strategy;
- non-public commercial interest;
- changes in price or valuation;
- external-contact plans;
- current ENS governance controversy commentary;
- claims that ENS is good, bad, captured, unsafe, dead, corrupt, centralized, or decentralized.

Public maintenance should distinguish durable technical source changes from temporary attention, private intent, commercial interpretation, or governance controversy.

## Public/private boundary

Maintenance work must preserve the boundaries described in [`docs/naming-governance-boundaries.md`](naming-governance-boundaries.md) and [`AGENTS.md`](../AGENTS.md).

In particular:

- ENS anchors are semantic naming surfaces only;
- ENS anchors are not authority surfaces;
- ENS anchors do not imply ENS DAO, ENS Foundation, ENS Labs, Ethereum Foundation, or ENSv2 endorsement or dependency;
- ENS names do not create protocol truth;
- private or commercial strategy must not be published.

## Validation checklist

Before merge, confirm:

- [ ] `npm run check:public-safety` passes.
- [ ] `npm run validate` passes.
- [ ] Generated docs are synced when generated outputs are relevant to the change.
- [ ] No private or commercial content was added.
- [ ] No unauthorized registry, schema, generated, package, version, source-note, release-note, map, or market files changed.
- [ ] Pull request scope is narrow and clearly described.

## Recommended PR types

Future maintenance should prefer clear PR categories such as:

- source note refresh;
- registry status update;
- candidate intake note;
- documentation clarification;
- validation/tooling improvement;
- release/metadata update;
- public-safety boundary update.

Each PR should state its category, scope, changed files, validation results, and any source-of-truth implications.

## Conclusion

After v0.6.5, normal work should be incremental, source-grounded, and validation-preserving rather than foundational hardening.
