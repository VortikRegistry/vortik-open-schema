# Protocol Watch Alert

Observed at: `2026-09-14T12:40:17.843Z`
Baseline reviewed through: `2026-09-13`

This draft PR is an evidence alert only. It MUST NOT be merged until a reviewer determines whether the upstream changes require source-note, anchor, registry, feed, map, or documentation updates. The watcher does not mutate canonical registry state and does not auto-merge.

## Changed primary sources

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
