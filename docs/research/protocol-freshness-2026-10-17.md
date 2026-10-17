# Ethereum source follow-up — 2026-10-17

This review updates the public reference from the [October 8 snapshot](protocol-freshness-2026-10-08.md). The review date uses UTC; the principal new announcement was published on October 16. It covers selected proposal metadata, fork assignments, network announcements and catalog extraction. Other research and application notes retain their September 30 review.

## Network state and schedule

The [Foundation's October 16 announcement](https://blog.ethereum.org/2026/10/16/glamsterdam-hoodi-announcement) explicitly reports that Glamsterdam activated on Sepolia on October 6. This supplies the activation evidence missing from the earlier review. Hoodi is scheduled for October 26, while mainnet remains undated.

| Network | Recorded state | UTC time | Epoch | Slot |
| --- | --- | --- | ---: | ---: |
| Sepolia | Reported active | 2026-10-06 13:53:36 | 353024 | 11296768 |
| Hoodi | Scheduled | 2026-10-26 17:42:48 | 132352 | 4235264 |
| Mainnet | Not scheduled | — | — | — |

Sepolia's exact time, epoch and slot retain the [published schedule](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement); the newer announcement supplies the report of activation. These sources do not constitute an independent chain-health or finality check. Hoodi remains a future event at this review's cutoff.

The Hoodi time is corroborated by merged [eth-clients/hoodi PR #31](https://github.com/eth-clients/hoodi/pull/31), commit [`ef8998901c1350f41a0bcc0a2a8d4baad973abcf`](https://github.com/eth-clients/hoodi/commit/ef8998901c1350f41a0bcc0a2a8d4baad973abcf). Its [consensus configuration](https://github.com/eth-clients/hoodi/blob/ef8998901c1350f41a0bcc0a2a8d4baad973abcf/metadata/config.yaml) sets Gloas epoch 132352 and a 200,000,000 gas limit at that epoch; its execution configurations use timestamp 1793036568. The genesis-time calculation agrees: `1742213400 + 132352 × 384 = 1793036568`, and `132352 × 32 = 4235264`.

## Resolving differences between primary sources

- The pinned EIP-7773 activation table still leaves Hoodi blank. The later Foundation announcement and merged Hoodi configuration supply the schedule; a blank older table does not override them.
- The reviewed [Ethereum PM schedule](https://github.com/ethereum/pm/blob/master/glamsterdam-pm.md) lists the same Hoodi UTC time, epoch and slot but timestamp `1793134872`. That timestamp disagrees with both the date arithmetic and the merged configuration. This snapshot uses `1793036568`, as the configuration and announcement agree. The PM link is mutable and this discrepancy is dated to this review.
- The watched ethereum.org roadmap blob is unchanged from October 8 and still presents an earlier testing milestone. It is not used to override the newer activation report.

## Proposal states and implications

The selected document states are unchanged at EIPs commit `deb8f0d3ea9167bd30775fb3d45d052fce651d56`: EIP-1559 is Final; EIPs 7732, 7928, 8037, 8038 and 8282 are Last Call; EIPs 7805, 8025 and 8146 are Draft. The five Last Call proposals retain their November 1 deadline. EIP-7773 remains Review and EIP-8081 remains Draft.

The selected fork assignments also remain unchanged: ePBS, BALs, builder requests and the two gas-accounting proposals are scheduled for Glamsterdam; FOCIL is scheduled for Hegotá, optional execution proofs are proposed, and BAL sidecars are declined. Hegotá network dates remain unset. Neither a document status nor a testnet activation promotes a Vortik anchor or establishes mainnet activation.

For operators and application developers, the linked Hoodi announcement provides the upgrade instructions and client-release references. The earlier [repricing testing guide](https://blog.ethereum.org/2026/08/24/glamsterdam-repricing-testing) explains why fixed gas assumptions merit testing. Vortik's static reference does not execute contracts, manage validators or require a wallet migration for this content update.

## Catalog refresh

The existing generator extracted metadata from pinned official Git objects:

| Repository | Commit | Markdown inputs | Unique records |
| --- | --- | ---: | ---: |
| ethereum/EIPs | [`deb8f0d3ea9167bd30775fb3d45d052fce651d56`](https://github.com/ethereum/EIPs/commit/deb8f0d3ea9167bd30775fb3d45d052fce651d56) | 966 | 601 |
| ethereum/ERCs | [`4dec821bcb7dfbd739c843dcb7247e750781dd55`](https://github.com/ethereum/ERCs/commit/4dec821bcb7dfbd739c843dcb7247e750781dd55) | 624 | 623 |

All 1,590 inputs are accounted for: **1,224 unique records**, 365 moved stubs and one mirror, with no excluded files. Both pinned licenses remain CC0-1.0. This is a metadata review, not an audit of every specification body.

The 15 additions are EIPs **8247, 8317, 8357, 8358, 8364, 8374, 8397 and 8433**, and ERCs **7963, 8176, 8259, 8348, 8376, 8436 and 8444**. All enter this snapshot as Draft. Their inclusion in search does not imply adoption, fork inclusion or a Vortik implementation commitment.

Three existing lifecycle fields changed: EIP-7979 and EIP-8173 move from Draft to Review; ERC-8153 moves from Last Call to Final. ERC-1613's title capitalization and EIP-8130's description changed. No record was removed. The comparison excludes per-record source commits, which advance with the source lock.

The two exact safety exceptions for technical metadata in EIP-7609 and EIP-7915 retain identical wording; their commit binding is updated after checking the regenerated fields. The safety check remains enabled. See [catalog provenance and reproduction](../ethereum-catalog.md).

## Watch review and scope

The [separate alert #155 review](protocol-watch-alert-155-review-2026-10-17.md) accounts for the complete devnet path inventory and the ten configured watch identities. It reviews upstream operational material for its effect on this site's claims; it does not treat shadowfork activity as mainnet activation.

This update changes public editorial context, the metadata catalog and a dated watch reference. Canonical registry version 0.6.5, its identities and classifications, schemas, feeds, maps and services keep their existing definitions. Search Console verification and sitemap configuration are preserved. Website publication does not refresh or verify the separate agent runtime. Validation and publication results belong to the associated pull request and workflow runs.
