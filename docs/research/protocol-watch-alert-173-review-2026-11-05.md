# Protocol Watch alert #173 review — 2026-11-05

[Alert #173](https://github.com/VortikRegistry/vortik-open-schema/issues/173) reports one source change: `ethpandaops/glamsterdam-devnets`, from `c8c460fcb1c5d3da5619c09a6440727a09bf7f5a` to `eda124015e090c1b43d0ccd4025c61795975ed46`. The [saved observation](../../protocol-watch/reviews/2026-11-05-alert-173-observation.json), started at `2026-11-05T20:12:27.222Z`, checks all eleven sources and reproduces that single change. All ten other fingerprints remain unchanged.

## Complete inventory and bounded review

The [immutable comparison](https://github.com/ethpandaops/glamsterdam-devnets/compare/c8c460fcb1c5d3da5619c09a6440727a09bf7f5a...eda124015e090c1b43d0ccd4025c61795975ed46) returned all nine commits and 98 files, below GitHub's 300-file comparison limit. The [machine-readable inventory](../../protocol-watch/reviews/2026-11-05-alert-173-devnets-inventory.json) records every path, status, previous path for renames and final blob. Counts use GitHub rename detection: 76 renames, 17 modifications and five additions.

| Group | Paths | Review treatment |
| --- | ---: | --- |
| README | 1 | PBT-1 marked ended; links to final snapshots and archived tooling. |
| `ansible/` | 13 | Default inventory restored to devnet-8; PBT client image, migration, restart and observability configuration changes inspected as experiment records. |
| `kubernetes-archive/` | 76 | Moves from `kubernetes/pbt-1/`, all with zero content changes. Inventory reviewed; charts not executed or dependency-audited. |
| `md/` | 5 | Launch history, self-conversion trial scope/results, activation incident outcome, final snapshots and metrics/log access guide assessed for implications for Vortik's public claims. |
| `scripts/` | 2 | Final snapshot transfer tooling and shadowfork firewall helper scoped as operational procedures; no commands executed. |
| `terraform/` | 1 | PBT external-peer firewall allowlist change; no plan or deployment. |

This is a bounded assessment of source drift and public-claim relevance, not a line-by-line audit of upstream code, validation of measurements, or an independent reconstruction of the experiment.

## Findings

The upstream [activation incident record](https://github.com/ethpandaops/glamsterdam-devnets/blob/eda124015e090c1b43d0ccd4025c61795975ed46/md/pbt-1-activation-incident-2026-10-29.md) reports that the experimental PBT-1 switch occurred, followed by client memory/restart problems, a period without finality and recovery. It is later evidence than the preparation and launch record assessed on October 30; the earlier absence of post-switch evidence should not be repeated as a current claim.

The [final snapshot report](https://github.com/ethpandaops/glamsterdam-devnets/blob/eda124015e090c1b43d0ccd4025c61795975ed46/md/pbt-1-final-snapshots-2026-10-30.md) reports a common final head at block 24,558,379 across nine execution clients before freezing the fleet. The final commit records teardown and archival of PBT-1. These reports describe an experimental shadowfork, even though its configuration uses chain ID 1. They do not establish public-mainnet activation or alter Hoodi's postponed schedule.

No Hoodi, Sepolia or public-mainnet configuration path changed in this comparison. No RPCs, nodes, large snapshot archives, metrics services or infrastructure were accessed. Source repositories and textual metadata were read; upstream operational instructions were not performed.

## Acceptance

Advance only the reviewed devnet fingerprint, retain all other source fingerprints, and record this assessment in the baseline. Comparing the saved observation with the old baseline must yield one change and with the reviewed baseline zero. The watcher remains an evidence detector and does not approve its own baseline or edit canonical registry state.

Run public-safety, full repository validation, detector/notifier tests and catalog reproduction. Close #173 after the reviewed PR is merged and the publication artifacts are verified. A later upstream change requires a new assessment.
