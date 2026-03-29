# Schema Directory

This directory contains machine-readable semantic schemas for coordination primitives tracked by the Vortik Semantic Registry.

Schemas define minimal, structured representations of emerging terminology across Ethereum’s execution and consensus pipeline.

They are designed to track **semantic stabilization**, not to define protocol specifications.

---

## Available Schemas

- epbs — Enshrined Proposer-Builder Separation  
- inclusionlist — Inclusion enforcement (FOCIL)  
- commitmentlayer — Commitment signaling coordination  
- preconflayer — Preconfirmation coordination networks  
- ssf — Single Slot Finality research  
- buildermarket — Builder coordination and bidding environments  
- solverlayer — Solver-based execution coordination  
- executionmarket — Execution coordination (ambiguous term)  
- orderflowauction — Order flow auction routing systems  

Schemas are versioned and located under:

`schemas/<primitive>/<version>/schema.json`

---

## Semantic Model

Each schema captures a coordination surface using a consistent structure:

- **canonical_term** → normalized terminology used by the registry  
- **classification** → core / emerging / adjacent / premature  
- **pipeline_position** → where the surface sits in the execution pipeline  
- **coordination_role** → what function it performs  
- **protocol_grounding** → links to EIPs or research threads  
- **naming** → ENS mapping and semantic alignment  

This model allows the registry to distinguish between:

- canonical protocol primitives  
- emerging coordination layers  
- ambiguous or unstable terminology  

---

## Notes

Schemas are introduced when sufficient research signals allow defining a coherent semantic surface.

However, inclusion does not imply protocol standardization.

Many tracked primitives remain under active research and their terminology may evolve as Ethereum architecture converges.

---

## Positioning

The schema directory functions as a **semantic interface layer** for Ethereum coordination primitives.

Its purpose is to reduce ambiguity, track terminology convergence, and provide a consistent reference surface across research, infrastructure and protocol discussions.
