# Order Flow Auctions

**Associated ENS:** `orderflowauction.eth`  
**Canonical term:** order flow auctions (OFA)  
**Registry ID:** `orderflowauction`  
**Status:** Research  
**Classification:** external  

---

## Summary

This anchor tracks order flow auctions (OFA) as external mechanisms for allocating access to transaction flow or execution opportunities through competition.

The auction, privacy, routing, and settlement rules depend on the implementation. OFA is not a single Ethereum L1 consensus object.

## Current source context

**Reviewed: 2026-09-30.** [Flashbots MEV-Share documentation](https://docs.flashbots.net/flashbots-mev-share/introduction) provides a concrete implementation reference for an order flow auction protocol. It supports this external coordination category without establishing that all order flow uses auctions.

[EIP-7805](https://eips.ethereum.org/EIPS/eip-7805) addresses a different surface: fork-choice enforced inclusion constraints. [EIP-8081](https://eips.ethereum.org/EIPS/eip-8081) schedules FOCIL for Hegotá, with activation dates unset. This scheduling does not demonstrate that OFAs are disappearing or being replaced.

## Coordination role

Depending on their design, OFAs can affect:

- which participants receive transaction information;
- how execution opportunities are allocated;
- how competition between searchers or other execution actors is organized;
- how execution-related value is returned or distributed.

Their upstream allocation rules must be distinguished from downstream block validity, transaction inclusion, and consensus finality.

## Interaction with other designs

Preconfirmations, encrypted transaction flow, intent systems, and inclusion lists can change the constraints under which a routing system operates. Their existence is not evidence for a forecast about OFA adoption or long-term dominance. Compatibility must be evaluated for a specific mechanism.

## Semantic and naming alignment

`orderflowauction.eth` names an external coordination category. Vortik retains `external` and does not present the name as an official Ethereum role, namespace, or layer.

## Registry role

- Track documented OFA terminology and implementation context.
- Distinguish access to transaction flow from protocol inclusion guarantees.
- Record design-specific changes without unsupported adoption forecasts.

## Sources

See the [curated references and review notes](../schemas/orderflowauction/0.1-research/sources.md).
