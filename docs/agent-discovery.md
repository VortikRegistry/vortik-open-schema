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

Contract:

```text
schemas/agents/vortik-agent-discovery/1.0.0/schema.json
```

## Current capabilities

The manifest advertises only capabilities already implemented and validated in this repository:

1. `discover_vortik_feeds` — discovery and verification of versioned public semantic feeds through `feeds/index.json`.
2. `research_ens_semantics` — deterministic local ENS-style semantic research through `lib/ens-research-client.mjs` and the existing versioned request/response contracts.

The manifest does not create a second evaluator, client, registry or map. Consumers should follow the referenced existing artifacts.

## Current interaction state

The manifest is **discovery-only**. Vortik does not currently advertise a live A2A server, public task endpoint, push notification endpoint, authenticated extended card, MCP source-ingestion surface or general-purpose network ingress.

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

The validator confirms the closed schema, references to existing capabilities, canonical/public mirror equality and fail-closed rejection of unimplemented A2A, live-network and commercial-authority claims.
