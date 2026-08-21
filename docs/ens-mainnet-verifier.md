# ENS mainnet verifier

## Status

This branch adds the bounded ENS mainnet verifier runtime in `lib/ens-mainnet-verifier.mjs`.

It derives the existing `ens_mainnet` evidence payload from two independently configured Ethereum JSON-RPC providers. Candidate admission remains disabled. No production signing key, trusted issuance clock, registry mutation, ownership inference, wallet operation, or commercial authority is added.

The canonical trusted-verification implementation-state manifest remains unchanged in this PR. Until the runtime has passed CI and exact-head review, `ens_mainnet_verifier_implemented` remains `false`. Publishing the implementation-state transition is a separate small gate after the verifier is reviewed.

## Bounded name profile

Version 0.1 deliberately supports only normalized ASCII `.eth` second-level names such as `epbs.eth`.

This is a strict subset of names that are stable under ENSIP-15 normalization. The verifier does not claim full Unicode ENSIP-15 implementation. Uppercase names, Unicode labels, subnames, non-`.eth` names, malformed labels, and labels outside the bounded profile fail closed before network access.

This avoids adding a normalization dependency or silently approximating ENSIP-15.

## Trusted provider boundary

A verifier instance must be constructed with exactly two distinct provider identities, HTTPS RPC endpoints, and trusted fetch transports.

Provider configuration is captured at construction. Per-request callers cannot replace provider identity, RPC URL, transport, contract addresses, chain ID, provider count, active-registration definition, or provider-policy identity.

Credentials, if a deployment later needs them, belong to trusted runtime configuration and are not committed here.

Each RPC request has a construction-owned deadline and bounded response size. Redirects fail closed.

## Finalized-block selection

For every verification the runtime:

1. requires `eth_chainId == 1` from both providers;
2. queries each provider's `finalized` block;
3. chooses the lower finalized block number as the conservative common height;
4. re-queries that exact block number from both providers;
5. requires exact agreement on block number, hash, state root, parent hash and timestamp; and
6. performs every ENS state read against that exact block number.

If providers disagree, verification fails closed.

## ENS state definition

The verifier implements the contract-layer definition `active_eth_2ld_at_finalized_block_v1` using the canonical mainnet contracts already fixed by the trusted receipt schema:

- ENS Registry: `0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e`
- Base Registrar: `0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85`

At the shared finalized block, each provider independently supplies evidence for:

- a non-zero ENS Registry record for the exact candidate node;
- the `.eth` registry owner matching the canonical Base Registrar boundary;
- Base Registrar `nameExpires(labelhash)` for the exact 2LD token; and
- expiry later than the finalized block timestamp.

The two independently derived lookup objects must be byte-for-byte equivalent after normalization into the verifier's bounded evidence structure.

Candidate owner/controller addresses are used only to determine whether the registry record is non-zero and are not returned in evidence. ENS evidence therefore does not infer or expose ownership.

## Evidence binding

The returned payload matches the existing `ens_mainnet` receipt payload semantics:

- chain ID `1`;
- normalization profile `ENSIP-15` with the explicitly bounded supported-name subset;
- exact normalized candidate name;
- canonical contract identities;
- one shared finalized block;
- fixed provider-policy ID;
- exactly two distinct provider identities;
- affirmative active-registration evidence; and
- `lookup_result_digest` recomputed with `computeEnsLookupResultDigest` from the exact name, contracts, block and lookup result.

Each provider evidence record carries the same block hash, state root, timestamp and recomputed lookup-result digest.

## Cryptography

Ethereum namehash, labelhash and ABI function selectors require legacy Keccak-256 rather than FIPS SHA3-256. The module contains a dependency-free bounded Keccak-256 implementation and tests it against the canonical Ethereum empty-input vector before using it for ENS calls.

No external cryptography or RPC package is introduced.

## Validation

`npm run validate` includes:

```text
npm run test:ens-mainnet-verifier
```

The regression suite covers:

- the canonical Keccak-256 vector;
- 2-of-2 agreement when providers expose different finalized tips but share a lower finalized block;
- exact finalized-block disagreement;
- negative registry state;
- canonical `.eth` registrar boundary enforcement;
- mainnet chain-ID enforcement;
- bounded normalized-name profile rejection;
- distinct provider identities; and
- stalled RPC timeout behavior.

Tests use deterministic trusted mock RPC transports. CI does not require live provider credentials.

## Gates that remain closed

```text
primary source verifier canonical = true
ENS mainnet verifier code present = true
ENS mainnet verifier canonical implementation-state = false pending review
production trusted receipt issuance = false
candidate admission = false
registry mutation = false
ownership inference = false
commercial authority = false
```

After CI and exact-head review are clean, the next small gate is to publish a versioned trusted-verification implementation state that marks the reviewed ENS verifier available. Production trusted clock/signing and candidate admission remain separate later gates.
