# Developer quickstart

## Goal

Get a useful, machine-readable Vortik result from the public registry in under 30 seconds without cloning the repository, installing dependencies, configuring a wallet, or supplying RPC credentials.

Vortik's public feed endpoints are read-only semantic artifacts. They do not grant Ethereum protocol authority, ENS authority, ownership claims, candidate admission, registry mutation, or commercial authority.

## One-command first value

Fetch the implementation-facing ePBS semantic feed directly from GitHub Pages:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/feeds/epbs.json
```

The response is JSON. Useful fields include:

```text
feed                         vortik-anchor-feed
feed_version                 1.0.1
anchor.id                    epbs
anchor.ens                   epbs.eth
anchor.canonical_term        enshrined proposer-builder separation (ePBS)
anchor.status                implementation-facing
authority.protocol_authority false
authority.ens_authority      false
```

This is the shortest supported path from zero context to a real public Vortik artifact.

## Discover available feeds

Fetch the public feed index:

```bash
curl -fsSL https://vortikregistry.github.io/vortik-open-schema/feeds/index.json
```

The index advertises each feed's canonical public URL and versioned contract URL. Consumers should discover feeds from this index rather than constructing arbitrary URLs.

Current index contract:

```text
index         vortik-feed-index
index_version 1.0.0
```

## Zero-dependency JavaScript

Modern Node.js and browsers can consume the same public artifacts without an SDK:

```js
const indexUrl = "https://vortikregistry.github.io/vortik-open-schema/feeds/index.json";
const index = await fetch(indexUrl).then((response) => {
  if (!response.ok) throw new Error(`Vortik index HTTP ${response.status}`);
  return response.json();
});

const epbsEntry = index.feeds.find((entry) => entry.id === "epbs");
if (!epbsEntry) throw new Error("ePBS feed not advertised");

const feed = await fetch(epbsEntry.public_url).then((response) => {
  if (!response.ok) throw new Error(`Vortik feed HTTP ${response.status}`);
  return response.json();
});

console.log({
  anchor: feed.anchor.id,
  canonical_term: feed.anchor.canonical_term,
  status: feed.anchor.status,
  protocol_authority: feed.authority.protocol_authority
});
```

No package install is required for this public read path.

## Repository-backed client

For consumers that clone the repository and want stricter local validation, Vortik also includes a bounded feed client and deterministic examples:

```bash
npm install
npm run example:discover-feeds
npm run example:consume-feed
```

The client validates feed/index structure, supported versions, HTTPS origin restrictions, registry metadata, feed metadata, and authority boundaries.

## Stability and authority boundary

The public quickstart is intentionally consumption-only.

- `feeds/index.json` and `feeds/epbs.json` are generated repository artifacts.
- GitHub Pages deployment verifies that the published copies are byte-identical to the committed `docs/` artifacts.
- Schema and feed versions are explicit and machine-readable.
- `protocol_authority` and `ens_authority` remain `false`.
- Trusted verification, receipt issuance, candidate admission and registry mutation are separate trust boundaries.

If a consumer needs protocol truth, it must follow the cited Ethereum primary sources rather than treating the Vortik feed as an official specification.
