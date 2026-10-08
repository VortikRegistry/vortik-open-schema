# Protocol Watch review — 2026-10-08

This review completes the **file-inventory gap** recorded in the [October 8 follow-up](protocol-freshness-2026-10-08.md) for [alert #144](https://github.com/VortikRegistry/vortik-open-schema/issues/144). It proposes accepting the ten source fingerprints below through the project's human-reviewed PR process. The branch is a proposal until that approval and merge; this document does not itself accept the main-branch baseline or close the alert.

The scope is freshness impact on Vortik's existing public claims. Complete path coverage is not a line-by-line audit of all upstream code, generated genesis states, bundled dependencies or deployed networks.

## Revalidated source identities

A read-only run of the existing watcher completed at **2026-10-08T04:01:28.065Z**. All ten identities match the earlier October 8 review. Nine differ from the September 13 baseline; EIP-7805 does not.

| Source | Proposed blob SHA / repository commit | Disposition |
| --- | --- | --- |
| EIP-7732 | `947683d4fe49da8870026cb69c6d9ff8d7d4d6d8` | Last Call metadata already reflected by the earlier follow-up. |
| EIP-7773 | `c6b80d7f3d36bcb5d041ca30c6026133602900ea` | Review; schedule and title changes already covered. A past schedule does not establish activation. |
| EIP-7805 | `0a3955d9e8772b7666f560402b2d81ae032a3d06` | Unchanged; Draft. |
| EIP-7928 | `f5828f59cd5073eca7856b62c6d16389d5a2c09d` | Last Call; access-cost, empty-list, key-ordering and size-discussion changes covered by the earlier follow-up. |
| EIP-8081 | `2f0d5c497eca41ee9a13f2aef2598e4ed3ec1597` | Draft; selected Hegotá assignments already reflected in the structured context. Other proposal lists are not a complete fork-assignment dataset in Vortik. |
| EIP-8282 | `13b923d8effa18ec5eae90c9c5072950539aa0f9` | Last Call metadata already reflected by the earlier follow-up. |
| ethereum.org Glamsterdam roadmap | `d6a26c8d19a6e8370be70b112bd92b17f93eb709` | Supplementary proposal-list changes covered. EIP-7773 takes precedence over the roadmap's stale Draft wording. |
| Gloas beacon-chain specification | `68ef6e61d33cdc185cdb5fc17b8dd6e8cb63b699` | PTC fork boundary, settlement ordering, withdrawal accounting and builder-index reuse changes covered. |
| Gloas P2P specification | `1e0dca6e5ab6a83c3f4536b69bcca4bcd1c5bdcc` | Retention arithmetic, fork-boundary rejection, signature domain and envelope-serving changes covered. |
| Glamsterdam devnets | `788b03c81be76170e87ea382722f778193634997` | Complete Git inventory and the bounded impact review below replace the truncated comparison. |

The file paths and primary repositories are defined in [`config/protocol-watch.json`](../../config/protocol-watch.json). File fingerprints identify immutable Git blobs, retrievable at `https://api.github.com/repos/OWNER/REPO/git/blobs/SHA`. The previous accepted fingerprints are retained in Git history and in the earlier alert; the watcher configuration is unchanged.

## Complete devnet inventory

The comparison uses the full Git object history for [ethPandaOps Glamsterdam devnets](https://github.com/ethpandaops/glamsterdam-devnets), from [`42166f755d6aedca08e4747d2df94e2a6e4199dd`](https://github.com/ethpandaops/glamsterdam-devnets/tree/42166f755d6aedca08e4747d2df94e2a6e4199dd) to [`788b03c81be76170e87ea382722f778193634997`](https://github.com/ethpandaops/glamsterdam-devnets/tree/788b03c81be76170e87ea382722f778193634997). It does not depend on the Compare API's 300-file response.

Git's default rename detection reports **614 changes**: 482 additions, 19 modifications, one deletion and 112 renames. Of the renames, 110 are byte-identical, one has 99% similarity and one has 84% similarity. Disabling rename detection yields **726 path records**: 594 additions, 19 modifications and 113 deletions. These are two representations of the same endpoint comparison, not conflicting totals.

The complete [path and blob inventory](../../protocol-watch/reviews/2026-10-08-devnets-paths.txt) records both object identities, modes, status and path for every record. Its SHA-256 is `64e82369d091d6c91edcdf117f9cd8df573d75c1a4527614d7482c168f0967a3`.

| Path group, with rename detection disabled | Records | Review treatment |
| --- | ---: | --- |
| README and `md/` | 2 | Read the status changes and the devnet-8 faucet rollout record as upstream operational reports. |
| `.github/workflows/` | 2 | Syncoor moves from devnet-7 to devnet-8 with revised client-image defaults. |
| `ansible/` | 111 | Reviewed existing-network deltas and shadowfork setup intent, fork configuration, snapshot restoration and client adaptations. Encrypted settings remain opaque. |
| `kubernetes/` and `kubernetes-archive/` | 534 | Accounted for active/archived service trees, archive blob equivalence, service resources, faucet persistence and msf-1 test concurrency. Bundled charts are inventoried, not dependency-audited. |
| `network-configs/` | 40 | Identified generated network material and inspected genesis/configuration fields distinguishing the three shadowforks. Binary consensus states and full allocation/state contents are not consensus-validated. |
| `scripts/` | 7 | Read the purpose and relevant logic for shadowfork funding, genesis normalization, peer isolation, pre-genesis checks and prestate creation/import. No script was executed. |
| `terraform/` | 30 | Accounted for shadowfork infrastructure, devnet-8 host sizing and devnet-9 formatting changes. No infrastructure plan or apply was run. |
| **Total** | **726** | **Every changed path is present; no Compare API truncation remains.** |

## Findings and impact on Vortik

**Archived environments.** All 111 devnet-11 Kubernetes paths move to the archive. Direct blob comparison confirms that 110 are identical; the remaining Tracoor values file changes its image tag. The `sepsf-1` and `sepsf-2` service trees are also in the archive at the reviewed head. The README still labels `sepsf-2` “On” and links its former active path, while commit [`0a15736`](https://github.com/ethpandaops/glamsterdam-devnets/commit/0a15736) records its sunset. This discrepancy prevents treating that README status as current runtime evidence. Vortik's historical devnet-9 discussion does not claim that either shadowfork is currently running.

**Mainnet shadowfork testing.** The `msf-1` configuration and commit [`61aefb8`](https://github.com/ethpandaops/glamsterdam-devnets/commit/61aefb8) describe a testing environment based on benchmark snapshots, with a separate generated consensus genesis, Gloas at epoch 40 and prestate blocks for test funding and EIP-8282 contract deployment. Its execution `chainId` is 1. That inherited identifier does not make its configured fork time an Ethereum mainnet activation. The final two commits raise configured Assertoor concurrency first to six and then fourteen; a configured test count is not evidence that the tests passed.

**Client and infrastructure maintenance.** Existing-network deltas include client-image rolls, sync/debug flags, staggered update schedules, builder-host sizing, ERPC resources and Tracoor memory. New shadowfork tooling restores pinned snapshots, normalizes genesis input and restricts peer selection to avoid joining the source network. These changes concern implementation testing and operations; they do not establish new canonical terminology or alter Vortik's classifications.

**Devnet faucet operations.** The upstream devnet-8 rollout report and configuration record bounded claims, a pinned image and persistent quota history. They concern an upstream testing faucet. Vortik does not integrate or activate that faucet, import its operational data, or treat the report as independently verified service health.

**Public-claim decision.** The earlier October 8 follow-up already incorporates the relevant document lifecycle and selected fork-assignment changes. This additional review supports advancing the watch reference after human acceptance, with no further canonical registry, schema, feed, map, catalog or deployment changes. It leaves Sepolia activation unverified and does not infer a mainnet schedule from shadowfork data. Dated research records retain their stated review scope.

## Reproduction and acceptance

From a local clone of the upstream repository containing both commits, reproduce the inventory without running upstream code:

```bash
git diff --raw --no-abbrev --no-renames \
  42166f755d6aedca08e4747d2df94e2a6e4199dd \
  788b03c81be76170e87ea382722f778193634997 > devnets-paths.txt
sha256sum devnets-paths.txt
git diff --name-status --find-renames=50% \
  42166f755d6aedca08e4747d2df94e2a6e4199dd \
  788b03c81be76170e87ea382722f778193634997
```

For the Vortik proposal, run `npm run check:public-safety`, `npm run validate` and the existing Protocol Watch detector/notifier tests. The proposed baseline must match the recorded observation exactly; the prior baseline must still produce nine changes against that same observation. This prevents a quiet comparison caused by omitted sources.

The maintainer must approve the evidence scope and baseline before merge, as required by the repository constitution. Keep alert #144 open until that merge. Then compare upstream sources again: a later change requires another review rather than silently extending this cutoff. Approval covers this dated freshness reference, not upstream security, deployed health, future observations or new automation permissions.
