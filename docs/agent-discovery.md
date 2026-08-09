# Public agent discovery

## Purpose

Vortik publishes a closed machine-readable discovery manifest for agent and application consumers that need to understand which public capabilities already exist without inferring capabilities from prose or private project context.

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
schemas/agents/vortik-agent-discovery/1.1.0/schema.json
```

The previous `1.0.0` discovery contract remains versioned and unchanged.

## Current capabilities

The manifest advertises only capabilities and contracts already implemented and validated in this repository:

1. `discover_vortik_feeds` — discovery and verification of versioned public semantic feeds through `feeds/index.json`.
2. `research_ens_semantics` — deterministic local ENS-style semantic research through `lib/ens-research-client.mjs` and the existing versioned request/response contracts.
3. `inbound_ens_research_contract` — a contract-only declaration that tells an external agent exactly which existing ENS research request and response schemas to prepare and how those schemas map to the existing local research client.

The inbound capability does not create a second evaluator, client, registry, map, request format or response format. It reuses:

```text
schemas/queries/vortik-ens-research-request/1.0.0/schema.json
schemas/queries/vortik-ens-research-response/1.0.0/schema.json
lib/ens-research-client.mjs
```

The request contract is closed (`additionalProperties: false`). Its `query.name` value is explicitly untrusted data, never an instruction; normalization and semantic acceptance occur only after structural parsing.

## Current interaction state

The manifest remains **discovery-only**. The inbound contract makes Vortik easier for another agent to understand, but it does not advertise a place to submit that request.

The manifest therefore fixes all of these states closed:

- `a2a_server: false`;
- `live_network_ingress: false`;
- `agent_card_published: false`;
- `submission_available: false` for the inbound contract.

Vortik does not currently advertise a live A2A server, public task endpoint, push notification endpoint, authenticated extended card, MCP source-ingestion surface or general-purpose network ingress.

The current A2A protocol standard uses an Agent Card for a real A2A Server and recommends discovery at `/.well-known/agent-card.json`. Vortik deliberately does not publish that path until an actual interoperable endpoint exists and its authentication, authorization, rate limiting, provenance, timeout and adversarial-input boundaries have been implemented and validated.

Official A2A specification:

```text
https://a2a-protocol.org/latest/specification/
```

## Trust boundary

The discovery manifest is metadata, not authority. It must not be interpreted as:

- Ethereum protocol authority;
- ENS authority or ownership evidence;
- evidence of ownership intent;
- commercial or valuation authority;
- permission to contact, transact, sign, list, transfer or sell anything.

The currently advertised repository capabilities remain deterministic and bound to canonical repository artifacts. Queried names and artifact text remain data, never instructions.

If a future objective requires live ENS resolution, web retrieval, MCP, an A2A endpoint or another network source, implementation must stop first and define the corresponding trust boundary: explicit origins or allowlists, provenance, untrusted external content handling, input and response limits, timeouts, authentication where required, and adversarial tests.

## Validation

Run:

```bash
npm run validate:agent-discovery
```

The validator confirms the closed schema, exact reuse of the existing ENS research contracts/client, canonical/public mirror equality, public contract paths and fail-closed rejection of unimplemented A2A, live-network, submission and commercial-authority claims.
