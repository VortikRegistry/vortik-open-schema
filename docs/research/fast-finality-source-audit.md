# Fast Finality and SSF source audit

## Purpose

This research note reviews the current primary-source use of **fast finality** and **single-slot finality (SSF)** across official Ethereum materials.

It is an interpretive support document only. It does not modify `registry.json`, change the `ssf` anchor, alter a schema constant, add or remove an anchor, or claim that a finality design has been selected for deployment.

**Source review date:** 2026-07-24

## Primary sources reviewed

- Ethereum Foundation Protocol Consensus — Fast Finality: <https://consensus.ethereum.foundation/themes/fast-finality>
- Ethereum Foundation Protocol Consensus — Applied Consensus Research for Ethereum: <https://consensus.ethereum.foundation/>
- Ethereum Foundation Protocol Consensus — Upgrading Finality 1: Decoupling Consensus: <https://consensus.ethereum.foundation/blog/upgrading-finality-edition-1>
- Ethereum Foundation Protocol Consensus — Finality Stakeholder Research: <https://consensus.ethereum.foundation/articles/stakeholder-research>
- Ethereum.org — Single slot finality: <https://ethereum.org/roadmap/single-slot-finality/>
- EIP-8062 — Add sweep withdrawal fee for `0x01` validators: <https://eips.ethereum.org/EIPS/eip-8062>
- Existing Vortik anchor: `anchors/fastfinality.md`
- Existing Vortik source notes: `schemas/ssf/0.1-research/sources.md`

## Finding 1 — Fast Finality is now an explicit Ethereum Foundation research-area label

The Ethereum Foundation Protocol Consensus site presents **Fast Finality** as one of its named research areas. Its stated objective is to significantly reduce Ethereum's finalization time while preserving dynamic availability, accountable safety, and validator-set decentralization.

The term is therefore no longer supported only as informal shorthand. It has an explicit and durable role in current Ethereum Foundation research organization and publication structure.

This does not make Fast Finality a deployed protocol feature, a finalized specification, or a network-upgrade commitment. It establishes a source-backed research-area label.

## Finding 2 — SSF remains a specific technical concept

Ethereum.org continues to define **single-slot finality (SSF)** as the concept of proposing and finalizing a block within the same slot.

The same page keeps SSF in the research phase and describes unresolved trade-offs involving validator-set size, attestation processing, networking, aggregation, hardware requirements, and decentralization.

SSF therefore remains a valid and recognized technical term. The new evidence does not make SSF obsolete or incorrect.

## Finding 3 — Fast Finality is broader than SSF

Protocol Consensus groups several approaches and research outputs under Fast Finality, including:

- single-slot finality;
- three-slot finality;
- one-round finality;
- decoupled consensus;
- validator consolidation;
- attestation aggregation improvements;
- changes to the relationship between the available chain and the finalized chain.

The May 2026 finality update explicitly describes a staged strategy: first decouple finality from slot-by-slot fork choice, then improve time to finality incrementally through multiple possible upgrades.

This means the current research direction is not equivalent to a single all-or-nothing SSF design.

## Finding 4 — Official materials use “fast finality roadmap” directly

EIP-8062 is a Draft Core EIP and states that Ethereum's **fast finality roadmap** depends on stake consolidation, including migration from many `0x01` validators toward consolidated `0x02` validators.

This is direct standards-track evidence that the phrase Fast Finality is being used as a roadmap-level category rather than merely as a loose descriptive approximation.

EIP-8062 does not itself implement fast finality. It proposes one validator-economics change intended to improve stake consolidation and consensus overhead.

## Finding 5 — Fast confirmation and fast finality must remain distinct

Protocol Consensus treats fast confirmation and fast finality as separate research areas.

Fast confirmation can provide high confidence quickly under normal network conditions, but it does not provide the same accountable, economically secured guarantees as finality. Vortik should not merge these concepts into one term or treat confirmation latency as equivalent to finalized settlement.

## Current Vortik mismatch

The current `fastfinality.eth` anchor states that:

- `single-slot finality (SSF)` is the canonical term;
- Fast Finality is a broader but less exact description;
- SSF is increasingly displacing Fast Finality as the preferred terminology;
- the ENS label is therefore only an approximation.

The first two statements still contain useful distinctions, but the displacement claim is no longer supported by the current official source landscape.

The stronger source-backed model is:

```text
Fast Finality
  = umbrella research area and roadmap direction

Single-Slot Finality (SSF)
  = specific finality target or design family within that broader area
```

Other designs and enabling changes may also sit within the Fast Finality research area without being SSF.

## Implications for the existing anchor

The new evidence materially strengthens the naming alignment of `fastfinality.eth`.

However, it does not automatically determine the correct registry migration because the current entry combines several coupled fields:

- registry ID: `ssf`;
- canonical term: `single-slot finality (SSF)`;
- ENS: `fastfinality.eth`;
- classification: `repairable`;
- type: `primitive`;
- schema path and versioned schema constants.

Changing only the canonical term would create tension with the `ssf` identifier and the existing schema title. Changing the ID would be a larger registry migration. Adding an umbrella scope or alias may be safer, but the current schema does not yet define such a field.

## Candidate registry decisions for a later PR

### Option A — Preserve the SSF anchor and document the umbrella

Keep:

```text
id: ssf
canonical_term: single-slot finality (SSF)
```

Then explicitly document Fast Finality as the broader research-area label associated with the ENS entry point.

This is the least disruptive option, but it may understate the improved alignment of `fastfinality.eth`.

### Option B — Reframe the anchor around Fast Finality

Change the canonical surface from SSF to Fast Finality and treat SSF as a specific child concept or design family.

This would better match current Protocol Consensus naming, but it would require coordinated changes to the registry ID, schema constants, anchor documentation, maps, generated indexes, and compatibility expectations.

### Option C — Introduce an explicit semantic-scope model

Preserve the existing ID and canonical term while adding structured fields such as:

```text
umbrella_term: fast finality
specific_design: single-slot finality (SSF)
aliases:
  - fast finality
  - SSF
```

This could model the source reality more accurately, but it is a material schema-model change and should not be introduced only for one anchor without broader taxonomy review.

## Recommended next decision

Do not change the anchor in the same PR as this audit.

A separate semantic decision should determine whether Vortik wants to model:

1. one canonical term per ENS entry only; or
2. an umbrella term with specific designs and aliases.

Until that decision is made, the safe statement is:

```text
Fast Finality is an official Ethereum Foundation research-area label.
SSF remains a specific, recognized finality design concept within the broader research space.
```

## Non-claims

This audit does not claim that:

- Fast Finality is active on Ethereum mainnet;
- SSF has been selected as Ethereum's final consensus design;
- decoupled consensus has a finalized specification;
- EIP-8062 is included in a network upgrade;
- any finality proposal has an announced activation date;
- the Ethereum Foundation endorses Vortik or any ENS identifier;
- this audit changes registry state.

## Registry-state boundary

No registry state changes are made by this audit. Any change to the `ssf` ID, canonical term, classification, status, type, naming mismatch, versioned schema, maps, or generated outputs requires a separate validated pull request and an explicit semantic decision.
