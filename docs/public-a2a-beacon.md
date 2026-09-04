# Public A2A Reception beacon

## Status

The Vortik public A2A Reception beacon is implemented and the canonical activation state is **live**.

Machine-readable state:

```text
manifest_version = 1.5.0
mode = a2a_live
a2a_implementation_available = true
a2a_server = true
live_network_ingress = true
agent_card_published = true
public_base_url = https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app
```

Canonical public endpoints:

```text
Agent Card: https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app/.well-known/agent-card.json
A2A interface: https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app/a2a/v1
```

The deployment uses the reviewed bounded read-only implementation and remains independent from trusted-receipt issuance and candidate admission.

## Purpose

The beacon is a bounded read-only Reception surface for agents and developer tools. It classifies a closed set of public intents and routes each request to deterministic public behavior.

For one normalized ENS-style identifier, Reception can execute the existing local ENS semantic research evaluator against immutable Vortik registry and coordination-surface snapshots. It does not perform open-ended reasoning, external retrieval, live ENS resolution, arbitrary tool execution, registry mutation or persistent task processing.

Examples of supported discovery themes include:

- ePBS and proposer-builder separation;
- inclusion-list and FOCIL terminology;
- deterministic ENS semantic research for a single normalized name;
- ENS semantic research contracts;
- Vortik feeds, schemas and registry artifacts;
- the public ENS candidate contribution contract and GitHub collaboration path.

Contribution and candidate-submission intents are directed only to the existing public GitHub Issue path. Unknown or multi-identifier requests receive a bounded unsupported response rather than triggering external search.

Explicit commercial-interest language may produce only a sanitized public signal containing a normalized intent and, when unambiguous, one ENS identifier. It does not disclose terms, assert availability, enable a private handoff or grant action authority.

## A2A interface

The implementation targets Agent2Agent Protocol 1.0 with the HTTP+JSON binding.

Live paths are:

```text
GET  /.well-known/agent-card.json
POST /a2a/v1/message:send
GET  /a2a/v1/tasks
GET  /a2a/v1/tasks/{id}
POST /a2a/v1/tasks/{id}:cancel
```

The current implementation does not enable streaming, push notifications, authenticated extended cards or persistent tasks.

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

Responses contain only deterministic text or structured data assembled from fixed allowlisted public references and immutable local snapshots. Structured responses include a versioned `reception` result identifying the classified intent, route, status and confidence.

ENS research responses may additionally include the existing closed `vortik-ens-research-response` artifact. Sanitized interest responses may include only the single normalized identifier, normalized intent, bounded routing reason, confidence and a `privateHandoff: false` declaration.

The response does not echo the raw caller query or surrounding terms. A validated normalized ENS identifier may be returned when it is the subject of research or sanitized routing. Responses do not include credentials, environment values, signed trusted-receipt material or private repository information.

Every discovery response retains explicit non-authority semantics. Vortik does not claim Ethereum protocol authority, ENS authority or ownership inference through this endpoint.

## Network and runtime separation

The beacon code has no dependency on the trusted-receipt runtime or Google Cloud KMS signer.

The production deployment uses the dedicated unprivileged runtime identity and network controls defined in [`public-a2a-beacon-trust-boundary.md`](public-a2a-beacon-trust-boundary.md).

The production activation gate verified that the reviewed immutable image runs through the dedicated Direct VPC path and that the bounded outbound-denial probe succeeds only when both the fixed external HTTPS destination and fixed private/RFC1918 destination are inaccessible after Direct VPC readiness is established.

That evidence does not grant receipt, admission, ENS, protocol or commercial authority.

## Request budget

The HTTP surface includes a bounded process-level fixed-window request budget. Cloud Run deployment additionally retains bounded instances, concurrency and timeout settings.

The application budget is defense in depth. It does not replace infrastructure limits or the deny-egress boundary.

## Discovery lifecycle

The canonical source of truth is:

```text
agents/discovery.json
```

Version `1.5.0` retains the explicit lifecycle states and binds the live interface to the reviewed Reception router:

- `a2a_preactivation`: implementation exists; public ingress, Agent Card publication and public base URL remain closed;
- `a2a_live`: the dedicated service has passed its deployment gate and the manifest records the exact live HTTPS origin.

Historical discovery contracts `1.0.0` through `1.4.0` remain immutable. Version `1.4.0` records the original bounded discovery-only activation; version `1.5.0` adds deterministic Reception and remote ENS research while preserving the same network and authority boundaries.

The implementation originally remained in `a2a_preactivation` until the reviewed deployment, immutable digest, dedicated identity, deny-egress policy, outbound-denial probe and authenticated functional acceptance were verified. The canonical manifest may claim `a2a_live` only while those production conditions and the published endpoint remain true.

## Activation evidence requirements

The live transition is grounded in deployment evidence binding:

1. the exact reviewed source commit;
2. the Cloud Build execution and provenance;
3. the immutable Artifact Registry image digest;
4. the running Cloud Run revision and exact image digest;
5. the dedicated runtime identity;
6. the isolated deny-egress network posture;
7. successful adversarial outbound-denial probe evidence;
8. the exact HTTPS base URL used by the Agent Card;
9. the canonical and public discovery manifest mirrors.

If the deployed service and machine-readable discovery state cease to be consistent, the live claim must fail closed or be rolled back rather than remain detached from reality.

## Independent gates

The A2A beacon is independent from trusted-receipt issuance and candidate admission.

Beacon activation does not alter those separate gates.
