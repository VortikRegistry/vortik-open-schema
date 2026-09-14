# ePBS source audit

**Reviewed:** 2026-09-13  
**Registry anchor:** `epbs.eth` / `epbs`  
**Purpose:** public primary-source audit for the current implementation-facing ePBS state.

## Boundary

This document records source state. It does not make Vortik an Ethereum protocol authority, does not claim mainnet activation, and does not treat an ENS name as an official Ethereum namespace.

## Primary sources reviewed

- EIP-7732 — Enshrined Proposer-Builder Separation: https://eips.ethereum.org/EIPS/eip-7732
- EIP-7773 — Hardfork Meta: Glamsterdam: https://eips.ethereum.org/EIPS/eip-7773
- EIP-8282 — Builder Execution Requests: https://eips.ethereum.org/EIPS/eip-8282
- Ethereum consensus specifications: https://github.com/ethereum/consensus-specs
- Ethereum Foundation — Announcing the Platåberget Testnet: https://blog.ethereum.org/2026/08/17/plataberget-testnet
- ethPandaOps — Glamsterdam devnet-9: https://notes.ethereum.org/@ethpandaops/glamsterdam-devnet-9
- ethereum.org — Glamsterdam roadmap: https://ethereum.org/roadmap/glamsterdam/

## Findings

### 1. EIP-7732 status

EIP-7732 is currently a **Review** Standards Track Core EIP. Older Vortik text describing it as Draft was stale and has been corrected.

EIP-7773 lists EIP-7732 as **Scheduled for Inclusion** in Glamsterdam. This is a fork inclusion state, not a mainnet activation claim.

### 2. Public testnet evidence — Platåberget

Ethereum Foundation Protocol DevOps announced Platåberget on 2026-08-17 as Glamsterdam's early testing ground open to public participation.

The announcement explicitly warns application developers that tooling which depends on a hard-capped maximum gas limit can break. This matters to Vortik because Glamsterdam is no longer only a specification/research surface; public infrastructure is exercising post-Glamsterdam assumptions.

Platåberget is testnet evidence, not production-mainnet evidence.

### 3. Glamsterdam devnet-9

The ethPandaOps devnet-9 specification records:

- genesis: 2026-09-01 15:00 UTC;
- Gloas fork: 2026-09-02 15:00 UTC;
- a large pre-fork state at genesis;
- non-finality testing and recovery;
- trunk client images;
- EIP-7732 and EIP-7928 in the tested fork surface;
- EIP-7610 removed from Glamsterdam.

This provides current multi-client implementation-facing evidence while remaining devnet scope.

### 4. Builder lifecycle — EIP-8282

EIP-8282 is a **Review** Core EIP and is Scheduled for Inclusion in Glamsterdam under EIP-7773.

It introduces dedicated EIP-7685 request types and predeploys for EIP-7732 builder deposits/top-ups and exits. This strengthens the semantic case that `builder` is becoming a protocol-explicit role under ePBS rather than only an external market label.

### 5. Block-Level Access Lists and gas/state changes

EIP-7928 — Block-Level Access Lists is Scheduled for Inclusion in Glamsterdam and appears in current testing. BAL is distinct from ePBS, but it interacts with the wider block-production and execution-state architecture.

EIP-8037 and EIP-8038 affect state/gas cost assumptions. They should not be described as ePBS itself. Platåberget's fixed-gas-limit warning is application-facing evidence that execution assumptions around Glamsterdam require active testing.

### 6. Roadmap timing

As reviewed on 2026-09-13, ethereum.org describes Glamsterdam as **testing on devnets**, lists the next milestone as **Sepolia fork — 2026-10-06**, and says mainnet is expected in Q4 2026 with the date not yet confirmed.

The Sepolia date is a public roadmap target and must not be described as a guaranteed activation date. No confirmed Glamsterdam mainnet date is asserted by Vortik.

## Cross-anchor check

`inclusionlist.eth` remains correctly scoped. EIP-7805 / FOCIL is **Declined for Inclusion** in Glamsterdam and **Scheduled for Inclusion** in Hegotá under EIP-8081. Hegotá activation values remain unset.

EIP-8146 — Block Access List Sidecars remains **Proposed for Inclusion** in Hegotá, not Scheduled.

No semantic classification change is required for the existing v0.6.5 ENS anchor set as part of this freshness pass.

## Audit result

**PASS — protocol freshness update required, ontology redesign not required.**

The ePBS anchor remains:

```text
classification: core
status: implementation-facing
stage: canonical
type: primitive
```

The material corrections are source freshness, current EIP status, current public implementation evidence, current Glamsterdam composition, and clearer testnet/mainnet boundaries.
