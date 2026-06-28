# Multi-Agent Verification Audit — 2026-06-28

## Executive summary

This audit records a conservative verification pass over candidate Ethereum and ENS terms surfaced during multi-agent discovery. AI-generated reports from Gemini, Claude, Kimi, or any other model are treated only as secondary discovery inputs: they can suggest terms to check, but they do not establish registry truth.

The only accepted claims below are grounded in primary Ethereum Improvement Proposal (EIP), Ethereum Research, or ENS architecture sources reviewed on 2026-06-28. No registry anchors are added here, no existing registry entries are renamed or deleted, and this document does not change `registry.json`, `anchors/`, `schemas/`, `maps/`, generated outputs, `market.index.json`, or `anchors.index.json`.

This document includes no pricing guidance. It includes no buyer targeting. No external-contact plan is included. It includes no custody claim, no monopoly claim, no tax guidance, no banking information, no weather information, and no personal data.

## Source policy

Primary sources used for acceptance or rejection:

- EIP-7773: Hardfork Meta - Glamsterdam — <https://eips.ethereum.org/EIPS/eip-7773>
- EIP-7732: Enshrined Proposer-Builder Separation — <https://eips.ethereum.org/EIPS/eip-7732>
- EIP-7928: Block-Level Access Lists — <https://eips.ethereum.org/EIPS/eip-7928>
- EIP-7805: Fork-choice enforced Inclusion Lists (FOCIL) — <https://eips.ethereum.org/EIPS/eip-7805>
- EIP-8142: Block-in-Blobs (BiB) — <https://eips.ethereum.org/EIPS/eip-8142>
- EIP-8159: eth/71 - Block Access List Exchange — <https://eips.ethereum.org/EIPS/eip-8159>
- EIP-8189: snap/2 - BAL-Based State Healing — <https://eips.ethereum.org/EIPS/eip-8189>
- EIP-8237: Independent CL/EL Sync — <https://eips.ethereum.org/EIPS/eip-8237>
- Ethereum Research: Mini-Blocks: SSV-Backed Sub-Slot Auctions for Ethereum PBS — <https://ethresear.ch/t/mini-blocks-ssv-backed-sub-slot-auctions-for-ethereum-pbs/24898>
- Ethereum Research: Outcome Preconfs: Verifying Block Commitments Without the Block — <https://ethresear.ch/t/outcome-preconfs-verifying-block-commitments-without-the-block/24466>
- Ethereum Research: Encrypted frame transactions — <https://ethresear.ch/t/encrypted-frame-transactions/24440>
- Ethereum Research: Building towards Multi-Party Block Construction — <https://ethresear.ch/t/building-towards-multi-party-block-construction/24975>
- ENS Blog: A Deeper Dive into the ENSv2 Architecture — <https://ens.domains/blog/post/ensv2-architecture>

Secondary discovery inputs:

- AI-generated reports may identify candidate phrases for manual review.
- AI-generated reports must not be cited as authority for registry inclusion, status, priority, or terminology.
- If an AI report conflicts with a primary source, the primary source controls.
- If no primary source supports a term, the term is WATCH or REJECT, not ACT.

## ACT / PREPARE / WATCH / REJECT state policy

- **ACT**: A term is present in primary sources, has stable-enough terminology, and can be used in registry-facing analysis without implying unapproved status.
- **PREPARE**: A term is primary-source-backed but depends on draft status, implementation details, or fork-scoped decisions that should not be represented as final.
- **WATCH**: A term appears in credible primary research or adjacent draft work, but is not sufficiently settled for registry action.
- **REJECT**: A term is unsupported, hallucinated, over-specific, incorrectly officialized, or prohibited by source evidence.

## Accepted primary-source-backed terms and facts

### Glamsterdam / EIP-7773

- **State**: PREPARE.
- EIP-7773 / Glamsterdam is a Draft Meta EIP.
- EIP-7773 lists EIP-7732 / Enshrined Proposer-Builder Separation and EIP-7928 / Block-Level Access Lists as Scheduled for Inclusion.
- EIP-7773 lists EIP-7805 / Fork-choice enforced Inclusion Lists as Declined for Inclusion in Glamsterdam.
- EIP-7773 does not provide a decided mainnet activation date; activation rows are placeholders until client teams decide activation times.

### ePBS / EIP-7732

- **State**: ACT for the term; PREPARE for fork-specific finality.
- EIP-7732 defines Enshrined Proposer-Builder Separation (ePBS).
- EIP-7732 introduces in-protocol builders and a Payload Timeliness Committee (PTC).
- EIP-7732 defines `ExecutionPayloadBid`, `SignedExecutionPayloadBid`, `ExecutionPayloadEnvelope`, and `SignedExecutionPayloadEnvelope`.
- EIP-7732 describes delayed validation: consensus validation and execution validation are decoupled, with execution validation deferred until the next beacon block validation.

