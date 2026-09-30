# Builder Markets

**Associated ENS:** `buildermarket.eth`  
**Canonical term:** builder  
**Registry ID:** `buildermarket`  
**Status:** Research / legacy framing  
**Classification:** deprecated  

---

## Summary

This anchor tracks builder competition as an economic coordination concept around execution-payload construction and proposer selection.

Vortik retains `builder` as the canonical term and `deprecated` as the classification of this broader market abstraction. That label is a registry judgment about scope and naming. Ethereum has not declared builder competition obsolete.

## Current protocol context

**Reviewed: 2026-09-30.** [EIP-7732](https://eips.ethereum.org/EIPS/eip-7732) defines a builder role, payload bids, proposer payments, and reveal duties. [EIP-8282](https://eips.ethereum.org/EIPS/eip-8282) defines builder deposit, top-up, and exit request paths. Both are in Review and Scheduled for Inclusion in Glamsterdam under [EIP-7773](https://eips.ethereum.org/EIPS/eip-7773).

These designs make particular duties explicit at the protocol level. They preserve builder bidding and do not establish that builder competition is declining or merely historical. Scheduled inclusion is separate from network activation.

## Coordination role

Builder competition concerns:

- constructing execution payloads;
- proposing bids for payload selection;
- combining transactions and execution opportunities;
- interacting with upstream order flow and downstream proposers.

The economic behavior of competing builders is related to, but broader than, the interfaces and duties specified by an EIP. External PBS infrastructure and proposed enshrined PBS rules must also be distinguished.

## Semantic and naming alignment

The ENS label `buildermarket.eth` names a broad economic category. The registry's canonical term `builder` names an actor. This difference explains the retained semantic classification; it is not evidence of an upstream deprecation notice.

The cited specifications do not standardize a separate architectural layer named builder market. They also do not support predictions about the disappearance of builders, bidding, or external coordination.

## Registry role

- Document builder terminology and its source-defined duties.
- Distinguish an economic category from a protocol role.
- Preserve the existing registry classification without converting it into a claim about adoption or obsolescence.

## Sources

See the [curated references and review notes](../schemas/buildermarket/0.1-research/sources.md).
