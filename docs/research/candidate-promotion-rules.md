# Candidate promotion rules

## Purpose

This note defines how public candidate terms may move from research monitoring to future registry consideration. It does not promote any current candidate, create registry entries, add ENS anchors, modify schemas, or change registry state.

## Candidate boundary

Candidates are not registry entries. A candidate backlog item is a public monitoring note, not an ENS anchor, not a schema object, not official Ethereum status, and not a promise of future promotion.

The candidate backlog is not a promotion queue. It is a place to keep conservative, source-checkable observations until a separate registry PR is justified or the term is left outside registry state.

## Conservative review process

Before any candidate can be considered for future registry work, reviewers should:

1. Identify the candidate term and the exact claim being reviewed.
2. Confirm primary sources for the term or claim.
3. Classify evidence quality, distinguishing EIPs, fork meta-EIPs, implementation references, research discussion, secondary summaries, and AI-generated discovery inputs.
4. Check [`../taxonomy-promotion-rules.md`](../taxonomy-promotion-rules.md).
5. Check whether the term maps to a primitive, role, constraint, external surface, or rejected abstraction.
6. Check whether an ENS anchor exists or whether the term is only glossary, research-note, or backlog material.
7. Require a separate PR for any registry change.
8. Require validation, including the public-safety scanner and registry validation.

## Explicit blockers

A candidate must not be promoted when review finds any of these blockers:

- no primary source;
- only social commentary;
- only an AI-generated report;
- only nontechnical interest;
- unclear protocol meaning;
- duplicate of an existing anchor;
- prohibited nontechnical targeting.

These blockers apply even when a candidate sounds plausible or appears in secondary summaries.

## Allowed outcomes

A candidate review may result in one of these outcomes:

- keep in backlog;
- add a glossary entry;
- add a research note;
- propose a registry PR later;
- reject or degrade the candidate.

Only a later, separate registry PR may add or change registry state. That later PR must remain source-grounded, avoid unsupported Ethereum status claims, avoid treating ENS names as protocol truth, and pass validation.

## Non-promotion statement

This document does not promote any current candidate. It only documents the conservative gate between public research monitoring and future registry consideration.
