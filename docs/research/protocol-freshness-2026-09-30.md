# Public protocol source review — 2026-09-30

## Scope

This review covers all 12 anchor notes, their curated source trails, the public landing page and explorer, the README, glossary, and related current research notes. It records primary-source context as of September 30, 2026. Historical release records and dated audits remain historical records.

The registry remains version `0.6.5`. Canonical terms, classifications, schema constants, and runtime configuration are unchanged. Labels such as `core`, `external`, or `deprecated` describe Vortik's semantic model; they are not Ethereum deployment states or deprecation notices.

## Current fork and ENS context

| Topic | Source state at review |
| --- | --- |
| Glamsterdam | [EIP-7773](https://eips.ethereum.org/EIPS/eip-7773) and the [Ethereum Foundation announcement](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement) schedule Sepolia for **2026-10-06 13:53:36 UTC**, epoch 353024, slot 11296768. Hoodi and mainnet dates remain unset. |
| ePBS and BALs | EIP-7732, EIP-7928, and builder execution requests in EIP-8282 are Scheduled for Inclusion in Glamsterdam. This is not a mainnet activation claim. |
| FOCIL | [EIP-8081](https://eips.ethereum.org/EIPS/eip-8081) schedules EIP-7805 for Hegotá. It is absent from Glamsterdam's current scheduled set. Hegotá activation dates are unset. |
| Optional execution proofs | EIP-8025 is Draft and Proposed for Inclusion in Hegotá; it is not Scheduled. |
| BAL sidecars | EIP-8146 remains Draft, but EIP-8081 now lists it as Declined for Inclusion in Hegotá. Earlier Proposed references are historical. |
| ENSv2 | ENS announced [public Beta on Sepolia](https://ens.domains/blog/post/ensv2-beta-public-testing) on August 12. This is testnet context, not a mainnet launch or a change to Vortik ENS records. See the [ENS source note](ensv2-l1-decision-source-note.md). |

## Review of every anchor

| ENS semantic anchor | Source-backed context and retained boundary | Reference trail |
| --- | --- | --- |
| `epbs.eth` | EIP-7732 and EIP-8282 define builder duties and request paths; scheduled Glamsterdam context. | [Anchor](../../anchors/epbs.md) · [Sources](../../schemas/epbs/1.0-draft/sources.md) |
| `inclusionlist.eth` | EIP-7805 is scheduled for Hegotá; scheduling is distinct from activation. | [Anchor](../../anchors/inclusionlist.md) · [Sources](../../schemas/inclusionlist/0.1-draft/sources.md) |
| `commitmentlayer.eth` | Concrete commitments appear in ePBS; a standalone commitment layer is not standardized by those sources. | [Anchor](../../anchors/commitmentlayer.md) · [Sources](../../schemas/commitmentlayer/0.1-draft/sources.md) |
| `preconflayer.eth` | Assurances and enforcement depend on the design. Preconfirmations are distinct from consensus finality. | [Anchor](../../anchors/preconflayer.md) · [Sources](../../schemas/preconflayer/0.1-draft/sources.md) |
| `fastfinality.eth` | Official Fast Finality research is the umbrella; SSF is a narrower target. The existing canonical SSF entry remains unchanged. | [Anchor](../../anchors/fastfinality.md) · [Sources](../../schemas/ssf/0.1-research/sources.md) |
| `buildermarket.eth` | Builders and bidding remain explicit in ePBS. Vortik's deprecated abstraction does not mean builder competition is obsolete. | [Anchor](../../anchors/buildermarket.md) · [Sources](../../schemas/buildermarket/0.1-research/sources.md) |
| `executionmarket.eth` | Payload coordination, BALs, and gas accounting are distinct technical surfaces. The broad market term is not one L1 object. | [Anchor](../../anchors/executionmarket.md) · [Sources](../../schemas/executionmarket/0.1-research/sources.md) |
| `blockspacemarket.eth` | EIP-1559 supplies a concrete fee-market reference. The registry label does not deprecate the economic concept. | [Anchor](../../anchors/blockspacemarket.md) · [Sources](../../schemas/blockspacemarket/0.1-research/sources.md) |
| `solverlayer.eth` | Primary application documentation supports solver competition; solver is distinct from an L1 consensus duty. | [Anchor](../../anchors/solverlayer.md) · [Sources](../../schemas/solverlayer/0.1-research/sources.md) |
| `orderflowauction.eth` | MEV-Share is a documented external OFA example. FOCIL scheduling does not establish an OFA adoption trend. | [Anchor](../../anchors/orderflowauction.md) · [Sources](../../schemas/orderflowauction/0.1-research/sources.md) |
| `provingmarket.eth` | EIP-8025 supplies L1 proof context but introduces no prover incentives or standardized proving market. | [Anchor](../../anchors/provingmarket.md) · [Sources](../../schemas/provingmarket/0.1-research/sources.md) |
| `sequencingmarket.eth` | Based-rollup research uses L1 actors; rollup sequencing need not be wholly separate from L1 block production. | [Anchor](../../anchors/sequencingmarket.md) · [Sources](../../schemas/sequencingmarket/0.1-research/sources.md) |

## Interpretation and maintenance

Seven previously empty curated reference sections now contain primary specifications or implementation references. Current audits and glossary entries are reconciled with the fork meta EIPs. The repository-only protocol watchlist also records EIP-8146's declined state; it remains excluded from the public Pages mirror and is not a source of registry authority.

The older wording retained in machine-readable registry role summaries reflects existing ontology decisions. Current anchor/source notes explain their scope. Any future change to canonical terms or classifications requires a separate semantic decision and validation.

Source review is not runtime verification. It does not establish current cloud service health, billing state, ENS resolution, an on-chain migration, or a software deployment beyond these public documentation artifacts. No protocol endpoint or cloud job is invoked by this documentation update.

Read the linked primary sources for subsequent changes. A review date records when evidence was checked; it is not an automatic freshness guarantee.
