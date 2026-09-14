# Vortik Reception Observatory

Status: proposed bounded observability layer for the public A2A Reception beacon.

The Observatory records **sanitized structured events** for successful Reception classifications. It is designed to answer operational questions such as:

- how many A2A interactions occurred;
- which bounded intent class was recognized;
- which ENS identifier was the subject when the public router already permits that identifier in the response;
- whether an interaction was classified as high-priority commercial interest;
- whether the same opaque message/context identifiers recur, using one-way digests rather than raw IDs.

The Observatory MUST NOT record raw caller text, prompts, arbitrary metadata, IP addresses, authentication material, headers, pricing, offer terms or private buyer data.

## Event contract

`vortik_reception_observation/1.0.0` contains:

- random `event_id`;
- `observed_at`;
- fixed public surface identifier;
- bounded Reception `intent`, `status`, `route`, and `confidence`;
- `priority` (`normal` or `high`);
- `commercial_signal` boolean;
- normalized ENS identifier when the existing public Reception result already exposes one;
- domain-separated SHA-256 digests of inbound message ID, context ID, and generated response message ID.

High priority currently means explicit `commercial_interest`. Business-proposal language that is not yet part of the closed Reception classifier must be added through a separate reviewed classifier change rather than inferred by the logger.

## Storage and notification model

The Cloud Run service emits one-line JSON events to stdout. Cloud Run / Cloud Logging supplies infrastructure retention and queryability without adding a new database or expanding public-beacon egress.

A production alert SHOULD match only high-priority events, for example:

- `jsonPayload.schema="vortik_reception_observation/1.0.0"`
- `jsonPayload.priority="high"`

The notification channel belongs to the private operations layer. It MUST NOT require outbound credentials inside the public beacon.

## Public/private boundary

This observability layer does not activate Block B, does not perform a private handoff, does not alter `privateHandoff: false`, and does not contact buyers. It records a minimized operational event only.
