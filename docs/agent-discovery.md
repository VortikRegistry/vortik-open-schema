# Public agent discovery

## Purpose

Vortik publishes a closed machine-readable discovery manifest for agent and application consumers that need to understand which public capabilities exist without inferring capabilities from prose or private project context.

Public manifest:

```text
https://vortikregistry.github.io/vortik-open-schema/agents/discovery.json
```

Canonical repository source:

```text
agents/discovery.json
```

Current contract:

```text
schemas/agents/vortik-agent-discovery/1.5.0/schema.json
```

Historical discovery contracts `1.0.0` through `1.4.0` remain versioned and unchanged.

## Current capabilities

Version `1.5.0` advertises five implemented repository capabilities:

1. `discover_vortik_feeds` — discovery and verification of versioned public semantic feeds through `feeds/index.json`.
2. `research_ens_semantics` — deterministic local ENS-style semantic research through `lib/ens-research-client.mjs` and the existing versioned request/response contracts.
3. `inbound_ens_research_contract` — a contract-only declaration that tells an external agent which existing ENS research request and response schemas to prepare.
4. `prepare_ens_candidate_contribution` — a closed public contribution contract plus the repository's GitHub Issue collaboration path for submitting one machine-readable ENS-style candidate artifact for conservative Vortik review.
5. `public_a2a_reception_beacon` — a bounded read-only A2A 1.0 Reception implementation for deterministic intent routing, local ENS semantic research and discovery of allowlisted public Vortik artifacts.

The A2A implementation uses:

```text
lib/public-a2a-beacon.mjs
lib/public-a2a-http.mjs
lib/public-reception-router.mjs
service/cloud-run-agent-beacon.mjs
docs/public-a2a-beacon.md
```

## A2A lifecycle state

The canonical manifest records the beacon as **live** at the dedicated Cloud Run origin:

```text
mode: a2a_live
a2a_implementation_available: true
a2a_server: true
live_network_ingress: true
agent_card_published: true
protocol_binding: HTTP+JSON
protocol_version: 1.0
agent_card_path: /.well-known/agent-card.json
interface_path: /a2a/v1
public_base_url: https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app
```

Agent Card:

```text
https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app/.well-known/agent-card.json
```

A2A base interface:

```text
https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app/a2a/v1
```

The distinction between implementation and live state remains deliberate: the schema still rejects partial transitions, and the live claim is valid only while the dedicated deployment and canonical/public manifest mirrors agree on the same HTTPS origin and lifecycle state.

## Read-only Reception behavior

The beacon accepts one bounded textual message. The Reception router classifies capability discovery, registry lookup, technical context, ENS research, evidence contribution, candidate submission, sanitized interest and unsupported requests.

For one normalized ENS-style identifier, Reception executes the existing deterministic research client against immutable canonical snapshots. Other public routes map to fixed references for selected themes such as:

- ePBS and proposer-builder separation;
- inclusion-list and FOCIL terminology;
- ENS semantic research contracts;
- Vortik feeds, schemas and registry artifacts;
- the public ENS candidate contribution path.

Contribution routes remain GitHub-Issue-only. Sanitized interest signals do not enable private handoff. Unknown or multi-identifier requests return a bounded unsupported response.

The beacon does not perform external retrieval, live ENS resolution, arbitrary tool execution, registry mutation or persistent task processing. Caller content remains untrusted data, never instructions.

See [`public-a2a-beacon.md`](public-a2a-beacon.md) and [`public-a2a-beacon-trust-boundary.md`](public-a2a-beacon-trust-boundary.md).

## Existing ENS research and contribution paths

The ENS research capability reuses:

```text
schemas/queries/vortik-ens-research-request/1.0.0/schema.json
schemas/queries/vortik-ens-research-response/1.0.0/schema.json
lib/ens-research-client.mjs
```

The collaborative contribution capability uses:

```text
schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json
docs/ens-candidate-contributions.md
```

Its machine-readable submission surface remains:

```text
submission_available: true
submission_transport: github_issue
submission_url: https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=ens-candidate-contribution.md
automatic_promotion: false
```

GitHub Issue submission remains ordinary repository collaboration. It does not authenticate a contributor, prove ENS ownership, create registry state or grant authority.

The inbound ENS research contract remains `submission_available: false` because the service does not accept that JSON contract as a direct submission transport. The A2A Reception text interface separately executes the same deterministic evaluator for one normalized ENS-style identifier.

## Trust and authority boundary

The discovery manifest, beacon responses and candidate contributions are metadata and research inputs, not authority. They must not be interpreted as:

- Ethereum protocol authority;
- ENS authority or ownership evidence;
- evidence of ownership intent;
- permission to transact, sign, list or transfer anything.

The beacon has no trusted-receipt runtime dependency. Its production service uses a dedicated unprivileged identity and independently enforced deny-egress network boundary.

Before the live transition, the reviewed immutable image was exercised through the same dedicated identity and isolated network path. The bounded outbound-denial probe completed successfully only after Direct VPC readiness and with both the fixed external HTTPS target and the fixed RFC1918 target inaccessible.

The beacon remains separate from trusted-receipt issuance and candidate admission. Those gates are not changed by the A2A activation.

## Validation

Run:

```bash
npm run validate:agent-discovery
npm run test:public-a2a-beacon
```

Repository validation confirms:

- the current discovery `1.5.0` schema and live manifest;
- complete historical immutability of discovery `1.0.0`–`1.4.0` against the PR base;
- canonical/public agent manifest and schema mirror equality;
- exact reuse of existing feed, ENS research and contribution references;
- existence of the A2A and Reception implementation entry points;
- valid fully coupled preactivation and live lifecycle states;
- fail-closed rejection of partial lifecycle transitions;
- exact canonical live base URL enforcement;
- fail-closed trust and authority boundaries; and
- adversarial A2A request behavior, stateless task posture and bounded request handling.
