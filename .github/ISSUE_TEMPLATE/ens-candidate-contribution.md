---
name: ENS candidate contribution
about: Submit one machine-readable ENS semantic research candidate for review
title: "[Contribution]"
labels: new-anchor
assignees: ''
---

## Fast path

Edit the values inside the single JSON block below and submit the Issue.

Minimum edits:

1. replace `replace-me-001` with a stable contribution ID you choose;
2. set `contributor.kind` to `human`, `agent`, or `other`;
3. replace `candidate-name.eth` with the ENS-style name to research;
4. replace the rationale with why the name may matter semantically;
5. replace the evidence URL with at least one relevant HTTPS technical reference.

Optional `claimed_id`, `proposed_term`, `proposed_classification`, and additional evidence may be added only if they conform to the public schema.

Do not add commentary inside the JSON block. The first and only `json` fenced block is the contribution artifact.

```json
{
  "$schema": "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json",
  "contribution": "vortik-ens-candidate-contribution",
  "contribution_version": "1.0.0",
  "contribution_id": "replace-me-001",
  "contributor": {
    "kind": "human"
  },
  "candidate": {
    "name": "candidate-name.eth",
    "rationale": "Explain why this candidate may be relevant to Ethereum coordination terminology."
  },
  "evidence": [
    {
      "kind": "primary_source",
      "reference": "https://eips.ethereum.org/EIPS/eip-7732"
    }
  ]
}
```

## Trust boundary

Submitting this artifact does **not** authenticate the contributor, prove ENS ownership, create trusted evidence, admit a registry entry, mutate `registry.json`, grant Ethereum/ENS authority, or create commercial authority.

The contribution is untrusted research input. Vortik independently reviews evidence and keeps candidate admission fail-closed unless separate trusted receipt and admission requirements are satisfied.

Do not include pricing, buyers, outreach, negotiation strategy, sale intent, wallet instructions, private commercial intelligence, or claims of official Ethereum/ENS endorsement.
