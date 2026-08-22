# Trusted verification offline artifacts

## Scope

This document defines the versioned offline contracts and cryptographic semantics used by Vortik trusted verification. Candidate admission remains fail-closed.

The four versioned contracts are:

```text
schemas/verification/vortik-verification-claim/1.0.0/schema.json
schemas/verification/vortik-admission-intent/1.0.0/schema.json
schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json
schemas/verification/vortik-verification-key-policy/1.0.0/schema.json
```

Their `docs/schemas/...` mirrors are public and must remain byte-identical.

The network-backed primary-source and ENS mainnet verifiers are implemented separately. `lib/trusted-receipt-issuer.mjs` now provides the protected-runtime core that converts their independently derived payloads into signed receipt envelopes when supplied with protected signer and trusted-clock dependencies.

Production receipt issuance remains disabled because no production signing key, production key-policy instance, protected clock implementation or deployment assembly is committed here.

## 1. Exact verification claim

A verification claim binds one exact human-reviewed semantic assertion to:

- contribution ID and canonical contribution digest;
- review ID and canonical review digest;
- raw candidate name;
- exact normalized candidate name under `ENSIP-15`;
- canonical term and classification;
- exact claim statement; and
- expected primary-source authority class.

The claim artifact is not trusted evidence. Its gates keep registry eligibility, registry mutation, ownership inference and commercial authority closed.

The canonical claim digest is:

```text
sha256(JCS(claim artifact))
```

using `RFC8785-JCS-constrained-v1`.

## 2. Deterministic admission intent

An admission intent binds the exact claim digest to one candidate-derived registry-sensitive change:

```text
new_anchor
ens_rebound
```

It records the contribution/review/claim digests, exact normalized candidate name, target anchor, proposed ENS value, expected base-anchor digest where applicable, and digest of the complete proposed anchor object.

The intent is only a deterministic description of a possible future separate registry PR. It does not enable admission or mutate `registry.json`.

## 3. Canonicalization and digest profile

Version 1 uses:

```text
canonicalization: RFC8785-JCS-constrained-v1
digest_algorithm: SHA-256
```

`lib/trusted-verification-crypto.mjs` accepts a constrained JSON subset:

- `null`, booleans, strings, arrays and plain objects;
- safe integers only;
- no floats, unsafe integers or negative zero;
- no `undefined` or non-JSON values; and
- no lone UTF-16 surrogates.

Artifact digests use:

```text
sha256:<64 lowercase hex characters>
```

## 4. Signed receipt envelope

Receipt type is exactly one of:

```text
primary_source
ens_mainnet
```

Every receipt binds to the same subject tuple:

- contribution digest;
- review digest;
- exact claim digest;
- admission-intent digest;
- raw candidate name; and
- normalized candidate name.

The envelope also binds verifier identity/version/code commit, key-policy identity/digest, trusted issuance time and clock provenance, bounded validity, replay material, evidence payload, canonicalization and digest algorithm.

Receipt v1 requires:

```text
issued_at == trusted_issued_at
trusted_issued_at <= admission_valid_until
admission_valid_until <= trusted_issued_at + 86400
```

ENS receipts additionally require:

```text
block.finalized == true
block.timestamp <= trusted_issued_at
trusted_issued_at - block.timestamp <= 1800
base_registrar_expiry > trusted_issued_at
admission_valid_until <= base_registrar_expiry
```

## 5. Receipt digest and Ed25519 signature

The receipt digest covers all receipt semantics except the digest itself and the signature value. Signature algorithm and key identity remain protected by the digest:

```text
signed_receipt_semantics = receipt minus {receipt_digest, signature.signature_base64url}
receipt_digest = sha256(JCS(signed_receipt_semantics))
```

The Ed25519 signature signs the exact UTF-8 `receipt_digest` string.

Changing subject, verifier provenance, key identity, time bounds, payload or admission intent therefore changes the digest and invalidates the signature.

## 6. Public key policy

The key-policy contract contains public verification metadata only. It never accepts a private key.

Each authorized key defines:

- key ID;
- Ed25519 public key in SPKI DER base64;
- status (`active`, `retired`, `revoked`);
- authorization interval; and
- allowed receipt types.

The policy does not authenticate itself. Its ID/version/digest must come from independently trusted runtime/repository configuration. Receipt verification checks policy identity/digest, unique key identity, non-aliased public keys, active status, authorization interval and allowed receipt type.

No production key-policy instance or signing secret is committed in this repository.

## 7. Primary-source receipt payload

The implemented bounded primary-source verifier independently derives:

- validated authority class;
- code-owned retrieval-policy ID;
- canonical source identifier;
- exact GitHub repository identity;
- immutable commit SHA;
- exact blob SHA and path;
- SHA-256 of retrieved bytes; and
- exact claim-binding digest.

The receipt issuer core invokes that verifier itself. Contributor-supplied URLs or caller-supplied payloads are never signed as trusted evidence.

## 8. ENS mainnet receipt payload

The implemented bounded ENS mainnet verifier independently derives:

- Ethereum chain ID `1`;
- normalization profile and exact normalized name;
- canonical ENS Registry/Base Registrar contracts;
- one finalized block number/hash/state root/parent hash/timestamp;
- provider-policy ID;
- exactly two distinct provider identities agreeing on block and lookup digest;
- affirmative registry record and active-registration evidence;
- Base Registrar expiry; and
- lookup-result digest bound to exact name/contracts/block/result context.

The receipt issuer core invokes that verifier using only the claim's normalized name. ENS evidence never proves ownership and never grants commercial authority.

## 9. Validation and issuer-core tests

`npm run validate` includes both:

```text
npm run validate:trusted-verification-artifacts
npm run test:trusted-receipt-issuer
```

Offline artifact validation covers schema mirrors, canonicalization, claim/intent binding, key-policy authorization, receipt temporal/evidence semantics, same-subject dual receipts, Ed25519 verification, freshness, replay fields and tamper/fail-closed regressions.

Issuer-core tests add coverage that:

- the caller cannot inject verifier payload, time, key identity, nonce or receipt identity;
- both verifier payloads are derived internally;
- claim and intent gates remain fail-closed;
- stale/detached evidence is rejected before signing;
- unauthorized or mismatched signers fail closed; and
- no raw private key is accepted by the issuer constructor.

Only ephemeral keys are generated in tests. No production private key is committed.

## 10. Current gate state

Current technical state is:

```text
primary source verifier implemented = true
ENS mainnet verifier implemented = true
bounded live network access = true
protected receipt issuer core implemented = true
production trusted receipt issuance = false
candidate admission = false
registry mutation = false
ownership inference = false
commercial authority = false
```

The remaining production issuance gap is no longer a missing public algorithmic bridge. It is protected runtime activation: real Ed25519 key custody, trusted public key-policy identity, trusted issuance-clock implementation/policy, deployment assembly, and operational key rotation/revocation.

Those require external/protected infrastructure and owner decisions. They must not be synthesized or committed as public test material.

Candidate admission remains a later separate gate even after production receipt issuance is activated.
