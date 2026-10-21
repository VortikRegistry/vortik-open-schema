# Protocol source follow-up — 2026-10-20

> Calendar follow-up: the [October 21 review](protocol-freshness-2026-10-21.md) records the subsequent upstream correction. The findings below remain historical evidence for their pinned source.

This targeted review supersedes the October 17 snapshot for the nine selected EIP statuses, fork assignments and network schedules. Other research and application sources retain their own dated reviews. The separate proposal catalog remains the October 17 metadata snapshot of 1,224 proposals; it is not a live index.

## Pinned evidence

- EIPs source: [`cae82202be652e492ef28d2d03202a270a376dad`](https://github.com/ethereum/EIPs/tree/cae82202be652e492ef28d2d03202a270a376dad/EIPS), compared with `deb8f0d3ea9167bd30775fb3d45d052fce651d56`.
- The [watch review](protocol-watch-alert-165-review-2026-10-20.md) records all ten monitored sources, immutable fingerprints and the separate devnet cutoff. The October 20 observation extends the original October 19 alert; it does not silently accept future revisions.
- The [Foundation announcement](https://blog.ethereum.org/2026/10/16/glamsterdam-hoodi-announcement) was re-read on October 20. It reports Glamsterdam's Sepolia activation and schedules Hoodi for October 26, 17:42:48 UTC; it leaves mainnet undecided.

## Selected document and fork states

| EIP | Document status | Reviewed fork assignment |
| --- | --- | --- |
| 1559 | Final | Not reviewed in this dataset |
| 7732 | Last Call | Scheduled for Glamsterdam |
| 7805 | Draft | Scheduled for Hegotá; absent from Glamsterdam's scheduled set |
| 7928 | Last Call | Scheduled for Glamsterdam |
| 8025 | Draft | **Declined for Hegotá**, previously proposed |
| 8037 | Last Call | Scheduled for Glamsterdam |
| 8038 | Last Call | Scheduled for Glamsterdam |
| 8146 | Draft | Declined for Hegotá |
| 8282 | Last Call | Scheduled for Glamsterdam |

[EIP-8081 at the pinned commit](https://github.com/ethereum/EIPs/blob/cae82202be652e492ef28d2d03202a270a376dad/EIPS/eip-8081.md) moves EIP-8025, EIP-7716 and EIP-8371 to Declined for Inclusion. Only EIP-8025 is among this site's nine selected EIPs. Declined describes this fork's assignment, not withdrawal of the Draft proposal or deprecation of proof research. The proving-market anchor retains its existing classification.

## Hegotá calendar discrepancy

The pinned EIP-8081 now contains Sepolia epoch 353024 / October 6, 13:53:36 and Hoodi epoch 132352 / October 26, 17:42:48. These match the **Glamsterdam** values in the Foundation announcement. The meta EIP labels its own upgrade Hegotá, while the announcement describes Glamsterdam and its different feature set. This review cannot reconcile those identities or establish that Hegotá activated on Sepolia. Matching dates alone are insufficient.

Accordingly, Hegotá's Sepolia and Hoodi records use the existing **`unverified`** state, with null time, epoch and slot. They are no longer described as empty upstream rows. Hegotá mainnet remains `not_scheduled` because its row is empty. The source values and discrepancy are retained here rather than silently relabelled or copied into a confirmed schedule. This is a review conclusion, not a claim that the upstream table is definitively erroneous.

Glamsterdam's records remain source-reported Sepolia activation, scheduled Hoodi activation and no mainnet date. Scheduled inclusion of FOCIL remains distinct from activation. Revisit the Hegotá discrepancy when the meta EIP is clarified or a matching primary network announcement/configuration is published; the existing watcher continues monitoring EIP-8081.

## ePBS and BAL changes

[EIP-7732](https://github.com/ethereum/EIPs/blob/cae82202be652e492ef28d2d03202a270a376dad/EIPS/eip-7732.md) expands its specification summary: bids commit to execution requests, payload envelopes no longer commit to a consensus post-state root, and consensus effects of a payload are deferred to child-block processing. Pending builder payments settle through the documented payload-inclusion or attestation conditions. Dedicated builder request types, proposer preferences and reusable builder indices are clarified. This is substantive specification evolution, not just formatting. Vortik's broad separation-of-duties definition still applies; it does not implement these consensus objects.

[EIP-7928](https://github.com/ethereum/EIPs/blob/cae82202be652e492ef28d2d03202a270a376dad/EIPS/eip-7928.md) changes BAL availability through `engine_getPayloadBodiesBy*V2` from 3533 epochs to `HISTORY_PRUNE_EPOCHS` (14299 epochs). It also clarifies terminology, examples, validation wording and the provenance of size estimates. These details do not change the EIP's Last Call status or Glamsterdam assignment. Neither a measured BAL size nor a devnet report establishes mainnet readiness.

## Public changes and limits

Update the dated context, homepage, glossary and affected anchor/source notes; preserve historical reviews with explicit links to this follow-up. Use the existing `unverified` representation; no schema or runtime extension is needed. Update the existing regression assertions for the changed assignment and ensure the explorer receives null Hegotá testnet timings rather than Glamsterdam dates.

Registry version 0.6.5, its 12 entries, canonical classifications, schema definitions, feeds, catalog source lock and service deployment remain unchanged. No wallet, network-health probe, client benchmark, Cloud resource or commercial action is part of this review.
