# ENS candidate review and provenance

## Purpose

External ENS candidate contributions are research inputs, not evidence accepted by Vortik. Vortik may review and preserve a contribution, but this review layer does not currently have authority to make a candidate eligible for registry admission.

Canonical review schema:

```text
schemas/reviews/vortik-ens-candidate-review/1.0.0/schema.json
```

Public schema:

```text
https://vortikregistry.github.io/vortik-open-schema/schemas/reviews/vortik-ens-candidate-review/1.0.0/schema.json
```

## Mandatory verification rule

A contributor, visiting agent or review artifact cannot create verified Ethereum/protocol evidence by labeling a URL as authoritative. Likewise, a review artifact cannot prove ENS existence by labeling a URL or statement as on-chain evidence.

Source classifications and review statuses in this contract are observations only. They are useful for organizing investigation, but they never satisfy a registry-admission gate.

Before registry admission can be enabled, Vortik requires two separate trusted verification receipts:

1. a receipt derived from an independently maintained Ethereum or relevant-protocol primary-source verification path; and
2. a receipt derived from a trusted Ethereum mainnet ENS lookup bound to the exact candidate name.

Those receipts are not implemented by this contract. Until the trusted verification bridge exists, registry admission remains fail-closed.

Implementation references, research discussions, secondary context and AI analysis may help discovery or corroboration, but they cannot substitute for the trusted verification receipts.

## Provenance binding

Every review carries a canonical SHA-256 digest of the complete contribution artifact in addition to its `contribution_id` and candidate name. The evaluator recomputes that digest.

Changing the rationale, proposed term, proposed classification, evidence, contributor fields, candidate name or any other contribution field therefore invalidates the old review. Reusing an identifier and name is not sufficient to replay prior review provenance.

## Current outcomes

Allowed review outcomes are intentionally limited to:

- `reject`;
- `keep_backlog`;
- `research_note`.

`registry_pr_eligible` is not an allowed outcome in version `1.0.0`. Both the schema and runtime evaluator reject attempts to declare it.

## Repository enforcement

`npm run validate` includes the candidate-admission gate. On a pull request it compares `registry.json` against the actual base branch. Until trusted verification receipts are implemented, validation rejects:

- every new registry anchor; and
- rebinding an existing anchor ID to another ENS name.

This means a direct registry PR cannot bypass Candidate Review & Provenance simply by omitting a review artifact.

Ordinary maintenance of an already tracked anchor is not treated as a new candidate admission and continues to use the existing registry and source validations.

## Fail-closed authority boundary

Every review artifact fixes these states closed:

- trusted primary-source receipt unavailable;
- trusted ENS receipt unavailable;
- contributor input is not trusted;
- ownership is not inferred;
- commercial authority is not granted;
- registry state is not mutated;
- registry PR eligibility is false;
- any future admission still requires a separate reviewed registry PR.

The public review process therefore cannot authorize private commercial actions, asset operations, wallet actions or representation of an ENS name.

## Relationship to live agent intake

This review model is transport-independent. Today contributions can arrive through ordinary GitHub Issues or Pull Requests. A future live agent endpoint may transport the same untrusted contribution artifacts, but it must not bypass this review/provenance gate.

The next prerequisite is a trusted verification bridge. Live public agent intake must remain downstream of that bridge rather than becoming a way around it.
