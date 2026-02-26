## Repository contents

- `epbs-schema-v1.json` — Semantic anchor schema for Enshrined PBS (ePBS).
- `inclusionlist-schema-v0.1.json` — Semantic anchor schema for Inclusion Enforcement / Inclusion Lists (FOCIL).
- `commitmentlayer-schema-v0.1.json` — Semantic anchor schema for commitment & preconfirmation coordination.

## Strawmap Alignment (Concept-level Mapping)

> Note: roadmap names and proposal identifiers can evolve. Vortik tracks **concepts and terminology** first, and links to primary sources via each schema file under `references`.

| Roadmap area (2026+) | Concept / primitive | Vortik anchor | Repo artefact | Status |
|---|---|---|---|---|
| Glamsterdam | Enshrined PBS (ePBS) | `epbs.eth` | `epbs-schema-v1.json` | Active research |
| Glamsterdam | Block-Level Access Lists (BALs) | *(TBD)* | `bals-schema-v0.1.json` *(planned)* | Pending |
| Hegotá | Inclusion Enforcement / Inclusion Lists (FOCIL) | `inclusionlist.eth` | `inclusionlist-schema-v0.1.json` | Active research |
| Fast L1 / Preconfirmations | Commitment & preconfirmation coordination | `commitmentlayer.eth` | `commitmentlayer-schema-v0.1.json` | Active research |

> BALs are referenced as “Block-Level Access Lists” in primary EIP discussions that connect execution-layer constraints with ePBS-era block production; see EIP-7862 (Motivation) for a direct reference chain to EIP-7928.

## Active Monitoring & Alignment

### [Feb 26, 2026] — Post-ACDE #231 observations

Vortik is calibrating its schema artefacts based on current consensus & execution-layer discussions:

- **Glamsterdam (ePBS):** Monitoring design convergence and terminology stability for ePBS-related primitives (including payload-related attributes).
- **Glamsterdam (Execution primitives / BALs):** Tracking BALs as an execution-side co-primitive referenced alongside ePBS-era constraints in primary EIP discussions (see EIP-7862 → EIP-7928 reference chain).
- **Hegotá (Inclusion Enforcement / Inclusion Lists):** Tracking the semantic boundary between mandatory inclusion mechanisms and proposer/builder duties.
- **Encrypted mempools:** Observing emerging confidentiality primitives (e.g., LUCID) to assess whether a dedicated namespace category is warranted.

> Primary-source links and detailed references are maintained inside each schema file under `references`.

## Contact / Stewardship inquiries

For research discussion, coordination, or stewardship conversations:

- **X (Twitter):** https://x.com/VortikRegistry  
- **Stewardship inquiry:** contact.preconf@gmail.com

---

*© 2026 Vortik Semantic Registry.*
