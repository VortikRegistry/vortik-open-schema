# Enshrined Proposer-Builder Separation (ePBS)

**Associated ENS:** `epbs.eth`  
**Canonical term:** enshrined proposer-builder separation (ePBS)  
**Registry ID:** `epbs`  
**Status:** implementation-facing  
**Classification:** core  

---

## Summary

This anchor tracks **Enshrined Proposer-Builder Separation (ePBS)** as a protocol-facing coordination primitive within Ethereum.

ePBS formalizes the separation between block proposal and execution payload construction at the protocol design level. It moves proposer-builder coordination closer to Ethereum’s consensus boundary, replacing reliance on trusted off-protocol relay coordination with a more explicit protocol-defined interaction between proposers, builders, bids, commitments, payload reveal, and timing checks.

Vortik tracks `epbs.eth` because the term **ePBS** has strong semantic alignment with the EIP-7732 coordination surface and is one of the clearest naming surfaces for protocol-facing block production changes.

This document is not an official Ethereum specification. It is a registry anchor document used by Vortik to describe why the term is tracked, how it is classified, and what risks or boundaries apply.

---

## Context

Proposer-Builder Separation (PBS) emerged as a way to separate block construction from block proposal. In today’s external PBS / MEV-Boost-style architecture, much of that coordination depends on relays, external infrastructure, builder markets, timing assumptions, and off-protocol trust boundaries.

Enshrined Proposer-Builder Separation extends this model by moving key parts of the proposer-builder interface into Ethereum’s protocol design.

The primary specification associated with this anchor is **EIP-7732**. EIP-7773 currently lists EIP-7732 / ePBS as **Scheduled for Inclusion** in Glamsterdam. Vortik treats that as source-state support for ePBS as a strong protocol-facing primitive while keeping scheduled inclusion separate from final deployment or live mainnet activation.

Vortik does not treat ePBS as a deployed mainnet feature. It is tracked as **implementation-facing** because the terminology, specification surface, and engineering discussion around ePBS have matured enough to make the term structurally important for Ethereum coordination mapping.

The relevant semantic shift is not that Ethereum “eliminates markets” or “eliminates builders.” Builders remain important. The shift is that Ethereum increasingly defines the rules, commitments, and timing boundaries under which proposer-builder coordination happens.

---

## Pipeline Position

**Block construction / proposer-builder interface**

ePBS sits at the coordination boundary between:

- consensus-layer proposal responsibilities
- execution payload construction
- builder bids
- proposer selection
- payload reveal
- timing and availability checks
- validator-facing coordination

This makes ePBS a high-priority registry anchor because it connects protocol roles, commitments, payload semantics, and block production flow.

---

## Coordination Role

ePBS defines a protocol-facing coordination interface between:

- proposers
- builders
- validators
- payload commitments
- execution payload reveal
- timing or availability checks
- consensus-facing block production rules

The central coordination change is that proposer-builder interaction becomes more explicit inside the protocol design, rather than being mediated primarily through trusted external relay infrastructure.

In Vortik’s ontology, ePBS is classified as a **core primitive** because it maps directly to a major protocol-facing coordination surface rather than to a vague market narrative, application-level abstraction, or off-protocol service category.

---

## Protocol Grounding

This anchor is grounded in:

- **EIP-7732**
- proposer-builder separation research
- consensus-layer block production discussions
- ePBS implementation-facing engineering work
- payload commitment and reveal semantics
- builder/proposer coordination design
- Payload Timeliness Committee and related timing-check discussions

The registry uses this grounding cautiously. It does not claim that `epbs.eth` is an official Ethereum endpoint, an official protocol namespace, or an Ethereum Foundation-controlled naming surface.

---


## EIP-7732 Source Notes

EIP-7732 defines **Enshrined Proposer-Builder Separation (ePBS)** as a draft Core EIP that separates an Ethereum block into consensus and execution parts and adds an in-protocol mechanism for the consensus proposer to choose the execution proposer. This registry anchor treats that terminology as source-grounded while distinguishing terminology from fork finality, deployment, or mainnet activation. EIP-7773 lists EIP-7732 as Scheduled for Inclusion in Glamsterdam, but activation rows remain unset until client teams decide activation times; this note therefore does not claim final deployment.

Within the EIP-7732 design, builders are introduced as an in-protocol entity tracked by the beacon state. PTC is introduced as the **Payload Timeliness Committee**, a subset of validators assigned to attest to whether the corresponding builder revealed the committed execution payload with the expected block hash in a timely way and whether corresponding blob data was available from their view. PTC is therefore tracked here as an ePBS role/component, not as a separate registry anchor.

EIP-7732 defines the following ePBS containers and related signed containers:

- `ExecutionPayloadBid`
- `SignedExecutionPayloadBid`
- `ExecutionPayloadEnvelope`
- `SignedExecutionPayloadEnvelope`

EIP-7732 also describes delayed validation: consensus validation and execution validation are decoupled logically and temporally. PTC members are not required to validate the execution payload before attesting to payload timeliness; execution validation is deferred until the next beacon block validation path.

