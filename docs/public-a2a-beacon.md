# Public A2A discovery beacon

## Status

The Vortik public A2A discovery beacon is implemented in the repository and remains in **preactivation**.

Machine-readable state:

```text
manifest_version = 1.4.0
mode = a2a_preactivation
a2a_implementation_available = true
a2a_server = false
live_network_ingress = false
agent_card_published = false
public_base_url = null
```

No public A2A listener or Agent Card is claimed by this repository state.

## Purpose

The beacon is a bounded read-only discovery surface for agents and developer tools that are looking for selected Ethereum coordination semantics or public Vortik artifacts.

It maps a small allowlisted vocabulary to already-public Vortik references. It does not perform open-ended reasoning, external retrieval, live ENS resolution, arbitrary tool execution, registry mutation or persistent task processing.

Examples of supported discovery themes include:

- ePBS and proposer-builder separation;
- inclusion-list and FOCIL terminology;
- ENS semantic research contracts;
- Vortik feeds, schemas and registry artifacts;
- the public ENS candidate contribution contract and GitHub collaboration path.

Unknown queries receive a generic bounded Vortik discovery response rather than triggering external search.

## A2A interface

The implementation targets Agent2Agent Protocol 1.0 with the HTTP+JSON binding.

Planned live paths are:

```text
GET  /.well-known/agent-card.json
POST /a2a/v1/message:send
GET  /a2a/v1/tasks
GET  /a2a/v1/tasks/{id}
POST /a2a/v1/tasks/{id}:cancel
```

The first implementation does not enable streaming, push notifications, authenticated extended cards or persistent tasks.

Simple discovery requests return a direct A2A `Message` response.

## Input boundary

`message:send` accepts one bounded `ROLE_USER` message containing exactly one text part.

The implementation rejects:

- multiple parts;
- structured data parts;
- file bytes or file references;
- caller-provided URLs;
- unsupported A2A protocol versions or extensions;
- oversized request bodies;
- unsupported output media types;
- task continuation fields;
- unknown request fields.

Caller content is untrusted data and is never interpreted as an instruction to execute code, choose a network destination, select an internal path or invoke another system.

## Output boundary

Responses contain only deterministic text or structured discovery data assembled from fixed allowlisted public references.

The response does not echo the raw caller query. It does not include credentials, environment values, signed trusted-receipt material or private repository information.

Every discovery response retains explicit non-authority semantics. Vortik does not claim Ethereum protocol authority, ENS authority or ownership inference through this endpoint.

## Network and runtime separation

The beacon code has no dependency on the trusted-receipt runtime or Google Cloud KMS signer.

A future production deployment must use a dedicated unprivileged runtime identity and the network controls defined in [`public-a2a-beacon-trust-boundary.md`](public-a2a-beacon-trust-boundary.md).

Live activation requires independent evidence that outbound Internet and private-network destinations are unreachable from the deployed revision, while the intended inbound discovery surface remains reachable through the controlled activation path.

## Request budget

The HTTP surface includes a bounded process-level fixed-window request budget. Cloud Run deployment must additionally retain bounded instances, concurrency and timeout settings.

The application budget is defense in depth. It does not replace infrastructure limits or the deny-egress boundary.

## Discovery lifecycle

The canonical source of truth is:

```text
agents/discovery.json
```

Version `1.4.0` introduces explicit lifecycle states:

- `a2a_preactivation`: implementation exists; public ingress, Agent Card publication and public base URL remain closed;
- `a2a_live`: the dedicated service has passed its deployment gate and the manifest has been atomically updated to the exact live HTTPS origin.

Historical discovery contracts `1.0.0` through `1.3.0` remain immutable.

The implementation PR must remain in `a2a_preactivation`. Deployment alone does not permit the manifest to claim `a2a_live`.

## Activation requirements

Before the first live transition, the deployment evidence must bind:

1. the exact reviewed source commit;
2. the Cloud Build execution and provenance;
3. the immutable Artifact Registry image digest;
4. the running Cloud Run revision and exact image digest;
5. the dedicated runtime identity;
6. the isolated deny-egress network posture;
7. successful adversarial outbound-denial probes;
8. the exact HTTPS base URL used by the Agent Card;
9. the canonical and public discovery manifest mirrors.

If the deployed service and machine-readable discovery state cannot be made consistent, activation fails closed.

## Independent gates

The A2A beacon is independent from trusted-receipt issuance and candidate admission.

Beacon implementation or activation must not alter those separate gates.
