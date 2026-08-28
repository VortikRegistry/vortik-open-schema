# Public A2A beacon trust boundary v0.1

## Purpose

This document defines the trust boundary enforced by Vortik's live public agent-to-agent discovery listener.

The objective is narrow: make Vortik discoverable by independent developer agents looking for Ethereum coordination semantics and return deterministic pointers to already-public Vortik artifacts.

This capability is a public discovery beacon. It is not a solicitation or commercial coordination system, autonomous sales agent, registry mutation API, trusted-receipt issuer, wallet surface, ENS authority surface, or general-purpose AI agent.

## Protocol target

The deployed service implements Agent2Agent (A2A) Protocol 1.0 using the HTTP+JSON binding.

The bounded public deployment publishes:

```text
GET /.well-known/agent-card.json
POST /a2a/v1/message:send
GET /a2a/v1/tasks
GET /a2a/v1/tasks/{id}
POST /a2a/v1/tasks/{id}:cancel
```

Streaming, push notifications, authenticated extended cards and arbitrary task execution remain disabled.

The Agent Card must declare only capabilities that the deployed service actually implements.

Official protocol reference:

```text
https://a2a-protocol.org/latest/specification/
```

## Allowed purpose

The beacon may accept a bounded discovery query such as:

- `ePBS`
- `proposer builder separation`
- `inclusion list`
- `FOCIL`
- `ENS semantic research`
- `Ethereum coordination terminology`
- `Vortik feeds`

It may respond only with deterministic, allowlisted public metadata and links describing relevant Vortik capabilities and artifacts.

The beacon may guide another agent toward:

- the public Vortik feed index;
- the public ePBS feed;
- public registry/schema/anchor artifacts;
- the deterministic ENS semantic research contracts;
- the public candidate-contribution contract and GitHub Issue collaboration path;
- public documentation describing trusted-verification preactivation evidence.

## Explicitly prohibited behavior

The beacon must not:

- modify `registry.json`, schemas, maps, feeds or any repository state;
- admit or promote candidates;
- activate or perform trusted receipt issuance;
- call Google Cloud KMS or use the receipt-signing service account;
- access wallets, signing keys, ENS ownership credentials or asset-transfer surfaces;
- infer ENS ownership intent or commercial intent;
- expose private counterparties, private transaction terms, monetization plans, private intelligence or solicitation strategy;
- send unsolicited outbound messages, callbacks, notifications or webhooks;
- crawl arbitrary URLs supplied by callers;
- perform arbitrary web retrieval;
- perform live ENS resolution;
- ingest MCP sources;
- execute caller-provided instructions, code, shell commands, URLs or tool directives;
- act as a general-purpose proxy, fetcher, LLM endpoint or automation runner.

Caller text is always untrusted data, never instructions.

## Network and privilege separation

The beacon is deployed as a service separate from the trusted-receipt runtime.

It uses a dedicated runtime identity with no KMS signer role and no private-repository or asset privileges.

The public service must not reuse:

```text
vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com
```

The beacon should require no secrets for normal operation.

The absence of application-level fetch calls is not a network boundary. Production enforces deny-by-default outbound connectivity independently of handler code.

The production deployment uses a dedicated isolated VPC/subnet only as the beacon's outbound sink. The Cloud Run revision routes all outbound traffic through that isolated network path and uses a dedicated network tag covered by an egress firewall rule that denies all IPv4 and IPv6 destinations. That network has no Cloud NAT, VPC peering, VPN, Private Service Connect path, or route/connectivity to private application networks. The beacon service is not attached to an existing application/private VPC. A private Cloud DNS readiness zone is associated only with this dedicated VPC. Its fixed TXT record is non-secret control evidence and is not published through a public zone.

