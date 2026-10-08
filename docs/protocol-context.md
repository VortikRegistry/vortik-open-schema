# Protocol context data

Use the [protocol context JSON](protocol-context.json) to distinguish a concept's meaning, an EIP's document status, its fork assignment, and a network's activation schedule. The [explorer](app.html) presents the same snapshot for people; the JSON is for dashboards, research tools, and local agents.

The dataset covers all 12 registry anchors and nine related EIPs, including BALs, builder requests, execution proofs, BAL sidecars, and gas-accounting changes. EIPs can be useful references without becoming new ENS anchors. This is selected coverage, not a complete Ethereum roadmap.

## Fetch or use locally

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/protocol-context.json
```

Inside a clone, these commands use only local files:

```bash
npm run validate:protocol-context
npm run test:protocol-context
npm run example:protocol-context -- inclusionlist
```

The example also accepts an ENS label, such as `epbs.eth`, as a lookup key in committed data. It does not resolve ENS or use an RPC endpoint.

```js
import { readProtocolContext, getAnchorContext } from "../lib/protocol-context.mjs";

const data = await readProtocolContext();
const result = getAnchorContext(data, "provingmarket");
console.log(result.reviewed_at);
console.log(result.related_eips); // EIP-8025: Draft; Hegotá assignment: proposed
```

## Independent facts

| Field | Meaning | Example in the October 8 follow-up |
| --- | --- | --- |
| `reviewed_at` | Date of this editorial source review | `2026-10-08` |
| `registry.last_updated` | Date of the referenced canonical registry | `2026-09-13` |
| `anchors[].context_kind` | Vortik's description of the source context | `protocol`, `research`, `application`, or `editorial` |
| `eips[].document_status` | Status on the EIP document | FOCIL: `Draft` |
| `eips[].fork.assignment` | Assignment in the cited fork meta EIP | FOCIL: `scheduled` for Hegotá |
| `forks[].activations[].status` | Network state recorded by the reviewed schedule | Glamsterdam/Sepolia: `unverified` |
| `forks[].activations[].activation_at` | Explicit UTC activation time, if recorded | `null` for unverified Sepolia; announced time retained in the review |

The October 8 follow-up marks Sepolia `unverified` with null activation fields: the published October 6 time has passed, and its elapsed time is not evidence of successful activation. The announcement time remains in the dated review. The review does not verify live network state.

An EIP being `Draft` does not determine whether it is scheduled. A scheduled fork feature is not automatically active on mainnet. An anchor's `eip_refs` are contextual references: a related EIP does not standardize an entire umbrella term or assign a fork status to an ENS name. `getAnchorContext` preserves the names `related_eips` and `related_forks` for this reason.

The source review remains separate from canonical classifications in `registry.json`. In particular, the registry's `deprecated` abstractions do not represent Ethereum deprecation notices for builders or economic concepts.

## Null and missing information

- `eips[].fork: null` means this dataset does not review a fork assignment for that EIP. EIP-1559 uses this value; it is not a claim that EIP-1559 was never deployed.
- `not_scheduled` means the reviewed source leaves that network's activation schedule unset.
- `unverified` means this dataset cannot establish that network's activation state. It is different from `not_scheduled`.
- Both values require explicit `null` time, epoch, and slot fields. Required fields may not be omitted.
- A `scheduled` or `active` state requires an explicit UTC time. An `active` value must not be later than the source review date.

An empty `eip_refs` array means no EIP is linked in this selected context. It is not evidence that no related research or proposal exists.

## Contract and validation

Contract: `vortik.protocol-context/1.0.0`. The public [JSON Schema](protocol-context.schema.json) rejects unknown fields and unsupported states. The local validator additionally checks exact registry coverage and identity, source and EIP references, allowed HTTPS primary-source hosts, local document paths, dates, duplicate records, and epoch/slot consistency. It requires the review document and all linked anchor/source notes to exist locally.

These checks protect structure and consistency. They do not independently prove that a statement still matches an upstream document. Source links are citations to read, not endpoints fetched by validation or by the local example. Human source review is required when the facts change.

The dataset is maintained directly under `docs/`; it is not a generated registry mirror. `npm run generate` preserves it. It is separate from the existing versioned ePBS feed and agent-discovery contracts.

## Updating the snapshot

1. Read the relevant primary documents. Recheck EIP document status separately from its assignment in the fork meta EIP and the network activation schedule.
2. Update `protocol-context.json` and add a dated review document. Keep earlier review documents as history; set `review_path` to the new review.
3. Change `reviewed_at` only after the source review. Preserve `registry.last_updated` unless the canonical registry itself changed.
4. Update the dated regression assertions with the new evidence, then run the protocol-context checks, public-safety checks, and full repository validation.

The current [October 8 follow-up](research/protocol-freshness-2026-10-08.md) rechecks the selected EIP metadata, fork assignments and published schedules. Other research and application source notes retain their September 30 review.

The initial snapshot is backed by the [September 30 source review](research/protocol-freshness-2026-09-30.md). The primary URLs in the JSON were rechecked when this dataset was prepared. A date is a record of that review, not an automatic freshness guarantee.

Source context does not verify deployed agent health, billing, ENS ownership, resolution, or a software rollout. The service's packaged registry snapshot has its own deployment lifecycle.
