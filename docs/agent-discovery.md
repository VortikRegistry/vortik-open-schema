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
schemas/agents/vortik-agent-discovery/1.3.0/schema.json
```

The previous `1.0.0`, `1.1.0`, and `1.2.0` discovery contracts remain versioned and unchanged. Version `1.3.0` adds only machine-readable discovery of the already-implemented GitHub Issue contribution path.

## Current capabilities

The manifest advertises only capabilities and contracts already implemented and validated in this repository:

1. `discover_vortik_feeds` — discovery and verification of versioned public semantic feeds through `feeds/index.json`.
2. `research_ens_semantics` — deterministic local ENS-style semantic research through `lib/ens-research-client.mjs` and the existing versioned request/response contracts.
3. `inbound_ens_research_contract` — a contract-only declaration that tells an external agent exactly which existing ENS research request and response schemas to prepare and how those schemas map to the existing local research client.
4. `prepare_ens_candidate_contribution` — a closed public contribution contract plus the repository's GitHub Issue collaboration path for submitting one machine-readable ENS-style candidate artifact for conservative Vortik review.

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

Its machine-readable submission surface is:

```text
submission_available: true
submission_transport: github_issue
submission_url: https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=ens-candidate-contribution.md
automatic_promotion: false
```

Both request surfaces are closed (`additionalProperties: false`). ENS names, contributor labels, rationales and evidence references are explicitly untrusted data, never instructions. A structurally valid contribution does not authenticate the contributor, prove ENS ownership, create registry state, imply endorsement or grant commercial authority.

## Collaborative contribution path

Vortik is not limited to ENS names owned by its founder or maintainers. A relevant ENS-style name may be researched or proposed regardless of ownership.

Humans and external agents can submit the versioned candidate-contribution artifact through the dedicated GitHub Issue template. The artifact is an input to review only. It cannot promote itself into `registry.json`, schemas, maps or public semantic status.

See [`ens-candidate-contributions.md`](ens-candidate-contributions.md) for the contract, fast path and review boundary.

## GitHub collaboration is not live Vortik ingress

`submission_available: true` is intentionally narrow. It means the repository exposes an ordinary GitHub Issue collaboration URL that accepts the contribution artifact through GitHub's own product surface.

It does **not** mean Vortik operates a network listener, A2A server, task endpoint, webhook ingress, authenticated agent service, or general-purpose submission API.

The manifest remains `discovery_only` and fixes these states closed:

- `a2a_server: false`;
- `live_network_ingress: false`;
- `agent_card_published: false`;
- `submission_available: false` for the inbound ENS research contract;
- `automatic_promotion: false` for candidate contributions.

The candidate-contribution capability alone advertises `submission_available: true`, with transport fixed to `github_issue` and the exact repository Issue template URL.

Vortik does not currently advertise a live A2A server, public task endpoint, push notification endpoint, authenticated extended card, MCP source-ingestion surface or general-purpose network ingress.

The current A2A protocol standard uses an Agent Card for a real A2A Server and recommends discovery at `/.well-known/agent-card.json`. Vortik deliberately does not publish that path until an actual interoperable endpoint exists and its authentication, authorization, rate limiting, provenance, timeout and adversarial-input boundaries have been implemented and validated.

Official A2A specification:

```text
https://a2a-protocol.org/latest/specification/
```

## Trust boundary

The discovery manifest and candidate contributions are metadata and research inputs, not authority. They must not be interpreted as:

- Ethereum protocol authority;
- ENS authority or ownership evidence;
- evidence of ownership intent;
- commercial or valuation authority;
- permission to contact, transact, sign, list, transfer or sell anything.

GitHub transport does not change the trust level of submitted content. External contribution fields and links remain untrusted until independently reviewed and, where required, verified by the separate trusted-verification boundary.

The currently advertised repository capabilities remain deterministic and bound to canonical repository artifacts. Queried names and contributed text remain data, never instructions.

If a future objective requires live ENS resolution, web retrieval, MCP, an A2A endpoint or another Vortik-operated network source, implementation must stop first and define the corresponding trust boundary: explicit origins or allowlists, provenance, untrusted external content handling, input and response limits, timeouts, authentication where required, and adversarial tests.

## Validation

Run:

```bash
npm run validate:agent-discovery
```

The validator confirms:

- the closed discovery `1.3.0` schema;
- complete historical immutability of discovery `1.0.0`–`1.2.0` against the PR base;
- exact reuse of the existing ENS research contracts/client;
- the candidate-contribution contract and public mirror;
- the exact GitHub Issue submission transport and URL;
- the existence of the referenced Issue template;
- canonical/public agent manifest and schema mirror equality;
- deployment coverage for the public discovery schema; and
- fail-closed rejection of A2A, live-network, research-submission, automatic-promotion and commercial-authority claims.
