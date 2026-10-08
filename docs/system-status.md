# System status and evidence limits

Capabilities reviewed: **2026-09-30**. Measurement preparation reviewed: **2026-10-08**. This page describes repository capabilities and the limits of the recorded evidence. It is not a live health monitor.

## What runs where

| Surface | Implementation | Evidence and limit |
| --- | --- | --- |
| Ethereum proposal search | Static GitHub Pages interface over metadata from pinned official EIP/ERC repositories | Coverage and source commits are recorded in the catalog. Search is independent of the 12 curated terms; it does not retrieve full specifications or resolve ENS names. |
| Curated term search and comparison | Static GitHub Pages assets; browser JavaScript reads registry and context JSON | Local functional checks and Pages artifact verification apply to the published commit. These tools do not invoke Reception. |
| Protocol context | Dated `protocol-context.json` and schema | Separates EIP document status, fork assignment and network timing. Read `reviewed_at` and follow primary sources for later changes. |
| Canonical registry and ePBS feed | Versioned, validated repository data | Registry last-change date is separate from the date of the upstream source review. |
| Public A2A Reception | Deterministic Node.js service using immutable packaged snapshots | The discovery manifest records `a2a_live`. Website publication does not deploy the service, check its current health or establish its packaged source revision. |
| ENS semantic research | Deterministic evaluator over packaged Vortik data | No live ENS lookup or proof of ownership. |
| Human follow-up | Fixed, optional link to the owner-selected X profile | The visitor initiates any separate contact. A link is not an authenticated inbox, automatic notification or delivery receipt. |
| Trusted receipt issuance | Implemented with separate activation gates | Disabled for the current public interface. Historical preactivation tests do not enable it. |
| Candidate admission | Schema-bound submissions through GitHub Issues | Automatic admission and registry mutation remain disabled. |

## Three different freshness questions

1. **When did the canonical definition change?** Read the registry version and `last_updated`.
2. **When were protocol sources reviewed?** Read `protocol-context.json`'s `reviewed_at` and the linked review document.
3. **What code and data does a deployed service contain?** Bind its deployed image digest to the reviewed source commit using the deployment evidence. A newer Pages commit alone cannot answer this.

The curated explorer reads the current published context artifact, and the broader proposal search reads a separate source-pinned metadata catalog. The public beacon loads local snapshots packaged with its image. Its deny-egress boundary prevents it from retrieving newer sources on demand. Changes to those snapshots require a separate reviewed service deployment. Publishing the broader catalog does not expand the deployed beacon's research capability.

## Operational checks

A service activation or refresh needs evidence for the exact reviewed commit, built image digest, running revision, identity/network boundary and functional behavior. Service requests and deployment actions can consume cloud resources, so they belong to the owner's separately authorized operational workflow.

This website adds no background service polling, wallet connection, model invocation or message sender. The optional website analytics adapter is prepared but disabled (empty site token); it makes no analytics request in that state. Activating it requires a maintainer-controlled provider registration and a reviewed publication. See [traffic measurement and privacy](traffic-measurement.md) for coverage, opt-out and evidence limits. An outbound source or contact link opens only when the visitor chooses it.

## Reproduce the public behavior locally

```bash
npm ci
npm run validate
npm run example:protocol-context
npm run example:research-ens
```

Tests use local fixtures and loopback HTTP servers. They verify code behavior, not current Cloud health, external notification delivery or human response.

## Related records

- [Dated protocol context](protocol-context.md)
- [Review history](changes.md)
- [Public A2A implementation](public-a2a-beacon.md)
- [Network and deployment boundary](public-a2a-beacon-trust-boundary.md)
- [Voluntary human contact](public-human-contact.md)
- [Trusted-verification preactivation evidence](cloud-run-preactivation-evidence.md)
