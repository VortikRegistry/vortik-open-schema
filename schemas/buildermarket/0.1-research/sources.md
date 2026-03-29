# Builder Markets — Sources

## Overview

This document compiles primary references and terminology associated with **builder markets** within Ethereum block production and execution infrastructure.

It supports the semantic anchoring of `buildermarket.eth` within the Vortik Semantic Registry.

---

## Research Context

Builder markets describe the competitive environment where block builders construct execution payloads and compete to supply blocks to proposers.

These markets emerged from proposer-builder separation (PBS) architectures and became operational through external PBS implementations such as MEV-Boost.

Builder markets operate at the block construction stage of the execution pipeline and are closely tied to:

- proposer-builder separation mechanisms  
- block construction competition  
- bid-based block selection  
- execution supply chain coordination  

---

## Primary Research Threads

- ePBS Design Constraints  
  https://ethresear.ch/t/epbs-design-constraints/18728

- Why Enshrine Proposer-Builder Separation — A viable path to ePBS  
  https://ethresear.ch/t/why-enshrine-proposer-builder-separation-a-viable-path-to-epbs/15710

---

## Terminology Surface

Common terminology associated with this coordination surface includes:

- builder markets  
- builder market  
- block builder market  
- block building market  
- builder competition  

---

## Status

Research coordination surface (2026).

Builder markets represent a key coordination mechanism within Ethereum block production and are closely tied to proposer-builder separation architectures.

While not themselves a standalone protocol primitive, they are a core component of the block-building pipeline.
