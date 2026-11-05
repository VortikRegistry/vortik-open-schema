# Protocol source follow-up — 2026-11-05

The November 5 review preserves the October 30 protocol conclusions and refreshes the separate proposal catalog. It rechecks the nine selected EIP document states and their reviewed fork assignments. Research and application notes outside that scope retain their own review dates.

## Schedule and document state

- The [Ethereum Foundation postponement](https://blog.ethereum.org/2026/10/22/glamsterdam-hoodi-delay) still gives no replacement Hoodi activation date. The [earlier announcement](https://blog.ethereum.org/2026/10/16/glamsterdam-hoodi-announcement) explicitly marks its old schedule as superseded. No later replacement announcement was found in the Foundation's protocol announcement index during this review.
- [EIP-7773 at the reviewed commit](https://github.com/ethereum/EIPs/blob/af5ea76669821d1eb8dfc60e3373a0a7fa9a7759/EIPS/eip-7773.md) still contains the superseded Hoodi row. The explicit postponement takes precedence for the network schedule; Vortik retains `not_scheduled` and null time, epoch and slot. The monitored Hoodi configuration is unchanged from the October 30 review.
- ePBS, BALs, EIP-8037, EIP-8038 and builder requests remain Scheduled for Inclusion in Glamsterdam. Their documents still say `Last Call`; the November 1 deadline does not automatically make them `Final`.
- [EIP-8081 at the reviewed commit](https://github.com/ethereum/EIPs/blob/af5ea76669821d1eb8dfc60e3373a0a7fa9a7759/EIPS/eip-8081.md) still schedules FOCIL for Hegotá and leaves its network activation table empty. EIP-7805 is `Draft`; EIP-8025 and EIP-8146 remain `Draft` and Declined for Inclusion in Hegotá. EIP-1559 remains `Final`, without adding a historical fork assignment to this selected dataset.
- Sepolia's October 6 activation remains source-reported through the Foundation announcement. This review did not independently query chain health. Mainnet has no scheduled activation in the reviewed sources.

The eleven-source [watch observation](../../protocol-watch/reviews/2026-11-05-alert-173-observation.json), started at `2026-11-05T20:12:27.222Z`, found one changed fingerprint: the devnet repository head. The other ten fingerprints, including all six watched EIP files and Hoodi configuration, were unchanged.

## Experimental devnet evidence

The [alert #173 review](protocol-watch-alert-173-review-2026-11-05.md) accounts for all 98 changed or renamed paths across nine commits. The upstream PBT-1 records now report a binary-trie switch, client incidents and recovery, final snapshots, and October 30 teardown. These are operator reports about an experimental shadowfork. They do not activate Hoodi, establish a mainnet date, or demonstrate production readiness. The review does not execute or certify upstream software.

## Proposal metadata snapshot

The [catalog](../ethereum-catalog.md) now contains **1,232 unique proposals: 607 EIPs and 625 ERCs**, derived from all **1,598** numbered Markdown inputs. Sources are pinned to:

- `ethereum/EIPs`: [`af5ea76669821d1eb8dfc60e3373a0a7fa9a7759`](https://github.com/ethereum/EIPs/commit/af5ea76669821d1eb8dfc60e3373a0a7fa9a7759).
- `ethereum/ERCs`: [`7dafd1125fffbd3832316edeb739608ad82bb4c4`](https://github.com/ethereum/ERCs/commit/7dafd1125fffbd3832316edeb739608ad82bb4c4).

Two additions: [EIP-8449](https://eips.ethereum.org/EIPS/eip-8449), Engine API Proposal Lookahead (`Draft`, Standards Track/Core), and [EIP-8457](https://eips.ethereum.org/EIPS/eip-8457), Batched KZG Point Evaluation via EIP-2537 (`Draft`, Informational). There are no removals or changes to the copied title, description, status, type or category of existing records. New source commits are provenance updates, not lifecycle transitions.

Upstream specification bodies and assets changed for EIP-7851, EIP-8141, EIP-8151, EIP-8450, ERC-8259 and ERC-8348. The catalog indexes selected frontmatter, not those bodies or implementations. In particular, ERC-8259's actual frontmatter still says `Draft`; a commit title mentioning Review is not substituted for the file contents. The two technical metadata exceptions in the publication check were rechecked verbatim against EIP-7609 and EIP-7915 and rebound only to the new EIPs commit.

The 365 moved ERC stubs and one mirrored EIP-1 account for the same 366 duplicate numbers. No source input was excluded. The canonical registry remains version 0.6.5 with 12 anchors; its classifications, schemas and feeds are unchanged. Neither the source review nor catalog refresh verifies a deployed service or ENS ownership/resolution.
