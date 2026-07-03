# Naming and governance boundaries

Names are useful because they give humans stable handles for complex systems. A concise name can make a technical area easier to discuss, review, compare, and document without replacing the primary sources that define the underlying system.

When names become infrastructure-adjacent, governance, authority, and source-of-truth boundaries must remain legible. A human-readable name can help people find related material, but it should not be mistaken for governance approval, operational control, or protocol truth.

Vortik Registry uses ENS-style names such as `epbs.eth` and `inclusionlist.eth` only as semantic anchors. In this repository, ENS anchors are naming surfaces, not authority surfaces. They provide readable handles for registry entries and related documentation; they do not define Ethereum protocol behavior.

Protocol truth must come from primary sources such as EIPs, specifications, source notes, and validation logic. Registry state is defined by repository artifacts, not by ENS DAO governance, ENS name ownership, ENS Foundation activity, ENS Labs activity, or any ENS deployment model.

## What an ENS anchor does not mean

An ENS anchor in this repository does not mean:

- official Ethereum status;
- Ethereum Foundation endorsement;
- ENS DAO endorsement;
- ENS Foundation endorsement;
- ENS Labs endorsement;
- support for or against any ENS DAO governance proposal;
- dependence on any ENS DAO governance outcome;
- dependence on ENSv2 deployment, ENSv2 architecture, ENS subregistries, or ENS local registries;
- a claim that the ENS name stores, controls, resolves, or defines Ethereum protocol metadata;
- a claim that an ENS name creates protocol truth;
- a claim that an ENS name has operational authority over clients, validators, builders, wallets, or automated queries;
- a claim that ENS governance is good, bad, captured, safe, unsafe, centralized, or decentralized;
- commercial valuation, purchaser targeting, sale signal, contact strategy, or marketplace positioning.

## Source-of-truth boundaries

Vortik Registry source-of-truth boundaries are defined by repository artifacts and validation flow. The relevant sources are:

- `registry.json`;
- versioned `schemas/*/*/schema.json` files;
- `sources.md` files;
- anchor documents;
- validation scripts;
- generated public docs when derived from validated source files.

These artifacts determine what the registry records, how an entry is described, and which public source trails support it. Generated public docs can help readers navigate validated data, but generated output does not override the underlying source files.

## Practical reading rule

Read each ENS anchor as a stable human-readable handle for a documented registry entry. Read protocol claims through the relevant primary sources, source notes, schemas, anchor documents, and validation results. Do not infer endorsement, governance position, ENSv2 infrastructure dependency, operational authority, or commercial intent from the presence of an ENS-style name.
