# Commitment

**Associated ENS:** `commitmentlayer.eth`  
**Canonical term:** commitment  
**Registry ID:** `commitmentlayer`  
**Status:** Research  
**Classification:** repairable  

---

## Summary

This anchor tracks **commitment** as an emerging protocol-relevant coordination primitive within Ethereum.

Commitments are increasingly important in designs where actors provide verifiable signals, bids, promises, or pre-reveal information before a later execution, reveal, or confirmation step.

The ENS identifier `commitmentlayer.eth` captures the correct underlying concept — **commitment** — but introduces a non-canonical architectural suffix: **layer**. For that reason, this anchor is classified as **repairable** rather than canonical.

---

## Context

Commitment mechanisms appear across multiple Ethereum coordination surfaces, including:

- proposer-builder separation  
- bid-based block production  
- preconfirmation systems  
- encrypted or sealed transaction flow  
- commit-before-reveal designs  
- early execution or inclusion guarantees  

In ePBS-style block production, commitment language becomes especially relevant because builders and proposers interact through structured promises, bids, and later payload reveal or validation steps.

Commitments are not limited to preconfirmations. They are a broader coordination primitive that can appear wherever a system separates:

**promise → selection → reveal → verification**

---

## Pipeline Position

Commitment / Pre-Reveal Coordination

---

## Coordination Role

Commitments support coordination between:

- builders  
- proposers  
- validators  
- preconfirmation systems  
- encrypted-orderflow mechanisms  
- external coordination infrastructure  

They allow systems to coordinate around information that is not fully executed, revealed, or finalized yet.

In this sense, commitments help bridge the gap between intent, selection, execution, and verification.

---

## Protocol Grounding

This surface is grounded in:

- ePBS-style builder commitment and payload reveal flows  
- Ethereum research on proposer-builder coordination  
- preconfirmation and proposer-commitment mechanisms  
- encrypted mempool and commit-before-reveal designs  
- broader research on verifiable coordination under delayed reveal  

---

## Semantic Note

Commitment should be treated as a **primitive**, not as a standalone architectural layer.

The underlying term is structurally useful because Ethereum coordination increasingly relies on verifiable promises, bids, or pre-reveal states.

However, the ENS label `commitmentlayer.eth` remains partially misaligned because **layer** is not the dominant protocol-native framing.

The registry therefore treats this anchor as **repairable**:

- `commitment` is semantically valuable  
- `layer` is semantically weaker  
- the full ENS remains useful, but not canonical  

---

## Naming Alignment

- **ENS anchor:** `commitmentlayer.eth`  
- **Canonical term:** commitment  

The name has partial alignment.

The word **commitment** maps to a real and increasingly important coordination primitive. The word **layer** introduces a broader abstraction that does not currently map cleanly to protocol terminology.

This creates a naming mismatch, but not a full semantic failure.

---

## Registry Role

- Track the emergence of commitment as a protocol-relevant primitive  
- Distinguish commitment primitives from broader “layer” abstractions  
- Map commitment behavior across ePBS, preconfirmations, encrypted order flow, and reveal-based coordination  
- Preserve a repairable semantic surface for future convergence  

---

## Status

Active research surface with increasing relevance across Ethereum coordination design.

The anchor should be monitored closely, especially as ePBS, preconfirmations, encrypted mempools, and commit-before-reveal mechanisms continue to evolve.

---

## Sources

Primary research references are documented in:

`schemas/commitmentlayer/`
