# Google Cloud KMS Ed25519 signer adapter

## Purpose

`lib/google-cloud-kms-ed25519-signer.mjs` provides the protected signer interface required by `lib/trusted-receipt-issuer.mjs` without placing private-key material, service-account keys, bearer tokens or other secrets in this repository.

This adapter is a deployment-bound integration primitive. Its presence does **not** mean that production trusted receipt issuance is active.

The canonical state remains:

```text
trusted_receipt_issuance = false
admission.enabled = false
```

## Provisioned public identity

The initial pre-provisioned public verification policy is:

```text
verification/key-policies/vortik-prod-receipt-signing-v1.json
```

It binds:

```text
policy_id = vortik-prod-receipt-signing-v1
key_id = gcp-kms-vortik-receipt-ed25519-v1
algorithm = Ed25519
allowed receipt types = primary_source, ens_mainnet
```

The policy contains only the public Ed25519 SPKI verification key and its bounded authorization window. No private key, service-account credential or access token is valid policy material.

## Exact Google Cloud key-version binding

The deployment profile for this initial adapter is intentionally version-specific:

```text
project = vortik-registry-production
region = southamerica-east1
key ring = vortik-trust
key = vortik-receipt-ed25519
key version = 1
CryptoKeyVersion = projects/vortik-registry-production/locations/southamerica-east1/keyRings/vortik-trust/cryptoKeys/vortik-receipt-ed25519/cryptoKeyVersions/1
expected protection level = SOFTWARE
```

The adapter does not sign against an implicit primary version. A rotation requires an explicit new CryptoKeyVersion binding and corresponding public key-policy change.

## Runtime identity

The intended protected runtime service identity is:

```text
vortik-receipt-runtime@vortik-registry-production.iam.gserviceaccount.com
```

The intended privilege boundary is sign-only access to the receipt-signing CryptoKey, not project-wide KMS administration.

The repository does not contain a downloadable service-account JSON key. In a Google-managed runtime such as Cloud Run, the default token provider requests a short-lived OAuth access token from the fixed Google metadata identity endpoint.

## Signing semantics

The trusted receipt issuer already computes a canonical receipt digest in the form:

```text
sha256:<64 lowercase hexadecimal characters>
```

For the Ed25519 Cloud KMS key, the adapter sends the UTF-8 bytes of that canonical digest string through the `data` field of `asymmetricSign`. It does not send a caller-selected message and it does not use the pre-hashed KMS `digest` field.

Before accepting a signature, the adapter fail-closes on:

- noncanonical Vortik receipt-digest input;
- a different returned CryptoKeyVersion name;
- failure of KMS request-data CRC32C verification;
- an unexpected protection level;
- malformed or noncanonical base64 signature material;
- a signature that is not exactly 64 bytes; or
- a returned signature CRC32C mismatch.

The resulting 64-byte Ed25519 signature is converted to base64url for the existing trusted-receipt contract. The issuer then performs its existing public-key self-verification before returning a receipt.

## Metadata identity boundary

The default access-token provider is fixed to:

```text
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token
```

and requires the Google metadata response binding. Tokens are construction/runtime material only and are never returned as part of a receipt or stored in public artifacts.

Tests use injected token and HTTP doubles. Repository CI does not require Google credentials and does not perform billable Cloud KMS operations.

## Validation

Run:

```bash
npm run validate:google-cloud-kms-signer
npm run test:trusted-receipt-issuer
npm run check:public-safety
npm run validate
```

The dedicated validation confirms that the pre-provisioned public key policy conforms to the exact versioned schema, parses as Ed25519 SPKI material, preserves the expected bounded authorization window and does not change the canonical production/admission gates.

## Activation boundary

This adapter and public policy are necessary but not sufficient for production receipt issuance.

Before `trusted_receipt_issuance` can become `true`, a separate deployment gate must establish and verify at minimum:

- a private Google-managed runtime using the intended service identity;
- exact binding to CryptoKeyVersion `1`;
- a policy-validated trusted issuance clock that is not request-controlled;
- protected assembly of the implemented primary-source and ENS verifiers, key policy, trusted policy identity, signer and clock;
- an end-to-end real receipt test whose final Ed25519 signature verifies independently against the public key policy; and
- operational key rotation/revocation procedure.

Candidate admission remains a later and separate gate. This adapter does not mutate the registry, infer ENS ownership or create commercial authority.
