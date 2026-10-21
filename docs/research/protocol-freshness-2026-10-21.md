# Protocol calendar follow-up — 2026-10-21

## Result

The two changes reported by [alert #168](https://github.com/VortikRegistry/vortik-open-schema/issues/168) clarify the calendar discrepancy recorded in the [October 20 review](protocol-freshness-2026-10-20.md). EIP-7773 adds the already announced Glamsterdam/Hoodi schedule. EIP-8081 removes its repeated Sepolia and Hoodi dates and leaves all three Hegotá activation rows empty.

This is a targeted calendar review. It does not independently verify chain activation, explain why the earlier dates were entered, or revise the separately dated proposal catalog and other research notes.

## Immutable source evidence

Both updated blobs were checked against EIPs commit `8207146ff51b049d3b1a6ab192d4acfc2f4ab754`. The full before/after contents were read and their Git blob hashes verified. The rendered official EIP pages also showed these corrected tables on October 21.

| Source | Previous blob | Reviewed blob | Complete change |
| --- | --- | --- | --- |
| [EIP-7773](https://github.com/ethereum/EIPs/blob/8207146ff51b049d3b1a6ab192d4acfc2f4ab754/EIPS/eip-7773.md) | `c6b80d7f3d36bcb5d041ca30c6026133602900ea` | `94b90da54273434f67e263527c0d08f5e4793cfb` | Hoodi changes from an empty row to epoch 132352, timestamp 1793036568: 2026-10-26 17:42:48 UTC. |
| [EIP-8081](https://github.com/ethereum/EIPs/blob/8207146ff51b049d3b1a6ab192d4acfc2f4ab754/EIPS/eip-8081.md) | `7386ae919b35a8f69cdba2a0334d595754c8a84a` | `3e65690f78221f358d980cbb33ea843e21bc9e7d` | The Sepolia and Hoodi epoch/time cells become empty. Mainnet was already empty. |

No other lines changed in these two blob comparisons. EIP-7773 remains Review and EIP-8081 remains Draft. FOCIL remains Scheduled for Inclusion in Hegotá; ePBS and BAL remain in Glamsterdam's scheduled set. Fork assignment is distinct from network activation.

## Representation

- Glamsterdam/Hoodi remains `scheduled` for October 26, 17:42:48 UTC, epoch 132352 and slot 4235264. The meta EIP now corroborates the schedule already retained from the October 16 Foundation announcement. A future schedule is not activation evidence.
- Hegotá/Sepolia and Hegotá/Hoodi change from `unverified` to the existing `not_scheduled` representation because the reviewed source now leaves their schedules unset. Hegotá/Mainnet remains `not_scheduled`. All three time, epoch and slot fields remain null.
- `not_scheduled` describes the reviewed source's empty schedule, not a prediction or a guarantee that the network has never activated.
- The October 20 discrepancy remains in historical notes with a link to this follow-up. Current-facing prose, the context artifact and the existing regression are updated consistently.
- Registry v0.6.5, canonical classifications, schema contracts, the October 17 catalog of 1,224 proposals and the homepage reading guide are unchanged. No runtime deployment, infrastructure, analytics or sitemap change is needed.

## Watch acceptance

The [complete observation](../../protocol-watch/reviews/2026-10-21-alert-168-observation.json) records all ten monitored sources. It reports exactly the two changes above; the other eight fingerprints and all six watched EIP document statuses match the October 20 baseline. Only the two reviewed fingerprints are advanced. The recorded observation must yield two changes against the previous baseline and zero against the proposed baseline.

Run the existing detector/notifier tests, public-safety checks and full validation before merging. Close #168 only after the reviewed change is integrated and its public artifacts are verified. A later upstream change requires a new review; this observation is not a continuing freshness guarantee.
