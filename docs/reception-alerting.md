# Vortik Reception Alerting

High-priority Reception events are operational alerts, not autonomous commercial actions.

Current high-priority intents:

- `commercial_interest`: explicit purchase/acquisition/offer language recognized by the public Reception router;
- `business_proposal`: explicit proposal/partnership/business-deal language recognized by the public Reception router.

A high-priority event MUST remain sanitized. It may identify the normalized ENS subject when the public router already exposes it, but it must not contain raw caller text, offer values, contact details, IP addresses, arbitrary headers, credentials, or private buyer intelligence.

## Notification boundary

The public beacon emits structured high-priority events to Cloud Logging through stdout. Notification delivery is an operations concern and should be configured using a private Cloud Monitoring / Logging alert policy that matches:

```text
jsonPayload.schema="vortik_reception_observation/1.0.0"
jsonPayload.priority="high"
```

The alert destination must be owned and configured outside the public repository. The public beacon must not contain email addresses, webhooks, bot tokens, API keys, or private notification endpoints.

A notification should contain only:

- timestamp;
- event ID;
- intent (`commercial_interest` or `business_proposal`);
- normalized ENS identifier if present;
- confidence;
- link/instruction to inspect the corresponding Cloud Logging event under authorized access.

No notification may itself authorize negotiation, pricing, outreach, listing, acceptance, transfer, or sale.
