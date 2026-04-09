# Semantic Status

This document tracks the current semantic maturity of primitives, roles, and coordination surfaces referenced by the Vortik Semantic Registry.

Status reflects **semantic stabilization**, not implementation readiness.

---

## Protocol Primitives (High Confidence)

These primitives are grounded in protocol specifications or active EIPs.

- epbs — enshrined proposer-builder separation (EIP-7732)  
- inclusionlist — fork-choice enforced inclusion (FOCIL, EIP-7805)  

These represent:

→ **protocol-defined coordination mechanisms**  
→ **structurally stable primitives**

---

## Emerging Coordination Roles and Mechanisms

These surfaces reflect real coordination structures, but are still stabilizing in terminology and scope.

- commitmentlayer — commitment signaling (preconfirmation-related)  
- preconflayer — preconfirmation systems  
- solverlayer — solver coordination  
- orderflowauction — order flow auctions (OFA)  

These represent:

→ **active coordination mechanisms**  
→ **partially stabilized terminology surfaces**

---

## Ambiguous / Premature Surfaces

These terms appear in research and discussion, but lack clear semantic boundaries or canonical definition.

- executionmarket — execution coordination (ambiguous term)  

These represent:

→ **unstable terminology clusters**  
→ **non-canonical coordination abstractions**

They are tracked to prevent premature standardization.

---

## Legacy / Degrading Abstractions

These concepts were historically useful, but are losing precision due to protocol evolution.

- buildermarket — builder markets / builder coordination abstraction  

These represent:

→ **superseded coordination models**  
→ **semantic drift away from protocol reality**

In particular:

- builder is now a **protocol-defined role (ePBS)**  
- market-based descriptions are being replaced by **role-based coordination**

---

## Consensus Research

These primitives relate to long-term consensus evolution.

- ssf — single-slot finality (SSF)  

These represent:

→ **high-impact research directions**  
→ **emerging consensus-level primitives**

---

## Interpretation

The registry distinguishes between:

- **protocol primitives** → defined or formalizing within the protocol  
- **coordination roles and mechanisms** → observable system structures  
- **ambiguous terminology surfaces** → unstable or overlapping concepts  
- **legacy abstractions** → concepts losing structural relevance  

---

## Structural Shift (2026)

Ethereum coordination is transitioning from:

→ market-based and layered descriptions  

to:

→ **role-based coordination**  
→ **commitment-driven validation**  
→ **constraint-enforced inclusion**  
→ **asynchronous execution pipelines**

This shift directly impacts semantic classification.

---

## Notes

- Terminology evolves as research converges  
- Classification is defined at the schema level and may change over time  
- Inclusion does not imply protocol standardization
