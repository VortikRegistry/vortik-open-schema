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

## What a contributor may provide

A contribution contains:

- a stable contribution identifier;
- a contributor kind (`agent`, `human`, or `other`);
- an optional claimed contributor label;
- an ENS-style candidate name;
- a rationale for semantic relevance;
- an optional proposed canonical term and classification;
- one or more HTTPS evidence references.

Every contributor-supplied field remains untrusted research input. A claimed contributor label is not authentication. A supplied ENS name is not ownership evidence. A supplied reference is not trusted evidence until independently reviewed.

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

## Current delivery path

There is no Vortik-operated live agent submission endpoint yet. A prepared contribution artifact may currently be supplied through the repository's ordinary GitHub Issue or Pull Request process. An agent with GitHub tooling may prepare and submit the artifact through that process; a human may also relay an artifact prepared by another agent.

This keeps collaboration available now without pretending that a production A2A ingress exists.

## Review boundary

A valid contribution artifact is not registry state.

Reviewers must independently assess the candidate under the existing contribution, taxonomy and candidate-promotion rules. Allowed outcomes include keeping the item outside registry state, retaining it as research/backlog material, or opening a separate registry PR when evidence is strong enough.

The contributor cannot set or bypass review state. Promotion remains a separate repository decision and requires normal validation.

## Commercial boundary

These statements are intentionally separate:

- discovering an ENS does not recommend it;
- accepting a contribution does not endorse it;
- registering or discussing an ENS does not prove ownership;
- analyzing an ENS does not grant authority to represent it;
- public registry presence does not grant permission to price, negotiate, list, transfer or sell it.

Any future bridge from public semantic registry state into private commercial representation must require separate verified ownership or delegated authority and must remain outside this public repository.

## Future live intake

A Vortik-operated agent endpoint, Agent Card or other live submission transport is a separate trust-boundary change. Before such an endpoint is enabled it must define and validate authentication where needed, rate limiting, replay protection, provenance, bounded inputs, timeout behavior, abuse handling, durable review state and adversarial-input tests.
