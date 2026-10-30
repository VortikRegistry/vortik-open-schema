# Protocol Watch alert #170 review — 2026-10-30

[Alert #170](https://github.com/VortikRegistry/vortik-open-schema/issues/170) initially reported devnet head `1905f08cb72ea7b0c6832708d909d18b291a3222` on October 22. The October 30 observation covers all ten prior sources and the newly allowlisted official Hoodi consensus configuration. It records six changed prior fingerprints and one new source, with the other four fingerprints and all six watched EIP document states unchanged.

The [complete observation](../../protocol-watch/reviews/2026-10-30-alert-170-observation.json) began at **2026-10-30T15:57:03.761Z**. The [content review](protocol-freshness-2026-10-30.md) explains the public corrections. This is bounded source assessment, not certification of upstream software or network health.

## Reviewed file pairs

| Source | Previous blob | Reviewed blob | Finding |
| --- | --- | --- | --- |
| EIP-7732 | `ffb4ba18e44307f58d2a19c33fb7339d5c5fd9c2` | `5baf745271ab7dce5863c1be123ddb783987bd44` | Description wording only |
| EIP-7773 | `94b90da54273434f67e263527c0d08f5e4793cfb` | `3b0d9db14e6a1069652045329101d907d0b739c8` | Description/title typography; Hoodi row still retains superseded date |
| EIP-7928 | `da3508ff6d73d53c9ffa9fc55f0724fb4c99198b` | `3c4d4ad300e4946303db45710bba02cfb836f9eb` | Explicit integer RLP encoding and corrected examples |
| ethereum.org Glamsterdam | `d6a26c8d19a6e8370be70b112bd92b17f93eb709` | `b229c9a3a238605e10434d8775634c0a40c30121` | Page description only |
| Gloas beacon chain | `2dbc757d375267746fd8f1ae0090663ef4774176` | `f6d01d30ee8d29a4f30f9024872d389b4d1bb571` | Comment reference EIP-7521 corrected to EIP-7251 |
| Hoodi consensus config | New source | `884ff8091fc767e8c31a93911d95149aed897e0f` | No Gloas activation or scheduled gas-limit increase; corroborates postponement |

Complete file-pair differences were inspected. Source blob identities were verified. The three EIP blobs match pinned EIPs commit `c1ff0a992ef65c0321b098a890b6d1c44b3fdb93`. The new Hoodi source is fixed to the existing official repository and `metadata/config.yaml` path; it uses the same bounded detector and does not add a new schedule, service or automatic editor.

## Complete devnet inventory

The GitHub comparison response reached its 300-file limit, so it was not accepted as complete. A local comparison of immutable Git trees, with rename detection disabled, accounts for **398 paths: 352 additions, 45 modifications and one deletion**. The [raw inventory](../../protocol-watch/reviews/2026-10-30-alert-170-devnets-paths.txt) has SHA-256 `3af08a6bd81dcbc11341cc1839c080ff8fc187bd675394d84e6d10ec3e7f372c`.

Endpoints: `085b7a135cfa5456b9fb0e689291b815d4a14eb3` → `c8c460fcb1c5d3da5619c09a6440727a09bf7f5a`, including the alert's intermediate head. All paths are assigned below; inventory coverage is not a line-by-line code or dependency audit.

| Group | Paths | Treatment |
| --- | ---: | --- |
| `ansible/` | 142 | PBT/HSF inventories, preparation and recovery, default PBT selection, devnet-8 image pins. Encrypted files inventoried, not decrypted. |
| `kubernetes-archive/` | 106 | HSF-0 tooling retained after teardown; manifests/charts inventoried, not deployed or dependency-audited. |
| `kubernetes/` | 14 | PBT tooling, observability and migration-progress presentation. |
| `scripts/` | 81 | PBT preparation/recovery plus two shadowfork helpers; procedures scoped without executing upstream code. |
| `network-configs/` | 27 | PBT-1 and HSF-0 configuration/genesis/discovery artifacts; no Hoodi, Sepolia or mainnet configuration path. |
| `terraform/` | 16 | PBT/HSF infrastructure definitions; no plan or deployment run. |
| `md/` | 9 | Read the launch/handoff record, experiment boundaries and coverage context relevant to public claims. |
| Root files | 3 | `.gitattributes`, `requirements.txt`, `setup.sh`; source-preservation and dependency-bootstrap changes, not protocol adoption evidence. |

The upstream [PBT handoff](https://github.com/ethpandaops/glamsterdam-devnets/blob/c8c460fcb1c5d3da5619c09a6440727a09bf7f5a/md/pbt-1-launch-handoff.md) records a nine-worker launch and staged migration, an observation-window exception, deferred independent reconstruction and client issues. Its generated configuration identifies a test network with October 22 genesis. These records do not demonstrate a successful October 29 PBT activation, a completed migration, or any public-network upgrade. The later HSF teardown and tooling changes do not supply that missing evidence. No upstream scripts, RPCs, nodes or infrastructure were executed or accessed.

## Acceptance

Advance only the six assessed prior fingerprints and add the reviewed Hoodi source after validation. Keep the other four unchanged. The saved eleven-source observation must produce seven changes against the old baseline and zero against the reviewed baseline. The six original monitored document states are unchanged.

Run detector/notifier tests, public-safety checks and full validation. Close #170 only after merge and successful public artifact verification. A later upstream change needs a new review; the watcher still reports evidence and never edits canonical registry state, accepts its own baseline, or auto-merges. The new configuration source improves schedule coverage but does not replace reading official announcements.
