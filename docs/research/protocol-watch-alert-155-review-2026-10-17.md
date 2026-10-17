# Protocol Watch alert #155 review — 2026-10-17

This bounded freshness-impact review addresses [alert #155](https://github.com/VortikRegistry/vortik-open-schema/issues/155), which first observed devnet commit `5c4bb0b4c0b6eb47008fc4b277ba3252806a83df` on October 9. It includes the explicitly pinned later cutoff `dcc90b47b58b2fc4e2b3881d3cc2ef93017d0c56` from October 16. It does not accept future observations or establish deployed health.

## Source identities

The [complete recorded observation](../../protocol-watch/reviews/2026-10-17-alert-155-observation.json) covers all ten configured sources. The six watched EIP blobs and statuses, the two Gloas specification blobs and the ethereum.org roadmap blob match the accepted October 8 baseline. Only `glamsterdam-devnets-head` changes, from `859bb47b59621384888b64eeb6c1d4cab0724ec7` to the cutoff above.

Evidence combines read-only GitHub file metadata for the three non-EIP files with local immutable Git objects for EIPs and devnets. It is not represented as a successful live execution of the network watcher. The same complete observation must produce one devnet difference against the old baseline and zero against the proposed one.

## Complete path coverage

The [raw path and blob inventory](../../protocol-watch/reviews/2026-10-17-alert-155-devnets-paths.txt), generated with rename detection disabled, has SHA-256 `8a000c4f4a21f412fd988018916c7de5a71f925d11f8c9c704b25d48a5f0f5a1`. It contains **1,954 records: 1,839 additions, 17 modifications and 98 deletions**. With default rename detection, Git reports 1,858 records, including 96 byte-identical renames. These are equivalent views of the same endpoint comparison; no Compare API file limit is involved.

| Path group | Records | Review treatment |
| --- | ---: | --- |
| README, workflow and ignore file | 3 | Read network-status and sync-workflow changes. |
| `ansible/` | 76 | Accounted for new inventories, profiling and workload setup; read relevant snapshot/load configuration changes. Encrypted settings remain opaque. |
| `kubernetes/` and `kubernetes-archive/` | 374 | Accounted for archived msf-1, msf-2 and devnet-12 service trees. Bundled charts are inventoried, not dependency-audited. |
| `md/` | 1,445 | Operational reports, generated monitoring evidence and plots. Read report summaries; do not revalidate every captured sample or infer present runtime health. |
| `network-configs/` | 30 | Read fork and chain identifiers in devnet-12 and msf-2 configuration; generated allocations and binary consensus state are inventoried, not consensus-validated. |
| `scripts/` | 8 | Read changed shadowfork normalization, funding order, pre-genesis checks and the monitor's documented scope. No upstream executable was run. |
| `terraform/` | 18 | Accounted for new devnet-12 and msf-2 infrastructure definitions. No plan or deployment was executed. |
| **Total** | **1,954** | **All changed paths are accounted for; review depth differs by category.** |

## Findings relevant to Vortik

**Testing environment lifecycle.** Upstream records msf-1 and msf-2 teardown and archives devnet-12 services. At the cutoff the README still calls devnet-12 WIP, so its label is not treated as runtime evidence. The `msf-2` configuration uses Gloas at epoch zero and inherited execution chain ID 1; `devnet-12` uses chain ID 706430921 and Gloas epoch 225. Neither configuration provides Ethereum mainnet's activation schedule.

**Client investigation evidence.** The October 12 benchmark and October 14 follow-up report missed proposals associated with local payload timeouts despite external bids, Engine response delays and memory pressure in particular client pairings. These are upstream observations from a bounded shadowfork workload, not a Vortik reproduction, a current client ranking or a mainnet incident. They support keeping implementation readiness distinct from EIP document status and network announcements. The site makes no assertion that all tested clients are issue-free.

**Operational changes.** The devnet-8 sync workflow adds an every-other-day schedule, moves defaults to client development images and enables Snap2 flags for Besu and Geth. Shadowfork tools add explicit transaction/blob load, post-Amsterdam snapshot handling, builder-request contract presence checks and a nonempty peer-set requirement. Those changes concern upstream testing. They do not introduce a new term or require a canonical registry, schema or feed change here.

The review does not audit all upstream code, dependencies, telemetry samples, secrets or infrastructure. It uses complete path accounting and targeted primary-source reads to assess the existing site's claims. No decryption, upstream script execution, test-network query or infrastructure mutation was performed.

## Disposition and reproduction

Advance only the devnet fingerprint through the maintainer-authorized PR process. Preserve the other nine fingerprints and all watched EIP statuses. The [separate public-content follow-up](protocol-freshness-2026-10-17.md) uses the new Foundation announcement and merged Hoodi configuration for Sepolia/Hoodi facts; those facts are not inferred from this devnet review. The watch's ten sources do not cover every Foundation announcement.

Reproduce the inventory from the upstream Git checkout:

```bash
git diff --raw --no-abbrev --no-renames \
  859bb47b59621384888b64eeb6c1d4cab0724ec7 \
  dcc90b47b58b2fc4e2b3881d3cc2ef93017d0c56 > devnets-paths.txt
sha256sum devnets-paths.txt
```

Run public-safety checks, repository validation and the existing detector/notifier tests before merge. Keep #155 open until this reference is merged and the normal publication checks finish. A later upstream change belongs to another dated review and must not silently extend this cutoff.
