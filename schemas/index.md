# Schema Directory

This directory contains machine-readable semantic schemas for primitives tracked by the Vortik Semantic Registry.

Schemas define minimal metadata structures describing conceptual primitives and their research status.

---

## Available Schemas

- epbs — Enshrined Proposer-Builder Separation
- inclusionlist — Inclusion Enforcement / FOCIL
- commitmentlayer — Commitment signaling coordination
- preconflayer — Preconfirmation coordination networks
- ssf — Single Slot Finality research
- buildermarket — Block builder market structures
- solverlayer — Intent solver coordination networks
- executionmarket — Execution market coordination layer
- orderflowauction — Order flow auction routing infrastructure

Schemas are versioned and located under:

`schemas/<primitive>/<version>/schema.json`

---

## Notes

Schemas are added when sufficient primary research sources allow defining a stable semantic surface for the primitive.

Many primitives tracked by the registry remain under active research and their schemas may evolve as terminology and architecture stabilize.
