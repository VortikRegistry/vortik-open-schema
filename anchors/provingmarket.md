# Proving Markets

**Associated ENS:** `provingmarket.eth`  
**Canonical term:** proving markets  
**Registry ID:** `provingmarket`  
**Status:** Research  
**Classification:** external  

---

## Summary

This anchor tracks proving markets as a broad category for coordinating cryptographic proof generation, delivery, resource allocation, and any associated economic mechanisms.

Proof-generation research concerns both rollup systems and Ethereum L1. The registry's `external` classification concerns the market category; it does not imply that every use of execution proofs is external to L1.

## Current protocol context

**Reviewed: 2026-09-30.** [EIP-8025 — Optional Execution Proofs](https://eips.ethereum.org/EIPS/eip-8025) is a Draft Core proposal. [EIP-8081](https://eips.ethereum.org/EIPS/eip-8081) lists it as Proposed for Inclusion in Hegotá, not Scheduled for Inclusion.

EIP-8025 describes opt-in proofs from altruistic proof-generating nodes and introduces no prover incentives. Its current design keeps proofs supplementary to re-execution. It does not specify a proving auction, a paid market, or a production rollout.

This distinction matters: a proposal can make proof generation relevant to L1 without standardizing the economic coordination category named by `provingmarket.eth`.

## Coordination scope

A proving system may need to coordinate:

- proof generation and delivery deadlines;
- prover resources and hardware;
- proof aggregation and verification;
- reliability and workload allocation;
- economic incentives, where that system explicitly defines them.

These properties are design-specific. An EIP about optional proofs does not establish the existence or adoption of a market for those proofs.

## Semantic and naming alignment

The ENS name identifies a broad infrastructure category. Vortik retains `external`; this review does not create a new L1 role, change the canonical term, or infer official status for the name.

## Registry role

- Track proof-generation coordination terminology.
- Distinguish proof machinery from a market or incentive mechanism.
- Include L1 proof research as well as rollup context.
- Keep Draft, Proposed, Scheduled, and activated source states separate.

## Sources

See the [curated references and review notes](../schemas/provingmarket/0.1-research/sources.md).
