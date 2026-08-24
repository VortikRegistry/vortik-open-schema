# Public A2A beacon trust boundary v0.1

## Purpose

This document defines the trust boundary that must exist before Vortik may expose a public agent-to-agent discovery listener.

The objective is narrow: make Vortik discoverable by independent developer agents looking for Ethereum coordination semantics and return deterministic pointers to already-public Vortik artifacts.

This capability is a public discovery beacon. It is not an outreach system, autonomous sales agent, registry mutation API, trusted-receipt issuer, wallet surface, ENS authority surface, or general-purpose AI agent.

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
- expose buyer names, prices, sale strategy, private intelligence or outreach strategy;
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

Its production container must be pinned by immutable image digest.

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
15. no raw caller query logging.

## Deployment gate

Code review and CI are not sufficient to make the beacon live.

Before first public deployment, verify:

- dedicated unprivileged service account;
- immutable image digest;
- min instances 0;
- max instances 1;
- bounded concurrency and timeout;
- public unauthenticated access only to this dedicated read-only beacon service;
- exact Agent Card URL and A2A interface URL;
- no KMS IAM binding;
- no secret environment variables;
- no receipt-issuance or admission changes.

Only after those checks may the first public beacon execution/deployment gate be considered.