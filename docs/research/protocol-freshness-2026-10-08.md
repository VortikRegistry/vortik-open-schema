# Protocol follow-up and visitor journey — 2026-10-08

This targeted follow-up updates selected proposal metadata, fork assignments and published schedules after the [September 30 all-anchor review](protocol-freshness-2026-09-30.md). It also records a read-only check of the published visitor journey. Research and application notes outside this scope retain their September 30 review; this is not a new technical audit of all proposal bodies or all twelve anchors.

## Findings that change the public reference

The following related proposals are **Last Call**, each with a **2026-11-01** deadline, in the pinned official EIPs repository:

| Proposal | Subject | Fork assignment in EIP-7773 |
| --- | --- | --- |
| [EIP-7732](https://eips.ethereum.org/EIPS/eip-7732) | Enshrined proposer-builder separation | Scheduled for Inclusion in Glamsterdam |
| [EIP-7928](https://eips.ethereum.org/EIPS/eip-7928) | Block-Level Access Lists | Scheduled for Inclusion in Glamsterdam |
| [EIP-8037](https://eips.ethereum.org/EIPS/eip-8037) | State creation gas costs | Scheduled for Inclusion in Glamsterdam |
| [EIP-8038](https://eips.ethereum.org/EIPS/eip-8038) | State-access gas costs | Scheduled for Inclusion in Glamsterdam |
| [EIP-8282](https://eips.ethereum.org/EIPS/eip-8282) | Builder execution requests | Scheduled for Inclusion in Glamsterdam |

Last Call is a document lifecycle state. It does not establish activation or change Vortik's canonical classifications.

[EIP-7773](https://eips.ethereum.org/EIPS/eip-7773) remains Review. It and the [Foundation announcement](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement) record Sepolia at **2026-10-06 13:53:36 UTC**, epoch **353024**, slot **11296768**. The announcement page is dated September 28 despite the September 17 URL path. That scheduled time has now passed. Neither the passage of time nor the schedule is sufficient evidence of successful activation. This follow-up does not check live chain state and preserves the published schedule in this note without claiming completion. The structured context marks Sepolia `unverified` with null activation fields rather than presenting a past schedule as a current future event. Hoodi and mainnet dates remain unset in these sources.

[EIP-8081](https://eips.ethereum.org/EIPS/eip-8081) remains Draft. EIP-7805 FOCIL remains Draft and Scheduled for Inclusion in Hegotá; EIP-8025 remains Draft and Proposed for Inclusion; EIP-8146 remains Draft and Declined for Inclusion. Hegotá network activation dates are unset. EIP-1559 remains Final; its historical fork assignment is outside this dataset's selected review.

## Catalog refresh

The existing generator was run against these official repository commits, with no hand edits to the generated catalog:

| Repository | Commit | Scanned Markdown files | Canonical records |
| --- | --- | ---: | ---: |
| ethereum/EIPs | [`6dac5e74918b54511298fdbff79650e8f8d27d78`](https://github.com/ethereum/EIPs/commit/6dac5e74918b54511298fdbff79650e8f8d27d78) | 958 | 593 |
| ethereum/ERCs | [`3da6a0ffd402d7ea11a695dbb1eea9b2e1162238`](https://github.com/ethereum/ERCs/commit/3da6a0ffd402d7ea11a695dbb1eea9b2e1162238) | 617 | 616 |

All **1,575** inputs are accounted for: **1,209** unique records, 365 moved stubs and one mirror, with no excluded files. The new record is [EIP-8411, Fast Execution Payload Broadcast](https://eips.ethereum.org/EIPS/eip-8411). It is catalog metadata, not a promoted registry anchor.

Compared with September 30, 33 existing records changed lifecycle state: 30 moved from Review to Last Call; ERC-7945 and ERC-8167 moved from Last Call to Final; EIP-8333 moved from Draft to Withdrawn. The five selected proposals above are a subset of those changes. No existing indexed title or description changed. This comparison excludes source commit fields, which change for every record when the source lock advances.

Both pinned licenses remain CC0-1.0. The exact technical metadata exceptions for EIP-7609's description and EIP-7915's title were checked against the new pinned sources and retain their original text; only their commit correspondence changed. The public safety check remains enabled. See [catalog provenance](../ethereum-catalog.md) for reproduction and coverage limits.

## Protocol Watch follow-up

A read-only watch comparison detected changes in nine of ten configured sources against the September 13 baseline. EIP-7805 was unchanged. The current source identities observed were:

| Watched source | Observed blob SHA or repository head |
| --- | --- |
| EIP-7732 | `947683d4fe49da8870026cb69c6d9ff8d7d4d6d8` |
| EIP-7773 | `c6b80d7f3d36bcb5d041ca30c6026133602900ea` |
| EIP-7805 | `0a3955d9e8772b7666f560402b2d81ae032a3d06` |
| EIP-7928 | `f5828f59cd5073eca7856b62c6d16389d5a2c09d` |
| EIP-8081 | `2f0d5c497eca41ee9a13f2aef2598e4ed3ec1597` |
| EIP-8282 | `13b923d8effa18ec5eae90c9c5072950539aa0f9` |
| ethereum.org Glamsterdam roadmap | `d6a26c8d19a6e8370be70b112bd92b17f93eb709` |
| consensus-specs Gloas beacon chain | `68ef6e61d33cdc185cdb5fc17b8dd6e8cb63b699` |
| consensus-specs Gloas P2P interface | `1e0dca6e5ab6a83c3f4536b69bcca4bcd1c5bdcc` |
| ethPandaOps Glamsterdam devnets head | `788b03c81be76170e87ea382722f778193634997` |

The EIP-7732 and EIP-8282 changes against that baseline are the Last Call status and deadline. EIP-7928 additionally clarifies empty access lists, warm SELFDESTRUCT beneficiary access cost, numeric storage-key ordering and its empirical size discussion. Fork-meta changes include the published Sepolia schedule, proposal title updates and Hegotá assignment changes already partly covered by the September 30 review. Repeated watch alerts therefore do not mean every change is new since the last editorial review.

The reviewed [Gloas beacon-chain specification](https://api.github.com/repos/ethereum/consensus-specs/git/blobs/68ef6e61d33cdc185cdb5fc17b8dd6e8cb63b699) changes include fork-epoch handling for payload timeliness committees, settlement ordering before builder execution requests, withdrawal accounting and reused builder-index handling. The immutable blob link returns the GitHub Git Database representation. The source path is `specs/gloas/beacon-chain.md` in [ethereum/consensus-specs](https://github.com/ethereum/consensus-specs).

The Gloas P2P source (`specs/gloas/p2p-interface.md` in the same repository) changes include request-retention arithmetic, rejection of pre-Gloas payload attestations, the proposer-preference signature epoch and serving envelopes newer than the latest finalized checkpoint. These are reviewed implementation details, not a client interoperability or security audit.

The [ethereum.org roadmap](https://ethereum.org/roadmap/glamsterdam/) removes EIP-7610 from its supplementary list and adds EIP-8070, EIP-8136 and EIP-8189. Its stale Draft wording for the fork meta EIP is not used to override the authoritative EIP-7773 Review status.

The devnet head comparison returned **300 changed files**, the API comparison limit. It is not an exhaustive review of that repository. The Protocol Watch baseline is therefore **unchanged**, and this follow-up does not close the watch issue or assert that every pending source diff was accepted. Baseline acceptance still requires the project's human review gate.

A [separate Protocol Watch review](protocol-watch-review-2026-10-08.md) subsequently completes the Git path inventory and proposes a dated baseline for human acceptance. The statement above records the limit of this earlier follow-up; the separate review describes the additional evidence and its boundaries.

## Published visitor journey

These interactions were checked on the public site before this update, whose source snapshot was September 30:

| Journey | Observed result |
| --- | --- |
| Home search → `ERC-20` | Proposal search loads one canonical ERC-20 result with Final document status. |
| ERC-20 result → official document | Opens the official Token Standard at `ercs.ethereum.org/ERCS/erc-20`. |
| Unmatched query | Explains that there are no results and offers reset controls and official index links. |
| Home → ePBS / FOCIL comparison | Both intended entries are selected and shown in the comparison. |
| Reload shared comparison | Both selections persist from the query URL. |
| Explorer → maintainer on X | Opens the public `@VortikRegistry` profile. |

The X profile provides a public mention path and sign-in options. This check does not verify private-message eligibility or delivery. Visitors use their own X account to make contact; opening the link sends no message and does not forward anything to email. No message was sent during the check.

The check covered the desktop browser journey, not a complete mobile or accessibility audit. It did not test a new deployment, the separately deployed Reception service, deployed agent health, ENS resolution, billing or private integrations. Local validation of this update is recorded in its pull request.

## Change boundary

This update changes editorial context, source metadata and their derived documentation. Registry version 0.6.5, canonical identities and classifications, schema contracts, service deployment and the Protocol Watch baseline retain their existing state. No new monitoring schedule or autonomous contact behavior is introduced.
