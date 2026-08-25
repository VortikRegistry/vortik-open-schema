# Vortik — Ethereum Semantic Registry

[![Live Registry](https://img.shields.io/badge/live-registry-0b0f14?style=flat-square&logo=githubpages&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/)
[![Interactive App](https://img.shields.io/badge/explore-app-111722?style=flat-square&logo=vercel&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/app.html)
[![Registry JSON](https://img.shields.io/badge/source-registry.json-0b1220?style=flat-square&logo=json&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/registry.json)
[![Semantic Feeds](https://img.shields.io/badge/machine--readable-feeds-162033?style=flat-square&logo=json&logoColor=white)](https://vortikregistry.github.io/vortik-open-schema/feeds/index.json)
[![Pipeline](https://img.shields.io/badge/validation-GitHub_Actions-1e2735?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/VortikRegistry/vortik-open-schema/actions)

Vortik is a public, independent semantic registry for selected Ethereum coordination terminology.

It maps selected ENS anchors to canonical technical terms, classifications, versioned schemas, human-readable notes, source trails and machine-readable discovery surfaces. ENS anchors are naming surfaces for registry entries; they are **not** protocol authority and do not create Ethereum or ENS truth.

Vortik is not affiliated with or endorsed by the Ethereum Foundation, ENS Labs or ENS DAO.

---

## 30-second developer quickstart

Get a real machine-readable Vortik artifact with one command. No clone, wallet, RPC credential or API key is required:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json
```

Discover the current feed set from:

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

For the zero-dependency JavaScript path, expected fields, versioning and stability boundary, see [`docs/developer-quickstart.md`](docs/developer-quickstart.md).

---

## Current capability status

This section intentionally distinguishes what is public today from what is implemented but still gated.

| Capability | Current state | Notes |
| --- | --- | --- |
| Public semantic registry | **Live** | GitHub Pages, `registry.json`, schemas, anchor notes and generated indexes are publicly readable. |
| Interactive explorer | **Live** | Public browsing surface for registry entries, classifications, status and schema links. |
| Versioned semantic feeds | **Live** | Read-only feed index plus topic feeds such as ePBS. |
| ENS semantic research library | **Implemented** | Deterministic local library and closed request/response contracts; no live public submission endpoint is claimed. |
| ENS candidate contribution path | **Live via GitHub Issues** | External contributors can prepare a schema-bound candidate contribution; review is conservative and promotion is never automatic. |
| A2A discovery beacon | **Implemented / preactivation** | A2A 1.0 HTTP+JSON service code exists, but no public A2A listener, public Agent Card or live ingress is currently claimed. |
| Beacon outbound-denial probe | **Implemented / not yet production-proven** | One-shot fixed-destination probe exists for the future isolated runtime gate; repository state does not claim that the production network probe has passed. |
| Trusted receipt production path | **Verified in bounded preactivation probes / disabled** | KMS signing, primary-source receipt and ENS-mainnet receipt preactivation probes recorded PASS; trusted receipt issuance remains disabled. |
| Candidate admission | **Disabled** | Receipt verification and candidate admission are independent gates. No automatic registry mutation is active. |

### A2A discovery beacon

The repository now contains a bounded read-only Agent2Agent discovery implementation for agents and developer tooling that need to find selected public Vortik artifacts.

Canonical lifecycle state is defined in [`agents/discovery.json`](agents/discovery.json):

```text
mode = a2a_preactivation
a2a_implementation_available = true
a2a_server = false
live_network_ingress = false
agent_card_published = false
public_base_url = null
```

The implementation targets A2A 1.0 with the HTTP+JSON binding and is restricted to deterministic discovery over allowlisted public Vortik references. It does not perform open-ended web retrieval, live ENS resolution, arbitrary tool execution, persistent tasks, registry mutation or caller-selected network access.

The planned live paths are:

```text
GET  /.well-known/agent-card.json
POST /a2a/v1/message:send
```

Task-related A2A routes fail closed under the stateless service model; streaming, push notifications and persistent tasks are not enabled.

See [`docs/public-a2a-beacon.md`](docs/public-a2a-beacon.md) and [`docs/public-a2a-beacon-trust-boundary.md`](docs/public-a2a-beacon-trust-boundary.md).

### Trusted verification and receipt preactivation

Vortik also contains a separate trusted-verification path for bounded primary-source and ENS-mainnet evidence.

Production-preactivation evidence currently records PASS for:

- the pinned Google Cloud KMS Ed25519 signing path;
- a bounded primary-source receipt probe against the canonical ePBS source fixture; and
- a bounded dual-provider Ethereum-mainnet / ENS receipt probe for `epbs.eth`.

Those probes verify infrastructure and evidence-binding behavior only. They do **not** activate issuance or admission.

Canonical gates remain:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

See [`docs/cloud-run-preactivation-evidence.md`](docs/cloud-run-preactivation-evidence.md) and [`docs/google-cloud-run-receipt-runtime.md`](docs/google-cloud-run-receipt-runtime.md).

---

## Public entry points

### Registry

The canonical public interface for the semantic registry:

https://vortikregistry.github.io/vortik-open-schema/

### Interactive app

A navigable view of anchors, domains, classifications, status and schema links:

https://vortikregistry.github.io/vortik-open-schema/app.html

### Machine-readable registry

```text
https://vortikregistry.github.io/vortik-open-schema/registry.json
```

### Feed discovery

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

### Generated indexes and maps

```text
https://vortikregistry.github.io/vortik-open-schema/anchors.index.json
https://vortikregistry.github.io/vortik-open-schema/market.index.json
https://vortikregistry.github.io/vortik-open-schema/maps/coordination-stack.json
https://vortikregistry.github.io/vortik-open-schema/maps/coordination-surfaces.json
```

`market.index.json` is a retained generated artifact name in the current registry format; it does not make Vortik a marketplace, price oracle or commercial authority.

---

## What Vortik models

Vortik indexes semantic relationships between:

- selected ENS anchors;
- canonical technical terms;
- protocol primitives;
- roles;
- constraints;
- external actors and mechanisms;
- coordination surfaces;
- schema definitions;
- source trails;
- human-readable anchor documents; and
- generated machine-readable interfaces.

The registry helps distinguish:

- protocol-native terminology;
- implementation-facing terminology;
- external infrastructure terminology;
- emerging research terminology; and
- deprecated or semantically misaligned abstractions.

Interpretive maps and classifications are Vortik research outputs, not protocol specifications.

---

## Tracked semantic anchors

### Core

- **epbs.eth** — enshrined proposer-builder separation (ePBS)
- **inclusionlist.eth** — fork-choice enforced inclusion lists (FOCIL)

### Repairable

- **commitmentlayer.eth** — commitment
- **fastfinality.eth** — single-slot finality (SSF)

### Premature / emerging

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

Classification describes Vortik's semantic posture. It is not an ownership, price, buyer-interest or sale signal.

---

## Worked example: `epbs.eth`

| Field | Path or value |
| --- | --- |
| ENS anchor | `epbs.eth` |
| Canonical term | enshrined proposer-builder separation (ePBS) |
| Schema | `schemas/epbs/1.0-draft/schema.json` |
| Source notes | `schemas/epbs/1.0-draft/sources.md` |
| Anchor note | `anchors/epbs.md` |
| Public feed | `feeds/epbs.json` |

The anchor is a semantic naming surface. The authoritative protocol evidence remains the underlying Ethereum specifications and primary sources referenced by the registry.

---

## Public collaboration

Vortik supports schema-bound ENS candidate contributions through GitHub Issues.

The contribution path is intended for evidence and corrections, not automatic admission. A submitted candidate:

- remains untrusted input;
- does not become a registry entry automatically;
- does not establish ENS ownership intent;
- does not establish commercial relevance; and
- requires conservative human/repository review before any later promotion decision.

See [`docs/ens-candidate-contributions.md`](docs/ens-candidate-contributions.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Source of truth

Read the repository with this hierarchy in mind:

1. `schemas/` — formal source of truth for versioned registry definitions and contracts.
2. `registry.json` — central index for tracked anchors.
3. `anchors/` — human-readable interpretation for selected ENS anchors.
4. `agents/` — machine-readable agent/discovery state.
5. `feeds/` — generated/read-only semantic feed artifacts.
6. `maps/` — interpretive coordination views.
7. `docs/` — generated public interfaces, evidence records and explanatory material.
8. Research documents — interpretive support; they do not automatically modify registry state.

Generated files should not be edited manually unless explicitly intended by the repository workflow.

---

## Validation and reproducibility

Run locally:

```bash
npm run check:public-safety
npm run validate
```

Validation covers JSON structure, registry/schema consistency, integrity, derived-output synchronization, discovery lifecycle constraints, public-safety checks and regression tests included in the repository validation pipeline.

GitHub Actions validates pull requests and pushes to `main`.

---

## Boundaries

Vortik does **not**:

- define Ethereum protocol rules;
- replace EIPs, consensus specifications, execution specifications or client documentation;
- claim Ethereum Foundation, ENS Labs or ENS DAO authority;
- treat ENS names as protocol authority;
- infer ownership intent from an ENS name;
- expose private ENS strategy or commercial workflow;
- operate as a marketplace, price oracle or buyer-discovery service;
- grant automatic candidate admission;
- expose the trusted-receipt signer or KMS through the public beacon;
- use AI-generated reports as authority or source of truth.

The public A2A beacon and the trusted receipt runtime are deliberately separate security domains.

---

## Recommended reading path

1. [`REGISTRY.md`](REGISTRY.md) — registry model and source-of-truth hierarchy.
2. [`SEMANTIC-STATUS.md`](SEMANTIC-STATUS.md) — current public semantic posture.
3. [`docs/developer-quickstart.md`](docs/developer-quickstart.md) — machine-readable developer path.
4. [`docs/agent-discovery.md`](docs/agent-discovery.md) — agent discovery contract.
5. [`docs/public-a2a-beacon.md`](docs/public-a2a-beacon.md) — A2A beacon implementation and lifecycle.
6. [`docs/public-a2a-beacon-trust-boundary.md`](docs/public-a2a-beacon-trust-boundary.md) — dedicated runtime/network boundary required before activation.
7. [`docs/cloud-run-preactivation-evidence.md`](docs/cloud-run-preactivation-evidence.md) — bounded trusted-receipt preactivation evidence.
8. [`docs/naming-governance-boundaries.md`](docs/naming-governance-boundaries.md) — ENS naming and authority boundaries.
9. [`CONTRIBUTING.md`](CONTRIBUTING.md) — contribution rules.

Additional references:

- [Vortik Registry Constitution](.specify/memory/constitution.md)
- [Taxonomy Promotion Rules](docs/taxonomy-promotion-rules.md)
- [Multi-Agent Verification Audit](docs/research/multi-agent-verification-2026-06-28.md)
- [Repository Positioning and Trust Audit](docs/research/repo-positioning-trust-audit.md)
- [ePBS Source Audit](docs/research/epbs-source-audit.md)
- [Inclusionlist / FOCIL Source Audit](docs/research/inclusionlist-focil-source-audit.md)
- [Candidate Promotion Rules](docs/research/candidate-promotion-rules.md)

---

## Repository status

- Registry version: `0.6.5`
- Formal source of truth: `schemas/`
- Central index: `registry.json`
- Public interface: GitHub Pages
- Validation: GitHub Actions
- A2A beacon: implemented, preactivation
- Trusted receipt issuance: disabled
- Candidate admission: disabled

---

## Contact

- X → https://x.com/VortikRegistry
- GitHub → Issues / Discussions

---

© 2026 Vortik
