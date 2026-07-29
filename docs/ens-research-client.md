# Reusable ENS research client

## Purpose

`lib/ens-research-client.mjs` provides a small importable interface for running the public Vortik ENS semantic research method against the repository's validated canonical artifacts.

The client is ownership-neutral and non-authoritative. It does not resolve ENS records, inspect ownership, fetch external content, contact anyone, modify registry state, or perform wallet or transaction actions.

## Importable interface

```js
import {
  createEnsResearchRequest,
  researchEnsName,
  researchEnsRequest
} from "./lib/ens-research-client.mjs";
```

### Research a name directly

```js
const response = researchEnsName("builder.eth", {
  requestId: "example-builder"
});

console.log(response.result.state);
console.log(response.result.related_terms);
```

### Build and evaluate a complete request

```js
const request = createEnsResearchRequest("epbs.eth", {
  requestId: "example-epbs"
});

const response = researchEnsRequest(request);
```

The request and response follow the versioned contracts under:

- `schemas/queries/vortik-ens-research-request/1.0.0/schema.json`;
- `schemas/queries/vortik-ens-research-response/1.0.0/schema.json`.

## Executable example

Run the default tracked-anchor example:

```bash
npm run example:research-ens
```

Choose another ENS-style name:

```bash
VORTIK_ENS_NAME=builder.eth npm run example:research-ens
```

Set an explicit request identifier:

```bash
VORTIK_ENS_NAME=execution.eth \
VORTIK_ENS_REQUEST_ID=example-execution \
npm run example:research-ens
```

## Result states

The client can return:

- `tracked_anchor` for an exact canonical registry match;
- `related_terminology` for an exact curated surface identifier;
- `untracked` when the registry has no source-grounded assessment;
- `invalid_input` when the submitted value is outside the accepted input boundary;
- `indeterminate` when required curated relation evidence cannot be accepted safely.

## Trust boundary

The client imports `registry.json` and `maps/coordination-surfaces.json` directly from the repository and passes them to the deterministic evaluator. Callers cannot substitute registry, map, source, network, resolver, ownership, or commercial inputs through the client options.

Unknown client option fields are rejected. Queried names remain untrusted data and cannot introduce instructions or change the control flow.

A result expresses only the current source-grounded Vortik interpretation. It does not imply protocol authority, ENS authority, ownership intent, endorsement, adoption, registration value, or commercial relevance.
