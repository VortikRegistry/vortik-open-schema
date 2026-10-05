# Protocol Watch Agent

## Purpose

Protocol Watch is a bounded freshness detector for Vortik Registry. It watches a small allowlist of primary or implementation-facing Ethereum sources relevant to the current registry and delivers an evidence issue when one of those sources changes.

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

The scheduled GitHub Actions workflow runs every six hours, may be dispatched manually, and runs after successful main-branch validation. Its delivery job reads only the checked-out main branch. Pull requests run boundary tests without delivery.

1. Fetch only allowlisted GitHub sources through the GitHub API.
2. Compare current immutable Git blob or commit fingerprints with `protocol-watch/baseline.json`.
3. If nothing changed, exit without repository writes.
4. If a source changed, write `protocol-watch/candidate.json` and `protocol-watch/report.md` in the runner workspace.
5. Open a single issue titled `Protocol watch alert — upstream change detected` and retain the current report in the run summary.
6. Suppress another alert while an issue with that exact title, created by the repository owner or GitHub Actions bot, is open. An issue from another author cannot suppress delivery. A full 1,000-issue inventory fails closed rather than assuming no alert exists.

The issue is evidence only. A reviewer must inspect the upstream diff and decide whether Vortik is stale. Any source-note, public-artifact or baseline changes belong in a separate reviewed PR. The watcher does not advance the baseline or close the issue automatically; CI remains the merge gate for resulting changes.

The delivery job needs only `contents: read` and `issues: write`. It does not need permission to create PRs, repository write access, a personal token, or new automation branches. A delivery error is a failed run, not a successful alert. Inspect the issue inventory before retrying an ambiguous creation failure.

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
