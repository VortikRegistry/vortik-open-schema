# Ethereum proposal catalog

The [catalog JSON](ethereum-catalog.json) contains **1,208 unique proposals: 592 EIPs and 616 ERCs**. It copies selected frontmatter fields from every numbered proposal Markdown file in the two official repositories at the commits below. It is independent of Vortik's 12 ENS-style semantic anchors: a proposal does not need a matching naming handle to appear here.

Use the [proposal search](research.html) for titles, optional upstream descriptions, proposal numbers, and document filters. The [separate protocol context](protocol-context.md) supplies a smaller, editorially reviewed set of fork assignments and network schedules. The catalog itself makes no activation claim.

## Snapshot provenance

Metadata snapshot reviewed: **2026-09-30**. This date records source selection and metadata extraction, not a technical review of every specification body.

| Official repository | Pinned commit | Markdown files | Canonical records |
| --- | --- | ---: | ---: |
| [ethereum/EIPs](https://github.com/ethereum/EIPs) | [`66daa41124581e4e839e89d71eb06b6cd4b1f9b8`](https://github.com/ethereum/EIPs/commit/66daa41124581e4e839e89d71eb06b6cd4b1f9b8) | 957 | 592 |
| [ethereum/ERCs](https://github.com/ethereum/ERCs) | [`5993dff16ae5003b1eb9c450cf71159e5ae89275`](https://github.com/ethereum/ERCs/commit/5993dff16ae5003b1eb9c450cf71159e5ae89275) | 617 | 616 |

Both repositories' pinned `LICENSE.md` files specify **CC0 1.0 Universal**. Each catalog source includes its immutable source-tree and license URLs. Each proposal includes its repository reference, path and commit; its `url` points to the official publication site.

All **1,574** Markdown inputs are accounted for:

- 365 EIPs files are `Moved` ERC stubs. Their canonical ERC metadata is used once.
- ERCs contains a mirror of EIP-1. The indexed metadata matches the canonical EIPs copy, which is used once.
- The remaining 1,208 records are unique by proposal number. No proposal is excluded because it lacks a Vortik anchor.
- No Markdown file is silently skipped. The generator fails on an unknown filename, unsupported metadata, missing counterpart or conflicting duplicate.

`coverage.duplicate_numbers` lists the 366 numbers represented by a moved stub or mirror. `coverage.excluded_files` is empty. This is coverage of those pinned repository directories, not all Ethereum ideas: unmerged pull requests, research discussions, abandoned unpublished drafts and later commits are outside the snapshot.

## Contract

Contract: `vortik.ethereum-catalog/1.0.0`. [JSON Schema](ethereum-catalog.schema.json).

| Field | Meaning |
| --- | --- |
| `proposals[].id` | Canonical catalog identity, such as `eip-7732` or `erc-20` |
| `number`, `title`, `description` | Upstream number and text; description is `null` when absent |
| `status` | Upstream document lifecycle: Draft, Review, Last Call, Final, Stagnant, Withdrawn or Living |
| `type`, `category` | Upstream classification; category is `null` for Meta and Informational documents |
| `url` | Official EIP/ERC publication URL, derived from canonical repository and number |
| `source_ref`, `path`, `commit` | Immutable source identity for the copied metadata |
| `provenance.content_sha256` | SHA-256 of the deterministic JSON serialization of the proposal array |

`Final` describes a document lifecycle. It does not prove that every network has implemented that proposal. A missing description is preserved as `null`; the generator does not invent a summary or index body text. Existing Vortik classifications and canonical registry fields are unchanged.

## Read or search locally

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/ethereum-catalog.json
```

Inside this repository, these commands read local committed files:

```bash
npm run validate:ethereum-catalog
npm run test:ethereum-catalog
npm run example:ethereum-catalog -- ERC-20
npm run example:ethereum-catalog -- account abstraction
```

The example searches titles and available descriptions, showing at most 20 results. A zero-result query is not evidence that a topic has no related proposal.

## Reproduce from pinned official objects

The generator never downloads sources. Prepare local checkouts of the official repositories and make the two locked commits available. One option is:

```bash
git clone --filter=blob:none --sparse https://github.com/ethereum/EIPs.git /tmp/vortik-official-EIPs
git -C /tmp/vortik-official-EIPs sparse-checkout set EIPS
git -C /tmp/vortik-official-EIPs checkout 66daa41124581e4e839e89d71eb06b6cd4b1f9b8

git clone --filter=blob:none --sparse https://github.com/ethereum/ERCs.git /tmp/vortik-official-ERCs
git -C /tmp/vortik-official-ERCs sparse-checkout set ERCS
git -C /tmp/vortik-official-ERCs checkout 5993dff16ae5003b1eb9c450cf71159e5ae89275

node scripts/generate-ethereum-catalog.mjs \
  --eips /tmp/vortik-official-EIPs \
  --ercs /tmp/vortik-official-ERCs \
  --check
```

The checkouts may require public GitHub reads while being prepared. The generator then reads only git objects at the locked commits with lazy fetching disabled. Uncommitted working-tree edits are ignored. Missing objects cause failure; they do not trigger a fetch. Remove `--check` to write the deterministic artifact after a reviewed source-lock update.

The source lock is [`scripts/ethereum-catalog-sources.json`](https://github.com/VortikRegistry/vortik-open-schema/blob/main/scripts/ethereum-catalog-sources.json). Updating it requires a new metadata snapshot review, regeneration, validation and coverage inspection. Do not automatically advance the date or imply live synchronization.

The publication safety check has two exact, commit-bound exceptions for technical metadata fields in EIP-7609 and EIP-7915. When the source lock changes, review those fields against the new pinned source and update their correspondence. Keep the catalog covered by the safety check and retain the proposals.

## Validation limits

Schema and integrity checks reject unsupported fields and lifecycle states, unsafe or mismatched official URLs, inconsistent counts, duplicate canonical numbers, source-lock drift and a changed content digest. Generation also verifies filenames against frontmatter numbers, identical indexed metadata for mirrors, and the presence of canonical ERC records for moved stubs. Metadata extraction fails explicitly on unsupported YAML syntax rather than guessing.

The `--check` reproduction verifies the committed artifact byte-for-byte against the pinned official source objects. The ordinary repository validator needs no upstream checkout or network access. When the separate context snapshot has the same review date, it also checks that its selected EIP document statuses agree with the catalog.

This catalog provides no ENS lookup, deployed-service health result, general web search, model-generated answer, or automatic action. Follow the cited official document and its history for the full specification and later changes.
