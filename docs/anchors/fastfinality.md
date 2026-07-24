# Single-Slot Finality (SSF) within Fast Finality

**Associated ENS:** `fastfinality.eth`  
**Canonical term:** single-slot finality (SSF)  
**Registry ID:** `ssf`  
**Status:** Research  
**Classification:** repairable  
**Type:** primitive

---

## Summary

This anchor continues to track **single-slot finality (SSF)** as its canonical technical term and registry primitive.

Current Ethereum Foundation Protocol Consensus material also uses **Fast Finality** as the explicit name of a broader research area focused on significantly reducing Ethereum's finalization time while preserving dynamic availability, accountable safety, and validator-set decentralization.

The source-backed relationship is therefore:

```text
Fast Finality
  = broader Ethereum consensus research objective and program surface

Single-slot finality (SSF)
  = a specific same-slot target or design family within that broader surface
```

The ENS identifier `fastfinality.eth` aligns directly with the broader research-area label, while the registry intentionally retains `single-slot finality (SSF)` as the canonical term for the current `ssf` entry. The classification remains **repairable** because the ENS label and canonical registry term have related but non-identical scope.

---

## Context

Fast Finality research addresses how Ethereum can reduce time to finality without abandoning the availability, safety, and decentralization properties expected from its consensus protocol.

The broader research space includes work on:

- decoupling the available chain from the finality protocol;
- one-round and multi-round finality designs;
- single-slot and three-slot finality targets;
- validator-set management and consolidation;
- attestation aggregation and networking constraints;
- interactions between finality time, slot length, safety, and liveness.

SSF is one important design target inside this wider space. Ethereum.org describes SSF as the concept of proposing and finalizing a block in the same slot and continues to classify it as research rather than a deployed feature.

---

## Coordination position

**Fast-finality research surface / SSF primitive**

---

## Coordination Role

The broader Fast Finality surface affects consensus coordination around:

- validator agreement speed;
- finality checkpoint formation;
- available-chain and finalized-chain interaction;
- validator-set size and participation;
- aggregation of validator signatures;
- consensus timing, safety, and liveness trade-offs.

Within that surface, SSF represents the narrower target of reaching finality within the same slot as block proposal.

A faster-finality design may improve finality substantially without implementing exact same-slot finality, so Fast Finality and SSF must not be treated as exact synonyms.

---

## Protocol Grounding

This surface is grounded in:

- the Ethereum Foundation Protocol Consensus **Fast Finality** research area;
- Protocol Consensus work on decoupled consensus and incremental finality upgrades;
- Ethereum.org roadmap material on single-slot finality;
- EIP-8062's use of fast-finality roadmap language in the context of validator consolidation;
- Ethereum consensus research on SSF, three-slot finality, one-round finality, aggregation, and validator-set constraints.

These sources support active research significance. They do not establish fork inclusion, activation dates, deployment, or implementation convergence for Fast Finality or SSF.

---

## Semantic Stability

Both terms now have strong and distinct source support:

- **Fast Finality** is an explicit umbrella research-area label used by Ethereum Foundation Protocol Consensus.
- **Single-slot finality (SSF)** is a recognized specific timing target and design family within the wider finality research space.

The previous framing that treated Fast Finality only as a less precise approximation, or suggested that SSF was displacing Fast Finality, is no longer supported by the current official terminology.

The conservative registry position is to retain SSF as the canonical term for this entry while documenting Fast Finality as the broader source-backed scope.

---

## Structural Importance

Fast Finality research may affect:

- finality latency guarantees;
- validator coordination models;
- available-chain and finality-protocol architecture;
- scalability constraints tied to validator-set size;
- application and settlement timing assumptions;
- user confirmation and finality expectations.

SSF remains one structurally important target within that broader program.

---

## Naming Alignment

- **ENS anchor:** `fastfinality.eth`  
- **Canonical registry term:** single-slot finality (SSF)
- **Broader source-backed term:** Fast Finality

The ENS name is strongly aligned with the official umbrella research-area terminology. It does not exactly match the narrower canonical term currently stored in the `ssf` registry entry.

This is a scope mismatch rather than a claim that Fast Finality is invalid, informal, or being displaced. The current **repairable** classification and canonical term are preserved pending any future explicit registry-model decision.

---

## Registry Role

- Track SSF as the canonical primitive represented by registry ID `ssf`.
- Document Fast Finality as the broader official research-area scope.
- Preserve the distinction between an umbrella objective and a specific finality target.
- Monitor evolution across SSF, three-slot finality, one-round finality, decoupled consensus, and validator consolidation.
- Avoid collapsing finality research into a rigid sequential layer model.

---

## Status and boundaries

This remains an active research and roadmap surface within Ethereum consensus evolution.

This anchor does not claim that:

- Fast Finality or SSF is scheduled for a specific fork;
- either concept has an announced activation date;
- SSF is deployed on Ethereum mainnet;
- EIP-8062 is a finality specification;
- Fast Finality and SSF are exact synonyms;
- `fastfinality.eth` is an official Ethereum namespace.

---

## Sources

Primary research references and technical material are documented in:

`schemas/ssf/0.1-research/sources.md`
