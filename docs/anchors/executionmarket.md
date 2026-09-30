# Execution Market

**Associated ENS:** `executionmarket.eth`  
**Canonical term:** execution (ambiguous)  
**Registry ID:** `executionmarket`  
**Status:** Research / legacy framing  
**Classification:** deprecated  

---

## Summary

This anchor tracks execution market as a broad abstraction covering several execution-related interactions. It does not map to one bounded protocol role, object, or mechanism in the specifications reviewed here.

Vortik retains `deprecated` for this terminology cluster and `execution (ambiguous)` as its canonical term. This is a registry classification, not a prediction that execution-related coordination or economic activity will disappear.

## Current protocol context

**Reviewed: 2026-09-30.** [EIP-7773](https://eips.ethereum.org/EIPS/eip-7773) schedules several distinct execution-related changes for Glamsterdam:

| Specification | Defined surface |
| --- | --- |
| [EIP-7732](https://eips.ethereum.org/EIPS/eip-7732) | Proposer-builder coordination and execution payload handling |
| [EIP-7928](https://eips.ethereum.org/EIPS/eip-7928) | Block-Level Access Lists |
| [EIP-8037](https://eips.ethereum.org/EIPS/eip-8037) | State-creation gas accounting |
| [EIP-8038](https://eips.ethereum.org/EIPS/eip-8038) | State-access gas costs |

These are separate technical objects and rules. BALs are not a synonym for gas repricing, and none of these EIPs defines an execution market as a new L1 layer. Scheduled inclusion does not establish mainnet activation.

## Coordination scope

The broad phrase can refer to transaction routing, solver competition, execution strategy, payload construction, or proposer-builder interaction. A source-grounded description should identify which interaction it means and cite its actual specification or implementation.

## Semantic and naming alignment

`executionmarket.eth` remains an ambiguous semantic entry point. Its market suffix groups mechanisms with different trust assumptions and roles; it does not create a shared protocol interface.

The classification records that breadth. Claims that the category will dissolve, lose adoption, or be replaced require separate evidence and are not conclusions of this review.

## Registry role

- Track ambiguous execution terminology.
- Point readers toward specific execution objects and interfaces.
- Document overlap with order flow, solvers, builders, payloads, and inclusion constraints.

## Sources

See the [curated references and review notes](../schemas/executionmarket/0.1-research/sources.md).
