# ENS candidate contributions

## Purpose

Vortik Registry accepts the idea that useful ENS semantic research can originate outside the set of names owned or maintained by the project. A human or external agent may therefore propose an ENS-style candidate and supporting evidence for review.

This is a collaborative research surface. It is not a sales surface and it does not infer ownership.

## Public contract

Canonical schema:

```text
schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json
```

Public schema:

```text
https://vortikregistry.github.io/vortik-open-schema/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json
```

The contract is closed. Unknown fields are rejected structurally.

## Fast path: GitHub Issue

The shortest supported contribution path is the dedicated machine-readable Issue template:

https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=ens-candidate-contribution.md

The template contains one minimal JSON artifact that already conforms to the public contribution schema. A contributor edits five things:

1. a stable `contribution_id`;
2. `contributor.kind` (`human`, `agent`, or `other`);
3. the candidate ENS-style name;
4. the semantic rationale; and
5. at least one relevant HTTPS evidence reference.

Optional contributor label, proposed term, proposed classification, and additional evidence may be added when useful and schema-valid.

The first and only `json` fenced block in that Issue template is the machine-readable contribution artifact. Surrounding prose is guidance and is not part of the artifact.

This path does not require editing `registry.json`, understanding generated files, or preparing a registry PR. A broader narrative `New semantic anchor` Issue and normal Pull Requests remain available for proposals that need more context or repository changes.

## What a contributor may provide

A contribution contains:

- a stable contribution identifier;
- a contributor kind (`agent`, `human`, or `other`);
- an optional claimed contributor label;
- an ENS-style candidate name;
- a rationale for semantic relevance;
- an optional proposed canonical term and classification;
- one or more HTTPS evidence references.

Every contributor-supplied field remains untrusted research input. A claimed contributor label is not authentication. A supplied ENS name is not ownership evidence. A supplied reference is not trusted evidence.

## Example

```json
{
  "$schema": "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json",
  "contribution": "vortik-ens-candidate-contribution",
  "contribution_version": "1.0.0",
  "contribution_id": "agent-example-001",
  "contributor": {
    "kind": "agent",
    "claimed_id": "example-agent"
  },
  "candidate": {
    "name": "candidate-name.eth",
    "rationale": "Example contribution for contract illustration only.",
    "proposed_term": "candidate term",
    "proposed_classification": "premature"
  },
  "evidence": [
    {
      "kind": "primary_source",
      "reference": "https://eips.ethereum.org/EIPS/eip-7732"
    }
  ]
}
```

The example is contract illustration only. It is not a registry proposal and does not create a candidate entry.

## Delivery paths

There is no Vortik-operated live agent submission endpoint. Contribution artifacts currently travel through ordinary GitHub collaboration surfaces:

- the dedicated machine-readable ENS candidate Issue template;
- the broader semantic-anchor Issue template when narrative context is needed; or
- a Pull Request when a repository change is intentionally proposed.

An agent with GitHub tooling may submit the same contract artifact through those paths; a human may also relay an artifact prepared by another agent.

This keeps collaboration usable without pretending that a production A2A ingress exists.

## Mandatory review and verification boundary

A valid contribution artifact is not verified evidence and is not registry state.

Every contribution may be processed by the review/provenance layer documented in [`ens-candidate-review.md`](ens-candidate-review.md), but that review cannot create registry eligibility by itself. Source labels and reviewer observations are not trusted verification receipts.

The bounded primary-source verifier and bounded ENS mainnet verifier are implemented. However, production authenticated trusted-receipt issuance remains disabled, and `admission.enabled` remains `false`. Contributor artifacts therefore cannot turn themselves into trusted evidence or registry admission merely because verifier runtimes exist.

Future registry admission still requires the closed receipt-integrity and admission requirements: independently derived primary-source and exact-name ENS evidence, authenticated authorized receipt issuance, trusted clocks/freshness, same-subject binding, and a separate reviewed registry PR.

The review also carries a canonical digest of the full contribution. Changing any contribution field invalidates the old review and prevents provenance replay based only on a reused identifier or name.

Contributor statements, AI analysis, implementation references, research discussions or secondary context may help discovery or corroboration, but cannot open the registry-admission gate.

## Commercial boundary

These statements are intentionally separate:

- discovering an ENS does not recommend it;
- accepting a contribution does not endorse it;
- registering or discussing an ENS does not prove ownership;
- analyzing an ENS does not grant authority to represent it;
- public registry presence does not grant authority for private commercial or asset actions.

Any future bridge from public semantic registry state into private commercial representation must require separate verified ownership or delegated authority and must remain outside this public repository.

## Future live intake

A Vortik-operated agent endpoint, Agent Card or other live submission transport is a separate trust-boundary change. Before such an endpoint is enabled it must define and validate authentication where needed, rate limiting, replay protection, provenance, bounded inputs, timeout behavior, abuse handling, durable review state and adversarial-input tests. A future transport must preserve the same mandatory review/provenance gate rather than bypass it.
