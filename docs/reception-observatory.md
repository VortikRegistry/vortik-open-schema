# Vortik Reception Observatory

Status: implemented bounded observability layer for the public A2A Reception beacon.

The Observatory records **sanitized structured events** for successful Reception classifications. It is designed to answer operational questions such as:

- how many A2A interactions occurred;
- which bounded intent class was recognized;
- which ENS identifier was the subject when the public router already permits that identifier in the response;
- whether an interaction was classified as a high-priority signal;
- whether the same opaque message/context identifiers recur, using one-way digests rather than raw IDs.

The Observatory MUST NOT record raw caller text, prompts, arbitrary metadata, IP addresses, authentication material, headers, financial terms, proposal contents or private identity data.

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

High priority currently means explicit `commercial_interest` or a bounded explicit `business_proposal`. Additional intent classes must be introduced through reviewed, closed classifier changes rather than inferred by the logger.

## Storage and notification model

The Cloud Run service emits one-line JSON events to stdout. Cloud Run / Cloud Logging supplies infrastructure retention and queryability without adding a new database or expanding public-beacon egress.

For a recognized, unambiguous `commercial_interest`, the same stdout-only path may also emit `vortik_sanitized_commercial_signal_log/1.0.0`. That event wraps exactly the closed ten-field public/private signal contract. It contains no raw caller text, contact data, price, buyer identity, wallet, prompt or conversation material. Emission to stdout is not a private handoff: no Logging sink, Pub/Sub topic, private consumer, signing identity or private boundary is created or enabled by this repository change.

A production alert SHOULD match only high-priority events, for example:

- `jsonPayload.schema="vortik_reception_observation/1.0.0"`
- `jsonPayload.priority="high"`

The notification channel belongs to the private operations layer. It MUST NOT require outbound credentials inside the public beacon.

## Public/private boundary

This observability layer does not activate runtime transport, does not perform a direct private handoff, does not alter `privateHandoff: false`, and does not initiate external contact. It records minimized operational events only. Any future platform-mediated routing remains a separately authorized Production gate.
