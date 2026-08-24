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
schemas/agents/vortik-agent-discovery/1.4.0/schema.json
```

Historical discovery contracts `1.0.0` through `1.3.0` remain versioned and unchanged.

## Current capabilities

Version `1.4.0` advertises five implemented repository capabilities:

1. `discover_vortik_feeds` — discovery and verification of versioned public semantic feeds through `feeds/index.json`.
2. `research_ens_semantics` — deterministic local ENS-style semantic research through `lib/ens-research-client.mjs` and the existing versioned request/response contracts.
3. `inbound_ens_research_contract` — a contract-only declaration that tells an external agent which existing ENS research request and response schemas to prepare.
4. `prepare_ens_candidate_contribution` — a closed public contribution contract plus the repository's GitHub Issue collaboration path for submitting one machine-readable ENS-style candidate artifact for conservative Vortik review.
5. `public_a2a_discovery_beacon` — a bounded read-only A2A 1.0 implementation for deterministic discovery of allowlisted public Vortik artifacts.

The A2A implementation uses:

```text
lib/public-a2a-beacon.mjs
lib/public-a2a-http.mjs
service/cloud-run-agent-beacon.mjs
docs/public-a2a-beacon.md
```

## A2A lifecycle state

The beacon is implemented but **not live** in the current manifest.

```text
mode: a2a_preactivation
a2a_implementation_available: true
a2a_server: false
live_network_ingress: false
agent_card_published: false
protocol_binding: HTTP+JSON
protocol_version: 1.0
agent_card_path: /.well-known/agent-card.json
interface_path: /a2a/v1
public_base_url: null
```

This distinction is deliberate. Repository code may exist and pass review before any public network claim is true.

A later `a2a_live` transition is valid only when the dedicated deployment has passed the reviewed deployment gate and the canonical/public manifest mirrors can record the exact live HTTPS origin consistently.

## Read-only beacon behavior

The beacon accepts one bounded textual discovery message and maps it to fixed public references for selected themes such as:

- ePBS and proposer-builder separation;
- inclusion-list and FOCIL terminology;
- ENS semantic research contracts;
- Vortik feeds, schemas and registry artifacts;
- the public ENS candidate contribution path.

Unknown queries return a generic bounded discovery response.

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

The inbound ENS research contract remains `submission_available: false`; the A2A beacon discovers that public contract but does not execute the ENS research client on behalf of a remote caller.

## Trust and authority boundary

The discovery manifest, beacon responses and candidate contributions are metadata and research inputs, not authority. They must not be interpreted as:

- Ethereum protocol authority;
- ENS authority or ownership evidence;
- evidence of ownership intent;
- permission to transact, sign, list or transfer anything.

The beacon has no trusted-receipt runtime dependency. Its production service requires a dedicated unprivileged identity and an independently enforced deny-egress network boundary before any live transition.

The beacon also remains separate from trusted-receipt issuance and candidate admission. Those gates are not changed by agent discovery work.

## Validation

Run:

```bash
npm run validate:agent-discovery
npm run test:public-a2a-beacon
```

Repository validation confirms:

- the current discovery `1.4.0` schema and preactivation manifest;
- complete historical immutability of discovery `1.0.0`–`1.3.0` against the PR base;
- canonical/public agent manifest and schema mirror equality;
- exact reuse of existing feed, ENS research and contribution references;
- existence of the A2A implementation entry points;
- valid preactivation and fully coupled live lifecycle states;
- fail-closed rejection of partial lifecycle transitions;
- fail-closed trust and authority boundaries; and
- adversarial A2A request behavior, stateless task posture and bounded request handling.
