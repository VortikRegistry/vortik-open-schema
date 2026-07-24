# Fast Finality source audit

## Purpose

This research note records the current official terminology around Ethereum finality research and compares **fast finality** with **single-slot finality (SSF)** without changing registry state.

It does not modify `registry.json`, schemas, anchors, classifications, status, type, ENS metadata, or market data.

## Primary sources reviewed

- Ethereum Foundation Protocol Consensus — Fast Finality: <https://consensus.ethereum.foundation/themes/fast-finality>
- Ethereum Foundation Protocol Consensus — Upgrading Finality 1: Decoupling Consensus: <https://consensus.ethereum.foundation/blog/upgrading-finality-edition-1>
- Ethereum Foundation Protocol Consensus — Finality Stakeholder Research: <https://consensus.ethereum.foundation/articles/stakeholder-research>
- ethereum.org — Single-slot finality: <https://ethereum.org/roadmap/single-slot-finality>
- EIP-8062 — Add sweep withdrawal fee for `0x01` validators: <https://eips.ethereum.org/EIPS/eip-8062>

## Current terminology

The Ethereum Foundation Protocol Consensus research site uses **Fast Finality** as the title of an official research area. It describes the objective as significantly reducing Ethereum's finalization time while preserving dynamic availability, accountable safety, and validator-set decentralization.

The same research area groups several designs and lines of work, including single-slot finality, three-slot finality, one-round finality, decoupled consensus, and related protocol research. This makes **fast finality** an umbrella research term rather than merely an imprecise substitute for SSF.

ethereum.org continues to use **single-slot finality (SSF)** for the specific concept in which blocks could be proposed and finalized in the same slot. The page states that SSF remains in the research phase and is not expected to ship for several years.

## Relationship between Fast Finality and SSF

The source-backed distinction is:

```text
Fast Finality
  = broad Ethereum consensus research objective and program surface

Single-slot finality (SSF)
  = a specific finality target or design family within that broader surface
```

Other designs may pursue faster finality without requiring the exact same-slot outcome. Therefore, the terms overlap but are not equivalent.

## Validator-set consolidation

EIP-8062 is a Draft Core EIP. Its motivation states that Ethereum's fast-finality roadmap depends on stake consolidation, particularly migration from `0x01` validators to `0x02` compounding validators.

The EIP discusses reducing the active validator set voting in each round and references multiple possible routes, including Orbit SSF. This is evidence that **fast finality** is used as a roadmap-level objective while SSF remains one possible design path.

EIP-8062 is not a finality specification and does not establish a deployment schedule for fast finality or SSF.

## Current Vortik mismatch

The existing `fastfinality.eth` anchor states that:

- SSF is the more precise canonical term;
- fast finality is only a descriptive approximation;
- fast-finality language is increasingly displaced by SSF.

That framing is now incomplete. Official Ethereum Foundation research uses **Fast Finality** as a named research area and umbrella term, while still using SSF for a narrower design target.

The evidence does not automatically determine the correct registry change. At least three interpretations remain possible:

1. retain `single-slot finality (SSF)` as the canonical term and add `fast finality` as an official umbrella scope;
2. change the canonical term to `fast finality` and represent SSF as a narrower related design;
3. preserve the existing canonical term but revise the naming-mismatch rationale and classification.

Choosing among these options would materially affect anchor semantics and requires a separate registry decision.

## Candidate semantic model

A future registry decision could represent:

- `fast finality` — umbrella research objective;
- `single-slot finality` — specific timing target or design family;
- `three-slot finality` — alternative design family;
- `decoupled consensus` — architectural approach;
- `one-round finality` — protocol-design option;
- `validator consolidation` — enabling constraint or mechanism;
- `fast confirmation rule` — related but distinct pre-finality assurance surface.

These terms should not be collapsed into a rigid sequential layer model.

## Non-claims

This audit does not claim that:

- fast finality or SSF is scheduled for a specific fork;
- either concept has an announced activation date;
- EIP-8062 is accepted, scheduled, deployed, or active;
- Fast Finality and SSF are exact synonyms;
- `fastfinality.eth` is an official Ethereum namespace;
- the anchor classification should change without a separate decision.

## Registry-state boundary

No registry state changes are made by this audit. Any update to the `ssf` anchor, its canonical term, classification, status, schema constants, maps, or derived documentation requires a separate, validated pull request and explicit semantic approval.
