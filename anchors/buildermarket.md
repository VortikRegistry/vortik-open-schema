Builder Markets

Associated ENS: "buildermarket.eth"
Canonical term: builder markets
Registry ID: "buildermarket"
Status: Research
Classification: Repairable

---

Summary

This anchor tracks builder markets as an ecosystem-level coordination surface within Ethereum’s block construction pipeline.

While widely used, this term represents an economic abstraction rather than a protocol-defined structure, and its relevance is shifting as Ethereum moves toward protocol-enforced coordination.

---

Context

Ethereum block production involves multiple interacting surfaces including:

- order flow routing
- solver participation
- builder coordination
- proposer selection

Builder markets emerged alongside proposer-builder separation (PBS), describing a competitive environment in which builders construct execution payloads and compete for proposer selection.

---

Structural Shift

With the progression toward enshrined proposer-builder separation (ePBS), coordination is increasingly:

- defined at the protocol level
- enforced through structured interfaces
- less dependent on external relay-mediated markets

As a result, the concept of “builder markets” is becoming less central as a system model, and more descriptive of a specific coordination phase or historical configuration.

---

Semantic Position

Builder markets represent an informal economic coordination abstraction, not a protocol primitive or canonical layer.

They overlap with:

- solver networks
- order flow auctions
- proposer-builder interfaces

This positioning reflects ecosystem behavior rather than protocol-defined architecture.

---

Coordination Role

Builder markets describe:

- competition between block builders
- aggregation and pricing of execution value
- interaction with upstream order flow and downstream proposer selection

However, these functions are increasingly being restructured into protocol-defined roles and objects under evolving designs such as ePBS.

---

Protocol Grounding

This surface is grounded in:

- PBS (Proposer-Builder Separation)
- ePBS (EIP-7732)
- MEV supply chain architecture
- relay-based block construction systems

---

Semantic Note

Builder markets should not be interpreted as a stable architectural component.

They represent a transitional abstraction, useful for describing ecosystem dynamics, but increasingly misaligned with protocol-defined coordination structures.

---

Naming Alignment

- ENS anchor: "buildermarket.eth"
- Canonical term: builder markets

The term remains widely used across ecosystem discussions but is not formally defined at the protocol level and may lose precision as terminology converges toward protocol-native constructs.

---

Registry Role

- Track semantic usage of builder market terminology
- Document competitive dynamics in block construction
- Identify divergence between economic abstractions and protocol-defined roles
- Monitor transition toward protocol-enforced coordination

---

Status

Active research surface with strong historical and ecosystem relevance, but declining structural centrality as protocol-defined coordination primitives emerge.

---

Registry Context

This anchor captures a coordination abstraction describing builder competition within the execution pipeline.

It is included to track semantic transition from market-based descriptions to protocol-defined coordination models, and should not be interpreted as a canonical system layer.

See:

- "docs/security-hourglass/"

These interpretations reflect observed ecosystem behavior and are not protocol-level definitions.

---

Sources

Primary research references are documented in:

"schemas/buildermarket/"
