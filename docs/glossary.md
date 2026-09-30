# Vortik Registry glossary

Protocol source context reviewed **2026-09-30**; see the [complete source review](research/protocol-freshness-2026-09-30.md).

This public glossary explains recurring terms used in Vortik documentation. Glossary entries are explanatory only: they are not registry entries, do not create anchors, and do not imply official Ethereum status.

- **ePBS** — Enshrined Proposer-Builder Separation, the EIP-7732 protocol-facing design area for making proposer-builder coordination more explicit in Ethereum's protocol design. See [`anchors/epbs.md`](../anchors/epbs.md) and [`research/epbs-source-audit.md`](research/epbs-source-audit.md).
- **PTC** — Payload Timeliness Committee, an ePBS-related validator committee described by EIP-7732 for attesting to timely payload reveal and related availability conditions.
- **inclusion list** — A protocol-facing constraint concept for requiring eligible transactions or transaction sets to be surfaced, considered, or enforced under specified conditions.
- **FOCIL** — Fork-choice enforced inclusion lists, the EIP-7805 inclusion-list mechanism family. EIP-7805 is absent from the current Glamsterdam scheduled set in EIP-7773 and Scheduled for Inclusion in Hegotá under EIP-8081; Hegotá activation dates are unset. See [`anchors/inclusionlist.md`](../anchors/inclusionlist.md) and [`research/inclusionlist-focil-source-audit.md`](research/inclusionlist-focil-source-audit.md).
- **BAL** — Block-Level Access Lists, the EIP-7928 design area for representing block-level access information. In this repository it is monitored through research notes, not promoted to registry state.
- **block_access_list_hash** — An EIP-7928 field or object name associated with Block-Level Access Lists and related source notes. It is not a registry entry in this glossary.
- **builder** — An actor or protocol-facing role associated with constructing execution payloads or producing payload bids, depending on the source context.
- **payload** — The execution payload or payload-related data passed through proposer-builder coordination and block production flows.
- **commitment** — A binding reference to data or behavior, such as a payload commitment in ePBS-related flows; exact meaning depends on the cited specification.
- **Fast Finality / SSF** — Fast Finality is the Ethereum Foundation Protocol Consensus umbrella research area; single-slot finality is the narrower same-slot target. See the [source audit](research/fast-finality-source-audit.md).
- **preconfirmation** — An early, design-specific inclusion or execution assurance; it is not consensus finality. See the [anchor note](../anchors/preconflayer.md).
- **optional execution proofs** — The Draft EIP-8025 proposal, Proposed for Inclusion in Hegotá. It does not establish a paid proving market. See the [proving-market sources](../schemas/provingmarket/0.1-research/sources.md).
- **source of truth** — The authoritative file or primary source for a given claim. In this repository, schemas and `registry.json` define registry state, while EIPs and official specifications define protocol claims. See [`how-to-read-this-registry.md`](how-to-read-this-registry.md).
- **registry anchor** — A tracked Vortik registry entry connecting an ENS anchor, canonical term, schema, source notes, and anchor documentation. Registry anchors are observational and do not define protocol truth.
- **ENS anchor** — An ENS name used as a semantic naming surface for a registry entry. ENS anchors do not create protocol truth, official Ethereum status, or deployment claims; see [`naming-governance-boundaries.md`](naming-governance-boundaries.md).
