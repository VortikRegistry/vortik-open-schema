# Protocol Watch Alert

Observed at: `2026-09-14T21:47:23.115Z`
Baseline reviewed through: `2026-09-13`

This draft PR is an evidence alert only. It MUST NOT be merged until a reviewer determines whether the upstream changes require source-note, anchor, registry, feed, map, or documentation updates. The watcher does not mutate canonical registry state and does not auto-merge.

## Changed primary sources

- **eip-8081-hegota-meta** — ethereum/EIPs / `EIPS/eip-8081.md`
  - previous: `4b07e6f2fd8799217846735cd04b9b69208376ed`
  - current: `737a6271a039751384497d4f096911524f8ab2f1`
  - current EIP status: `Draft`
  - relevance: inclusionlist.eth, FOCIL, Hegota
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8081.md
- **glamsterdam-devnets-head** — ethpandaops/glamsterdam-devnets
  - previous: `42166f755d6aedca08e4747d2df94e2a6e4199dd`
  - current: `266024ae9e9b7cf04dd3ad78307618f803952150`
  - relevance: Glamsterdam devnets, implementation evidence
  - source: https://github.com/ethpandaops/glamsterdam-devnets/tree/master

## Required human gate

1. Inspect the upstream diff and primary-source context.
2. Decide whether Vortik public claims or semantic state are stale.
3. If needed, update source notes and affected public artifacts in this PR.
4. Update `protocol-watch/baseline.json` only after that review.
5. Require `npm run check:public-safety` and `npm run validate` to pass before merge.