Before public ingress was enabled, the final authorized adversarial preactivation probe used the same immutable image, runtime identity and network policy and proved that both a fixed external HTTPS destination and a fixed private/RFC1918 destination were unreachable. Direct VPC egress can delay connection establishment during instance startup, so the probe completed its fixed, bounded network-settle phase and then resolved exactly once the fixed TXT record visible only through the dedicated VPC's private DNS zone. Cloud Run routes DNS queries through the DNS server configured for its VPC egress network; only the exact private record established readiness. The probe permitted no readiness or destination retries and verified that the intended inbound health/discovery handler remained reachable through the controlled preactivation path. This gate is closed; no further outbound-denial probe is required for the V1 deployment.

Its production container is pinned by immutable image digest and bound to reviewed source provenance. The deployment record includes:

- exact reviewed source commit SHA;
- clean-tree source assertion before build;
- Cloud Build identifier;
- immutable Artifact Registry image digest;
- build provenance or equivalent attested build metadata linking the reviewed source to that digest;
- deployed Cloud Run revision name;
- independently described running revision image digest matching the recorded digest.

An immutable digest without the reviewed-source-to-build mapping is insufficient for activation.

The single Buildpacks image exposes distinct named process types through the Buildpacks launcher. The Cloud Run service uses the default `web` process and the closed one-shot job used the `egressprobe` process. A later deployment must not replace the launcher with a raw language-runtime command because doing so would bypass the launch environment assembled by the buildpacks.

Cloud Run production controls should remain bounded:

- minimum instances: 0;
- maximum instances: 1;
- bounded concurrency;
- bounded request timeout;
- no background workers;
- no scheduled outbound activity.

## Input boundary

The public handler must accept only the specific A2A operations declared by its Agent Card.

For `message:send`:

- request body size must be bounded;
- only `ROLE_USER` messages are accepted;
- only textual or narrowly structured discovery input is accepted;
- file bytes and caller-controlled URLs are rejected;
- malformed JSON is rejected;
- unsupported A2A versions are rejected;
- requests that attempt task continuation against nonexistent tasks are rejected;
- input is normalized only for deterministic keyword matching;
- raw caller content is not written to application logs.

No caller field may select an internal file path, network destination, repository, signing key, command, module, environment variable or execution function.

## Output boundary

Responses must be bounded and deterministic.

A successful response may contain:

- a short explanation of the matching Vortik capability;
- public HTTPS URLs already approved by the repository;
- capability identifiers;
- semantic tags;
- explicit authority/trust disclaimers.

Responses must not contain:

- private or commercial data;
- credentials, tokens or secrets;
- signed receipts or receipt replay material;
- server environment details;
- arbitrary caller-controlled HTML;
- dynamically fetched third-party content.

## Search matching

Initial matching must be closed and allowlisted rather than generative.

The implementation may map normalized terms to capability groups, for example:

```text
epbs / proposer-builder separation -> public ePBS feed + registry artifacts
inclusion list / FOCIL -> public registry/schema artifacts
ens / semantic research -> ENS research contracts and documentation
feed / registry / schema -> public feed index and registry entry points
contribute / candidate -> candidate-contribution contract and GitHub Issue path
```

Unknown queries should return a bounded generic discovery response rather than attempting external search.

## Rate and cost boundary

The service must include application-level bounded request handling and Cloud Run instance bounds sufficient to prevent a public discovery endpoint from becoming an uncontrolled cost surface.

The live implementation uses a simple deterministic global process budget/rate limiter compatible with `max-instances=1`; it fails closed when the budget is exceeded.

No retry fan-out, outbound fetch loop or recursive agent-to-agent discovery is permitted.

## A2A capability posture

The live public beacon advertises:

```text
protocolBinding = HTTP+JSON
protocolVersion = 1.0
streaming = false
pushNotifications = false
extendedAgentCard = false
```

It returns direct A2A `Message` responses for simple discovery requests and does not create persistent tasks.

Task-list/get/cancel endpoints may expose the stateless posture explicitly: no tasks are retained, and unknown task IDs fail closed.

## Machine-readable discovery lifecycle

The historical `vortik-agent-discovery` 1.3.0 contract truthfully declares that Vortik did not operate a public A2A server at that lifecycle point. Those historical bytes remain unchanged.

