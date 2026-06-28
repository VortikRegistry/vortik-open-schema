# Taxonomy Promotion Rules

## Purpose

These rules define how candidate and existing Vortik Registry terms are promoted, held, degraded, rejected, or left outside the registry. They are conservative by design: registry-facing terms must be evidence-first, primary-source-first, and limited to public technical semantics.

AI-generated reports may help discover candidates, but they are never authoritative. Model output from Gemini, Claude, Kimi, Codex, or any other system must be checked against primary sources before it can influence registry-facing status.

## Source hierarchy

Use sources in this priority order:

1. Finalized or accepted Ethereum Improvement Proposals (EIPs) and official protocol specifications.
2. Draft EIPs and fork meta-EIPs.
3. Ethereum client, consensus-layer, or execution-layer implementation references.
4. Ethereum Research posts and serious technical forum discussion.
5. ENS official sources, for ENS architecture only.
6. Secondary AI reports, as candidate discovery only and never as source of truth.

If sources conflict, the higher-priority source controls. If a claim cannot be checked against a suitable primary source, it must not be treated as registry truth.

## State definitions

### ACT

- **Meaning**: The term is stable enough for registry-facing use as a technical semantic anchor or established protocol term.
- **Allowed evidence level**: Finalized, accepted, or otherwise stable primary-source terminology; repeated primary-source usage may support ACT when it does not overstate fork finality.
- **Use when**: Primary sources establish the term and the registry can describe it without implying unsupported adoption, scheduling, or activation.
- **Do not use when**: The only support is a draft, a forum phrase, an AI report, or an inferred relationship not stated by primary sources.
- **Registry anchor effect**: May modify registry anchors only through a separate registry PR with validation.
- **Docs/research only**: No; ACT may appear in registry-facing docs, but docs alone do not update registry status.

### PREPARE

- **Meaning**: The term is primary-source-backed and likely relevant, but depends on draft status, implementation convergence, or fork-scoped decisions.
- **Allowed evidence level**: Draft EIPs, fork meta-EIPs, implementation references, or strong primary technical discussion.
- **Use when**: Evidence is real, but the term should not be represented as final, activated, or fully canonical.
- **Do not use when**: The term lacks primary-source support or is only suggested by AI output.
- **Registry anchor effect**: May propose future registry-anchor work only through a separate registry PR.
- **Docs/research only**: Can appear in docs/research while evidence is still developing.

### WATCH

- **Meaning**: The term is credible enough to monitor but not stable enough for registry action.
- **Allowed evidence level**: Ethereum Research discussion, draft work, early implementation references, or weak primary-source signals.
- **Use when**: A candidate may become important but terminology, scope, or protocol relationship remains unsettled.
- **Do not use when**: The term is already contradicted by primary sources or is unsupported after review.
- **Registry anchor effect**: Does not modify registry anchors.
- **Docs/research only**: Usually yes; WATCH is normally a research-document state.

### REJECT

- **Meaning**: The term or claim must not be used for registry promotion.
- **Allowed evidence level**: Evidence of contradiction, absence of primary-source support after review, or identification as hallucinated or unsafe framing.
- **Use when**: A term is hallucinated, unsupported, misleading, contradicted by official sources, or imports prohibited non-technical framing.
- **Do not use when**: The term merely lacks enough evidence today but remains plausible for monitoring; use WATCH or NO VERIFICABLE instead.
- **Registry anchor effect**: Does not modify registry anchors, except a separate registry PR may remove or degrade a previously accepted mistake.
- **Docs/research only**: Yes, unless a separate registry PR records a corrective registry change.

### NO ACTION

- **Meaning**: The candidate requires no registry work at this time.
- **Allowed evidence level**: Any reviewed input, including AI discovery, when review shows the candidate is irrelevant, duplicative, too broad, or outside scope.
- **Use when**: The safest outcome is to leave the term out without labeling it false.
- **Do not use when**: A term is contradicted, hallucinated, or unsafe; use REJECT when a stronger negative decision is needed.
- **Registry anchor effect**: Does not modify registry anchors.
- **Docs/research only**: Yes.

### NO VERIFICABLE

