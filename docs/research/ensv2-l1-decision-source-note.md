# ENSv2 L1 decision source note

## Purpose

This note records a public ENS source about ENSv2 deployment direction and Namechain status. It is a conservative research/source note for public context only and does not change Vortik Registry state, anchor state, schemas, generated outputs, scripts, maps, market files, package metadata, or release notes.

## Source

Primary source: [ENS is staying on Ethereum](https://ens.domains/blog/post/ens-staying-on-ethereum), published by ENS on February 6, 2026.

The ENS post announces that ENSv2 will be deployed exclusively on Ethereum L1 and that ENS will cease development of Namechain. The post also states that ENSv2 is still expected to ship. ENS frames the decision around Ethereum L1 scaling progress, reduced ENS registration gas costs, simpler resolution that avoids querying across two chains, and stronger Ethereum L1 infrastructure guarantees.

## Registry relevance

This decision is relevant public context for ENS-style naming surfaces because it reinforces the importance of keeping naming, authority, protocol truth, and registry state clearly separated. ENS names can be useful semantic naming surfaces, but naming surfaces do not create source-of-truth authority for Ethereum protocol claims and do not replace primary sources or validated registry artifacts.

## Non-claims

This note does not claim that:

- Vortik Registry is official ENS, Ethereum, Ethereum Foundation, ENS DAO, ENS Foundation, or ENS Labs infrastructure.
- ENSv2 validates Vortik Registry.
- ENSv2 validates any Vortik anchor.
- `epbs.eth`, `inclusionlist.eth`, or any ENS-style anchor is official Ethereum or ENS infrastructure.
- ENS names create protocol truth.
- ENS names control, store, resolve, or define Ethereum protocol metadata.
- ENSv2 creates operational dependency for Vortik Registry.
- This decision changes registry state.
- This decision promotes any candidate or anchor.
- This decision changes any classification, status, type, priority, or visibility field.
- This decision implies commercial value, acquirer interest, valuation, sale signal, or marketplace positioning.

## Source-of-truth rule

Protocol truth still comes from primary sources and validated repository artifacts, including:

- EIPs;
- official specifications;
- Ethereum client or specification repositories;
- source notes; and
- validated registry artifacts.

Research notes provide interpretive support only and do not override validated source-of-truth files.

## Registry-state impact

No registry state changes are made by this note. No anchor state changes are made by this note. Any future registry-state update would require a separate source-backed PR.

## Maintenance note

This note may be revisited if ENS publishes further primary sources about ENSv2 deployment, architecture, or migration details, but only through a separate PR.