### BALs / EIP-7928

- **State**: ACT for terminology; PREPARE for fork-specific finality.
- EIP-7928 defines Block-Level Access Lists (BALs).
- EIP-7928 introduces `block_access_list_hash` as a block-header field containing the hash of the RLP-encoded block access list.
- EIP-7928 positions BALs as enabling parallel disk reads, parallel transaction validation/execution, parallel state-root computation, and executionless state updates.

### BAL networking and state healing / EIP-8159 and EIP-8189

- **State**: WATCH/PREPARE.
- EIP-8159 is networking support for BAL exchange in the `eth` protocol.
- EIP-8189 is `snap/2` support for BAL-based state healing.
- These networking proposals depend on BAL availability and should not be represented as independent registry primitives.

### Block-in-Blobs / EIP-8142

- **State**: WATCH.
- EIP-8142 / Block-in-Blobs is Draft.
- EIP-8142 is not listed as Scheduled for Inclusion in EIP-7773.
- EIP-8142 should not be described as Glamsterdam SFI unless EIP-7773 changes.

### Independent CL/EL Sync / EIP-8237

- **State**: WATCH.
- EIP-8237 is Draft and requires EIP-7732.
- EIP-8237 modifies `ExecutionPayloadBid`, `BeaconBlockBody`, and `ExecutionPayload` with an accumulator-oriented `partial_header_hash` design for independent consensus/execution-layer synchronization.

### ENSv2 architecture

- **State**: WATCH for registry-adjacent architecture notes only.
- ENSv2 is ENS architecture, not Ethereum consensus.
- ENSv2 architecture discussion covers hierarchical registries, roles, expiration behavior, and Universal Resolver evolution.
- ENSv2 terms must not be treated as consensus primitives, fork components, or Ethereum client-daemon endpoints.

## WATCH terms

These terms may be useful for continued observation but should not cause registry changes in this PR:

- Mini-blocks and SSV-backed sub-slot auctions for PBS, from Ethereum Research.
- Outcome preconfirmations and block-commitment verification without requiring the full block, from Ethereum Research.
- Encrypted frame transactions, from Ethereum Research.
- Multi-party block construction, from Ethereum Research.
- Block-in-Blobs, because EIP-8142 is Draft and is not Glamsterdam SFI in EIP-7773.
- Independent CL/EL Sync, because EIP-8237 is Draft and depends on EIP-7732.
- BAL exchange and BAL-based state healing, because EIP-8159 and EIP-8189 are networking support surfaces rather than standalone canonical registry anchors.

## Rejected hallucinated or unsupported terms

The following terms are rejected or unverified for registry purposes unless future primary sources explicitly support them:

- **State-Root Validation Cascades**: no reviewed primary source establishes this as official Ethereum terminology.
- **SRVC**: no reviewed primary source establishes this abbreviation as official Ethereum terminology.
- **Execution Starvation via State-Tree Fracturing**: no reviewed primary source establishes this phrase as official Ethereum terminology.
- **parallelized Merkle proof invalidation**: no reviewed primary source establishes this as a protocol term or attack class.
- **`srvc_cache_eviction_threshold`**: no reviewed primary source establishes this parameter.
- **Attestation Deadline Decoupling / ADD as official terminology**: EIP-7732 discusses decoupling execution and consensus validation and deferred execution validation, but the reviewed primary sources do not establish ADD as official terminology.
- **Execution Ticket as a Glamsterdam/ePBS component**: the reviewed primary sources do not establish an Execution Ticket as a Glamsterdam or ePBS component.
- **ENSv2 L1 Native Registry framework on Sepolia as official wording**: the ENS architecture source discusses ENSv2 architecture, but the reviewed sources do not establish this phrase as official wording.
- **Any claim that `epbs.eth` or `ssf.eth` are mandatory ENSv2/client-daemon endpoints**: the reviewed ENSv2 and Ethereum protocol sources do not support this claim.

## Hard non-claims for this audit

- No Glamsterdam mainnet activation date is claimed.
- FOCIL is not claimed as Glamsterdam Scheduled for Inclusion; EIP-7773 currently lists EIP-7805 as Declined for Inclusion.
- SRVC and ADD are not added as real registry terms.
- ENSv2 is not treated as a consensus primitive.
- No new registry anchors are proposed or added.
- No existing registry entries are deleted or renamed.
- AI-generated reports are not used as sources of truth.
