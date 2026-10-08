# Protocol Watch alert #150 review — 2026-10-08

This follow-up reviews [alert #150](https://github.com/VortikRegistry/vortik-open-schema/issues/150) and one later commit observed during the review. It supplements the [earlier October 8 review](protocol-watch-review-2026-10-08.md), which was accepted in [PR #148](https://github.com/VortikRegistry/vortik-open-schema/pull/148). It proposes advancing only the Glamsterdam devnets watch fingerprint. The proposal requires human approval and merge; this document does not itself accept the baseline or close the alert.

## Cutoff and complete coverage

The accepted devnet reference is `788b03c81be76170e87ea382722f778193634997`. The alert observed `b00874e7e179366a311e81767e659939435318f6` at **2026-10-08T12:55:50.417Z**. A subsequent read of `master` identified `859bb47b59621384888b64eeb6c1d4cab0724ec7`; this review includes that additional commit explicitly, rather than accepting an unexamined newer head.

The full local Git comparison contains three commits and **33 changed paths: 15 additions and 18 modifications**, with no deletions or renames. The [complete path and blob inventory](../../protocol-watch/reviews/2026-10-08-alert-150-devnets-paths.txt) has SHA-256 `2d4a31f6b373338659c7ff0e7d3d7c1c7b7f828f2928f76c44aae27273f2194a`. The original alert interval has 32 paths; the later firewall change adds one.

| Commit | Reviewed change | Public-claim impact |
| --- | --- | --- |
| [`f75e0f2`](https://github.com/ethpandaops/glamsterdam-devnets/commit/f75e0f2598ec41bb464964705dfa9563740e70f6) | Split encrypted logs/metrics ingress settings from other inventory settings; add a specific SOPS recipient rule. | Upstream operations and access scoping; no protocol or terminology change. |
| [`b00874e`](https://github.com/ethpandaops/glamsterdam-devnets/commit/b00874e7e179366a311e81767e659939435318f6) | Change the pinned SOPS tool version from 3.8.1 to 3.13.3. | Upstream tooling maintenance. |
| [`859bb47`](https://github.com/ethpandaops/glamsterdam-devnets/commit/859bb47b59621384888b64eeb6c1d4cab0724ec7) | Open the `msf-1` execution-layer peer port, TCP/UDP 30303, to IPv4/IPv6 sources. | A shadowfork configuration change; not evidence of Ethereum mainnet or Sepolia activation. |

## Findings and limits

**Encrypted settings.** The change covers fifteen inventories: devnet-0 through devnet-11, msf-1, sepsf-1 and sepsf-2. In every pair, `secret_prometheus_remote_write` and `secret_loki` disappear from `all.sops.yaml` and appear in a new sibling `ingress.sops.yaml` with the same field names. Parsed comparison confirms that all remaining encrypted application fields in `all.sops.yaml` are identical; its SOPS metadata changes only the modification timestamp and MAC. Its existing PGP recipients remain unchanged and it has no age recipient.

The new ingress files include an additional age recipient and the existing PGP recipient set. The `.sops.yaml` rule matches `ingress.sops.yaml` specifically and precedes the unchanged existing rule. Upstream describes this as allowing platform ArgoCD to consume the ingress settings separately. These are visible configuration facts and upstream intent, not a verification of deployed access controls. The moved ciphertext differs, so plaintext equality is **not verified**. No decryption was attempted and no upstream executable, secret, infrastructure plan or deployment was used.

**Shadowfork peer access.** The later `terraform/msf-1/firewall.tf` diff replaces the network-tag/extra-address restriction for TCP and UDP 30303 with all IPv4 and IPv6 sources. Its comment attributes this to Amsterdam having activated in that testing environment on October 7 and to fork-ID separation from mainnet peers. This review does not independently verify that runtime assertion or the peer-rejection behavior. The file is explicitly scoped to `msf-1`; an inherited chain identifier or a shadowfork operator comment cannot establish Ethereum mainnet activation. Sepolia activation remains unverified in Vortik's structured context. The earlier review's peer-isolation description is dated to its own cutoff; the newer firewall configuration is recorded here.

**Public-claim decision.** The changed paths contain no EIP/specification document, network genesis, fork schedule, canonical term, client implementation or Vortik service code. There is no evidence in this interval requiring a registry classification, schema, feed, map, catalog or selected fork-assignment change. The needed editorial update is this bounded operational follow-up. The proposed baseline changes only `glamsterdam-devnets-head`; the other nine identities remain as accepted in PR #148. This is not an upstream security audit, a check of live devnet health, or authorization to alter any firewall or deployed service.

## Source revalidation

Read-only GitHub file metadata was retrieved at **2026-10-08T14:10:48Z** for the other nine configured sources. All nine blob identities match the accepted baseline, and all six watched EIP statuses match. The local live watcher attempt timed out; it is not counted as a successful live run. The read-only metadata checks and the Git diff provide the source evidence for this proposal.

| Source | Observed blob SHA / repository commit |
| --- | --- |
| EIP-7732 | `947683d4fe49da8870026cb69c6d9ff8d7d4d6d8` |
| EIP-7773 | `c6b80d7f3d36bcb5d041ca30c6026133602900ea` |
| EIP-7805 | `0a3955d9e8772b7666f560402b2d81ae032a3d06` |
| EIP-7928 | `f5828f59cd5073eca7856b62c6d16389d5a2c09d` |
| EIP-8081 | `2f0d5c497eca41ee9a13f2aef2598e4ed3ec1597` |
| EIP-8282 | `13b923d8effa18ec5eae90c9c5072950539aa0f9` |
| ethereum.org Glamsterdam roadmap | `d6a26c8d19a6e8370be70b112bd92b17f93eb709` |
| Gloas beacon-chain specification | `68ef6e61d33cdc185cdb5fc17b8dd6e8cb63b699` |
| Gloas P2P specification | `1e0dca6e5ab6a83c3f4536b69bcca4bcd1c5bdcc` |
| Glamsterdam devnets | `859bb47b59621384888b64eeb6c1d4cab0724ec7` |

Paths and primary repositories are defined in [`config/protocol-watch.json`](../../config/protocol-watch.json). File identities are immutable Git blobs. The observation covers all ten configured IDs; none is omitted to obtain a quiet comparison. A later upstream change remains a separate review item.

## Reproduction and acceptance

From a clone containing the pinned upstream commits:

```bash
git diff --raw --no-abbrev --no-renames \
  788b03c81be76170e87ea382722f778193634997 \
  859bb47b59621384888b64eeb6c1d4cab0724ec7 > alert-150-devnets-paths.txt
sha256sum alert-150-devnets-paths.txt
git log --format='%H %s' \
  788b03c81be76170e87ea382722f778193634997..859bb47b59621384888b64eeb6c1d4cab0724ec7
```

For the proposal, run `npm run check:public-safety`, `npm run validate`, and the existing detector/notifier tests. Compare the complete recorded observation against both baselines: the accepted baseline must produce exactly the devnet change, and the proposal must produce zero differences against that same observation. Those comparisons establish cutoff consistency, not future freshness.

Keep #150 open until human approval and merge. After merge, observe the normal main validation, single automatic Pages publication and Protocol Watch run. If upstream has changed again, inspect the new evidence without silently advancing the reference. This change does not modify watcher behavior, notification permissions or deployment controls.
