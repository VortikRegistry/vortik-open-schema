# Enshrined Proposer-Builder Separation (ePBS)

**Associated ENS:** `epbs.eth`  
**Canonical term:** enshrined proposer-builder separation (ePBS)  
**Registry ID:** `epbs`  
**Status:** implementation-facing  
**Classification:** core  
**Protocol freshness reviewed:** 2026-09-13

---

## Summary

This anchor tracks **Enshrined Proposer-Builder Separation (ePBS)** as a protocol-facing coordination primitive within Ethereum.

ePBS formalizes the separation between block proposal and execution-payload construction at the protocol boundary. Under the current EIP-7732 design, builders become an in-protocol actor, builder bids and proposer selection become explicit protocol objects, execution-payload reveal is separated from the consensus block, and validators gain payload-timeliness duties.

`epbs.eth` is used by Vortik as a semantic anchor because the label aligns directly with the technical acronym. It is not an official Ethereum endpoint or namespace.

Vortik is an independent semantic registry. This document is not an Ethereum specification and must not be used as a substitute for the current EIP, consensus specifications, client documentation, or fork activation sources.

---

## Current upstream state — 2026-09-13

The primary specification is **EIP-7732**.

As of this review:

- EIP-7732 is a **Review** Standards Track Core EIP.
- EIP-7773 lists EIP-7732 as **Scheduled for Inclusion** in Glamsterdam.
- Glamsterdam is in active testing; this does not mean ePBS is deployed on Ethereum mainnet.
- ethereum.org lists the next Glamsterdam milestone as a **Sepolia fork target on 2026-10-06** and describes mainnet as expected in Q4 2026 with no confirmed mainnet date.
- **EIP-8282 — Builder Execution Requests** is also in Review and Scheduled for Inclusion in Glamsterdam. It gives EIP-7732 builders dedicated deposit and exit request paths.

These are source states, not Vortik judgments about activation.

---

## Public implementation evidence

### Platåberget

On 2026-08-17, Ethereum Foundation Protocol DevOps announced **Platåberget** as Glamsterdam's early testing ground open to public participation.

Platåberget matters to this anchor because it moves ePBS-related assumptions out of specification-only discussion and into a public testing environment. The announced network also highlights application-facing breaking changes, including the need to remove assumptions that Ethereum has a permanently hard-capped maximum gas limit.

Vortik treats Platåberget as **public implementation evidence**, not as mainnet activation evidence.

### Glamsterdam devnet-9

ethPandaOps documents Glamsterdam devnet-9 with:

- genesis on **2026-09-01 15:00 UTC**;
- the Gloas fork on **2026-09-02 15:00 UTC**;
- trunk client images;
- a large pre-fork validator state;
- explicit non-finality testing;
- EIP-7732 and EIP-7928 in the tested fork surface;
- EIP-7610 recorded as removed from Glamsterdam.

This is stronger implementation-facing evidence than the earlier registry snapshot, while still remaining devnet evidence.

---

## Coordination position

ePBS sits at the boundary between:

- beacon-block proposal;
- execution-payload construction;
- builder bidding;
- proposer selection;
- payload commitments;
- execution-payload reveal;
- blob/data availability checks;
- payload-timeliness attestations;
- fork-choice and validator duties.

The important transition is:

```text
relay-mediated proposer-builder coordination
→ protocol-defined proposer-builder coordination
```

That transition reduces reliance on trusted middleware in the critical proposer-builder exchange. It does **not** remove builders, economic competition, MEV, or all external infrastructure.

---

## Protocol objects and roles

Current EIP-7732 terminology includes protocol objects and duties such as:

- `ExecutionPayloadBid`
- `SignedExecutionPayloadBid`
- `ExecutionPayloadEnvelope`
- `SignedExecutionPayloadEnvelope`
- builders as an in-protocol staked actor
- proposer selection of an execution proposer
- the Payload Timeliness Committee (PTC)
- payload-timeliness attestations
- delayed/decoupled execution validation

For semantic purposes, this makes **bids, commitments, payload reveal, timeliness, builder lifecycle, and validator/builder coordination** more precise terms than older generic “builder market” framing.

---

## Builder lifecycle and EIP-8282

EIP-8282 adds two EIP-7685 request types and corresponding predeploy contracts for EIP-7732 builders:

