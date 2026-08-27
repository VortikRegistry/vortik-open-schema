# Public A2A beacon trust boundary v0.1

## Purpose

This document defines the trust boundary that must exist before Vortik may expose a public agent-to-agent discovery listener.

The objective is narrow: make Vortik discoverable by independent developer agents looking for Ethereum coordination semantics and return deterministic pointers to already-public Vortik artifacts.

This capability is a public discovery beacon. It is not a solicitation or commercial coordination system, autonomous sales agent, registry mutation API, trusted-receipt issuer, wallet surface, ENS authority surface, or general-purpose AI agent.

## Protocol target

The implementation target is Agent2Agent (A2A) Protocol 1.0 using the HTTP+JSON binding.

A conforming public deployment may publish:

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

The beacon must deploy as a service separate from the trusted-receipt runtime.

It must use a dedicated runtime identity with no KMS signer role and no private-repository or asset privileges.

The public service must not reuse:

```text
vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com
```

The beacon should require no secrets for normal operation.

The absence of application-level fetch calls is not a network boundary. Production must enforce deny-by-default outbound connectivity independently of handler code.

The first deployment must use a dedicated isolated VPC/subnet used only as the beacon's outbound sink. The Cloud Run revision must route all outbound traffic through that isolated network path and use a dedicated network tag covered by an egress firewall rule that denies all IPv4 and IPv6 destinations. That network must have no Cloud NAT, VPC peering, VPN, Private Service Connect path, or route/connectivity to private application networks. The beacon service must not be attached to an existing application/private VPC. A private Cloud DNS readiness zone may be associated only with this dedicated VPC. Its fixed TXT record is non-secret control evidence and must not be published through a public zone.

Before public ingress is enabled, an adversarial preactivation probe using the same immutable image, runtime identity and network policy must prove that both a fixed external HTTPS destination and a fixed private/RFC1918 destination are unreachable. Direct VPC egress can delay connection establishment during instance startup, so the probe must complete its fixed, bounded network-settle phase and then resolve exactly once the fixed TXT record visible only through the dedicated VPC's private DNS zone. Cloud Run routes DNS queries through the DNS server configured for its VPC egress network; only the exact private record establishes readiness. A missing, timed-out, failed or mismatched readiness response is indeterminate and blocks both destination attempts; the deadline must also cancel the outstanding DNS operation. The settle phase performs no network request, and neither readiness nor destination checks permit retries. The deployment evidence must also verify that the intended inbound health/discovery handler remains reachable through the controlled preactivation path. Failure of any outbound-denial assertion blocks activation.

Its production container must be pinned by immutable image digest and bound to reviewed source provenance. The deployment record must include:

- exact reviewed source commit SHA;
- clean-tree source assertion before build;
- Cloud Build identifier;
- immutable Artifact Registry image digest;
- build provenance or equivalent attested build metadata linking the reviewed source to that digest;
- deployed Cloud Run revision name;
- independently described running revision image digest matching the recorded digest.

An immutable digest without the reviewed-source-to-build mapping is insufficient for activation.

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

The first implementation should use a simple deterministic global process budget/rate limiter compatible with `max-instances=1`; it must fail closed when the budget is exceeded.

No retry fan-out, outbound fetch loop or recursive agent-to-agent discovery is permitted.

## A2A capability posture

The first public beacon implementation should advertise:

```text
protocolBinding = HTTP+JSON
protocolVersion = 1.0
streaming = false
pushNotifications = false
extendedAgentCard = false
```

It may return direct A2A `Message` responses for simple discovery requests and should avoid creating persistent tasks.

Task-list/get/cancel endpoints may expose the stateless posture explicitly: no tasks are retained, and unknown task IDs fail closed.

## Machine-readable discovery lifecycle

The existing `vortik-agent-discovery` 1.3.0 contract truthfully declares that Vortik does not operate a public A2A server. Those historical bytes must not be rewritten to create the beacon.

Before any Agent Card is published or any public A2A ingress is enabled, the implementation must introduce a new versioned discovery contract and update the full canonical/public discovery set atomically in one reviewed change:

- next `schemas/agents/vortik-agent-discovery/<version>/schema.json`;
- byte-identical public schema mirror;
- `agents/discovery.json`;
- byte-identical `docs/agents/discovery.json` mirror;
- `scripts/validate-agent-discovery.mjs`;
- public discovery documentation where required.

The new contract must represent lifecycle state explicitly rather than turning historical 1.3.0 assertions into mutable claims. At minimum it must distinguish:

```text
preactivation: A2A implementation is reviewed, public ingress is false, Agent Card publication is false
live: A2A implementation is deployed, public ingress is true, Agent Card publication is true
```

The implementation PR must leave the manifest in a truthful preactivation state. Historical discovery schemas 1.0.0 through 1.3.0 remain byte-identical.

A later bounded activation change may transition the new manifest to `live` only after the reviewed image, dedicated identity, deny-egress policy and preactivation probes are verified. Activation is not PASS until the repository manifest/public mirror and the deployed service independently agree on the same live interface and state. If either side cannot be made consistent, the activation must fail closed rather than leaving a machine-readable live claim detached from the deployed service.

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

## Required tests before deployment

The implementation PR must cover at least:

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
16. versioned discovery manifest/schema/mirror/validator preactivation consistency;
17. historical discovery 1.0.0 through 1.3.0 byte preservation;
18. reviewed-source-to-image provenance verification;
19. running-revision digest verification;
20. deny-egress adversarial probe for external and private destinations.

## Deployment gate

Code review and CI are not sufficient to make the beacon live.

Before first public deployment, verify:

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
- versioned discovery manifest is in truthful preactivation state before publication;
- public unauthenticated access is granted only to this dedicated read-only beacon service during the explicit activation step;
- exact Agent Card URL and A2A interface URL match the live discovery manifest;
- no KMS IAM binding;
- no secret environment variables;
- no receipt-issuance or admission changes.

The Agent Card and live A2A ingress must not be published before the versioned discovery contract transition and the preactivation evidence above are complete. Only after those checks may the bounded live-state transition be performed and independently verified.
