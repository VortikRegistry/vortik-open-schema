# BAL / block_access_list_hash source notes

## Purpose

This note records primary-source-backed facts about Block-Level Access Lists (BALs), the `block_access_list_hash` field, and BAL support surfaces. It is a public research note only and does not change registry state.

It does not add a registry anchor, schema field, anchor note, generated output, market file, index file, or source-of-truth registry entry.

## Primary sources

- EIP-7773: Hardfork Meta - Glamsterdam — <https://eips.ethereum.org/EIPS/eip-7773>
- EIP-7928: Block-Level Access Lists — <https://eips.ethereum.org/EIPS/eip-7928>
- EIP-8159: eth/71 - Block Access List Exchange — <https://eips.ethereum.org/EIPS/eip-8159>
- EIP-8189: snap/2 - BAL-Based State Healing — <https://eips.ethereum.org/EIPS/eip-8189>

## Source status

- EIP-7773 lists EIP-7928 / Block-Level Access Lists as Scheduled for Inclusion in Glamsterdam.
- EIP-7928 remains an EIP source and should not be represented as already activated on mainnet unless primary sources say so.
- EIP-8159 / eth/71 - Block Access List Exchange is a networking support surface for BAL exchange.
- EIP-8189 / snap/2 - BAL-Based State Healing is a networking and sync support surface for BAL-based state healing.
- EIP-8159 and EIP-8189 depend on EIP-7928 and should not be represented as independent registry primitives.

## What BALs are

Using EIP-7928 as the source, Block-Level Access Lists record accounts and storage locations accessed during block execution, together with post-execution values.

EIP-7928 describes BALs as supporting:

- parallel disk reads;
- parallel transaction validation and execution;
- parallel state-root computation; and
- executionless state updates.

This note uses BAL terminology as a precise technical object from EIP-7928. It does not claim that BALs are already live on Ethereum mainnet.

## `block_access_list_hash`

Using EIP-7928 as the source, `block_access_list_hash` is a block-header commitment to the RLP-encoded block access list.

The field should be treated conservatively as a precise field-level primitive associated with EIP-7928. This note does not add the field to any Vortik schema and does not create an ENS anchor for it.

## Support surfaces

### EIP-8159 / eth/71 - Block Access List Exchange

EIP-8159 defines an `eth` protocol support surface for requesting and serving BALs between peers. It adds BAL exchange messages around BAL availability, synchronization, and parallel-execution use cases.

For Vortik purposes, this is a support surface around BAL exchange. It is not a new Vortik anchor in this PR.

### EIP-8189 / snap/2 - BAL-Based State Healing

EIP-8189 defines a `snap` protocol support surface for BAL-based state healing during sync. It uses BALs and their header commitments as part of a sync catch-up path.

For Vortik purposes, this is a support surface around BAL availability and state healing. It is not a new Vortik anchor in this PR.

## Relationship to the existing registry

- No new registry anchor is added.
- No schema is changed.
- No anchor note is changed.
- Existing terms such as ePBS and execution-related deprecated abstractions may refer to BALs as a more precise technical object, but this PR does not update those entries.
- Future registry changes, if any, require a separate PR.

This note also does not create or imply `bal.eth`, `blockaccesslist.eth`, or any other ENS-based registry entry. ENS names do not create Ethereum protocol truth.

## Suggested state

The following is research-note guidance only, not final registry status:

- BAL / Block-Level Access Lists: PREPARE or ACT-for-terminology only, depending on taxonomy rules and source state.
- `block_access_list_hash`: WATCH/PREPARE as a precise field-level primitive.
- EIP-8159 and EIP-8189: WATCH/PREPARE support surfaces, subordinate to EIP-7928.

Do not read this section as a registry classification, anchor status, or source-of-truth update.

## What not to infer

- Do not claim mainnet activation.
- Do not claim BALs are already live.
- Do not claim EIP-8159 or EIP-8189 are standalone registry primitives.
- Do not create an ENS anchor from this note.
- Do not use AI-generated reports as source of truth.
- Do not include private or commercial strategy.
- Do not infer official Ethereum status beyond what the cited EIPs say.
- Do not infer that ENS names create protocol truth.

## Future PR options

Possible future public PRs, if separately justified, include:

- add a BAL glossary entry or documentation reference;
- add a `docs/index.md` navigation page; or
- later, only if justified by source state and taxonomy rules, consider a registry change in a separate PR.
