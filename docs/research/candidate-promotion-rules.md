# Candidate promotion rules

## Purpose

This note defines how public candidate terms may move from research monitoring toward future registry consideration. It does not promote any current candidate, create registry entries, add ENS anchors, modify schemas, or change registry state.

## Candidate boundary

Candidates are not registry entries. A candidate backlog item is a public monitoring note, not an ENS anchor, not a schema object, not official Ethereum status, and not a promise of future promotion.

The candidate backlog is not a promotion queue. It is a place to keep conservative, source-checkable observations until the required trusted verification path exists or the term is left outside registry state.

## Mandatory verification boundary

Contributor-supplied evidence is never accepted as verified evidence merely because it is structurally valid or was supplied by a human or agent. A review artifact also cannot manufacture authority by labeling a URL as an EIP, official repository, protocol specification, or on-chain ENS proof.

Future registry admission requires verification derived independently from the review artifact:

1. a trusted primary-source receipt grounded in Ethereum or the relevant protocol; and
2. for an ENS-backed registry entry, a trusted Ethereum mainnet ENS receipt bound to the exact name.

Those trusted receipts are not implemented yet. Therefore current candidate admission is fail-closed.

Implementation references, research discussions, secondary summaries, social commentary and AI-generated analysis may corroborate research, but cannot open the admission gate.

The canonical review/provenance contract and current fail-closed behavior are documented in [`../ens-candidate-review.md`](../ens-candidate-review.md).

## Conservative review process

Current candidate review may:

1. identify the candidate term and exact claim being investigated;
2. collect candidate references without trusting them;
3. classify sources for research organization;
4. preserve a digest-bound review artifact;
5. keep the candidate in backlog;
6. add a glossary or research note when separately justified; or
7. reject or degrade the candidate.

It may not declare registry eligibility.

## Repository enforcement

The full validation pipeline compares `registry.json` with the pull request base branch. While trusted verification receipts are unavailable, validation rejects every new anchor and any rebinding of an existing anchor ID to another ENS name.

This repository-level gate prevents a direct registry PR from bypassing the candidate process.

## Explicit blockers

A candidate must remain outside registry admission when any of these conditions holds:

- trusted Ethereum/protocol primary-source receipt unavailable;
- trusted exact-name ENS receipt unavailable;
- only social commentary;
- only an AI-generated report;
- only secondary evidence;
- only nontechnical interest;
- unclear protocol meaning;
- duplicate of an existing anchor;
- prohibited nontechnical targeting.

These blockers apply even when a candidate sounds plausible or appears in secondary summaries.

## Current allowed outcomes

A candidate review may currently result in:

- keep in backlog;
- add a glossary entry through its normal process;
- add a research note through its normal process;
- reject or degrade the candidate.

Registry admission will remain disabled until a later, separately reviewed trusted-verification change implements the required Ethereum/protocol and ENS receipts. Even after that future change, registry mutation must remain a separate reviewed PR and pass the normal repository validations.

## Non-promotion statement

This document does not promote any current candidate. It documents the conservative gate between public research monitoring and future registry consideration.
