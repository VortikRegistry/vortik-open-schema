---
title: Consume the public ePBS feed
---

# Consume the public ePBS feed

Vortik publishes a deterministic, versioned machine feed for the flagship ePBS anchor.

## Public endpoint

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json
```

The feed is mirrored from the repository source and validated byte-for-byte against it. The current feed declares contract version `1.0.1`.

## Contract

```text
https://vortikregistry.github.io/vortik-open-schema/schemas/feeds/vortik-anchor-feed/1.0.1/schema.json
```

Contract `1.0.1` binds the advertised anchor identity and schema metadata to the nested ePBS instance. It also requires explicit authority boundaries: the feed does not claim Ethereum protocol authority or ENS authority.

## Minimal JavaScript consumption

```js
const endpoint = "https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json";
const response = await fetch(endpoint, {
  headers: { accept: "application/json" }
});

if (!response.ok) {
  throw new Error(`Feed request failed: ${response.status}`);
}

const feed = await response.json();

if (feed.feed !== "vortik-anchor-feed" || feed.feed_version !== "1.0.1") {
  throw new Error("Unsupported Vortik feed contract");
}

if (feed.anchor.id !== "epbs" || feed.instance.id !== "epbs") {
  throw new Error("Unexpected anchor profile");
}

console.log({
  canonicalTerm: feed.anchor.canonical_term,
  status: feed.anchor.status,
  summary: feed.instance.summary,
  schema: feed.$schema
});
```

## Executable repository example

The repository includes `examples/consume-epbs-feed.mjs`.

Validate the consumer against the committed local feed:

```bash
npm run example:consume-feed
```

Run the same consumer against the public GitHub Pages endpoint:

```bash
VORTIK_EPBS_FEED_SOURCE=https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json npm run example:consume-feed
```

The local path is used in required CI so repository validation remains deterministic and does not depend on deployment timing or external network availability.

## Authority and scope

This feed is a Vortik semantic artifact. It is not an official Ethereum specification, an Ethereum Foundation namespace, an ENS authority claim, or evidence that ePBS is active on Ethereum mainnet.

For protocol rules and current specification state, consumers must use the official sources referenced by the feed and the ePBS anchor documentation.
