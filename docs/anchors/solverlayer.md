# Solver

**Associated ENS:** `solverlayer.eth`  
**Canonical term:** solver (external)  
**Registry ID:** `solverlayer`  
**Status:** Research  
**Classification:** external  

---

## Summary

This anchor tracks **solvers** as external coordination actors involved in intent resolution, execution strategy formation, routing, and off-protocol transaction coordination.

Solvers are relevant across intent-based systems, order-flow routing, MEV-aware execution, and off-chain coordination environments.

However, solvers are not currently treated as core Ethereum L1 protocol roles. They operate primarily as external actors around Ethereum’s execution environment rather than as protocol-defined participants.

The ENS identifier `solverlayer.eth` captures the relevant concept of **solver**, but introduces a non-canonical architectural suffix: **layer**. For that reason, this anchor is classified as **external** rather than core.

---

## Context

Solver systems have emerged from intent-based execution, routing markets, and off-chain coordination mechanisms.

They may be responsible for:

- interpreting user intents  
- constructing execution strategies  
- competing to fulfill desired outcomes  
- routing transactions or bundles through execution pathways  
- optimizing execution quality, price, latency, or settlement outcome  

This surface developed alongside:

- intent-based execution architectures  
- order flow auctions  
- private order flow systems  
- MEV-aware routing infrastructure  
- solver and searcher competition  

Solvers are important, but they remain outside the core Ethereum L1 protocol model.

---

## Pipeline Position

External Intent Resolution / Execution Strategy Surface

---

## Coordination Role

Solvers coordinate around user goals rather than simply relaying raw transactions.

They may compete to:

- determine how user intents are executed  
- construct efficient execution paths  
- source liquidity or settlement routes  
- optimize execution outcomes  
- capture or redistribute execution-related value  

In this sense, solvers act as external execution-strategy actors between user intent and downstream inclusion pathways.

---

## Strategy Dynamics

Solver systems introduce competition over:

- execution paths  
- routing quality  
- liquidity access  
- transaction ordering strategy  
- value extraction and distribution  
- fulfillment guarantees  

Different solvers may produce different outcomes for the same user intent, creating a competitive environment around execution quality and profitability.

---

## Dependency Structure

Solver systems may depend on:

- access to order flow  
- intent architecture  
- liquidity routes  
- private or public routing infrastructure  
- interaction with builders, searchers, or execution services  
- downstream inclusion mechanisms  

Their effectiveness is constrained by upstream flow access and downstream settlement or inclusion conditions.

---

## Protocol Grounding

This surface is not currently defined as an Ethereum L1 protocol role.

It is grounded in:

- Ethereum research on intent-based systems  
- solver competition mechanisms  
- off-chain execution coordination models  
- MEV-aware execution and routing infrastructure  
- application-layer and rollup-adjacent coordination systems  

Solvers should be treated as external coordination actors rather than protocol-native L1 primitives.

---

## Structural Importance

Solvers are important because they shape how user intent becomes executable action.

They may influence:

- execution pathways  
- user outcomes  
- routing efficiency  
- value capture and redistribution  
- MEV exposure or mitigation  
- interaction between application-layer intent systems and Ethereum settlement  

However, this importance is external to the core L1 protocol. The registry therefore tracks solver terminology as an external coordination surface, not as a canonical Ethereum protocol role.

---

## Naming Alignment

- **ENS anchor:** `solverlayer.eth`  
- **Canonical term:** solver (external)  

The name has partial alignment.

The word **solver** maps to a real and increasingly important external coordination actor. The word **layer** introduces a broader architectural abstraction that does not currently map cleanly to Ethereum L1 protocol terminology.

This makes the anchor useful for tracking external coordination, but not canonical as a protocol primitive.

---

## Semantic Stability

The term **solver** has meaningful traction across intent-based execution and off-chain coordination systems.

However, the broader phrase **solver layer** is less stable and more architectural than protocol-native.

The registry therefore treats this anchor as external: relevant, monitorable, but not core to the current L1 protocol ontology.

---

## Registry Role

- Track solver terminology as an external coordination actor  
- Distinguish solver systems from protocol-native L1 roles  
- Document intent-resolution and execution-strategy surfaces  
- Monitor whether solver terminology stabilizes, fragments, or becomes absorbed into more specific application or rollup ecosystems  
- Preserve solver-related semantics without overstating L1 protocol alignment  

---

## Status

Active external research and ecosystem surface.

Solvers remain relevant to Ethereum-adjacent execution systems, but they should not currently be treated as canonical L1 protocol primitives, roles, or constraints.

---

## Sources

Primary research references are documented in:

`schemas/solverlayer/`
