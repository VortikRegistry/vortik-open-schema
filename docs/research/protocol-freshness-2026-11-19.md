# Ethereum source and catalog review — 2026-11-19

Sepolia is the only network for which this review found reported Glamsterdam activation. Hoodi has a proposed December window; mainnet has an early readiness estimate. Neither is an agreed activation. This follow-up updates the [November 5 review](protocol-freshness-2026-11-05.md); it does not redetermine Vortik classifications or the dates of unrelated research notes.

## What changed, and when

- **October 6:** the Foundation [reported Sepolia activation](https://blog.ethereum.org/2026/10/16/glamsterdam-hoodi-announcement) in its October 16 notice. Its subsequent [October 22 notice](https://blog.ethereum.org/2026/10/22/glamsterdam-hoodi-delay) postponed the October 26 Hoodi activation.
- **November 6, updated November 9:** the [EF compatibility review](https://blog.ethereum.org/2026/11/06/glamsterdam-8037-8038) covers EIP-8037 (state creation) and EIP-8038 (state access). It sought evidence about existing contracts and possible mitigations. The follow-up recommended reviewing audit results before deciding on a specification change or a Hoodi date.
- **November 18:** [EIP-7773 removed the superseded Hoodi epoch and timestamp](https://github.com/ethereum/EIPs/commit/b055feec322fbc37e9d77a393a50b3ff56b31c92). This resolves the discrepancy in our October 30 and November 5 reviews. The rendered [roadmap](https://ethereum.org/roadmap/glamsterdam/) still showed an October milestone during this review. A roadmap milestone is not an activation configuration.
- **November 19:** [ACDE #249](https://github.com/ethereum/pm/issues/2285) discussed proceeding with the existing specification. Client preferences differed; there was time to bring a concrete alternative. The [corrected call transcript](https://github.com/ethereum/pm/blob/27b51c935352cad737c76775f5cea2d3aca539a3/.github/ACDbot/artifacts/acde/2026-11-19_249/transcript_corrected.vtt) records the readiness estimate from affected teams at **00:10:49–00:12:54**: mid-January 2027 was the earliest plausible mainnet timing if the specification remained unchanged. At **00:44:49–00:46:04** the chair suggested the week of **December 14, 2026** for Hoodi, with a decision sought on the next consensus call. The [ACDC #192 agenda](https://github.com/ethereum/pm/issues/2305) is for **November 26**; that is a meeting, not a fork. The [meeting summary](https://ethereum-magicians.org/t/all-core-devs-execution-acde-249-november-19-2026/30071) mentions two weeks in its overview but the transcript closes on one week. The [recording and call resources](https://forkcast.org/calls/acde/249/) remain available.

## Per-network evidence

Glamsterdam combines **Amsterdam** (execution) and **Gloas** (consensus). Geth's pinned [execution chain configurations](https://github.com/ethereum/go-ethereum/tree/c299edff841c698cb78b61d567937bb6d9eca3dd/params/chainspecs) and the consensus configurations below were read separately. These are configuration and source checks, not live chain probes.

| Network | Execution / consensus evidence | Recorded state |
| --- | --- | --- |
| Sepolia | Geth `amsterdamTime=1791294816`; [Sepolia Gloas epoch 353024](https://github.com/eth-clients/sepolia/blob/7b1b9d9549787b6bbf538f943304c4cf84f7e39e/metadata/config.yaml). | Source-reported active, Oct 6 at 13:53:36 UTC, slot 11,296,768. |
| Hoodi | Geth has no Amsterdam timestamp; [Hoodi config](https://github.com/eth-clients/hoodi/blob/2a7efb3c530cce7c71702cc98d0f965df2411c11/metadata/config.yaml) has no Gloas epoch. The corrected meta EIP leaves the row empty. | Not scheduled; date, epoch and slot stay null. The December window is a proposal. |
| Mainnet | Geth has no Amsterdam timestamp; the [consensus config](https://github.com/ethereum/consensus-specs/blob/6ea84333433a840fbd534f8ebbe9dd5e1b599115/configs/mainnet.yaml) sets Gloas to the far-future sentinel. The meta EIP leaves the row empty. | Not scheduled; date, epoch and slot stay null. The January estimate is conditional. |

## Proposals and terminology

The [pinned Glamsterdam meta EIP](https://github.com/ethereum/EIPs/blob/b055feec322fbc37e9d77a393a50b3ff56b31c92/EIPS/eip-7773.md) still schedules ePBS (7732), BALs (7928), gas changes (8037, 8038) and builder requests (8282). All five documents still say **Last Call**. It now also lists SSZ ProgressiveContainer (7495) and SSZ ProgressiveList (7916); those supporting data structures are not new Vortik anchors. EIP-8282's [revised text](https://github.com/ethereum/EIPs/blob/b055feec322fbc37e9d77a393a50b3ff56b31c92/EIPS/eip-8282.md) clarifies the different pre-fork behavior of deposits and exits. The [Gloas P2P review](protocol-watch-alert-176-review-2026-11-19.md) distinguishes proposer bid selection from network propagation.

The [pinned Hegotá meta EIP](https://github.com/ethereum/EIPs/blob/b055feec322fbc37e9d77a393a50b3ff56b31c92/EIPS/eip-8081.md) lists FOCIL (7805) and [Frame Transaction (8141)](https://eips.ethereum.org/EIPS/eip-8141) separately as **Scheduled for Inclusion**; both documents are **Draft**. ACDE debated narrowing scope and identified FOCIL as a consensus-side decision. It did not remove either proposal. Work to support different signature schemes was discussed; the linked [leanSPHINCS frames proposal](https://github.com/ethereum/EIPs/pull/12672) is not evidence of another scheduled EIP. All three Hegotá network rows remain empty. Execution proofs (8025) and BAL sidecars (8146) remain Draft and Declined for Inclusion in Hegotá; EIP-1559 remains Final. Frame Transaction is a tenth selected EIP in the context dataset, not a thirteenth registry term.

## Catalog change from November 5

The existing generator read all **1,599** Markdown inputs from the pinned [EIPs](https://github.com/ethereum/EIPs/tree/b055feec322fbc37e9d77a393a50b3ff56b31c92/EIPS) and [ERCs](https://github.com/ethereum/ERCs/tree/10eca3cea34986aeeac0af98ad061ab8928dc15d/ERCS) directories. **1,232 → 1,233** unique proposals: **607 EIPs + 626 ERCs**. The 365 moved stubs and one EIP-1 mirror account for the other 366 inputs. No excluded files, deleted proposals, or silently dropped source paths.

| Change to indexed metadata (ignoring new commit pins) | Records |
| --- | --- |
| Added, Draft | [ERC-8501: Generative Engine Optimization Framework](https://ercs.ethereum.org/ERCS/erc-8501) |
| Draft → Review | ERC-8376 |
| Review → Last Call | ERC-7963 and ERC-8330 |
| Last Call → Final | ERC-8325, 8326, 8327, 8328, 8329 |
| Description only | ERC-8049 now describes its onchain key-value metadata interface. |

No other existing indexed field changed. Additional changes to upstream specification bodies are not copied into the metadata catalog. EIP-8449 and EIP-8457 were already present on November 5. The exact technical metadata exceptions for EIP-7609 and EIP-7915 were rechecked at the new EIPs commit. See [reproduction and coverage](../ethereum-catalog.md). Registry version 0.6.5, its 12 classifications and its feed contracts retain their previous meaning. These updates describe sources, not a deployed Reception image.
