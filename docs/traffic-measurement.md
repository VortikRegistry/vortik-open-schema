# Traffic measurement and evidence limits

Prepared 2026-10-08; configuration updated **2026-10-17 UTC**. Website analytics is **configured** with the maintainer-supplied public Web Analytics site token in `assets/site-analytics.js`. Publishing this configuration enables collection on the supported production pages, subject to the opt-outs below. Publication evidence comes from the Pages workflow's deployed-byte verification; **provider dashboard verification remains pending**. No accepted page views or visitor counts are asserted here. Historical page views cannot be reconstructed by adding a collector later.

## Three different signals

| Surface | Measurement | Limit |
| --- | --- | --- |
| GitHub Pages website | Configured Cloudflare Web Analytics on home, proposal search and curated explorer | Provider dashboard verification pending; measured page loads are not verified people |
| A2A Reception | Existing Cloud Run request logs and sanitized Reception events | Includes automation, tests and retries; requests and events must not be added together |
| Human contact | Voluntary visit to the maintainer's X profile | A link click does not prove a message, response or completed conversation |

GitHub repository traffic is separate from GitHub Pages traffic. No website counter is inferred from repository views, CI runs or functional tests.

## Optional website collector

Cloudflare documents Web Analytics as free and usable without moving DNS or proxying the site. It requires a maintainer-controlled Cloudflare account and the site's public ingestion token. No Cloud Run service, database or scheduled task is required for this integration.

The loader is restricted to the production origin and four explicit paths. It honors browser Do Not Track and Global Privacy Control, and skips pages opened with `analytics=off`. That URL option applies only to the current page; it is not a persistent browser preference. Local previews and other hosts cannot load the collector. The loader installs at most one provider script and uses `spa: false`, so search/filter history changes are not deliberately recorded as additional navigations. No custom search, contact-click or message events are sent by Vortik.

Cloudflare states that its beacon does not use cookies or browser storage, and that query strings are not logged. Its RUM processing receives the network source address and discards it at the edge; this is not a claim that there is no third-party data processing. On eligible production page loads, page and performance data are sent to Cloudflare. Ad blockers, opted-out browsers, sampling and failed delivery can affect totals. Its visits metric is not an exact count of distinct humans.

## Configuration and acceptance

1. **Provider registration:** the maintainer registered `vortikregistry.github.io` under **Web Analytics** for manual installation and supplied its public JavaScript snippet. No DNS migration or account API credential is involved.
2. **Source configuration:** `SITE_TOKEN` is set in `docs/assets/site-analytics.js`. The loader limits collection to this repository's supported pages, even though the provider is registered for the hostname.
3. **Publication evidence:** run `npm run check:public-safety` and `npm run validate`, then follow repository review and publication approval. The Pages workflow compares the served adapter with the reviewed artifact. A configured source file alone is not evidence of publication.
4. **Dashboard acceptance — pending:** check one controlled page load on the published site and confirm it in the account dashboard. Record the UTC time and test page privately. An HTTP success or script tag alone does not prove data acceptance. Check navigation/search with an opted-out or blocked collector as well.
5. For later checks, enable browser Do Not Track or use `analytics=off` on each page. Keep known test intervals separate; do not claim that all remaining activity is human.

Disable by clearing `SITE_TOKEN`, updating the checked-in configuration test and status to expect disabled analytics, publishing the change and checking that a fresh page loads no provider script. The empty-token test already covers the loader's disabled behavior. Already-open pages may retain the script until navigation/reload. Previously collected provider data is separate from disabling new collection.

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
