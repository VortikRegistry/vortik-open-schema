# Traffic measurement and evidence limits

Prepared 2026-10-08. Website analytics is **disabled**: `SITE_TOKEN` is empty in `assets/site-analytics.js`. The loader makes no analytics request in this state. Historical page views cannot be reconstructed by adding a collector later.

## Three different signals

| Surface | Measurement | Limit |
| --- | --- | --- |
| GitHub Pages website | Optional Cloudflare Web Analytics on home, proposal search and curated explorer | Only after activation; measured page loads are not verified people |
| A2A Reception | Existing Cloud Run request logs and sanitized Reception events | Includes automation, tests and retries; requests and events must not be added together |
| Human contact | Voluntary visit to the maintainer's X profile | A link click does not prove a message, response or completed conversation |

GitHub repository traffic is separate from GitHub Pages traffic. No website counter is inferred from repository views, CI runs or functional tests.

## Optional website collector

Cloudflare documents Web Analytics as free and usable without moving DNS or proxying the site. It requires a maintainer-controlled Cloudflare account and the site's public ingestion token. No Cloud Run service, database or scheduled task is required for this integration.

The loader is restricted to the production origin and four explicit paths. It honors browser Do Not Track and Global Privacy Control, and skips pages opened with `analytics=off`. That URL option applies only to the current page; it is not a persistent browser preference. Local previews and other hosts cannot load the collector. The loader installs at most one provider script and uses `spa: false`, so search/filter history changes are not deliberately recorded as additional navigations. No custom search, contact-click or message events are sent by Vortik.

Cloudflare states that its beacon does not use cookies or browser storage, and that query strings are not logged. Its RUM processing receives the network source address and discards it at the edge; this is not a claim that there is no third-party data processing. Page and performance data go to Cloudflare after activation. Ad blockers, opted-out browsers, sampling and failed delivery can affect totals. Its visits metric is not an exact count of distinct humans.

## Activation and acceptance

1. In the maintainer's Cloudflare account, add the hostname `vortikregistry.github.io` under **Web Analytics** using manual installation. No DNS migration is needed. Use the public token from that site's snippet, never an account API token.
2. Set `SITE_TOKEN` in `docs/assets/site-analytics.js`. The loader limits collection to this repository's supported pages, even though the provider is registered for the hostname.
3. Update this status and `system-status.md` to distinguish configured, published and dashboard-verified states. Run `npm run check:public-safety` and `npm run validate`, then follow repository review and publication approval.
4. Check one controlled page load on the published site and confirm it in the account dashboard. Record the UTC time and test page privately. An HTTP success or script tag alone does not prove data acceptance. Check navigation/search with a blocked collector as well.
5. For later checks, enable browser Do Not Track or use `analytics=off` on each page. Keep known test intervals separate; do not claim that all remaining activity is human.

Disable by clearing `SITE_TOKEN`, publishing the change and checking that a fresh page loads no provider script. Already-open pages may retain the script until navigation/reload. Previously collected provider data is separate from disabling new collection.

## Read existing Reception logs

The repository includes a read-only helper:

```bash
node ops/read-reception-activity.mjs 2026-10-01T00:00:00Z 2026-10-08T03:37:44Z
```

Run from an authorized environment with Node.js and an existing `gcloud` session. Choose explicit UTC bounds, no more than 31 days. This script only invokes `gcloud logging read` for the existing project/service/region. It does not enable APIs, change configuration, contact the runtime, or generate test events. It returns aggregate counts; raw request URLs, IP addresses, caller text and identifiers are not printed or saved. Keep operational results outside this public repository.

The query requests at most 10,001 records and processes at most 10,000. If the extra record is present, the result explicitly says `INCOMPLETE_LIMIT_REACHED`; narrow the interval. `RETURNED_LOGS_ONLY` is not a completeness attestation: retention, exclusions and scope can hide historical activity. Authentication failure is an error, never a zero count. Reception event IDs deduplicate repeated log entries; they do not identify distinct visitors. HTTP counts include non-Reception requests and are displayed separately.

The event contract marks visitor identity as unverified and has no trusted synthetic-event flag. Known tests require private reconciliation. Unknown records must not automatically be described as external people or genuine interest.

## Primary references

- [Cloudflare Web Analytics overview and cost model](https://developers.cloudflare.com/web-analytics/about/)
- [Manual installation](https://developers.cloudflare.com/web-analytics/get-started/)
- [Disable SPA measurement](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/)
- [Collection, storage and network data](https://developers.cloudflare.com/speed/observatory/rum-beacon/)
- [Query strings, sampling and delivery limits](https://developers.cloudflare.com/web-analytics/faq/)
- [Cloud Logging read command](https://docs.cloud.google.com/sdk/gcloud/reference/logging/read)
- [Google Cloud Observability charges](https://cloud.google.com/logging): existing Logging queries have no additional charge; retained infrastructure remains a separate concern.
