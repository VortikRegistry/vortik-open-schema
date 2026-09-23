# Protocol Watch Alert

Observed at: `2026-09-23T16:53:52.476Z`
Baseline reviewed through: `2026-09-13`

This draft PR is an evidence alert only. It MUST NOT be merged until a reviewer determines whether the upstream changes require source-note, anchor, registry, feed, map, or documentation updates. The watcher does not mutate canonical registry state and does not auto-merge.

## Changed primary sources

- **eip-7773-glamsterdam-meta** — ethereum/EIPs / `EIPS/eip-7773.md`
  - previous: `abdea2079ddee8c8aef4c957c867ce82e547f4b2`
  - current: `c6b80d7f3d36bcb5d041ca30c6026133602900ea`
  - current EIP status: `Review`
  - relevance: Glamsterdam, epbs.eth, BAL, gas repricing
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7773.md
- **eip-8081-hegota-meta** — ethereum/EIPs / `EIPS/eip-8081.md`
  - previous: `4b07e6f2fd8799217846735cd04b9b69208376ed`
  - current: `9a41cccb77a389cc8184e7c62f72595131afde06`
  - current EIP status: `Draft`
  - relevance: inclusionlist.eth, FOCIL, Hegota
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8081.md
- **consensus-gloas-beacon-chain** — ethereum/consensus-specs / `specs/gloas/beacon-chain.md`
  - previous: `a13fb1b550cb9a1c98468788fa0b4a042af0f9ac`
  - current: `4f3a4b252d9a836e1b0b3e911a7e96a0c16e01ee`
  - relevance: epbs.eth, Gloas consensus specification
  - source: https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/beacon-chain.md
- **consensus-gloas-p2p** — ethereum/consensus-specs / `specs/gloas/p2p-interface.md`
  - previous: `0b38f9de1b149485cc304bc71147d56f9a0af437`
  - current: `05982d92cd2160b4affc543960d05b2170afe684`
  - relevance: epbs.eth, payload and bid propagation
  - source: https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/p2p-interface.md
- **glamsterdam-devnets-head** — ethpandaops/glamsterdam-devnets
  - previous: `42166f755d6aedca08e4747d2df94e2a6e4199dd`
  - current: `9849d587f20ff3877dcffa90d994b0e227c80b2c`
  - relevance: Glamsterdam devnets, implementation evidence
  - source: https://github.com/ethpandaops/glamsterdam-devnets/tree/master

## Required human gate

1. Inspect the upstream diff and primary-source context.
2. Decide whether Vortik public claims or semantic state are stale.
3. If needed, update source notes and affected public artifacts in this PR.
4. Update `protocol-watch/baseline.json` only after that review.
5. Require `npm run check:public-safety` and `npm run validate` to pass before merge.
