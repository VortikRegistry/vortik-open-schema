# Trusted verification offline artifacts

## Scope

This document defines the **offline contract layer** that sits between Candidate Review & Provenance and the future real verification bridge.

Nothing in this layer performs network access, Ethereum RPC calls, GitHub retrieval, receipt issuance with a repository secret, registry mutation, ownership verification, or commercial authorization. Candidate admission remains fail-closed.

The four versioned contracts are:

```text
schemas/verification/vortik-verification-claim/1.0.0/schema.json
schemas/verification/vortik-admission-intent/1.0.0/schema.json
schemas/verification/vortik-trusted-verification-receipt/1.0.0/schema.json
schemas/verification/vortik-verification-key-policy/1.0.0/schema.json
```

Their `docs/schemas/...` mirrors are public and must remain byte-identical.

## 1. Exact verification claim

A verification claim binds one exact human-reviewed semantic assertion to:

- the contribution ID and canonical contribution digest;
- the review ID and canonical review digest;
- the raw candidate name;
- the exact normalized candidate name under `ENSIP-15`;
- one canonical term;
- one registry classification;
- one exact claim statement; and
- one expected primary-source authority class.

The claim artifact is **not evidence**. Its gates keep the claim untrusted, prevent authoritative-source selection by the claimant, prevent registry eligibility and mutation, and preserve the ownership/commercial boundary.

The canonical claim digest is:

```text
sha256(JCS(claim artifact))
```

using the constrained RFC 8785 profile described below.

## 2. Deterministic admission intent

An admission intent binds the exact claim digest to one candidate-derived registry-sensitive change recognized by the existing fail-closed gate:

```text
new_anchor
ens_rebound
```

It records:

- contribution digest;
- review digest;
- exact claim digest;
- exact normalized candidate name;
- target anchor ID;
- proposed ENS value;
- expected base-anchor digest (`null` only for a new anchor); and
- digest of the complete proposed anchor object.

The proposed ENS must equal the normalized candidate name.

The intent is a description of a possible future registry PR. It does not mutate `registry.json`, does not make the candidate eligible, and cannot bypass the separate-registry-PR rule.

Receipts later bind to the canonical digest of this complete intent artifact.

## 3. Canonicalization and digest profile

Version 1 uses:

```text
canonicalization: RFC8785-JCS-constrained-v1
digest_algorithm: SHA-256
```

The implementation in `lib/trusted-verification-crypto.mjs` intentionally accepts a constrained JSON subset:

- `null`, booleans, strings, arrays, and plain objects;
- safe integers only;
- no floating-point numbers;
- no unsafe integers;
- no negative zero;
- no `undefined` or non-JSON values;
- no lone UTF-16 surrogates.

Object keys are sorted according to JavaScript's UTF-16 lexical ordering and values are serialized with JSON string semantics. This keeps the supported data model inside the deterministic RFC 8785/JCS profile required by the trusted-verification boundary.

Artifact digests use:

```text
sha256:<64 lowercase hex characters>
```

## 4. Signed receipt envelope

Both future receipt types share one envelope:

```text
primary_source
ens_mainnet
```

Every receipt binds to the same subject tuple:

- contribution digest;
- review digest;
- exact claim digest;
- admission-intent digest; and
- normalized candidate name.

The envelope also binds:

- verifier ID and version;
- exact verifier code commit;
- key-policy identity, version and digest;
- `issued_at`;
- `trusted_issued_at`;
- `admission_valid_until`;
- payload;
- canonicalization and digest algorithms.

For receipt version `1.0.0`, offline temporal validation requires:

```text
issued_at == trusted_issued_at
trusted_issued_at <= admission_valid_until
admission_valid_until <= trusted_issued_at + 86400
```

An ENS receipt additionally requires:

```text
block.finalized == true
block.timestamp <= trusted_issued_at
trusted_issued_at - block.timestamp <= 1800
base_registrar_expiry > trusted_issued_at
admission_valid_until <= base_registrar_expiry
```

These checks are offline contract checks only. PR2 does not provide the trusted clock itself.

## 5. Receipt digest and Ed25519 signature

The receipt digest is calculated over the complete receipt **except** `receipt_digest` and `signature`:

