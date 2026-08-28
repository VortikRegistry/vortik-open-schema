# Trusted receipt issuer core

## Purpose

`lib/trusted-receipt-issuer.mjs` closes the code-level gap between the two implemented trusted verifier payloads and the existing signed receipt contract.

It is a protected-runtime **core**, not a production signing service. It deliberately does not contain a private key, production key-policy instance, trusted clock implementation, RPC credential, admission switch, registry mutation path or commercial authority.

The canonical production state therefore remains:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

## Protected construction boundary

The issuer is created with dependencies that must come from trusted runtime assembly, not from a contribution or request:

- primary-source verifier instance;
- ENS mainnet verifier instance;
- verifier IDs, versions and exact code commits;
- public verification key policy plus independently trusted policy identity;
- signer interface bound to one Ed25519 key ID;
- trusted issuance-clock interface plus source/policy identity;
- cryptographic randomness.

The issuer accepts a signer function, not raw private-key material. Constructor objects containing common raw secret/private-key fields are rejected.

The generic core cannot prove that an operator assembled those dependencies correctly. Production activation still requires a protected deployment boundary that controls the signer, clock, verifier configuration and trusted policy identity.

## What callers may provide

The primary-source path accepts only:

- the exact verification claim;
- the exact admission intent;
- the bounded primary-source selector consumed by the implemented primary-source verifier.

The ENS path accepts only:

- the exact verification claim; and
- the exact admission intent.

Callers cannot supply:

- verifier payloads;
- receipt IDs;
- nonces;
- `issued_at` or `trusted_issued_at`;
- `admission_valid_until`;
- signing-key identity;
- receipt digest; or
- signature.

Those fields are derived inside the protected core.

## Evidence derivation

For primary-source receipts, the issuer invokes the configured primary-source verifier itself. The verifier derives immutable GitHub repository/commit/blob/path/content evidence and binds it to the exact claim digest.

For ENS mainnet receipts, the issuer invokes the configured dual-provider ENS verifier itself using only the claim's exact normalized candidate name. The verifier derives the finalized block, provider agreement, active registration evidence, expiry and lookup digest.

The issuer never signs a caller-supplied verifier payload.

## Subject and gate binding

Before verification or signing, the issuer:

- snapshots the claim and admission intent;
- verifies their deterministic binding;
- requires the existing claim gates to remain fail-closed;
- requires the admission-intent gates to remain fail-closed;
- derives the exact claim digest and admission-intent digest; and
- constructs the receipt subject from those canonical artifacts.

This core does not enable admission. An admission intent remains a description of a possible future separate registry PR.

## Trusted time and validity

The request cannot supply a timestamp. The issuer reads Unix seconds only from the construction-bound trusted clock interface and emits the construction-bound clock source/policy identity.

Receipt v1 uses:

```text
issued_at = trusted_issued_at
admission_valid_until <= trusted_issued_at + 86400
```

For ENS receipts the issuer also caps `admission_valid_until` at Base Registrar expiry.

Before signing, the existing offline temporal/evidence checks reject stale finalized blocks, future block timestamps, expired registrations, detached digests and other receipt-semantic failures.

## Signing and self-verification

The issuer:

1. selects the construction-bound Ed25519 key ID;
2. checks that the public key policy and independently trusted policy identity authorize that key, receipt type and issuance time;
3. computes the canonical receipt digest;
4. sends only that digest to the protected signer interface;
5. inserts the returned base64url Ed25519 signature; and
6. verifies the completed signature against the public key policy before returning the receipt.

A signer that does not correspond to the authorized public key therefore fails closed even if it returns a syntactically valid signature.

## Replay material

Receipt IDs and replay nonces are generated inside the issuer from 128 bits of runtime randomness. They are not accepted from the request.

The existing receipt contract continues to require the single-use-at-admission replay rule. The issuer core does not implement the future durable single-use admission store because admission remains disabled.

## Validation

Run:

```bash
npm run test:trusted-receipt-issuer
```

The tests use only ephemeral Ed25519 keys and deterministic test doubles. They cover:

- valid primary-source and ENS receipt issuance;
- receipt schema conformance;
- exact same-subject dual receipts;
- signature self-verification;
- caller attempts to inject payload/time/key/nonce/receipt identity;
- fail-open claim or admission-intent gates;
- detached primary-source evidence;
- stale ENS evidence and expired registrations;
- signer/public-key mismatch;
- unauthorized receipt type; and
- rejection of raw private-key fields and mismatched trusted policy identity.

No production key or secret is committed.

## V1 decision and production activation STOP boundary

The issuer core is complete for the V1 trust boundary, but production `trusted_receipt_issuance` is explicitly deferred from V1 and remains `false`. V1 exposes no receipt-issuance route.

The production-preactivation evidence demonstrates bounded use of the protected runtime and pinned KMS key for fixed primary-source and ENS-mainnet receipt fixtures. Those PASS results are evidence for the preactivation path, not permission to enable a service.

Any post-V1 activation requires a separate reviewed change plus current owner/infrastructure decisions, including at minimum:

- the exact authorized Ed25519 signing key held in the approved KMS boundary;
- a public key-policy instance anchored as trusted runtime/repository configuration;
- a policy-validated issuance clock source whose time is not request-controlled;
- deployment assembly binding the real verifier instances, signer, clock and policy identities; and
- an operational rotation/revocation procedure for signing keys.

Those are external/protected operational dependencies. They are intentionally not synthesized, committed or guessed by this public repository, and historical probe evidence must be revalidated at the later activation gate.

Candidate admission remains a later and separate gate even after production receipt issuance is activated.
