# Emerging Ethereum candidate intake notes

## Purpose

This document tracks emerging Ethereum coordination terms that may be worth monitoring for possible future review after the v0.6.5 baseline.

This document is:

- a public research note;
- not registry state;
- not a protocol specification;
- not a source-of-truth document;
- not a claim that any candidate should become a registry entry;
- not commercial material, buyer-side analysis, valuation material, sales material, or direct-contact campaign material.

The terms below are intake candidates only. Their presence here records that they may deserve future primary-source review; it does not establish protocol meaning, adoption, implementation, roadmap inclusion, or registry eligibility.

## Candidate intake rule

Candidates may only move toward registry consideration after primary-source verification. Primary sources may include:

- EIPs;
- official Ethereum specifications;
- Ethereum client repositories;
- Ethereum specification repositories;
- durable protocol research posts;
- official upgrade manifests;
- source notes already reviewed in the repository.

AI-generated reports, social posts, screenshots, market commentary, and private notes may help identify what to investigate, but they are not source authority.

## Public registry relevance

Public registry relevance means a candidate may eventually help technical readers understand Ethereum coordination surfaces because it has some combination of:

- protocol relevance;
- semantic stability;
- repeated technical use;
- source durability;
- usefulness for readers trying to understand Ethereum coordination surfaces.

This section does not use or imply actionability, buyer-side analysis, sale signal, pricing, valuation, direct-contact campaigns, marketplace positioning, or non-public strategy.

## Candidate list

| Candidate | Provisional area | Why monitor | Current public state | Intake posture |
| --- | --- | --- | --- | --- |
| Quick Slots | Slot timing and block construction | May describe a timing-related coordination idea that could affect how readers discuss block or slot cadence. | needs primary-source verification; watch only; not registry state | WATCH |
| variable slot timing | Slot timing and block construction | May describe proposals or research around non-uniform slot cadence and related coordination assumptions. | needs primary-source verification; research candidate; not registry state | WATCH |
| blob ticket | Blob and data availability | May relate to data-availability resource allocation terminology that should be checked against durable sources. | needs primary-source verification; watch only; not registry state | WATCH |
| AOT blob | Blob and data availability | May describe ahead-of-time blob handling or commitment terminology that requires source confirmation. | needs primary-source verification; research candidate; not registry state | WATCH |
| JIT blob | Blob and data availability | May describe just-in-time blob handling or availability terminology that requires source confirmation. | needs primary-source verification; research candidate; not registry state | WATCH |
| UPIL | Inclusion, ranking, and preconfirmation | May be an acronym used in inclusion-list or transaction-inclusion discussions and should be expanded only after source review. | needs primary-source verification; watch only; not registry state | HOLD |
| ranking fee | Inclusion, ranking, and preconfirmation | May refer to fee-ordering or prioritization concepts in transaction inclusion research. | needs primary-source verification; watch only; not registry state | WATCH |
| Multi-Party Block Construction / MPBC | Slot timing and block construction | May describe collaborative block-building or construction responsibility terminology that should be compared with source usage. | needs primary-source verification; research candidate; not registry state | PREPARE |
| base block | Slot timing and block construction | May appear in block-construction decomposition discussions and requires careful disambiguation before any registry review. | needs primary-source verification; watch only; not registry state | WATCH |
| mini-block | Slot timing and block construction | May appear in sub-block or partial-block construction discussions and requires source-backed context. | needs primary-source verification; watch only; not registry state | WATCH |
| sub-slot auction | Inclusion, ranking, and preconfirmation | May describe auction timing below a full slot and should be evaluated only with durable technical sources. | needs primary-source verification; research candidate; not registry state | WATCH |
| outcome preconfirmations | Inclusion, ranking, and preconfirmation | May describe commitments about transaction or execution outcomes before final inclusion and needs precise source review. | needs primary-source verification; research candidate; not registry state | PREPARE |
| sealed transaction | Privacy and transaction delivery | May relate to transaction privacy, encryption, or delayed-reveal delivery patterns and needs source-backed disambiguation. | needs primary-source verification; watch only; not registry state | WATCH |
| sharded PIR | Privacy and transaction delivery | May describe private information retrieval designs split across shards or parties and needs durable protocol-research support. | needs primary-source verification; research candidate; not registry state | WATCH |

## Slot timing and block construction

Terms in this group may involve slot cadence, block decomposition, or multi-party construction responsibilities. They should remain in monitoring until primary sources show stable technical use, clear scope, and relevance to Ethereum coordination surfaces. Similar wording can have different meanings across research contexts, so future review should avoid inferring adoption from isolated usage.

## Blob and data-availability terminology

Blob-related candidates may reflect evolving data-availability resource, timing, or allocation discussions. Future work should verify whether each term appears in EIPs, official specifications, client repositories, specification repositories, or durable protocol research before describing it as anything more than a research candidate.

## Inclusion, ranking, and preconfirmation terminology

Candidates in this group may overlap with inclusion lists, ordering, fee prioritization, auctions, or preconfirmation design. Any future registry proposal should separate broad research vocabulary from protocol-defined terms and should avoid treating speculative design language as adopted protocol state.

## Privacy and transaction-delivery terminology

Privacy and transaction-delivery candidates may describe encrypted submission, delayed reveal, private information retrieval, or related coordination mechanisms. These terms need careful primary-source review because similar phrases can refer to different systems, threat models, or research assumptions.

## Explicit non-claims

This document does not:

- add any registry entry;
- add any ENS anchor;
- change status, classification, type, or schema;
- claim official Ethereum status;
- claim protocol adoption;
- claim client implementation;
- claim roadmap inclusion;
- imply ENS DAO, ENS Foundation, ENS Labs, Ethereum Foundation, or ENSv2 endorsement or dependency;
- publish commercial strategy;
- publish lists of counterparties, prices, sale timing, direct-contact campaigns, valuation, or marketplace positioning.

## Maintenance path

Future PRs may:

- add primary-source citations;
- move a candidate to a more detailed research note;
- reject a candidate;
- leave a candidate in WATCH;
- propose registry changes only through a separate explicit registry-state PR.

Any registry-state proposal must be separate from this intake note and must satisfy the repository's primary-source, validation, public/private boundary, and registry-modification requirements.

## Conclusion

This document is a conservative intake surface for future review, not a registry expansion.
