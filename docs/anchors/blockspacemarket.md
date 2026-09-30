# Blockspace Markets

**Associated ENS:** `blockspacemarket.eth`  
**Canonical term:** blockspace markets  
**Registry ID:** `blockspacemarket`  
**Status:** Research / legacy framing  
**Classification:** deprecated  

---

## Summary

This anchor tracks blockspace markets as an economic description of competition for scarce inclusion and execution capacity.

Vortik retains `deprecated` for its broad registry abstraction. This does not mean that Ethereum has deprecated blockspace markets or that fees and competition have become historical concepts.

## Current protocol context

**Reviewed: 2026-09-30.** [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) is a Final fee-market specification describing a congestion-responsive base fee, transaction fee caps, and priority fees. It is a concrete reference for the economics of transaction inclusion.

[EIP-7732](https://eips.ethereum.org/EIPS/eip-7732), Scheduled for Inclusion in Glamsterdam under [EIP-7773](https://eips.ethereum.org/EIPS/eip-7773), defines builder bids and proposer payments. These are related economic interactions with different protocol rules from transaction fee accounting. Glamsterdam scheduling does not imply mainnet activation.

## Coordination scope

The blockspace-market framing can describe demand for:

- transaction inclusion;
- execution capacity;
- ordering opportunities;
- access to settlement resources.

It is a broad economic category rather than one protocol role or data structure. Specific claims should identify whether they concern transaction fees, builder bids, inclusion constraints, or execution resource accounting.

## Semantic and naming alignment

The ENS name `blockspacemarket.eth` matches a recognizable economic concept. The retained registry classification expresses Vortik's preference for narrower technical objects in its ontology; it is not an Ethereum position on the validity or continued use of the economic term.

Protocol-defined roles and objects do not by themselves demonstrate declining economic relevance. This review makes no claims about market size, adoption trends, or the future dominance of particular mechanisms.

## Registry role

- Preserve the economic category as a semantic reference.
- Distinguish broad economic explanations from concrete protocol mechanisms.
- Direct technical readers to fee, bid, and execution specifications.

## Sources

See the [curated references and review notes](../schemas/blockspacemarket/0.1-research/sources.md).
