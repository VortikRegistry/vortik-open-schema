import assert from "node:assert/strict";
import test from "node:test";

import {
  getFeed,
  listFeeds,
  verifyFeed
} from "../lib/feed-client.mjs";

function clone(value) {
  return structuredClone(value);
}

test("listFeeds returns the generated ePBS index entry", async () => {
  const feeds = await listFeeds();

  assert.equal(feeds.length, 1);
  assert.equal(feeds[0].id, "epbs");
  assert.equal(feeds[0].feed_version, "1.0.1");
});

test("getFeed resolves and verifies ePBS from local artifacts", async () => {
  const result = await getFeed("epbs");

  assert.equal(result.entry.id, "epbs");
  assert.equal(result.feed.anchor.id, "epbs");
  assert.equal(result.feed.instance.id, "epbs");
  assert.equal(result.feed.authority.protocol_authority, false);
});

test("getFeed rejects an unindexed anchor", async () => {
  await assert.rejects(
    () => getFeed("unknown-anchor"),
    /No public Vortik feed is indexed/
  );
});

test("verifyFeed rejects anchor identity mismatch", async () => {
  const { entry, feed } = await getFeed("epbs");
  const mutated = clone(feed);
  mutated.anchor.id = "ssf";

  assert.throws(
    () => verifyFeed(entry, mutated),
    /identity does not match/
  );
});

test("verifyFeed rejects contract version mismatch", async () => {
  const { entry, feed } = await getFeed("epbs");
  const mutated = clone(feed);
  mutated.feed_version = "9.9.9";

  assert.throws(
    () => verifyFeed(entry, mutated),
    /contract metadata does not match/
  );
});

test("verifyFeed rejects unsafe authority claims", async () => {
  const { entry, feed } = await getFeed("epbs");
  const mutated = clone(feed);
  mutated.authority.protocol_authority = true;

  assert.throws(
    () => verifyFeed(entry, mutated),
    /authority boundaries are missing or unsafe/
  );
});

test("HTTP discovery uses injected fetch and the indexed public URL", async () => {
  const local = await getFeed("epbs");
  const indexUrl = "https://example.test/feeds/index.json";
  const feedUrl = local.entry.public_url;
  const calls = [];

  const fetchImpl = async (url) => {
    calls.push(url);
    const body = url === indexUrl
      ? {
          index: "vortik-feed-index",
          index_version: "1.0.0",
          feeds: [local.entry],
          authority: {
            protocol_authority: false,
            ens_authority: false
          }
        }
      : local.feed;

    return {
      ok: true,
      status: 200,
      async json() {
        return clone(body);
      }
    };
  };

  const result = await getFeed("epbs", {
    indexSource: indexUrl,
    fetchImpl
  });

  assert.deepEqual(calls, [indexUrl, feedUrl]);
  assert.equal(result.feed.anchor.id, "epbs");
});
