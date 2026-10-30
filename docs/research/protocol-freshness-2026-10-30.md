# Ethereum source follow-up — 2026-10-30

## What changed

Hoodi's October 26 Glamsterdam activation was postponed. The [October 22 Foundation notice](https://blog.ethereum.org/2026/10/22/glamsterdam-hoodi-delay) supersedes the earlier announcement and identifies investigation of EIP-8037 interactions with existing contracts as the reason. It supplies no replacement date. This review therefore removes the old Hoodi time, epoch and slot from the current context instead of interpreting an elapsed date as activation.

The [original announcement](https://blog.ethereum.org/2026/10/16/glamsterdam-hoodi-announcement) now carries an explicit supersession notice. Its report of Sepolia activation on October 6 is retained separately; Vortik has not performed a live chain-health check. Neither announcement schedules mainnet.

## Conflicting schedule evidence

At EIPs commit `c1ff0a992ef65c0321b098a890b6d1c44b3fdb93`, [EIP-7773](https://github.com/ethereum/EIPs/blob/c1ff0a992ef65c0321b098a890b6d1c44b3fdb93/EIPS/eip-7773.md) still contains the old Hoodi epoch 132352 and timestamp 1793036568. That row is preserved here as conflicting evidence, not used as the current schedule. The later Foundation notice explicitly cancels it.

The official Hoodi repository corroborates the postponement at commit `2a7efb3c530cce7c71702cc98d0f965df2411c11`:

- [Consensus configuration](https://github.com/eth-clients/hoodi/blob/2a7efb3c530cce7c71702cc98d0f965df2411c11/metadata/config.yaml), blob `884ff8091fc767e8c31a93911d95149aed897e0f`, contains no Gloas activation or scheduled 200M gas-limit increase.
- [Execution genesis configuration](https://github.com/eth-clients/hoodi/blob/2a7efb3c530cce7c71702cc98d0f965df2411c11/metadata/genesis.json), blob `0611aa4ec04574e0af392e98816cdab47b867b57`, contains no `amsterdamTime`.

Hoodi becomes `not_scheduled` with explicit null timing in the existing context contract. This represents the absence of a replacement schedule, not a new lifecycle state or an assertion that Hoodi itself is offline. Mainnet remains `not_scheduled`. EIP-8081 still leaves all three Hegotá activation rows empty.

## Selected proposals and implementation meaning

The nine EIPs below were checked at the pinned EIPs commit. Their document states and fork assignments are unchanged from the previous selected review:

| EIP | Document state | Reviewed assignment |
| --- | --- | --- |
| 1559 | Final | No historical fork assignment reviewed here |
| 7732 | Last Call | Glamsterdam: scheduled |
| 7805 | Draft | Hegotá: scheduled |
| 7928 | Last Call | Glamsterdam: scheduled |
| 8025 | Draft | Hegotá: declined |
| 8037 | Last Call | Glamsterdam: scheduled |
| 8038 | Last Call | Glamsterdam: scheduled |
| 8146 | Draft | Hegotá: declined |
| 8282 | Last Call | Glamsterdam: scheduled |

EIP-7773 remains Review; EIP-8081 remains Draft. The selected Last Call documents retain a November 1 deadline. Reaching that date must not automatically change their status to Final.

The complete before/after EIP-7928 diff adds an explicit encoding rule: integer fields use minimal unsigned big-endian RLP, without leading-zero padding; addresses are 20-byte strings and bytecode is variable length. Encoding the same numerical value differently changes the committed BAL hash. Examples now use integer storage keys and explicit wei balances. This clarification matters to implementations; it creates no new Vortik term or deployment claim.

The watched EIP-7732 change is description wording. The EIP-7773 diff normalizes description/title typography without changing membership or its still-stale schedule. The ethereum.org roadmap change is its description. The Gloas beacon-chain change corrects an EIP-7521 comment reference to EIP-7251. Full file-pair diffs were inspected, including Git blob identity verification. The separate [watch review](protocol-watch-alert-170-review-2026-10-30.md) records fingerprints and devnet scope.

## Proposal catalog refresh

The catalog is regenerated from official, pinned source objects:

| Repository | Commit | Markdown inputs | Canonical records |
| --- | --- | ---: | ---: |
| ethereum/EIPs | `c1ff0a992ef65c0321b098a890b6d1c44b3fdb93` | 970 | 605 |
| ethereum/ERCs | `3dcfe69f22810eae4ef90fba4f8ac3c3cb227eaf` | 626 | 625 |

All 1,596 inputs are accounted for: **1,230 proposals**, 365 moved stubs and one mirror; none excluded. Both licenses are CC0-1.0. This is a metadata snapshot, not a full technical audit of every proposal.

Six Draft records are new: EIP-8408 (indexed cell requests), EIP-8425 (quantum freeze and account recovery), EIP-8435 (last-written block in PBT leaves), EIP-8450 (post-quantum consensus key registry), ERC-8426 (wallet pass extension for NFTs), and ERC-8441 (hybrid post-quantum stealth addresses). These are discoverable proposals, not claims of fork inclusion or production readiness.

Three existing document states change: ERC-7963 and ERC-8262 move from Draft to Review; ERC-8330 moves from Last Call back to Review. Eighteen other records have title/description edits, including ERC-7902's frame-transaction description. No existing record is removed. The two source-bound public-safety exceptions for EIP-7609 and EIP-7915 were rechecked and retain exactly the same technical wording; only their pinned source commit changes.

## Publication scope and limits

The update corrects the homepage, protocol context, linked source notes and catalog, preserves historical reviews with a forward link, and adds official Hoodi configuration coverage to the existing watcher. It preserves registry v0.6.5, canonical classifications, schema contracts, feeds, runtime and packaged snapshots, infrastructure, analytics, sitemap and the existing reading guide.

Source review does not prove current Cloud Run health, message delivery, ENS ownership, or mainnet activation. It does not deploy the beacon. Other research/application notes keep their earlier review dates. Validate source reproduction, context regressions, watcher boundaries, public safety and the full repository before publishing; verify the deployed artifacts after merge.
