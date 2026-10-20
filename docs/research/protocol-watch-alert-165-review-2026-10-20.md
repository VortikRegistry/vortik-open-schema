# Protocol Watch alert #165 review — 2026-10-20

[Alert #165](https://github.com/VortikRegistry/vortik-open-schema/issues/165) initially observed changes to EIP-7928 and the Glamsterdam devnets repository on October 19. A successful read-only watcher run at **2026-10-20T21:55:31.190Z** observed four differences against the October 17 baseline: EIP-7732, EIP-7928, EIP-8081 and devnets. The other six monitored fingerprints and all six watched EIP document statuses are unchanged.

The [recorded observation](../../protocol-watch/reviews/2026-10-20-alert-165-observation.json) preserves all ten sources. The EIP blobs match EIPs commit `cae82202be652e492ef28d2d03202a270a376dad`. Devnets are reviewed through `085b7a135cfa5456b9fb0e689291b815d4a14eb3`, including the alert's intermediate commit `b64df32d98aac351428eb1283b72a05ea06c143e`. The [content follow-up](protocol-freshness-2026-10-20.md) explains the EIP changes and the unresolved Hegotá calendar discrepancy.

## Complete devnet path coverage

The [raw inventory](../../protocol-watch/reviews/2026-10-20-alert-165-devnets-paths.txt) compares `dcc90b47b58b2fc4e2b3881d3cc2ef93017d0c56` with the pinned October 20 endpoint, with rename detection disabled. SHA-256: `b6614bc2b9e1ec1e7b416d4aacd28e19a6c219a01cbab8b4dee628d3318f6ca8`. All **213 paths** are accounted for: **203 additions, 5 modifications and 5 deletions**.

| Group | Paths | Review treatment |
| --- | ---: | --- |
| README | 1 | Adds PBT-1 as work in progress, based on MSF-2. |
| `ansible/` | 40 | PBT preparation/inventory and snapshot tooling; devnet-8 telemetry changes. Encrypted configuration is inventoried, not decrypted. |
| `kubernetes/` | 82 | PBT service definitions, telemetry versions and removal of the disabled devnet-8 relay monitor. Bundled charts are not dependency-audited. |
| `md/` | 8 | Read the migration procedure, pilot, delivery and storage-benchmark findings relevant to the public claims. |
| `scripts/` | 72 | Accounted for source preparation, replay, BAL retention/audit and publication helpers. Read the procedure and boundaries; upstream executable code was not run. |
| `terraform/` | 10 | PBT infrastructure definitions inventoried. No plan or deployment was performed. |

## Findings and disposition

Upstream's [PBT migration report](https://github.com/ethpandaops/glamsterdam-devnets/blob/085b7a135cfa5456b9fb0e689291b815d4a14eb3/md/pbt-1-migration-process.md) records four-client snapshot delivery and a controlled mixed execution/state-gas workload. It explicitly separates refreshed snapshots from completion of the migration and activation of the PBT fork. The [pilot](https://github.com/ethpandaops/glamsterdam-devnets/blob/085b7a135cfa5456b9fb0e689291b815d4a14eb3/md/pbt-1-8037-pilot-2026-10-19.md) and [storage comparison](https://github.com/ethpandaops/glamsterdam-devnets/blob/085b7a135cfa5456b9fb0e689291b815d4a14eb3/md/pbt-1-storage-benchmark-2026-10-20.md) are bounded upstream experiments, not live production evidence or Vortik reproductions. No `network-configs/` paths changed in this interval. This material establishes no new public-network activation date.

Advance the four fingerprints only after this review and the accompanying public corrections pass validation and merge. Preserve all other source fingerprints and statuses. Acceptance means the observed changes have been assessed and represented; it does **not** resolve the Hegotá discrepancy. Keep that uncertainty visible in the dated context and continue watching its upstream source.

Reproduce the inventory with `git diff --raw --no-abbrev --no-renames dcc90b47b58b2fc4e2b3881d3cc2ef93017d0c56 085b7a135cfa5456b9fb0e689291b815d4a14eb3`. The recorded observation must produce four changes against the old baseline and zero against the reviewed baseline. Run the existing detector/notifier tests, public-safety checks and complete validation. Close #165 only after merge and successful publication verification. Subsequent upstream changes require another review.
