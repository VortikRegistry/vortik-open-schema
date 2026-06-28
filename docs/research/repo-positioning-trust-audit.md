# Repository Positioning and Trust Audit

## Executive summary

This audit reviews how the public Vortik Semantic Registry repository appears to an external technical Ethereum or ENS reader. The repository already communicates a serious evidence-first intent: it has a constitution, public-safety checks, validation scripts, taxonomy promotion rules, source files, schemas, anchors, and research notes that separate technical semantics from non-public ENS strategy.

The main trust gap is not lack of substance. It is onboarding density. A new visitor can infer that Vortik is an independent Ethereum semantic registry, but may need more than 60 seconds to understand how to read the repository, what problem it solves, which files are canonical, and how ENS anchors relate to protocol terminology. The README is directionally strong, but its most concrete explanation appears after several branded entry points and classification lists. The repository would feel more credible to first-time readers if the first screen included a short plain-language definition, a small file map, source-of-truth rules, a one-minute reading path, and one worked example.

The recommended path is to keep the registry conservative, public, and source-grounded while improving navigation and examples. Before adding more registry terms, the project should strengthen reader guidance, add example walkthroughs, expose the evidence model earlier, and make the generated-versus-source-file boundary more obvious.

No registry entries, schemas, anchors, maps, generated outputs, or source-of-truth data are changed by this audit.

## First-impression review

### 60-second comprehension

A technical Ethereum or ENS reader can identify the repository's theme quickly: it is an independent semantic registry for Ethereum coordination terms. However, the first minute is cognitively expensive because the README immediately combines several ideas:

- Ethereum coordination terminology
- ENS-linked anchors
- classifications such as core, repairable, premature, external, and deprecated
- public interfaces and generated outputs
- schema, anchor, map, and registry layers

The phrase "independent semantic registry" is accurate, but abstract. A new reader may ask: "Is this a glossary, a schema package, a research index, an ENS project, or a documentation site?" The answer is "a structured, evidence-first registry that maps selected ENS anchors to canonical Ethereum coordination terminology," but that answer should appear more directly in the opening section.

### README clarity

The README clearly says what Vortik does not do: it does not define protocol rules, replace EIPs, claim official authority, or treat every ecosystem term as canonical. It also has useful sections for system structure, automation, machine-readable outputs, core model, and current focus.

The main issue is ordering. The README currently spends early attention on public entry points and strategic anchors before fully teaching a newcomer how to interpret the model. This can make the repository feel more like a concept presentation than a practical registry. A stronger README would start with:

1. one-sentence definition
2. who this is for
3. what files to read first
4. what is canonical versus interpretive
5. one concrete example, such as `epbs.eth` mapping to ePBS and its schema/source trail
6. non-goals and safety boundary
7. deeper links

### Credibility versus abstraction

The repository looks credible because it contains:

- a formal constitution
- validation scripts
- public-safety scanning
- taxonomy promotion rules
- versioned schemas
- source files per schema
- anchor documents
- generated public docs
- a recent verification audit

The repository also risks looking overly abstract because the main concepts are presented as conceptual categories before readers see a worked example. Technical readers often trust a project faster when they can inspect a concrete path such as:

`registry.json` entry → schema → `sources.md` → anchor document → generated docs

That path exists, but it is not highlighted as the primary reading path.

## What the repo communicates well

- **Clear independence boundary**: the repository repeatedly states that it is not an official Ethereum specification and does not define protocol rules.
- **Evidence-first posture**: taxonomy promotion rules require primary-source grounding and limit AI-generated reports to discovery rather than authority.
- **Public safety discipline**: the constitution and scanner create an explicit boundary around public technical content.
- **Schema-first structure**: the repository distinguishes machine-readable schemas, the registry index, anchor documents, maps, docs, and scripts.
- **Conservative classifications**: categories such as repairable, premature, external, and deprecated help avoid overstating canonical status.
- **Good validation surface**: package scripts make it clear that JSON validation, registry validation, integrity checks, derived-output sync, and public-safety checks are part of the workflow.
- **Relevant technical focus**: ePBS, PTC, delayed validation, FOCIL, SSF, preconfirmations, solvers, proving, sequencing, and order-flow systems are presented as coordination surfaces rather than broad narrative claims.

