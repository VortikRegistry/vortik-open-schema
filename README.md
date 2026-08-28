# Vortik — Ethereum Semantic Registry

[![Live Registry](https://img.shields.io/badge/live-registry-0b0f14?style=flat-square&logo=githubpages&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/)
[![Machine-readable Feeds](https://img.shields.io/badge/machine--readable-feeds-162033?style=flat-square&logo=json&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/feeds/index.json)
[![Discovery Manifest](https://img.shields.io/badge/public-discovery-1b2433?style=flat-square&logo=json&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/agents/discovery.json)
[![Schemas](https://img.shields.io/badge/versioned-schemas-111722?style=flat-square&logo=json&logoColor=white)](https://github.com/VortikRegistry/vortik-open-schema/tree/main/schemas)
[![Validation](https://img.shields.io/badge/validation-GitHub_Actions-1e2735?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/VortikRegistry/vortik-open-schema/actions)

Vortik is a public, independent semantic registry and discovery surface for selected Ethereum coordination terminology.

The repository is not a directory of ENS names. It is a versioned public system that publishes:

- a semantic registry;
- machine-readable feeds;
- versioned schemas;
- source trails;
- explicit authority boundaries;
- public discovery metadata;
- deterministic research contracts; and
- a contribution path for evidence and corrections.

ENS names are used as **semantic anchors inside that system**. They help bind selected naming surfaces to technical terminology and public artifacts, but they do not create protocol truth, governance authority, ownership inference or commercial authority.

For a technical reader, the useful property is that Vortik can be **inspected, consumed, discussed and verified** from public artifacts.

---

## Public surfaces available today

| Surface | State | Purpose |
| --- | --- | --- |
| Semantic registry | **Live** | Canonical index of tracked anchors, classifications and schema bindings. |
| Public schemas | **Live** | Versioned machine-readable contracts and semantic definitions. |
| Source trails | **Live** | Human-readable and generated source references attached to registry definitions. |
| Semantic feeds | **Live** | Read-only machine-consumable outputs, currently including the ePBS feed and feed index. |
| Discovery manifest | **Live metadata** | Machine-readable description of Vortik public capabilities and lifecycle state, including the canonical live A2A origin. |
| Interactive explorer | **Live** | Human-readable browsing surface for registry entries and semantic structure. |
| ENS semantic research library | **Implemented** | Deterministic local evaluation against canonical Vortik artifacts. No live public research execution endpoint is claimed. |
| ENS candidate contribution path | **Live via GitHub Issues** | Schema-bound public contribution path for evidence and corrections. Promotion is never automatic. |
| A2A discovery beacon | **Live** | Bounded read-only A2A 1.0 HTTP+JSON discovery service with a public Agent Card and canonical HTTPS origin. |
| Beacon outbound-denial probe | **Production PASS** | Fixed-destination one-shot probe verified the dedicated Direct VPC deny-egress boundary before live activation. |
| Trusted receipt issuance | **Deferred from V1 / Disabled** | Production-preactivation paths passed, but V1 exposes no receipt-issuance service. |
| Candidate admission | **Deferred from V1 / Disabled** | V1 performs no automatic registry mutation and grants no admission authority. |

---

## 30-second developer quickstart

Fetch a real machine-readable Vortik artifact with one command:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json
```

Discover the available feeds:

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

Inspect the public discovery manifest:

```text
https://vortikregistry.github.io/vortik-open-schema/agents/discovery.json
```

Discover the live A2A agent directly:

```text
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/.well-known/agent-card.json
```

No wallet, API key or RPC credential is required for those public read-only artifacts and discovery surfaces.

For the zero-dependency JavaScript path, expected fields, versioning and stability boundary, see [`docs/developer-quickstart.md`](docs/developer-quickstart.md).

---

## How public discovery works today

Vortik exposes discovery in layers rather than treating one agent endpoint as the whole product.

### 1. Registry discovery

Developers can inspect the canonical registry directly:

```text
https://vortikregistry.github.io/vortik-open-schema/registry.json
```

The registry links ENS anchors to canonical terms, classifications, schemas and human-readable notes.

### 2. Feed discovery

Agents and applications can discover available machine-readable feeds from:

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

Feed consumers do not need to hard-code every topic artifact independently.

### 3. Schema discovery

Formal contracts live under:

```text
schemas/
```

These include registry definitions, feed contracts, ENS research request/response contracts, contribution contracts, review contracts and verification contracts.

### 4. Source trails

Registry definitions link to source notes and public evidence paths. Source trails are intended to make semantic claims inspectable rather than opaque.

### 5. Agent discovery metadata

The canonical machine-readable agent manifest is:

```text
agents/discovery.json
```

Its public mirror is published through GitHub Pages.

The manifest records the current live A2A lifecycle state, exact public origin and authority boundaries without upgrading unrelated gated capabilities.

### 6. Live A2A discovery beacon

External agents can discover the bounded public beacon through:

```text
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/.well-known/agent-card.json
```

The interface is A2A 1.0 HTTP+JSON at:

```text
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/a2a/v1
```

### 7. Public contribution path

External contributors can prepare schema-bound ENS candidate contributions through GitHub Issues. Contributions remain untrusted inputs until reviewed.

---

## A2A discovery beacon

Vortik operates a bounded read-only Agent2Agent discovery service intended for agents and developer tooling that need to locate selected public Vortik artifacts.

The implementation targets **A2A 1.0 HTTP+JSON** and maps selected Ethereum coordination queries to allowlisted public references.

Canonical lifecycle state is:

```text
mode = a2a_live
a2a_implementation_available = true
a2a_server = true
live_network_ingress = true
agent_card_published = true
public_base_url = https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app
```

Public Agent Card:

```text
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/.well-known/agent-card.json
```

The implementation is deliberately bounded. It does not perform open-ended web retrieval, live ENS resolution, arbitrary tool execution, persistent tasks, registry mutation or caller-selected network access.

The production service uses a dedicated unprivileged runtime identity, isolated Direct VPC egress and a deny-all outbound firewall boundary. Before live activation, the reviewed immutable image completed the fixed-destination outbound-denial probe successfully: Direct VPC readiness was established and both the fixed external HTTPS destination and fixed RFC1918 destination were inaccessible. The probe does not grant any receipt, admission, protocol, ENS or commercial authority.

See:

- [`docs/public-a2a-beacon.md`](docs/public-a2a-beacon.md)
- [`docs/public-a2a-beacon-trust-boundary.md`](docs/public-a2a-beacon-trust-boundary.md)

---

## What can be inspected and verified

A Vortik entry is designed to be traceable across multiple public layers:

```text
ENS anchor
   ↓
registry.json
   ↓
versioned schema
   ↓
source trail
   ↓
human-readable anchor note
   ↓
optional generated feed / map / discovery reference
```

This makes it possible to inspect:

- which canonical term an anchor maps to;
- how Vortik classifies that term;
- which schema defines the public shape;
- which source trail supports the interpretation;
- which authority claims are explicitly excluded; and
- which machine-readable surfaces expose the result.

A Vortik artifact is therefore an independent semantic research output, not a substitute for Ethereum specifications or ENS authority.

---

## ENS anchors inside the system

Selected ENS names are used as semantic anchors for registry entries.

Examples include:

### Core

- **epbs.eth** — enshrined proposer-builder separation (ePBS)
- **inclusionlist.eth** — fork-choice enforced inclusion lists (FOCIL)

### Repairable

- **commitmentlayer.eth** — commitment
- **fastfinality.eth** — single-slot finality (SSF)

### Emerging

- **preconflayer.eth** — preconfirmation

### External coordination surfaces

- **solverlayer.eth** — solver
- **orderflowauction.eth** — order flow auctions (OFA)
- **provingmarket.eth** — proving markets
- **sequencingmarket.eth** — sequencing markets

### Deprecated or reduced-precision abstractions

- **buildermarket.eth** — builder
- **executionmarket.eth** — execution (ambiguous)
- **blockspacemarket.eth** — blockspace markets

These classifications describe Vortik's semantic posture. They are not protocol status, governance status, ownership intent or commercial relevance.

---

## Worked example: `epbs.eth`

| Layer | Path or value |
| --- | --- |
| ENS anchor | `epbs.eth` |
| Canonical term | enshrined proposer-builder separation (ePBS) |
| Registry entry | `registry.json` |
| Schema | `schemas/epbs/1.0-draft/schema.json` |
| Source trail | `schemas/epbs/1.0-draft/sources.md` |
| Human-readable note | `anchors/epbs.md` |
| Public feed | `feeds/epbs.json` |

The ENS name is only one layer. The useful object is the complete public chain of registry metadata, schema, sources and machine-readable output.

---

## Authority boundaries

Vortik is independent and does **not**:

- define Ethereum protocol rules;
- replace EIPs, consensus specifications, execution specifications or client documentation;
- claim Ethereum Foundation, ENS Labs or ENS DAO authority;
- treat ENS names as protocol authority;
- infer ownership intent from an ENS name;
- treat external contributions as trusted evidence by default;
- grant automatic candidate admission;
- expose the trusted-receipt signer or Google Cloud KMS through the public discovery beacon;
- make AI-generated reports a source of protocol truth.

The public discovery layer and the trusted verification runtime are deliberately separate security domains.

See [`docs/naming-governance-boundaries.md`](docs/naming-governance-boundaries.md).

---

## Trusted verification state

Vortik contains a separate trusted-verification path for bounded primary-source and ENS-mainnet evidence.

Production-preactivation evidence records PASS for:

- the pinned Google Cloud KMS Ed25519 signing path;
- a bounded primary-source receipt probe for the canonical ePBS fixture; and
- a bounded dual-provider Ethereum-mainnet / ENS receipt probe for `epbs.eth`.

Those results verify specific preactivation paths. They do not activate authority.

Canonical gates remain:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

For V1 these are explicit, non-blocking deferrals rather than partially advertised capabilities. The implemented verifier, receipt-core and production-preactivation evidence remain available for a separately reviewed post-V1 activation, but V1 exposes no receipt-issuance route and does not admit candidates automatically.

See:

- [`docs/cloud-run-preactivation-evidence.md`](docs/cloud-run-preactivation-evidence.md)
- [`docs/google-cloud-run-receipt-runtime.md`](docs/google-cloud-run-receipt-runtime.md)

---

## Source of truth

Read the repository with this hierarchy in mind:

1. `schemas/` — formal source of truth for versioned semantic definitions and contracts.
2. `registry.json` — central index for tracked anchors.
3. `anchors/` — human-readable semantic interpretation.
4. `feeds/` — machine-readable semantic outputs.
5. `agents/` — machine-readable discovery and lifecycle state.
6. `maps/` — interpretive coordination views.
7. `docs/` — generated public mirrors, evidence records and explanatory material.
8. Research documents — interpretive support; they do not automatically modify registry state.

Generated files should not be edited manually unless explicitly intended by the repository workflow.

---

## Public collaboration

The repository supports public evidence and correction workflows through GitHub.

Before proposing changes, read [`CONTRIBUTING.md`](CONTRIBUTING.md).

For ENS candidate contributions, see [`docs/ens-candidate-contributions.md`](docs/ens-candidate-contributions.md).

A submitted contribution:

- remains untrusted input;
- does not become a registry entry automatically;
- does not establish protocol or ENS authority; and
- requires conservative review before any later promotion decision.

---

## Public entry points

```text
Registry
https://vortikregistry.github.io/vortik-open-schema/

Interactive explorer
https://vortikregistry.github.io/vortik-open-schema/app.html

Registry JSON
https://vortikregistry.github.io/vortik-open-schema/registry.json

Feed discovery
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json

Agent discovery manifest
https://vortikregistry.github.io/vortik-open-schema/agents/discovery.json

A2A Agent Card
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/.well-known/agent-card.json

A2A interface
https://vortik-agent-beacon-dtcdh3ioxu-rj.a.run.app/a2a/v1

Coordination stack
https://vortikregistry.github.io/vortik-open-schema/maps/coordination-stack.json

Coordination surfaces
https://vortikregistry.github.io/vortik-open-schema/maps/coordination-surfaces.json
```

---

## Validation and reproducibility

Run locally:

```bash
npm run check:public-safety
npm run validate
```

Validation covers JSON structure, registry/schema consistency, integrity, derived-output synchronization, discovery lifecycle constraints, public-safety checks and repository regression tests.

GitHub Actions validates pull requests and pushes to `main`.

---

## Recommended reading path

1. [`REGISTRY.md`](REGISTRY.md) — registry model and source-of-truth hierarchy.
2. [`SEMANTIC-STATUS.md`](SEMANTIC-STATUS.md) — current public semantic posture.
3. [`docs/developer-quickstart.md`](docs/developer-quickstart.md) — machine-readable developer path.
4. [`docs/agent-discovery.md`](docs/agent-discovery.md) — public discovery contract.
5. [`docs/public-a2a-beacon.md`](docs/public-a2a-beacon.md) — live A2A implementation and lifecycle.
6. [`docs/public-a2a-beacon-trust-boundary.md`](docs/public-a2a-beacon-trust-boundary.md) — runtime/network boundary enforced for activation.
7. [`docs/naming-governance-boundaries.md`](docs/naming-governance-boundaries.md) — ENS naming and authority boundaries.
8. [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution rules.

---

## Repository status

- Registry version: `0.6.5`
- Formal source of truth: `schemas/`
- Central index: `registry.json`
- Public interface: GitHub Pages
- Public feeds: live
- Public discovery metadata: live
- A2A beacon: live / bounded / deny-egress verified
- Trusted receipt issuance: deferred from V1 / disabled
- Candidate admission: deferred from V1 / disabled

---

## Contact

- X → https://x.com/VortikRegistry
- GitHub → Issues / Discussions

---

© 2026 Vortik
