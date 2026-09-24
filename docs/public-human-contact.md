# Buyer-initiated human contact

## Selected destination

**X · @VortikRegistry** — https://x.com/VortikRegistry

This is the owner-selected human commercial contact destination. It is not an X API integration, automated message sender, authenticated inbox, or proof that a buyer has contacted the owner. The link points to the fixed public profile, not to an invented direct-message recipient ID or a prefilled offer.

## Reception behavior

When the existing router classifies a request as `commercial_interest`, the response offers this optional external contact path:

- Text output includes the fixed profile URL and the buyer-initiated contact notice.
- JSON output adds a `human-contact` entry to the existing `links` array and includes the same notice in `summary`; the top-level response contract is unchanged.
- The buyer chooses whether to initiate a separate human conversation. No message or owner notification is sent by the beacon, and no reply is guaranteed.
- Ambiguous commercial requests still receive the contact path without upgrading their signal confidence or asserting an identified asset.
- Noncommercial research, technical discovery and contribution routes remain unchanged.

The notice does not confirm availability, price, terms, ownership or a sale. Final commercial decisions remain exclusively subject to the owner's approval. A proposed price does not cause automatic acceptance, rejection or a counteroffer. Do not publish confidential offers, private negotiations or buyer contact details in public posts or repository issues.

## Privacy and network boundary

The destination is a reviewed literal, not caller configuration. Request metadata cannot replace it. The profile URL has no query string, caller text, price, buyer identity or correlation token.

The `publicSignal` object is unchanged and continues to declare `privateHandoff: false`. Buyer identities, reply addresses, offer text and commercial terms are not added to the sanitized signal. The contact link is response presentation only; it does not create a public-to-private transport channel or an outbound request.

The beacon keeps its existing read-only authority flags, no external retrieval, no persistent tasks and no push-notification capability. No credential, X API client, scheduler, new cloud resource, listing, signature or ENS transfer is introduced.

## Operational status and activation gate

Repository implementation and passing tests do not establish live deployment, successful delivery, owner notification or actual buyer follow-up. The selected X account's contact availability, message-request settings and notifications must be checked separately before claiming the end-to-end human channel is operational. A profile link alone is not proof of an open inbox.

A human-channel acceptance check consists of confirming the correct profile, verifying a permitted contact route using an owner-approved test, and confirming that the owner can see and respond to that test. A test message must not be sent merely because this code or document exists. Until that check occurs, delivery and response readiness remain unverified.

Runtime publication remains a separate authorization and deployment gate. This change must not activate private signal transport or relax the existing deny-egress boundary.

## Tests

`npm run test:public-a2a-beacon` includes `tests/public-human-contact.test.mjs` and is already part of the repository's full validation chain. The focused tests cover text/JSON parity, unchanged sanitized fields, no price-based exclusion, ambiguous interest, noncommercial isolation, destination injection, caller URL rejection, mutation isolation and absence of fetch calls.