- builder deposit / top-up requests;
- builder exit requests.

Its motivation is to stop reusing validator lifecycle paths for builders after the fork and make the builder actor explicit at the request-type level.

Vortik treats EIP-8282 as supporting evidence for the semantic stabilization of the **builder** role under ePBS. It does not create a separate registry anchor in this update.

---

## Relationship to Block-Level Access Lists

**EIP-7928 — Block-Level Access Lists (BALs)** is Scheduled for Inclusion in Glamsterdam and appears alongside ePBS in current testing.

BALs and ePBS are distinct primitives:

```text
ePBS
→ proposer / builder / bid / payload-reveal coordination

BAL
→ execution-state access declaration and block-level execution/state surface
```

They interact in the broader Glamsterdam block-production architecture, but Vortik does not collapse them into one concept.

EIP-8146, currently Proposed for Inclusion in Hegotá, further explores BAL sidecars and a BAL commitment inside `ExecutionPayloadBid`. That proposal is post-Glamsterdam context and must not be described as already Scheduled or activated.

---

## Relationship to Inclusion Lists

`inclusionlist.eth` tracks **Fork-choice Enforced Inclusion Lists (FOCIL)** / EIP-7805.

The fork states remain distinct:

- EIP-7805 / FOCIL is **Declined for Inclusion** in Glamsterdam.
- EIP-8081 lists EIP-7805 as **Scheduled for Inclusion** in Hegotá.
- Hegotá activation rows remain unset.

ePBS and FOCIL remain semantically complementary:

```text
epbs.eth
→ proposer-builder coordination / block-production interface

inclusionlist.eth
→ protocol-facing inclusion constraint / censorship-resistance surface
```

---

## Gas-limit and repricing context

Glamsterdam also contains execution-layer changes that affect assumptions around gas and state costs, including EIP-8037 and EIP-8038.

Platåberget's public announcement explicitly warns application developers that tooling which assumes a fixed maximum gas limit can break.

Vortik tracks this as surrounding execution context. Gas repricing is **not** part of the definition of ePBS and should not be conflated with EIP-7732.

---

## Machine-readable feed

Vortik publishes a deterministic public feed for this anchor:

- `https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json`
- contract: `schemas/feeds/vortik-anchor-feed/1.0.1/schema.json`
- source trail: `schemas/epbs/1.0-draft/sources.md`

The feed is a Vortik semantic artifact and explicitly denies protocol and ENS authority.

---

## Semantic stability

The term **ePBS** remains one of the registry's strongest semantic matches because:

- it maps directly to EIP-7732;
- the ENS label matches the technical acronym;
- the mechanism has concrete protocol objects and validator/builder duties;
- it is Scheduled for Inclusion in Glamsterdam;
- public testnet and devnet implementation evidence now exists;
- related builder lifecycle work is becoming more explicit through EIP-8282.

The registry therefore retains:

```text
classification: core
status: implementation-facing
stage: canonical
type: primitive
```

No stronger deployment claim is implied.

---

## Boundaries and non-claims

This anchor must not be used to claim that:

- ePBS is already active on Ethereum mainnet;
- Sepolia's roadmap target is a guaranteed activation date;
- Glamsterdam's mainnet date is confirmed;
- `epbs.eth` is controlled by Ethereum Foundation, ENS Labs, or ENS DAO;
- Vortik defines Ethereum protocol terminology;
- ePBS eliminates MEV, builders, or every external relay/infrastructure role;
- a devnet or Platåberget result is equivalent to mainnet production evidence.

The accurate framing is:

```text
ePBS is a protocol-facing proposer-builder coordination primitive,
Scheduled for Inclusion in Glamsterdam and backed by active public
testnet/devnet implementation evidence as of 2026-09-13.
```

---

## Sources

Primary source context is maintained in:

```text
schemas/epbs/1.0-draft/sources.md
```

Current high-value references include:

- https://eips.ethereum.org/EIPS/eip-7732
- https://eips.ethereum.org/EIPS/eip-7773
- https://eips.ethereum.org/EIPS/eip-8282
- https://github.com/ethereum/consensus-specs
- https://blog.ethereum.org/2026/08/17/plataberget-testnet
- https://notes.ethereum.org/@ethpandaops/glamsterdam-devnet-9
- https://ethereum.org/roadmap/glamsterdam/
