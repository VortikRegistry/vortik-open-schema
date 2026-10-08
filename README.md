# Vortik — Ethereum terminology, with evidence

[![Validation](https://github.com/VortikRegistry/vortik-open-schema/actions/workflows/validate.yml/badge.svg)](https://github.com/VortikRegistry/vortik-open-schema/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Find an Ethereum proposal. Compare a term. Follow the primary source.**

Vortik is an independent Ethereum reference with two connected tools: a searchable snapshot of official EIP and ERC metadata, and an evidence explorer for 12 curated coordination terms. Proposal search is independent of the curated ENS-style names. The explorer adds definitions, source notes, versioned JSON contracts and dated protocol context where that deeper review exists.

[**Search Ethereum proposals →**](https://vortikregistry.github.io/vortik-open-schema/research.html) · [Explore curated terms](https://vortikregistry.github.io/vortik-open-schema/app.html) · [Compare ePBS and FOCIL](https://vortikregistry.github.io/vortik-open-schema/app.html?compare=epbs,inclusionlist) · [Report a correction](https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=source-correction.md)

## What you can do

| Task | Start here |
| --- | --- |
| Find an EIP or ERC beyond the curated terms | [Search official proposal metadata](https://vortikregistry.github.io/vortik-open-schema/research.html) |
| Understand a term or an ENS-style semantic anchor | [Search the explorer](https://vortikregistry.github.io/vortik-open-schema/app.html) |
| Compare definitions, evidence and protocol context | [ePBS / FOCIL comparison](https://vortikregistry.github.io/vortik-open-schema/app.html?compare=epbs,inclusionlist) |
| Check EIP status, fork assignment and network timing separately | [Dated protocol context](docs/protocol-context.md) |
| Integrate definitions into a tool or document | [Developer quickstart](docs/developer-quickstart.md) |
| See what was reviewed and what changed | [Review history](docs/changes.md) |
| Understand the website and agent capabilities | [System status and evidence limits](docs/system-status.md) |

The website uses static artifacts from this repository. Searching and comparing them requires no wallet, account, model API, or call to the Reception service. The [proposal catalog](docs/ethereum-catalog.md) records its source commits and coverage. It searches document metadata; full specifications remain at the linked primary sources. ENS ownership, availability and live resolution are outside this search.

## Four different kinds of status

| Field | Meaning | Distinction |
| --- | --- | --- |
| Vortik classification | Editorial assessment of naming and semantic alignment | `core` does not mean active on mainnet. |
| EIP document status | Upstream document lifecycle | `Review` is not a network activation. |
| Fork assignment | Inclusion in an upstream upgrade plan | A scheduled proposal can still have an unset activation date. |
| Network activation | A dated event for a specific network | A testnet schedule does not establish mainnet activation. |

The [protocol context contract](docs/protocol-context.md) keeps these concepts separate. A source review date is also separate from the canonical registry's last-change date.

## Protocol source follow-up — 2026-10-08

The October 8 follow-up updates the selected EIP document statuses, fork assignments and published schedules. Five referenced Glamsterdam proposals are now Last Call. The catalog now covers 1,209 EIP/ERC records from pinned official sources. Sepolia's published October 6 time has passed; this review does not confirm activation. Hoodi and mainnet dates remain unset in the cited sources.

See the [October 8 follow-up](docs/research/protocol-freshness-2026-10-08.md), the earlier [all-anchor source review](docs/research/protocol-freshness-2026-09-30.md) and [review history](docs/changes.md). Follow the linked primary sources for later decisions. Historical releases retain their original context.

## 30-second developer quickstart

Fetch the dated context used by the explorer:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/protocol-context.json
```

Or consume the existing versioned ePBS semantic feed:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json
```

| Artifact | Contract / documentation |
| --- | --- |
| [Ethereum proposal catalog](https://vortikregistry.github.io/vortik-open-schema/ethereum-catalog.json) | [Coverage, provenance and reproducible updates](docs/ethereum-catalog.md) |
| [Protocol context JSON](https://vortikregistry.github.io/vortik-open-schema/protocol-context.json) | [Separate document, fork and network states](docs/protocol-context.md) |
| [Registry JSON](https://vortikregistry.github.io/vortik-open-schema/registry.json) | [Registry model](REGISTRY.md) |
| [Feed index](https://vortikregistry.github.io/vortik-open-schema/feeds/index.json) | [Feed discovery](docs/guides/discover-feeds.md) |
| [ePBS feed](https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json) | [Consume ePBS](docs/guides/consume-epbs-feed.md) |
| [Agent discovery](https://vortikregistry.github.io/vortik-open-schema/agents/discovery.json) | [Discovery contract](docs/agent-discovery.md) |

The [developer quickstart](docs/developer-quickstart.md) includes zero-dependency JavaScript and local validation. The context artifact supplements the registry and feeds without changing their versions or canonical classifications.

## Reception and agents

The public Reception implementation is a bounded, deterministic **Node.js / A2A 1.0 HTTP+JSON** service. It routes supported requests, evaluates one normalized ENS-style name against packaged snapshots, and returns allowlisted public references. It does not require an LLM provider.

Its [discovery manifest](agents/discovery.json) records the `a2a_live` lifecycle and canonical origin. That record is separate from current health verification and from the source revision packaged in a deployment. Publishing this website does not update that image.

Reception supports public research and discovery, the GitHub contribution path and an optional owner-selected human contact link. It has no open-ended web retrieval, live ENS resolution, arbitrary tool execution, persistent tasks, automatic registry mutation or transaction authority. A returned contact link does not prove message delivery.

Read the [system status](docs/system-status.md), [beacon implementation](docs/public-a2a-beacon.md), [network boundary](docs/public-a2a-beacon-trust-boundary.md) and [voluntary contact behavior](docs/public-human-contact.md).

## Scope and independence

Vortik is maintained independently. It is not an Ethereum Foundation, ENS DAO, ENS Foundation or ENS Labs project. EIPs, specifications and their maintainers remain the authority for protocol behavior.

ENS names here are semantic naming surfaces. They do not establish ownership, availability, protocol authority, institutional endorsement or ENSv2 operational dependency. The curated term set is limited; the independent proposal catalog has its own broader, explicitly recorded coverage. Inclusion in that catalog does not add a canonical Vortik anchor or imply a separate technical review of the complete proposal.

Registry classifications are Vortik's editorial judgments. In particular, `deprecated` describes reduced naming precision within this registry; it does not declare the underlying infrastructure or activity obsolete.

Trusted receipt issuance and automatic candidate admission remain disabled. Historical preactivation evidence is in [the verification record](docs/cloud-run-preactivation-evidence.md); it is not an active receipt service.

## Contribute one useful improvement

- Correct a source link or dated protocol fact using the [source correction template](https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=source-correction.md).
- Report a confusing comparison or terminology mismatch through [semantic drift](https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=semantic-drift.md).
- Share a concrete integration question in [Discussions](https://github.com/VortikRegistry/vortik-open-schema/discussions).
- Propose a source-grounded candidate using the [contribution guide](CONTRIBUTING.md).

You do not need an ENS name to report a correction or propose a useful reference. New canonical anchors and schema changes require separate review. Submissions remain untrusted inputs until reviewed.

If you find the reference useful, a GitHub star helps you return to it. Reuse, corrections and concrete integration feedback help determine what to improve next.

## Run and validate locally

Requires Node.js 20 or later:

```bash
npm ci
npm run check:public-safety
npm run validate
```

To browse the static site with Python 3:

```bash
python3 -m http.server 8000 --directory docs --bind 127.0.0.1
```

Then open `http://127.0.0.1:8000/`. This serves the static website without starting a Cloud service.

Pull requests run validation and check that derived files are committed. Pages deployment verifies published artifacts against committed bytes. See [maintenance policy](docs/maintenance-policy.md) for source review and registry changes.

## Maintainer and license

[X · @VortikRegistry](https://x.com/VortikRegistry) · [Issues](https://github.com/VortikRegistry/vortik-open-schema/issues) · [Discussions](https://github.com/VortikRegistry/vortik-open-schema/discussions)

Use Issues for public technical reports. The X profile is a voluntary route for a separate conversation; contact availability and response are not guaranteed. Do not place private information in public issues.

[MIT](LICENSE) · [Naming and governance boundaries](docs/naming-governance-boundaries.md)
