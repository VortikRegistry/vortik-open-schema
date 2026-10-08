# Protocol Watch alert #152 review — 2026-10-08

This review addresses [alert #152](https://github.com/VortikRegistry/vortik-open-schema/issues/152), observed at 15:21:46 UTC, and an EIP-8081 change found in the same review's **17:37 UTC cutoff**. It supplements the accepted [devnet review](protocol-watch-alert-150-review-2026-10-08.md). The proposal changes two watch fingerprints and requires human approval before merge. It does not accept future observations or close the alert by itself.

## Evidence and coverage

Read-only GitHub metadata retrieved between **2026-10-08T17:37:15.966Z** and **2026-10-08T17:37:16.717Z** covers all ten configured sources. The [complete observation](../../protocol-watch/reviews/2026-10-08-alert-152-observation.json) records their identities. Eight fingerprints and all six watched EIP document statuses are unchanged. The two changed sources are:

| Source | Accepted blob | Reviewed blob |
| --- | --- | --- |
| Gloas beacon-chain specification | `68ef6e61d33cdc185cdb5fc17b8dd6e8cb63b699` | `2dbc757d375267746fd8f1ae0090663ef4774176` |
| EIP-8081 Hegotá meta | `2f0d5c497eca41ee9a13f2aef2598e4ed3ec1597` | `ecef1753737cc9b60b1d9d086380db88f1e3dc3c` |

Both complete blob diffs were inspected. The Gloas interval corresponds exactly to upstream commit [`aa16bb4`](https://github.com/ethereum/consensus-specs/commit/aa16bb4c156184e9548a997d53efaf2a228a6304): its parent contains the accepted blob, and the commit contains the reviewed blob. The entire three-file commit was reviewed, including both test-file changes. The EIP interval corresponds exactly to [`f154af8`](https://github.com/ethereum/EIPs/commit/f154af816c4e3467ea3a86e064e4d3493ab2a8e0); its only changed file is EIP-8081, and its parent also matches the accepted blob. Retrieved source bytes reproduce all four Git blob identities.

## Gloas: pending payments and validator slashing

Previously, the Gloas-specific `process_proposer_slashing` cleared the payment associated with the proven proposal only after checking that its proposer was still slashable. The upstream commit explains that another slashing path could make that check fail before the payment was cleared.

The new Gloas override moves payment clearing into `slash_validator` and removes the specialized `process_proposer_slashing`. The shared slashing operation now iterates over `builder_pending_payments`, clearing every entry whose `proposer_index` matches the slashed validator. Entries for other proposers are retained. This covers other slashing paths as well as proposer equivocation. As upstream notes, a proposer can also lose pending payments when slashed for an unrelated reason during that payment window. The change concerns still-pending entries; it does not add a mechanism to recall settled withdrawals.

The added upstream regression case builds a block carrying a builder bid and an attester-slashing operation against that block's proposer, then checks that the proposer is slashed and its pending payment is empty. The existing proposer-slashing helper now checks all pending entries by proposer identity. These test changes were read, **not executed here**. This review is not a consensus-client security audit, interoperability test or assurance that deployed clients contain the fix.

Vortik's ePBS anchor, selected protocol context and schemas do not describe the superseded clearing algorithm. Their descriptions of proposer/builder separation, bids, payments and payload duties remain compatible with this change. The appropriate update is this implementation-facing source note and the reviewed watch reference; no term promotion or classification change follows from the correction.

## Hegotá: proposal-list changes

The EIP-8081 commit records proposal-list decisions. A complete before/after comparison gives:

| EIPs | Previous assignment | Reviewed assignment |
| --- | --- | --- |
| 4758, 5920, 7709, 8077, 8116, 8151, 8298 | Proposed for Inclusion | Considered for Inclusion |
| 8360 | Not listed in the accepted version | Considered for Inclusion |
| 7666, 8355 | Proposed for Inclusion | Declined for Inclusion |
| 7907 | Not listed in the accepted version | Proposed for Inclusion |

These are fork-assignment changes in the meta EIP, not changes to the individual EIPs' document lifecycle. EIP-8081's frontmatter remains identical, including Draft status. Its activation table is unchanged and still has no dates for Sepolia, Hoodi or mainnet.

The assignments selected by Vortik remain unchanged: EIP-7805 is Scheduled for Inclusion, EIP-8025 is Proposed for Inclusion, and EIP-8146 is Declined for Inclusion. The structured context does not claim to enumerate every Hegotá candidate. The proposal catalog indexes document metadata, not a complete set of fork assignments. This interval therefore requires no structured-context or catalog regeneration. The dated catalog snapshot retains its existing provenance.

## Disposition and limits

Propose advancing only the two fingerprints above. Preserve all other watch entries and all EIP statuses. The canonical registry, schemas, anchors, selected fork assignments, feeds, maps, catalog, package, workflows and services remain unchanged. No mainnet or Sepolia activation is inferred. Prior dated reviews retain their original scope; this note records the later changes.

No upstream scripts or tests were run, no deployed service was contacted for this review, and no infrastructure was changed. A new source change after this cutoff belongs to another review; it is not silently included to keep the detector quiet. Ongoing source maintenance does not establish completion of separate activity-measurement or deployed-service checks.

## Reproduction and acceptance

The source paths and repositories are listed in [`config/protocol-watch.json`](../../config/protocol-watch.json). Retrieve the immutable blobs using their GitHub Git Database endpoints and verify them with `git hash-object` before comparing. For example, the reviewed specification blob is available at `https://api.github.com/repos/ethereum/consensus-specs/git/blobs/2dbc757d375267746fd8f1ae0090663ef4774176`; that endpoint returns a Git Database representation, not rendered Markdown.

Reproduce the complete changes from checkouts containing the pinned commits:

```bash
git -C consensus-specs diff \
  852955a4577ecbab7480f4173543317f186aecf0 \
  aa16bb4c156184e9548a997d53efaf2a228a6304
git -C EIPs diff \
  d298b6d416a233e9369a7c705a5abf0a246d6124 \
  f154af816c4e3467ea3a86e064e4d3493ab2a8e0 -- EIPS/eip-8081.md
```

Validate the proposal with `npm run check:public-safety`, `npm run validate`, and the existing Protocol Watch detector/notifier tests. Against the complete recorded observation, the accepted baseline must produce exactly the Gloas and EIP-8081 differences; the proposed baseline must produce zero. This verifies coverage and cutoff consistency, not continued upstream freshness.

Keep #152 open until human approval and merge. Then inspect the normal main validation, the single automatic Pages publication with served-file checks, and the live watch result. If another source change appears, retain its evidence for a separate review rather than repeatedly extending this completed interval.