- **Meaning**: The claim cannot be verified with available primary sources.
- **Allowed evidence level**: Unresolved candidate evidence, broken or inaccessible trails, or secondary claims with no primary confirmation.
- **Use when**: Review cannot confirm or deny the candidate with reliable primary sources.
- **Do not use when**: Primary sources clearly support, contradict, or reject the term.
- **Registry anchor effect**: Does not modify registry anchors.
- **Docs/research only**: Yes.

### DEGRADE

- **Meaning**: A previously stronger term, status, classification, or claim must move downward because evidence weakened, contradicted it, or showed overstatement.
- **Allowed evidence level**: Higher-priority primary sources, fork meta-EIP changes, implementation changes, or validated correction of an earlier registry mistake.
- **Use when**: ACT or PREPARE no longer matches the evidence.
- **Do not use when**: The term remains supported and only needs wording clarification.
- **Registry anchor effect**: May modify registry anchors only through a separate registry PR with validation.
- **Docs/research only**: Can be documented in research first, but registry status changes require a separate PR.

## Promotion rules

- **WATCH -> PREPARE**: Allowed when primary-source terminology strengthens, a draft EIP or fork meta-EIP includes the term, implementation references converge, or repeated credible primary-source usage reduces ambiguity.
- **PREPARE -> ACT**: Allowed when terminology stabilizes enough that registry-facing use will not overstate finality, scheduling, activation, or implementation support.
- **ACT -> DEGRADE**: Required when primary sources later show that the term was overstated, contradicted, incorrectly scoped, or no longer stable.
- **WATCH/PREPARE -> REJECT**: Required when review shows hallucination, contradiction, unsupported officialization, unsafe framing, or incorrect fork/ENS claims.
- **Candidate -> NO ACTION**: Appropriate when a candidate is irrelevant, duplicative, outside registry scope, or not worth continued tracking.
- **Candidate -> NO VERIFICABLE**: Appropriate when available sources do not permit confirmation or rejection.

## Required promotion evidence

A term can move upward only if at least one condition is true:

- Primary-source terminology stabilizes.
- The term appears in a draft or accepted EIP.
- The term is included in a fork meta-EIP.
- Client or specification implementation references converge.
- The term has repeated technical usage across credible primary sources.

Upward movement must still avoid unsupported claims about official status, activation, or scheduling.

## Required rejection or degradation evidence

A term must be rejected or degraded if it:

- Is hallucinated.
- Is unsupported by primary sources.
- Contradicts an EIP or official source.
- Overclaims fork inclusion.
- Mislabels ENS architecture as Ethereum consensus.
- Turns a research phrase into official protocol terminology without support.
- Must not import buyer, pricing, external-contact, sale, custody, monopoly, personal, banking, tax, or private commercial framing as registry semantics.

## Fork inclusion rules

- Do not claim a mainnet activation date unless an official source states it.
- Do not claim Scheduled for Inclusion unless the fork meta-EIP says so.
- If a proposal is Declined for Inclusion, it must not be described as Scheduled for Inclusion.
- Draft EIP status should usually be PREPARE or WATCH, not final ACT, unless the term already exists as an established registry anchor and the note clearly distinguishes terminology from fork finality.

## ENS architecture rules

- ENS official sources can support ENS architecture terms.
- ENSv2 must not be treated as an Ethereum consensus primitive.
- ENS names, domains, or assets must not create protocol truth.
- Do not include pricing, buyer targeting, sale windows, external-contact, custody, or private commercial strategy.

## AI report handling

- Gemini, Claude, Kimi, Codex, or any model output can suggest candidates.
- AI outputs cannot justify ACT or PREPARE alone.
- Any AI-suggested term must be verified against primary sources.
- Unsupported AI terms go to REJECT, NO ACTION, or NO VERIFICABLE.

## Public safety constraints

Registry-facing content must follow these constraints:

- No pricing.
- No buyer targeting.
- Do not include external-contact planning.
- No private leads.
- No custody claims.
- No monopoly claims.
- No personal data.
- No tax, banking, or unrelated operational content.

These constraints apply to taxonomy notes, registry entries, generated public outputs, and research documents.

## Registry change discipline

- Registry changes require a separate PR.
- Docs/research notes do not automatically modify registry status.
- Generated outputs must not be edited manually unless repo convention explicitly requires it.
- Validation must pass before merge.
