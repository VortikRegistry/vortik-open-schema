<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan.
<!-- SPECKIT END -->

# Repository Agent Instructions

## Public repository purpose

Vortik Registry is a public, independent, source-grounded semantic registry
for selected Ethereum coordination terminology. It is not an official Ethereum
specification and is not an ENS DAO, ENS Foundation, ENS Labs, or Ethereum
Foundation project. It is not a marketplace, sales pipeline, buyer pipeline,
valuation system, or outreach system.

## Source-of-truth hierarchy

Treat these repository artifacts as source of truth when they are validated and
consistent with each other:

- `registry.json`
- versioned `schemas/*/*/schema.json`
- `sources.md`
- anchor documents
- validation scripts
- generated docs only when derived from validated source files

Ground protocol claims in primary sources such as EIPs, official specs,
Ethereum client or specification repositories, and documented source notes. Do
not treat AI-generated reports, private notes, social posts, screenshots,
market commentary, or user strategy notes as source of truth.

## Public/private boundary

Do not add private or commercial strategy to this public repository. Prohibited
public content includes, but is not limited to:

- buyer names or target organizations
- buyer-side analysis, sales strategy, outreach copy, contact strategy, or
  negotiation strategy
- asking ranges, floor prices, stretch prices, ETH valuation, sale windows, or
  urgency labels related to selling
- marketplace positioning, defensive listings, personal commercial intent,
  private strategic intelligence, or private notes about asset monetization
- private assumptions about who may want a name or asset

Use general category language only. Do not include private examples, specific
buyer names, specific price ranges, or specific outreach text.

## ENS and naming boundaries

Preserve the boundary established in `docs/naming-governance-boundaries.md`.
ENS anchors are semantic naming surfaces only. They are not authority surfaces
and do not imply ENS DAO endorsement, ENS Foundation endorsement, ENS Labs
endorsement, Ethereum Foundation endorsement, ENSv2 operational dependency, or
official Ethereum status. ENS names do not create protocol truth.

Do not add ENSv2 resolver mappings, local registry mappings, automated query
examples, or claims that ENS names store, control, resolve, or define Ethereum
protocol metadata.

## Current controversy boundary

Do not add commentary about current ENS governance disputes, individuals,
accusations, treasury disputes, votes, delegates, social-media fights, or claims
that ENS is good, bad, captured, unsafe, dead, corrupt, centralized, or
decentralized. The repository may discuss general governance and source-of-truth
boundaries only in calm, evergreen, non-accusatory language.

## Registry modification discipline

Do not modify registry state unless explicitly asked. Do not modify the
following unless the task explicitly requires it:

- `registry.json`
- `docs/registry.json`
- `registry.schema.json`
- any `schemas/*/*/schema.json`
- schema const values
- classification, status, or type fields
- generated outputs
- maps or index files
- market files
- package metadata
- release notes

If registry-affecting files must change, explain why in the PR body.

## Validation requirements

Before opening or finalizing a PR, run:

```bash
npm run check:public-safety
npm run validate
```

If either validation fails, do not present the PR as ready.

## PR body requirements

PR bodies must include:

- summary
- files changed
- scope confirmation
- validation results
- confirmation that no private or commercial strategy was added
- confirmation that no unauthorized registry, schema, generated, package,
  version, source-note, release-note, map, or market files were modified unless
  explicitly required
