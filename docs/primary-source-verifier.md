# Primary-source verifier

## Status

Vortik now has a bounded GitHub primary-source verifier in `lib/primary-source-verifier.mjs`.

This is the first real network-backed trusted-verification capability. It derives primary-source evidence from independently retrieved bytes at an exact immutable Git commit. It does **not** enable candidate admission, registry mutation, receipt signing with production keys, ENS mainnet verification, ownership inference, or commercial authority.

The earlier `docs/trusted-verification-artifacts.md` remains the PR2 contract-layer reference. Its closing implementation-state block describes the state immediately after that contract layer; this document records the later PR3 runtime capability.

## Trusted source policy

The built-in policy is intentionally narrow and code-owned. It allows only these public Ethereum repositories and path prefixes:

- `ethereum/EIPs` (`repository_id: 44971752`) under `EIPS/` for `eip` or `ethereum_official_repository` claims;
- `ethereum/consensus-specs` (`repository_id: 149554797`) under `specs/` for `ethereum_spec` or `ethereum_official_repository` claims;
- `ethereum/execution-specs` (`repository_id: 286791346`) under `src/ethereum/` for `ethereum_spec` or `ethereum_official_repository` claims.

Unsupported repositories, authority classes, and paths fail closed before network retrieval. `protocol_spec` and `protocol_official_repository` are not generalized into an open repository rule; they require a later explicit trusted-policy decision if a concrete protocol source needs them.

Contributor URLs are not accepted as trusted retrieval targets. The verifier constructs GitHub API URLs internally from the allowlisted repository, exact lowercase 40-hex commit SHA, and normalized repository-relative path.

## Verification flow

For one validated verification claim and one source selector, the verifier:

1. binds the claim's `source_authority_class` to an allowlisted repository/path policy;
2. retrieves GitHub repository metadata and requires the numeric repository ID and full name to match the trusted policy;
3. retrieves the file at the exact commit SHA using the GitHub Contents API;
4. requires a file result at the exact requested path;
5. decodes the independently retrieved base64 bytes;
6. recomputes the Git blob SHA-1 from `blob <length>\0<bytes>` and requires it to equal GitHub's blob SHA;
7. computes SHA-256 over the exact retrieved bytes;
8. binds the complete claim digest; and
9. derives the canonical primary-source identifier using the existing trusted-verification crypto helper.

The resulting object is the `primary_source` payload evidence expected by the signed-receipt contract. PR3 does not itself issue a production trusted receipt.

## Network and trust boundary

Network access is bounded to `https://api.github.com` URLs constructed internally. Redirects are rejected. The built-in verifier does not fetch arbitrary hosts, raw contributor URLs, branches, floating tags, or default-branch content.

The current source artifact limit is 1,000,000 decoded bytes. Production signing secrets and a trusted issuance clock remain outside this module.

## Validation

`npm run validate` includes:

```text
npm run test:primary-source-verifier
```

The tests cover:

- successful derivation from independently retrieved bytes;
- exact repository ID/full-name binding;
- exact commit/path binding;
- recomputed Git blob SHA binding;
- SHA-256 content binding;
- claim authority-class enforcement;
- rejection of non-allowlisted repositories;
- rejection of paths outside trusted prefixes and traversal attempts; and
- narrow default-policy scope.

Tests inject a deterministic mock `fetch`; CI does not depend on live GitHub availability.

## Gates that remain closed

```text
primary source verifier implemented = true
ENS mainnet verifier implemented = false
production trusted receipt issuance = false
candidate admission = false
registry mutation = false
ownership inference = false
commercial authority = false
```

The next authorized architectural step is the bounded ENS mainnet verifier. It must preserve dual-provider agreement, finalized-block binding, exact normalized-name binding, no ownership inference, and admission disabled.
