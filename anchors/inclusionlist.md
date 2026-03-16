# inclusionlist.eth

Semantic anchor representing **inclusion enforcement primitives** in Ethereum block production.

## Context

Inclusion lists are mechanisms designed to mitigate transaction censorship in block construction.

These mechanisms allow certain transactions to be forced into the block production pipeline, typically requiring proposers or builders to include them within a bounded number of slots.

The primary research direction associated with this concept is **Fork-Choice Enforced Inclusion Lists (FOCIL)**, described in **EIP-7805**.

Inclusion lists aim to strengthen censorship resistance while preserving the security properties of Ethereum’s consensus protocol.

## Registry Role

- Track terminology convergence around inclusion enforcement mechanisms
- Document research discussions related to censorship resistance
- Distinguish protocol-level inclusion guarantees from off-chain coordination mechanisms

## Associated ENS Anchor

`inclusionlist.eth`

## Status

Draft EIP (EIP-7805)

## Sources

Primary research references are documented in:

`schemas/inclusionlist/`