Version 1.4.0 introduced explicit `preactivation` and `live` lifecycle states and updated the full canonical/public discovery set atomically:

- next `schemas/agents/vortik-agent-discovery/<version>/schema.json`;
- byte-identical public schema mirror;
- `agents/discovery.json`;
- byte-identical `docs/agents/discovery.json` mirror;
- `scripts/validate-agent-discovery.mjs`;
- public discovery documentation where required.

The contract represents lifecycle state explicitly rather than turning historical 1.3.0 assertions into mutable claims:

```text
preactivation: A2A implementation is reviewed, public ingress is false, Agent Card publication is false
live: A2A implementation is deployed, public ingress is true, Agent Card publication is true
```

The implementation PR left the manifest in a truthful preactivation state. Historical discovery schemas 1.0.0 through 1.3.0 remain byte-identical.

After the reviewed image, dedicated identity, deny-egress policy and final authorized preactivation probe were verified, the bounded activation change transitioned the manifest to `live`. The canonical manifest, public mirror and deployed Agent Card now agree on the same live HTTPS origin and A2A interface. Any later change must preserve that agreement or fail closed rather than leave a machine-readable live claim detached from the deployed service.

## Authority boundary

A beacon response means only:

> Vortik publishes a public artifact or capability relevant to this discovery query.

It does not mean:

- Ethereum standardization;
- ENS endorsement or ownership;
- protocol authority;
- candidate admission;
- trusted-receipt activation;
- commercial relevance;
- authorization to contact, transact, list, transfer or sell anything.

## Activation separation

Public A2A beacon deployment is independent from trusted-receipt issuance activation and candidate admission.

Implementing or deploying the beacon must not change:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

until their separate gates are explicitly authorized.

## Release and regression evidence

The reviewed implementation and activation evidence cover at least:

1. exact Agent Card shape and A2A 1.0 interface declaration;
2. bounded successful semantic discovery;
3. unknown-query fallback;
4. malformed JSON rejection;
5. oversized body rejection;
6. wrong role rejection;
7. file/raw/url input rejection;
8. unsupported protocol-version rejection;
9. unsupported streaming/push behavior rejection;
10. no task persistence;
11. no arbitrary URL/path/network selection;
12. no KMS/runtime receipt dependency;
13. no private/commercial terms in output;
14. rate-budget fail-closed behavior;
15. no raw caller query logging;
16. versioned discovery manifest/schema/mirror/validator lifecycle consistency;
17. historical discovery 1.0.0 through 1.3.0 byte preservation;
18. reviewed-source-to-image provenance verification;
19. running-revision digest verification;
20. deny-egress adversarial probe for external and private destinations.

## Production activation evidence and ongoing gate

Code review and CI were not treated as sufficient to make the beacon live.

Production activation additionally verified:

- dedicated unprivileged service account;
- exact reviewed source SHA and clean source tree;
- Cloud Build identifier and verified source-to-image provenance;
- immutable Artifact Registry image digest;
- deployed revision uses that exact digest;
- dedicated isolated outbound-sink VPC/subnet;
- all-traffic routing through that isolated network path;
- deny-all egress firewall policy for the beacon tag;
- no NAT or connectivity from the isolated network to private application networks;
- adversarial outbound-denial probe passes;
- minimum instances 0;
- maximum instances 1;
- bounded concurrency and timeout;
- versioned discovery manifest was truthful in preactivation and is now truthful in `live` state;
- public unauthenticated access is granted only to this dedicated read-only beacon service;
- exact Agent Card URL and A2A interface URL match the live discovery manifest;
- no KMS IAM binding;
- no secret environment variables;
- no receipt-issuance or admission changes.

The Agent Card and live A2A ingress were published only after the versioned discovery contract transition and preactivation evidence were complete. The live-state transition was then independently verified. Future changes must preserve the same bounded service identity, authority separation, network posture and runtime-to-manifest agreement.
