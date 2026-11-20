# Protocol Watch alert #176 — source review, 2026-11-19

[Issue #176](https://github.com/VortikRegistry/vortik-open-schema/issues/176) opened on November 10 for one Gloas P2P file. The [new observation](../../protocol-watch/reviews/2026-11-19-alert-176-observation.json) checks all eleven configured sources; four differ from the November 5 baseline. The observation began on November 19 in Argentina (November 20 at 01:18:33 UTC). The starting alert is not the final state.

## Gloas P2P: proposer choice and network propagation

File: [specs/gloas/p2p-interface.md at the reviewed commit](https://github.com/ethereum/consensus-specs/blob/6ea84333433a840fbd534f8ebbe9dd5e1b599115/specs/gloas/p2p-interface.md). The previous baseline blob was `1e0dca6e5ab6a83c3f4536b69bcca4bcd1c5bdcc`; the alert reported `ddfb99010040d826294f58bd275d890cc462ede0`. The following are all subsequent changes to that path since the previous review, in order.

| Date | Merged change | Effect on the source note |
| --- | --- | --- |
| Nov 10 | [#5774](https://github.com/ethereum/consensus-specs/pull/5774) · [67e437d](https://github.com/ethereum/consensus-specs/commit/67e437d9eb6a93f8ccb63a517eefd88672010bdb) | Adds proposer guidance about later, higher bids from the same builder for a slot and parent. |
| Nov 11 | [#5805](https://github.com/ethereum/consensus-specs/pull/5805) · [1a48161](https://github.com/ethereum/consensus-specs/commit/1a48161515966f9c843672fa500861845ddc75d8) | Replaces first-bid-only gossip with a per-builder count for the slot and parent, bounded by stake. |
| Nov 12 | [#5821](https://github.com/ethereum/consensus-specs/pull/5821) · [44be323](https://github.com/ethereum/consensus-specs/commit/44be32373afdb87496f3f68c1668f7e7d72aa662) | Adds consistency checks between the payload envelope, its block, bid and expected state. This is a separate validation change. |
| Nov 19 | [#5843](https://github.com/ethereum/consensus-specs/pull/5843) · [6ea8433](https://github.com/ethereum/consensus-specs/commit/6ea84333433a840fbd534f8ebbe9dd5e1b599115) | Deducts pending builder withdrawals before counting whole ETH for the gossip limit. A proposer should consider a higher bid for its own block; bids beyond the forwarding limit are not relayed. |

The final file blob is `672419f577092cf586388cebcaaefbde27268c8f`. The first alert alone would miss both the revised limit and the distinction between local consideration and gossip. Nothing here changes the document lifecycle, the upgrade assignment, or Vortik's classifications.

## Three other changes

- **EIP-7773** ([full interval](https://github.com/ethereum/EIPs/compare/af5ea76669821d1eb8dfc60e3373a0a7fa9a7759...b055feec322fbc37e9d77a393a50b3ff56b31c92)): added 7495/7916 to the scheduled list and cleared the obsolete Hoodi timing. The document stays Review.
- **EIP-8282** ([revision](https://github.com/ethereum/EIPs/commit/253f6bd20d1b1b600228c0d696775a90720ba5f1)): the text aligns with the assembly reference, adds the explicit EIP-7997 dependency and clarifies queue behavior, exit initialization and byte order at dequeue. The document stays Last Call and the Glamsterdam assignment is unchanged.
- **Glamsterdam devnets** ([immutable comparison](https://github.com/ethpandaops/glamsterdam-devnets/compare/eda124015e090c1b43d0ccd4025c61795975ed46...0ff9c3ad592c7dd466907bc82f7778f65c4a23c0)): seven commits and sixteen net paths. The [inventory](../../protocol-watch/reviews/2026-11-19-alert-176-devnets-inventory.json) accounts for ten modified files, three removed archives and three replacement archives. Scope: devnet-8 synchronization workflow, inventory changes and the Platåberget authenticator, faucet and faucet-agent charts. Path metadata and relevant textual changes were read; no encrypted inventory was opened or decrypted, no chart or operator command was executed. These are test infrastructure changes, not a change to the public testnet or mainnet calendars.

Seven fingerprints are unchanged, including the Gloas beacon-chain file, Hoodi network configuration and the four other watched EIPs. The corrected [network and catalog review](protocol-freshness-2026-11-19.md) records the editorial effects. Only the four reviewed fingerprints are advanced in this candidate. Replaying the saved observation should yield four changes against the former baseline and zero against this one. No watcher policy or trigger changes. Close the issue only after maintainer review, merge, publication verification and a fresh watch check; subsequent drift needs its own review.
