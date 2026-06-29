# Vortik Registry glossary

This public glossary explains recurring terms used in Vortik documentation. Glossary entries are explanatory only: they are not registry entries, do not create anchors, and do not imply official Ethereum status.

- **ePBS** — Enshrined Proposer-Builder Separation, the EIP-7732 protocol-facing design area for making proposer-builder coordination more explicit in Ethereum's protocol design. See [`anchors/epbs.md`](../anchors/epbs.md) and [`research/epbs-source-audit.md`](research/epbs-source-audit.md).
- **PTC** — Payload Timeliness Committee, an ePBS-related validator committee described by EIP-7732 for attesting to timely payload reveal and related availability conditions.
- **inclusion list** — A protocol-facing constraint concept for requiring eligible transactions or transaction sets to be surfaced, considered, or enforced under specified conditions.
- **FOCIL** — Fork-choice enforced inclusion lists, the EIP-7805 inclusion-list mechanism family. EIP-7773 currently lists EIP-7805 as Declined for Inclusion in Glamsterdam, so this glossary does not describe FOCIL as Glamsterdam-included or mainnet-active. See [`anchors/inclusionlist.md`](../anchors/inclusionlist.md) and [`research/inclusionlist-focil-source-audit.md`](research/inclusionlist-focil-source-audit.md).
- **BAL** — Block-Level Access Lists, the EIP-7928 design area for representing block-level access information. In this repository it is monitored through research notes, not promoted to registry state.
- **block_access_list_hash** — An EIP-7928 field or object name associated with Block-Level Access Lists and related source notes. It is not a registry entry in this glossary.
- **builder** — An actor or protocol-facing role associated with constructing execution payloads or producing payload bids, depending on the source context.
- **payload** — The execution payload or payload-related data passed through proposer-builder coordination and block production flows.
- **commitment** — A binding reference to data or behavior, such as a payload commitment in ePBS-related flows; exact meaning depends on the cited specification.
- **source of truth** — The authoritative file or primary source for a given claim. In this repository, schemas and `registry.json` define registry state, while EIPs and official specifications define protocol claims. See [`how-to-read-this-registry.md`](how-to-read-this-registry.md).
- **registry anchor** — A tracked Vortik registry entry connecting an ENS anchor, canonical term, schema, source notes, and anchor documentation. Registry anchors are observational and do not define protocol truth.
- **ENS anchor** — An ENS name used as a semantic naming surface for a registry entry. ENS anchors do not create protocol truth, official Ethereum status, or deployment claims.
