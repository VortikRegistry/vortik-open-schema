#!/usr/bin/env node
import {
  getFeed,
  PUBLIC_INDEX_URL
} from "../lib/feed-client.mjs";

const indexSource = process.env.VORTIK_FEED_INDEX_SOURCE;
const feedSource = process.env.VORTIK_FEED_SOURCE;
const requestedAnchor = process.env.VORTIK_ANCHOR_ID || "epbs";

const result = await getFeed(requestedAnchor, {
  ...(indexSource ? { indexSource } : {}),
  ...(feedSource ? { feedSource } : {})
});

console.log(JSON.stringify({
  index_source: result.indexSource,
  public_index: PUBLIC_INDEX_URL,
  requested_anchor: requestedAnchor,
  feed_source: result.feedSource,
  feed: result.entry.feed,
  feed_version: result.entry.feed_version,
  canonical_term: result.entry.canonical_term,
  status: result.entry.status,
  contract: result.entry.contract.id,
  protocol_authority: result.feed.authority.protocol_authority
}, null, 2));
