---
title: Discover Vortik feeds from an agent
---

# Discover Vortik feeds from an agent

Vortik publishes a versioned discovery index so consumers do not need to know individual feed paths in advance.

## Public index

```text
https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

The current index contract is `vortik-feed-index` version `1.0.0`.

## Discovery flow

An agent or application should:

1. fetch the index;
2. confirm `index` and `index_version`;
3. reject unsafe authority claims;
4. select a feed by anchor `id`;
5. fetch the advertised `public_url`;
6. verify that feed identity, version and schema match the index entry;
7. use official Ethereum sources for protocol rules and activation state.

## Minimal JavaScript discovery

```js
const indexUrl = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
const index = await fetch(indexUrl).then((response) => {
  if (!response.ok) throw new Error(`Index request failed: ${response.status}`);
  return response.json();
});

if (index.index !== "vortik-feed-index" || index.index_version !== "1.0.0") {
  throw new Error("Unsupported Vortik feed index");
}

const entry = index.feeds.find((candidate) => candidate.id === "epbs");
if (!entry) throw new Error("ePBS feed is not indexed");

const feed = await fetch(entry.public_url).then((response) => {
  if (!response.ok) throw new Error(`Feed request failed: ${response.status}`);
  return response.json();
});

if (feed.anchor.id !== entry.id || feed.$schema !== entry.contract.id) {
  throw new Error("Discovered feed does not match the index entry");
}
```

## Executable adapter

The repository includes `examples/discover-feeds.mjs`.

Run deterministically against committed local artifacts:

```bash
npm run example:discover-feeds
```

Run against the public index and public feed:

```bash
VORTIK_FEED_INDEX_SOURCE=https://vortikregistry.github.io/vortik-open-schema/feeds/index.json npm run example:discover-feeds
```

Select another indexed anchor when more feeds exist:

```bash
VORTIK_ANCHOR_ID=example npm run example:discover-feeds
```

Required CI uses local artifacts so validation does not depend on network availability or GitHub Pages deployment timing.

## Scope and authority

The index and feeds are Vortik semantic artifacts. They do not define Ethereum protocol rules, claim Ethereum Foundation authority, establish ENS authority, or prove that a proposal is active on mainnet.
