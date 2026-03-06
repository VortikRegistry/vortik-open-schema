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

Schemas are versioned and located under:

`schemas/<primitive>/<version>/schema.json`

---

## Notes

Some anchors tracked by the registry currently do not have schemas yet, including:

- buildermarket.eth
- solverlayer.eth
- executionmarket.eth
- orderflowauction.eth

Schemas may be added only when sufficient primary research sources justify a stable semantic model.