## What is unclear to a new visitor

- **The first-sentence product shape**: "semantic registry" is accurate but may not immediately explain whether the project is a glossary, data package, research archive, or generated site.
- **How to read one term**: there is no short walkthrough that follows one anchor from registry entry to schema, sources, anchor explanation, and public docs.
- **Canonical versus interpretive files**: the source-of-truth distinction exists, but should be more visible near the top of the README.
- **Why ENS is involved**: the repo explains that ENS names do not define protocol truth, but a first-time reader may still need a more explicit explanation that ENS anchors are naming surfaces, not authority sources.
- **Status vocabulary**: classifications and stages are helpful, but readers need a compact table explaining how `classification`, `status`, `stage`, and `type` differ.
- **Research-document status**: research notes are interpretive and supplementary, but a quick "how to cite or rely on research docs" note would reduce ambiguity.
- **Contribution path**: contributors can find guidance, but the README could link more directly to how to report drift or propose a term safely.

## README improvement recommendations

### Add a top-level "In one minute" section

Suggested content:

- Vortik is a public, independent semantic registry for selected Ethereum coordination terminology.
- It maps selected ENS anchors to canonical technical terms, classifications, schemas, human-readable anchor notes, and source trails.
- It does not define Ethereum protocol rules or treat ENS names as protocol authority.
- The formal source of truth is `/schemas/`; `registry.json` is the central index.

### Add a "Read this repository in order" block

Suggested path:

1. `README.md` for purpose, scope, and non-goals.
2. `registry.json` for the current anchor index.
3. `schemas/{anchor}/{version}/schema.json` for structured semantics.
4. `schemas/{anchor}/{version}/sources.md` for source trail.
5. `anchors/{anchor}.md` for human-readable interpretation.
6. `docs/taxonomy-promotion-rules.md` for promotion and rejection rules.

### Add one worked example

A concise example would make the registry less abstract. For example:

- `epbs.eth` is the ENS anchor.
- The canonical term is enshrined proposer-builder separation.
- The classification is core.
- The schema captures structured fields.
- The source file records primary evidence.
- The anchor document explains the semantic relationship.

The example should avoid new registry claims and simply point to existing files.

### Move source-of-truth language higher

The README should state early that schemas are the formal source of truth and that `registry.json` is the central index. This reduces uncertainty about whether anchors, docs, maps, or generated outputs are authoritative.

### Reframe "Strategic Anchors" wording for public technical readers

The label "Strategic Anchors" may be technically intended, but it can read as less neutral than "Tracked Anchors," "Registry Anchors," or "Semantic Anchors." If retained, the README should immediately clarify that strategic means structurally relevant to Ethereum coordination terminology, not private ENS/commercial planning.

### Add a compact non-goals list near the top

The README already has non-goals, but a near-top version would improve trust. It should emphasize:

- no protocol authority
- no replacement for EIPs or specs
- no unsupported official-status claims
- no non-public ENS/commercial planning
- no private operational material

## Documentation/navigation recommendations

- **Create a docs landing page with a role-based path**: "For protocol researchers," "For implementers/tool builders," "For contributors," and "For ENS readers."
- **Add a registry reading guide**: explain each field in `registry.json` and how it relates to schemas and anchors.
- **Add a glossary page**: define anchor, canonical term, classification, status, stage, type, schema, source trail, generated output, and interpretive map.
- **Add a source policy page or promote the taxonomy rules**: the source hierarchy is strong and should be easy to find from the README.
- **Make generated-output boundaries obvious**: add a short note in navigation docs explaining which files are source files and which are generated.
- **Cross-link recent audits and governance files**: readers should be able to discover the constitution, public-safety scanner, taxonomy rules, and verification audit from one "Trust and validation" section.
- **Add a validation section for readers**: list `npm run check:public-safety` and `npm run validate`, and explain what each command checks.

## Suggested examples or diagrams

### Example 1: "How to read an anchor"

A short markdown guide could use one existing anchor and show:

```text
ENS anchor → canonical term → classification → schema → sources → anchor note → generated docs
```

This would help readers understand that the ENS name is an entry point and not an authority source.

### Example 2: Source-of-truth diagram

A simple diagram could show:

```text
schemas/*  ──formal definitions──┐
                                  ├── registry.json ──public index── docs/*
anchors/*  ──human interpretation─┘
```

The diagram should also label maps and research documents as interpretive support.

### Example 3: Evidence ladder

A visual ladder could summarize:

```text
Official specs / accepted EIPs
Draft EIPs and fork meta-EIPs
Client or implementation references
Ethereum Research and serious technical discussion
ENS official sources for ENS architecture only
AI reports for discovery only
```

This would strongly reinforce public credibility.

### Example 4: Classification table

A one-screen table should compare core, repairable, premature, external, and deprecated. The table already exists in parts of the repo, but it should be linked from the README and repeated where readers first encounter anchor lists.

## Star-worthiness assessment

The repository has good star potential among technical readers if it becomes easier to understand quickly. Its strongest star-worthy traits are:

- narrow and timely Ethereum coordination focus
- machine-readable registry structure
- explicit evidence rules
- clear public safety boundaries
- validation scripts
- conservative terminology handling
- useful distinction between protocol-native, external, emerging, and deprecated terminology

The main blockers to organic stars are:

- abstract opening language
- limited quickstart guidance
- no worked example
- unclear first-read path
- early use of labels that may feel more narrative than technical
- insufficient surfacing of validation and source policies in the first screen

A technical reader is more likely to star the repository if they can quickly answer:

1. What is this?
2. Why should I trust it?
3. How do I inspect one entry?
4. How do I validate it?
5. How can I contribute without weakening evidence standards?

## What should be improved before adding more registry terms

- Add README onboarding improvements before expanding the registry surface.
- Add a "how to read this registry" guide.
- Add one worked example using an existing anchor.
- Add a compact glossary.
- Strengthen docs navigation around trust, validation, taxonomy promotion, and source hierarchy.
- Clarify source-of-truth hierarchy in the README first screen.
- Ensure future research notes continue to clearly state whether they modify registry status.
- Keep additional terms out until their evidence trail, classification, and schema impact can be reviewed conservatively.

## What should not be changed

- Do not loosen the evidence-first promotion model.
- Do not treat AI-generated reports as authority.
- Do not weaken the public safety scanner.
- Do not blur protocol semantics with non-public ENS/commercial planning.
- Do not claim official Ethereum status unless primary sources explicitly support it.
- Do not turn research notes into registry changes without a separate registry PR.
- Do not manually edit generated outputs to improve presentation.
- Do not remove conservative classifications merely to make the registry appear more definitive.
- Do not add broad ecosystem terms without strong technical grounding.

## Suggested future public PR list

1. **README quickstart and source-of-truth update**: add one-minute overview, reading path, non-goals, and validation commands.
2. **How to read this registry guide**: add a documentation page that walks through one existing anchor from registry entry to schema and source trail.
3. **Glossary page**: define recurring registry terms and classification vocabulary.
4. **Trust and validation page**: collect constitution, taxonomy rules, public-safety scanner, validation workflow, and verification audits into one navigation hub.
5. **Evidence ladder diagram**: add a small source hierarchy diagram based on existing taxonomy rules.
6. **Generated-output guide**: document which files are generated, which are source files, and how sync validation prevents drift.
7. **Contribution checklist**: add a concise checklist for safe terminology proposals that reinforces primary-source requirements.
8. **Anchor example page**: use an existing stable anchor as a canonical example without adding new registry data.

## Public technical credibility versus non-public ENS/commercial strategy

The public repository should optimize for technical credibility: precise terminology, source trails, schema integrity, validation, conservative classification, and clear non-goals. Public credibility comes from showing how claims are grounded, how data is structured, and how changes are validated.

Non-public ENS/commercial strategy must remain outside the repository. Public documentation should not include private operating plans, private counterparties, financial assumptions, external-contact planning, or related operational material. The public registry can describe ENS anchors as naming surfaces connected to technical terms, but it should not turn that relationship into commercial strategy.

The recommended positioning is therefore:

- public: technical semantic registry, evidence-first source trails, schemas, anchors, validation, conservative taxonomy
- not public: private ENS/commercial planning or any operational content unrelated to public technical semantics

This separation is one of the repository's strongest trust features and should be preserved as the project grows.
