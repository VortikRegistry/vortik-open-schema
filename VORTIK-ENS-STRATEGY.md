# VORTIK — ENS STRATEGY

## Portfolio Decision Table

| Anchor ID | ENS | Canonical Surface | Current Classification | Market Visibility | Market Priority | Current Strategy | Recommended Action | Decision Rationale | Public Posture | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| epbs | epbs.eth | enshrined proposer-builder separation (ePBS) | core | featured | high | hold | retain / offers only | strongest protocol-aligned naming surface in portfolio | strategic transfer only | tier-1 asset |
| inclusionlist | inclusionlist.eth | fork-choice enforced inclusion lists (FOCIL) | core | featured | high | hold | retain / offers only | direct protocol constraint surface with strong convergence | strategic transfer only | tier-1 secondary core |
| commitmentlayer | commitmentlayer.eth | commitment | repairable | standard | medium | monitor | selective | valuable concept but ENS suffix is semantically misaligned | selective discussion | keep under review |
| preconflayer | preconflayer.eth | preconfirmation (emergent) | premature / repairable | standard | medium | opportunistic | selective / offers only | meaningful area but naming still unstable | selective discussion | depends on convergence |
| ssf | fastfinality.eth | single-slot finality (SSF) | repairable | standard | medium | opportunistic | selective | meaningful concept, but ENS string is generalized rather than canonical | selective discussion | strong if SSF narrative grows |
| orderflowauction | orderflowauction.eth | order flow auctions (OFA) | valid | standard | medium | opportunistic | selective | real external coordination surface with recognizable relevance | selective discussion | solid non-core asset |
| provingmarket | provingmarket.eth | proving markets | external | standard | medium | monitor | selective | relevant external infra narrative, but not core Ethereum L1 semantic layer | selective discussion | may gain value via zk infra growth |
| sequencingmarket | sequencingmarket.eth | sequencing markets | external | standard | medium | monitor | selective | relevant to rollups/shared sequencing, but external to core protocol registry | selective discussion | keep open but not featured |
| solverlayer | solverlayer.eth | solver (external) | external / repairable | background | low | monitor | flexible / review | solver concept matters, but ENS framing is weaker and external | available | keep flexible |
| buildermarket | buildermarket.eth | builder | deprecated | background | low | liquidate | sell / liquidate | naming surface weakened by legacy market framing | available | non-core sale candidate |
| executionmarket | executionmarket.eth | execution (ambiguous) | premature | background | low | liquidate | sell / liquidate | ambiguous non-canonical naming surface | available | weak moat |
| blockspacemarket | blockspacemarket.eth | blockspace markets | deprecated | background | low | liquidate | sell / liquidate | legacy framing increasingly displaced by protocol-native structure | available | low strategic priority |

---

## Decision Buckets

| Bucket | Anchors |
|---|---|
| Retain / Offers Only | `epbs.eth`, `inclusionlist.eth` |
| Selective | `commitmentlayer.eth`, `preconflayer.eth`, `fastfinality.eth`, `orderflowauction.eth`, `provingmarket.eth`, `sequencingmarket.eth` |
| Flexible / Review | `solverlayer.eth` |
| Sell / Liquidate | `buildermarket.eth`, `executionmarket.eth`, `blockspacemarket.eth` |

---

## Strategic Priority Order

| Rank | ENS |
|---|---|
| 1 | `epbs.eth` |
| 2 | `inclusionlist.eth` |
| 3 | `commitmentlayer.eth` |
| 4 | `preconflayer.eth` |
| 5 | `fastfinality.eth` |
| 6 | `orderflowauction.eth` |
| 7 | `provingmarket.eth` |
| 8 | `sequencingmarket.eth` |
| 9 | `solverlayer.eth` |
| 10 | `buildermarket.eth` |
| 11 | `executionmarket.eth` |
| 12 | `blockspacemarket.eth` |

---

## Operating Rule

| If signal changes... | Action |
|---|---|
| Core protocol convergence strengthens | move toward `retain / offers only` |
| Naming instability increases | move toward `selective` or `sell` |
| Term becomes semantically obsolete | move toward `sell / liquidate` |
| External surface gains strategic relevance | keep `selective` |
| Buyer intent appears and timing aligns | reconsider `offers only` or sale path |

---

## Execution Rule

| Area | File to update |
|---|---|
| Portfolio strategy | `VORTIK-ENS-STRATEGY.md` |
| Actual market logic | `registry.json` |
| Public generated market page | `scripts/generate-market-html.mjs` + pipeline |
