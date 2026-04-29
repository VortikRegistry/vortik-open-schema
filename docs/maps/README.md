# Coordination Surfaces Map

This map is a semantic abstraction used by the **Vortik Semantic Registry**.

It does not describe a strict Ethereum protocol architecture.

It represents an interpretive view of how coordination-related terminology clusters across Ethereum protocol research, infrastructure, and external coordination systems.

This map is not a source of truth.

Formal definitions live in `/schemas/`.

The central registry index is `registry.json`.

---

## Coordination Surfaces

Vortik currently tracks or interprets coordination through several recurring domains:

- Proposer-builder separation
- Inclusion constraints
- Commitments and pre-reveal coordination
- Preconfirmations and latency guarantees
- Order flow access and routing
- Solver and intent resolution
- Proof generation
- Sequencing and ordering
- Finality and consensus timing

These domains are:

- not strictly sequential
- partially overlapping
- differently grounded in protocol, research, or external infrastructure
- subject to semantic convergence or deprecation over time

---

## Core Protocol-Aligned Surfaces

These surfaces have strong protocol-facing grounding.

- ePBS / proposer-builder separation
- Inclusion lists / FOCIL

Related anchors:

- `epbs.eth`
- `inclusionlist.eth`

---

## Repairable or Emerging Surfaces

These surfaces are meaningful but include naming mismatch, incomplete stabilization, or roadmap uncertainty.

- Commitment
- Preconfirmation
- Single-slot finality

Related anchors:

- `commitmentlayer.eth`
- `preconflayer.eth`
- `fastfinality.eth`

---

## External Coordination Surfaces

These surfaces are Ethereum-adjacent or off-protocol, but still relevant to Ethereum coordination.

- Solver systems
- Order flow auctions
- Proving markets
- Sequencing markets

Related anchors:

- `solverlayer.eth`
- `orderflowauction.eth`
- `provingmarket.eth`
- `sequencingmarket.eth`

---

## Deprecated or Misaligned Surfaces

These are broad market-oriented abstractions with reduced precision relative to current protocol-native terminology.

- Builder markets
- Execution markets
- Blockspace markets

Related anchors:

- `buildermarket.eth`
- `executionmarket.eth`
- `blockspacemarket.eth`

These are retained for historical and comparative interpretation.

They should not be treated as canonical protocol structures.

---

## What this shows

This map illustrates how coordination-related terminology clusters into recurring semantic domains.

These domains:

- are not protocol specifications
- are not strict execution stages
- may overlap
- may shift as Ethereum terminology stabilizes
- may become deprecated if more precise language emerges

This is not a pipeline.

---

## Why it matters

As terminology converges:

- interpretation becomes easier
- semantic fragmentation decreases
- protocol-native and external terminology can be separated more clearly
- deprecated abstractions can be tracked without overstating their current precision
- coordination becomes structurally legible

This helps researchers, infrastructure teams, and semantic tooling reason about Ethereum coordination more consistently.

---

## Relationship to Vortik

Each surface in this map relates to semantic anchors tracked in the Vortik registry.

Relevant files:

- `../registry.json`
- `../anchors.index.json`
- `coordination-stack.json`
- `coordination-surfaces.json`
- `emerging-signals.json`
- `../anchors/`
- `../schemas/`

Maps are interpretive views.

They do not replace the registry or schemas.
