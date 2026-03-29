# Ethereum Coordination Stack (Strawmap Era)

This document outlines the conceptual coordination layers referenced by the Vortik Semantic Registry.

The stack reflects terminology across Ethereum protocol research and execution infrastructure during the Strawmap era.

It is not intended as a strict architectural specification, but rather as a conceptual map of coordination surfaces across the Ethereum transaction supply chain.

---

## Coordination Stack

Order Flow  
↓  
Order Flow Auctions  
↓  
Solver Networks  
↓  
Execution Coordination Surfaces  
↓  
Builder Markets  
↓  
ePBS (Proposer-Builder Separation)  
↓  
Inclusion Lists (FOCIL)  
↓  
Commitment Layer  
↓  
Preconfirmation Layer  
↓  
Single Slot Finality (SSF)

---

## Layer Overview

### Order Flow
User transactions originate from wallets, applications and routing systems.

### Order Flow Auctions
Order flow auctions route transaction flow among competing execution participants.

### Solver Networks
Solvers compete to determine optimal execution outcomes, often within intent-based architectures.

### Execution Coordination Surfaces
Execution coordination surfaces describe environments where routing, liquidity access and transaction execution strategies are coordinated across participants. Terminology in this area remains fluid across research discussions.

### Builder Markets
Builders compete to construct blocks and produce payloads for proposers.

### ePBS
Enshrined proposer-builder separation formalizes the builder market at the protocol level.

### Inclusion Lists (FOCIL)
Inclusion lists introduce censorship-resistance constraints during block construction.

### Commitment Layer
Commitment systems enable proposer signaling and coordination mechanisms prior to block publication.

### Preconfirmation Layer
Preconfirmations reduce latency by providing early transaction guarantees derived from commitment mechanisms.

### Single Slot Finality
Single Slot Finality (SSF) represents a potential evolution of Ethereum consensus toward near-instant finality.
