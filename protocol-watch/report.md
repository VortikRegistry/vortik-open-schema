# Protocol Watch Alert

Observed at: `2026-10-02T05:31:22.554Z`
Baseline reviewed through: `2026-09-13`

This draft PR is an evidence alert only. It MUST NOT be merged until a reviewer determines whether the upstream changes require source-note, anchor, registry, feed, map, or documentation updates. The watcher does not mutate canonical registry state and does not auto-merge.

## Changed primary sources

- **eip-7773-glamsterdam-meta** — ethereum/EIPs / `EIPS/eip-7773.md`
  - previous: `abdea2079ddee8c8aef4c957c867ce82e547f4b2`
  - current: `c6b80d7f3d36bcb5d041ca30c6026133602900ea`
  - current EIP status: `Review`
  - relevance: Glamsterdam, epbs.eth, BAL, gas repricing
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7773.md
- **eip-7928-bal** — ethereum/EIPs / `EIPS/eip-7928.md`
  - previous: `f834f0004aa5110a5f1ac0d6b80e3dc4b842d040`
  - current: `d70db88d1406e81907ae46566af653959ac3a9f3`
  - current EIP status: `Review`
  - relevance: Glamsterdam, Block-Level Access Lists
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7928.md
- **eip-8081-hegota-meta** — ethereum/EIPs / `EIPS/eip-8081.md`
  - previous: `4b07e6f2fd8799217846735cd04b9b69208376ed`
  - current: `940bd0f3b8bd178bd7d2304dc0cbfff4e66bb4b9`
  - current EIP status: `Draft`
  - relevance: inclusionlist.eth, FOCIL, Hegota
  - source: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-8081.md
- **ethereum-org-glamsterdam-roadmap** — ethereum/ethereum-org-website / `public/content/roadmap/glamsterdam/index.md`
  - previous: `c4cb88c67359458495d3550212e60bc82808b4fe`
  - current: `d6a26c8d19a6e8370be70b112bd92b17f93eb709`
  - relevance: Glamsterdam roadmap, testnet milestones, public protocol communication
  - source: https://github.com/ethereum/ethereum-org-website/blob/dev/public/content/roadmap/glamsterdam/index.md
- **consensus-gloas-beacon-chain** — ethereum/consensus-specs / `specs/gloas/beacon-chain.md`
  - previous: `a13fb1b550cb9a1c98468788fa0b4a042af0f9ac`
  - current: `30afd4aca78c83624280aa0ca199bf599a178a76`
  - relevance: epbs.eth, Gloas consensus specification
  - source: https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/beacon-chain.md
- **consensus-gloas-p2p** — ethereum/consensus-specs / `specs/gloas/p2p-interface.md`
  - previous: `0b38f9de1b149485cc304bc71147d56f9a0af437`
  - current: `1e0dca6e5ab6a83c3f4536b69bcca4bcd1c5bdcc`
  - relevance: epbs.eth, payload and bid propagation
  - source: https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/p2p-interface.md
- **glamsterdam-devnets-head** — ethpandaops/glamsterdam-devnets
  - previous: `42166f755d6aedca08e4747d2df94e2a6e4199dd`
  - current: `679e1e768f6e889f9157d4040e9b893d3df9f246`
  - relevance: Glamsterdam devnets, implementation evidence
  - source: https://github.com/ethpandaops/glamsterdam-devnets/tree/master

## Required human gate

1. Inspect the upstream diff and primary-source context.
2. Decide whether Vortik public claims or semantic state are stale.
3. If needed, update source notes and affected public artifacts in this PR.
4. Update `protocol-watch/baseline.json` only after that review.
5. Require `npm run check:public-safety` and `npm run validate` to pass before merge.
