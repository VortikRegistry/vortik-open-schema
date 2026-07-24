# EIP-8146 / Block Access List sidecars source audit

## Purpose

This research note records the current primary-source state of EIP-8146 and its relationship to EIP-7732 and EIP-7928. It is an interpretive support document only.

It does not create a registry anchor, modify `registry.json`, change an existing anchor, promote a watchlist term, or create a protocol-adoption claim.

## Primary sources reviewed

- EIP-8146 — Block Access List Sidecars: <https://eips.ethereum.org/EIPS/eip-8146>
- EIP-7928 — Block-Level Access Lists: <https://eips.ethereum.org/EIPS/eip-7928>
- EIP-7732 — Enshrined Proposer-Builder Separation: <https://eips.ethereum.org/EIPS/eip-7732>
- EIP-8081 — Hardfork Meta: Hegotá: <https://eips.ethereum.org/EIPS/eip-8081>

## Source state

EIP-8146 is a Draft Core EIP created on 3 February 2026. It requires EIP-7732 and EIP-7928.

EIP-8081 currently lists EIP-8146 as **Proposed for Inclusion** in Hegotá. Proposed for Inclusion is not the same state as Scheduled for Inclusion, Included, deployed, or activated. EIP-8081 currently provides no Hegotá activation values for Sepolia, Hoodi, or mainnet.

This note must therefore not represent EIP-8146 as scheduled, fork-locked, deployed, or active on Ethereum mainnet.

## Technical object model

EIP-8146 separates the Block Access List from the execution payload envelope introduced by the ePBS design and propagates it as an independent sidecar.

The source-backed objects and fields include:

- `BlockAccessList`
- `BlockAccessListSidecar`
- `block_access_list_hash`
- `block_access_list_present`
- the `block_access_list_sidecar` gossip topic
- `engine_notifyBlockAccessListV1`

These are implementation-facing protocol artifacts and fields. They should not be described as a new architectural layer.

## Commitment and authentication

The builder includes `block_access_list_hash` in `ExecutionPayloadBid`. The value reuses the EIP-7928 execution-layer commitment, `keccak256(rlp(BlockAccessList))`.

A received sidecar is checked against that bid commitment. EIP-8146 does not introduce a separate sidecar signature: the sidecar is authenticated through the commitment already carried by the signed bid.

This strengthens the relevance of commitment vocabulary around ePBS, but it does not make “commitment layer” an upstream Ethereum term or justify changing the classification of `commitmentlayer.eth` without a separate registry decision.

## Availability and PTC behavior

EIP-8146 extends payload attestation data with `block_access_list_present`. Payload presence, blob-data availability, and BAL availability remain separately observable fields.

The Payload Timeliness Committee records BAL availability at the attestation deadline. Local BAL availability is required before an execution payload envelope can be processed.

This places the BAL sidecar inside the ePBS timing and availability surface, while preserving the distinction between:

- payload presence;
- blob-data availability;
- BAL availability;
- execution validity.

## Execution-layer handoff

After a sidecar passes its commitment check, the consensus layer calls `engine_notifyBlockAccessListV1` without waiting for the execution payload envelope.

The execution layer can then:

- store the BAL for the corresponding block hash;
- prefetch the declared accounts and storage slots;
- warm the state cache;
- optionally begin parallel post-state-root computation before the payload arrives.

This is an early-delivery and availability mechanism. It should not be inflated into a claim that EIP-8146 alone provides a complete parallel-execution architecture.

## Relationship to existing Vortik anchors

### `epbs.eth`

EIP-8146 directly depends on EIP-7732 and modifies ePBS-facing bid, attestation, payload-envelope, and PTC behavior. It is therefore relevant supporting evidence for the `epbs` semantic surface, but it does not modify the current registry state of that anchor.

### `commitmentlayer.eth`

The EIP strengthens concrete builder, payload, and BAL commitment terminology. It does not establish “commitment layer” as canonical terminology. The existing naming mismatch remains.

### `executionmarket.eth` and `blockspacemarket.eth`

EIP-8146 introduces concrete protocol artifacts, commitments, availability fields, gossip behavior, and Engine API handoff. It does not define an “execution market” or “blockspace market” primitive and does not justify promoting either legacy abstraction.

## Candidate watchlist vocabulary

The following terms are source-backed candidates for repository-only monitoring:

- Block Access List sidecar
- BAL sidecar
- BAL commitment
- BAL availability
- block access list gossip
- execution-state prefetch
- payload attestation
- independent BAL propagation

They remain below registry-anchor level. A later watchlist PR may add them only if it preserves EIP-8146's Draft and Proposed-for-Inclusion boundaries.

## Non-claims

This note does not claim that:

- EIP-8146 is Scheduled for Inclusion in Hegotá;
- EIP-8146 is Included in a fork;
- EIP-8146 is deployed or active on mainnet;
- Hegotá has announced activation dates;
- a BAL sidecar is a separate Ethereum layer;
- BAL sidecars create a new Vortik anchor;
- EIP-8146 changes any registry classification or semantic status;
- Vortik is an official Ethereum source.

## Registry-state boundary

No registry state changes are made by this audit. Any future modification to an anchor, schema, taxonomy, map, or watchlist requires a separate, validated pull request.
