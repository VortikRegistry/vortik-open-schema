# Taxonomy lifecycle bridge

## Purpose

This document bridges terminology used in candidate research notes and registry semantic-status documentation. It explains how candidate evidence posture can inform later registry review without changing the registry itself.

This document does not:

- modify registry state;
- promote any candidate;
- change any anchor status;
- create any new anchor;
- replace `registry.json`;
- replace `sources.md`;
- replace primary-source verification.

Vortik Registry uses two related but distinct vocabularies:

1. **Candidate evidence posture** — used for terms that are not necessarily registry entries yet.
2. **Registry semantic posture** — used for tracked anchors already represented in the registry or in public semantic-status documentation.

These vocabularies are not interchangeable.

Candidate posture answers: **Should this term be investigated, prepared, rejected, degraded, or held?**

Registry semantic posture answers: **How should an already tracked anchor be publicly interpreted within the registry?**

## Two-layer model

### Candidate layer

The candidate layer is for possible future terms, watchlists, research notes, intake notes, and external vocabulary being evaluated. It is an evidence-review layer, not registry state.

Candidate-layer language may help maintainers decide whether to gather sources, keep monitoring terminology, reject weak candidates, or prepare a separate registry-state proposal. It does not create anchors, change statuses, or alter schemas.

### Registry layer

The registry layer is for anchors already included in `registry.json` and represented in schemas, anchors, and public docs. Registry-layer language describes how tracked anchors should be interpreted by public readers under the repository's source-of-truth hierarchy.

Registry-layer posture must remain grounded in `registry.json`, schemas, source notes, anchor documents, validation scripts, and public documentation. Registry-layer changes require explicit source-backed pull requests.

## Candidate evidence posture

Candidate evidence posture is a conservative review vocabulary for terms that may be monitored, prepared, rejected, degraded, or held outside registry state.

- `ACT`: strong enough evidence to consider explicit registry action, but still requires a dedicated registry-state PR.
- `PREPARE`: promising candidate; source work or documentation may be prepared, but no registry change has occurred yet.
- `WATCH`: monitor only; evidence has insufficient stability or source support for registry treatment.
- `REJECT`: not suitable for registry treatment under current evidence.
- `NO ACTION`: no current registry or documentation action is required.
- `NO VERIFICABLE`: cannot be verified through reliable primary or durable sources.
- `DEGRADE`: reduce confidence, priority, or prominence due to better evidence, terminology drift, ambiguity, or misalignment.

None of these postures automatically changes registry state. They do not add anchors, change classifications, change statuses, update schemas, or replace primary-source review.

## Registry semantic posture

Registry semantic posture is a conservative public interpretation vocabulary for anchors already tracked by the registry or represented in public semantic-status documentation.

- `core`: central to the registry's current public technical thesis.
- `repairable`: potentially useful, but currently imprecise, outdated, or needing reframing.
- `premature`: technically relevant but not stable enough for stronger posture.
- `external`: useful as an adjacent or contextual concept, but not central.
- `deprecated`: retained for audit/history or negative signal, but no longer recommended as a strong semantic framing.

Registry semantic posture must be grounded in `registry.json`, schemas, source notes, and public documentation. It is not established by private notes, market commentary, social claims, AI-generated reports, or candidate posture labels alone.

## Relationship table

The following table describes possible relationships between candidate posture and registry review. These relationships are not automatic mappings.

| Candidate posture | Possible next review | Possible registry outcome | Important boundary |
| --- | --- | --- | --- |
| `WATCH` | Continue monitoring in research notes. | No registry change, or later review as `premature` if durable technical evidence emerges. | `WATCH` does not mean registry entry. |
| `PREPARE` | Gather primary sources and draft public documentation or a candidate proposal. | Candidate PR or separate registry-state PR. | Preparation is still not registry state. |
| `ACT` | Open a dedicated registry-state review with explicit source-backed justification. | New anchor or status update if the PR is approved. | Requires an explicit source-backed PR. |
| `DEGRADE` | Review source quality, terminology drift, ambiguity, or fit with the registry thesis. | `repairable`, `external`, `deprecated`, or no change. | No automatic demotion occurs. |
| `REJECT` | Close the candidate under current evidence. | No registry state. | Can be revisited if new primary sources appear. |
| `NO VERIFICABLE` | Keep out of scope unless reliable primary or durable sources appear. | No action. | Social or AI claims are insufficient. |
| `NO ACTION` | No current review required. | No registry or documentation change. | Absence of action is not endorsement or rejection. |

## Promotion and demotion rules

A candidate can only move toward registry state through a separate explicit registry-state PR. That PR must include:

- primary-source evidence;
- reason for the change;
- files changed;
- impact on registry state;
- validation results;
- public/private boundary confirmation.

Existing anchors can only be demoted, reclassified, deprecated, reframed, or otherwise changed through an explicit PR with source-backed justification. A candidate-layer signal such as `DEGRADE`, `REJECT`, or `NO VERIFICABLE` may motivate review, but it does not change registry interpretation by itself.

## Example interpretation

Example A: A term in `WATCH` may be useful to monitor but remains outside registry state until primary sources show durable, repeated technical use.

Example B: An existing anchor marked `repairable` is already tracked, but its public framing may need correction, narrowing, or source refresh.

Example C: A `DEGRADE` signal does not itself deprecate an anchor; it only indicates that a source-backed review may be needed.

## Non-claims

This document does not:

- create registry entries;
- create ENS anchors;
- change classifications;
- change statuses;
- change schema types;
- claim Ethereum adoption;
- claim official status;
- imply ENS DAO, ENS Foundation, ENS Labs, Ethereum Foundation, or ENSv2 endorsement or dependency;
- publish commercial strategy;
- publish buyers, prices, sale windows, valuation, marketplace positioning, or external-contact strategy.
