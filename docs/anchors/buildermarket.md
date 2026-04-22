# Builder Markets

**Associated ENS:** `buildermarket.eth`  
**Canonical term:** builder  
**Registry ID:** `buildermarket`  
**Status:** Research / legacy framing  
**Classification:** deprecated  

---

## Summary

This anchor tracks **builder markets** as an ecosystem-level coordination abstraction within Ethereum’s block construction pipeline.

While the term was historically useful for describing competitive block construction dynamics, it is increasingly less precise as Ethereum moves toward protocol-defined roles and more explicit proposer-builder coordination structures.

In the current registry, this anchor is preserved as a deprecated semantic surface rather than as a canonical protocol-facing term.

---

## Context

Ethereum block production involves multiple interacting coordination surfaces, including:

- order flow routing  
- solver participation  
- builder coordination  
- proposer selection  

Builder markets emerged alongside proposer-builder separation (PBS), describing a competitive environment in which builders construct execution payloads and compete for proposer selection.

This framing captured important ecosystem dynamics during earlier phases of Ethereum’s MEV and block construction discourse.

---

## Structural Shift

With the progression toward enshrined proposer-builder separation (**ePBS**), coordination is increasingly:

- defined at the protocol level  
- enforced through structured interfaces  
- less dependent on external relay-mediated market framing  

As a result, the concept of **builder markets** is becoming less central as a system model, and more descriptive of a historical or transitional coordination environment.

The role of the **builder** remains highly relevant, but the broader label **builder market** is less precise than protocol-native terminology.

---

## Semantic Position

Builder markets represent an informal economic coordination abstraction, not a protocol primitive or canonical system layer.

They overlap with:

- solver networks  
- order flow auctions  
- proposer-builder interfaces  
- payload construction pathways  

This positioning reflects ecosystem behavior rather than protocol-defined architecture.

---

## Coordination Role

Builder markets describe:

- competition between block builders  
- aggregation and pricing of execution value  
- interaction with upstream order flow and downstream proposer selection  

However, these functions are increasingly being restructured into more explicit protocol-defined roles and objects under evolving designs such as **ePBS**.

---

## Protocol Grounding

This surface is grounded in:

- PBS (Proposer-Builder Separation)  
- ePBS (EIP-7732)  
- MEV supply chain architecture  
- relay-based block construction systems  

It remains useful as a descriptive ecosystem term, but not as a canonical protocol-facing primitive.

---

## Structural Importance

This anchor remains useful for documenting semantic transition in Ethereum coordination language.

Its value is interpretive:

- it preserves a historically important framing  
- it captures ecosystem discourse around builder competition  
- it helps distinguish economic abstractions from protocol-native roles  

However, it should not be treated as a durable core coordination primitive.

---

## Semantic Note

Builder markets should not be interpreted as a stable architectural component.

They represent a transitional abstraction, useful for describing ecosystem dynamics, but increasingly misaligned with protocol-defined coordination structures.

The registry therefore treats this anchor as **deprecated**, while preserving it for semantic and historical comparison.

---

## Naming Alignment

- **ENS anchor:** `buildermarket.eth`  
- **Canonical term:** builder  

The ENS remains understandable, but the full phrase **builder markets** is less precise than the narrower protocol-native role of the **builder** itself.

This creates a growing semantic mismatch between the legacy ENS framing and the more precise direction of Ethereum protocol language.

---

## Registry Role

- Track semantic usage of builder market terminology  
- Document competitive dynamics in block construction  
- Identify divergence between economic abstractions and protocol-defined roles  
- Preserve transitional language as Ethereum coordination becomes more explicit  

---

## Status

This anchor has strong historical and ecosystem relevance, but declining structural precision as protocol-defined coordination primitives emerge.

It should be treated as a deprecated semantic surface rather than a canonical coordination layer.

---

## Registry Context

This anchor captures a coordination abstraction describing builder competition within Ethereum’s execution pipeline.

It is included to track semantic transition from market-based descriptions to protocol-defined coordination models, and should not be interpreted as a canonical system layer.

See:

- `docs/security-hourglass/`

These interpretations reflect observed ecosystem behavior and are not protocol-level definitions.

---

## Sources

Primary research references are documented in:

`schemas/buildermarket/`