```text
unsigned_receipt = receipt minus {receipt_digest, signature}
receipt_digest = sha256(JCS(unsigned_receipt))
```

The Ed25519 signature then signs the exact UTF-8 `receipt_digest` string.

This gives one unambiguous authentication relation:

```text
all unsigned receipt semantics
        ↓ JCS + SHA-256
receipt_digest
        ↓ Ed25519
signature
```

Changing the subject, verifier provenance, time bounds, payload, admission intent, or evidence changes the digest and invalidates the signature.

No private key is stored or accepted by the public key-policy schema.

## 6. Public key policy

The key-policy contract is public verification metadata only.

Each authorized key contains:

- key ID;
- algorithm `Ed25519`;
- public key encoded as SPKI DER base64;
- status: `active`, `retired`, or `revoked`;
- authorization start and end times; and
- allowed receipt types.

A receipt is acceptable only when:

- its key-policy digest matches the exact policy artifact;
- policy ID/version match;
- the signature key ID resolves to exactly one policy key;
- the key is `active`;
- the receipt type is authorized for that key; and
- trusted issuance occurs inside the key's authorization window.

PR2 deliberately adds **no production key-policy instance and no signing secret**. Real repository public keys and secret-backed signing belong to the later protected verifier implementation.

## 7. Primary-source receipt payload

The primary-source payload is designed to preserve the #97 requirements without performing retrieval yet. It carries:

- authority class;
- retrieval-policy ID;
- independent-retrieval assertion;
- provider identity (`github`);
- numeric repository ID;
- exact repository full name;
- exact commit SHA;
- exact blob SHA;
- exact path;
- SHA-256 of retrieved content; and
- exact claim-binding digest.

The later primary-source verifier must derive those values itself from the approved source policy. Contributor-supplied URLs do not become trusted inputs merely because they resemble these fields.

## 8. ENS mainnet receipt payload

The ENS payload models the evidence that the later dual-provider verifier must derive independently:

- chain ID `1`;
- normalization profile `ENSIP-15`;
- active definition `active_eth_2ld_at_finalized_block_v1`;
- exact normalized candidate name;
- finalized block number, hash, state root, parent hash and timestamp;
- exactly two distinct provider identities;
- provider evidence agreeing with the same block hash, state root, timestamp and lookup-result digest;
- affirmative ENS Registry record evidence;
- confirmation that the `.eth` registrar owner matches the Base Registrar boundary used by the verifier;
- Base Registrar expiry;
- affirmative active-registration result; and
- lookup-result digest.

Provider identities are carried explicitly but are not hard-coded to a vendor in this offline schema. Real provider policy and credentials remain PR4 infrastructure work.

ENS evidence never proves ownership and never grants commercial authority.

## 9. Offline validation

`npm run validate` now includes:

```text
npm run validate:trusted-verification-artifacts
```

The validator checks:

- all four source/public schema pairs are byte-identical;
- sample exact claim and admission intent artifacts;
- deterministic canonicalization independent of object key order;
- rejection of floats and negative zero;
- admission-intent subject binding;
- ephemeral Ed25519 signing and verification;
- key-policy digest and authorization;
- both receipt payload branches;
- same-subject dual receipts;
- trusted issuance/validity bounds;
- ENS finalized-block freshness;
- two-provider agreement;
- rejection of claim/admission authority escalation;
- rejection of private-key fields in public policy;
- rejection of tampered signed receipts;
- rejection of revoked keys;
- rejection of stale ENS evidence; and
- rejection of cross-receipt subject mismatch.

Ephemeral keys are generated only inside the validation process. No test or production private key is committed.

## 10. Gates that remain closed

After this contract layer:

```text
primary source verifier implemented = false
ENS mainnet verifier implemented = false
live network access = false
trusted receipt issuance = false
candidate admission = false
registry mutation = false
ownership inference = false
commercial authority = false
```

The next implementation step is the bounded primary-source verifier. It must still run with admission disabled.

The real ENS dual-RPC verifier, protected signing keys, and trusted runtime clock remain later trust-boundary work. A separate architecture/security audit remains required before any admission gate can be enabled.