These notes are limited to EIP-7732-backed terminology and mechanisms. They do not claim that ePBS is active on Ethereum mainnet, do not assign a mainnet activation date, and do not imply that Vortik or `epbs.eth` is an official Ethereum namespace.

## Semantic Stability

The term **ePBS** has strong semantic stability relative to most Ethereum coordination terms.

Reasons:

- it is directly associated with enshrined proposer-builder separation
- it is tied to EIP-7732
- it is short, precise, and widely recognizable in protocol discussions
- it maps to a concrete proposer-builder coordination surface
- it avoids weaker legacy framing such as “builder market” or “blockspace market”

However, the registry should still avoid overstating finality. Protocol scope, implementation details, and fork timelines can change. Vortik therefore tracks ePBS as **implementation-facing**, not as a deployed or finalized mainnet component.

---

## Structural Importance

ePBS is important because it changes where proposer-builder coordination is defined.

The relevant transition is:

```text
relay-mediated proposer-builder coordination
→ protocol-facing proposer-builder coordination
```

This does not remove economic competition among builders. It changes the trust and coordination boundary.

The most important semantic consequences are:

- builder remains a protocol-relevant role
- proposer-builder separation becomes more explicit
- payload commitments become structurally important
- reveal timing and payload availability become central coordination concerns
- relay trust is reduced as a core coordination assumption
- block production semantics become more machine-readable and protocol-facing

For Vortik, this makes ePBS a stronger semantic anchor than broader legacy terms such as `buildermarket`, `executionmarket`, or `blockspacemarket`.

---

## Naming Alignment

- **ENS anchor:** `epbs.eth`
- **Canonical term tracked:** enshrined proposer-builder separation (ePBS)

The ENS name is strongly aligned with the technical acronym.

Unlike several other anchors in the registry, `epbs.eth` does not contain a problematic suffix such as `market`, `auction`, or `layer`.

This is why Vortik classifies it as:

```text
classification: core
type: primitive
status: implementation-facing
stage: canonical
```

This classification means that Vortik considers the term structurally important and semantically aligned. It does not mean that Vortik defines the protocol term or controls its official meaning.

---

## Registry Role

Vortik uses this anchor to:

- track semantic stabilization around ePBS
- distinguish enshrined PBS from external PBS infrastructure
- map ePBS as a protocol-facing coordination primitive
- separate protocol-defined roles from older market-centric terminology
- connect ePBS to payload commitments, builder bids, proposer selection, and reveal timing
- provide machine-readable registry context for Ethereum coordination terminology

The registry role is observational and interpretive.

Vortik does not define Ethereum protocol rules, does not replace official specifications, and does not claim authority over Ethereum terminology.

---

## Boundaries and Non-Claims

This anchor should not be used to claim that:

- ePBS is already deployed on Ethereum mainnet
- `epbs.eth` is an official Ethereum or Ethereum Foundation endpoint
- Vortik is the official registry for Ethereum protocol terms
- ePBS eliminates MEV
- ePBS eliminates builders
- ePBS makes execution deterministic
- ePBS removes all external coordination
- ePBS guarantees decentralization by itself

The accurate framing is narrower:

```text
ePBS formalizes proposer-builder coordination more explicitly at the protocol boundary.
```

---

## Relationship to Other Anchors

### `inclusionlist.eth`

`inclusionlist.eth` tracks fork-choice enforced inclusion lists / FOCIL-style inclusion constraints.

Together, `epbs.eth` and `inclusionlist.eth` represent two different but complementary directions:

```text
epbs.eth → proposer-builder coordination / block production interface
inclusionlist.eth → censorship-resistance constraint / inclusion guarantees
```

### `commitmentlayer.eth`

`commitmentlayer.eth` tracks the broader term `commitment`.

It is relevant because ePBS depends on commitment-like semantics around bids, headers, payload reveal, and accountability. However, `commitmentlayer.eth` remains classified as `repairable` because `layer` is not a canonical protocol suffix.

### `buildermarket.eth`

`buildermarket.eth` is classified as deprecated because the term “builder market” is less precise than the protocol-facing builder role and associated ePBS primitives.

Builders remain economically important. The deprecated classification applies to the naming abstraction, not to the existence of builders.

---

## Status

Current registry status:

```text
implementation-facing
```

This means the anchor is relevant to active specification, implementation, and engineering-facing discussion, while avoiding the stronger and potentially misleading claim that ePBS is already fully implemented as a deployed Ethereum mainnet feature.

Vortik tracks `epbs.eth` as a **core semantic anchor** because the term has strong alignment with a protocol-facing primitive and because it maps cleanly to Ethereum’s proposer-builder separation roadmap.

---

## Sources

Primary source context is documented in:

```text
schemas/epbs/1.0-draft/sources.md
```

Machine-readable schema:

```text
schemas/epbs/1.0-draft/schema.json
```

Registry entry:

```text
registry.json
```
