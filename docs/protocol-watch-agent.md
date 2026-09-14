# Protocol Watch Agent

## Purpose

Protocol Watch is a bounded freshness detector for Vortik Registry. It watches a small allowlist of primary or implementation-facing Ethereum sources relevant to the current registry and creates a draft evidence PR when one of those sources changes.

It is intentionally not an autonomous registry editor. It does not change `registry.json`, classifications, schemas, anchor status, feeds, maps, or public claims. It never auto-merges.

## Watched sources

The initial watch set covers:

- EIP-7732 (ePBS);
- EIP-7773 (Glamsterdam meta EIP);
- EIP-7805 (FOCIL);
- EIP-7928 (Block-Level Access Lists);
- EIP-8081 (Hegotá meta EIP);
- EIP-8282 (Builder Execution Requests);
- the canonical ethereum.org Glamsterdam roadmap source file;
- Gloas beacon-chain and P2P consensus-spec files;
- the ethPandaOps Glamsterdam devnet repository head.

The source allowlist is stored in `config/protocol-watch.json`. Callers cannot supply arbitrary repositories or URLs.

## Lifecycle

The scheduled GitHub Actions workflow runs every six hours and may also be dispatched manually.

1. Fetch only allowlisted GitHub sources through the GitHub API.
2. Compare current immutable Git blob or commit fingerprints with `protocol-watch/baseline.json`.
3. If nothing changed, exit without repository writes.
4. If a source changed, write `protocol-watch/candidate.json` and `protocol-watch/report.md` on a new automation branch.
5. Open a single draft PR titled `Protocol watch alert — upstream change detected`.
6. Refuse duplicate alert PRs while one is already open.

The alert PR is evidence only. A reviewer must inspect the upstream diff, decide whether Vortik is stale, apply any necessary source-note or public-artifact updates, and only then move the baseline. CI remains the merge gate.

## Safety properties

- fail closed on malformed or unavailable sources;
- exact GitHub API origin and repository allowlist;
- bounded source size and request timeout;
- no caller-selected network destinations;
- no canonical registry mutation;
- no automatic semantic classification;
- no automatic baseline acceptance;
- no automatic merge;
- duplicate-alert suppression;
- ordinary repository validation still applies to every PR.

## Baseline rule

`protocol-watch/baseline.json` means "reviewed upstream state", not merely "latest observed state". Updating it without reviewing the related upstream change defeats the freshness gate and is prohibited by design.
