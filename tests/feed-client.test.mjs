import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  getFeed,
  listFeeds,
  verifyFeed
} from "../lib/feed-client.mjs";

function clone(value) {
  return structuredClone(value);
}

function makeIndex(entry, authority = {
  registry_scope: "independent semantic registry",
  protocol_authority: false,
  ens_authority: false,
  note: "Independent semantic data."
}) {
  return {
    $schema: "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/feeds/vortik-feed-index/1.0.0/schema.json",
    index: "vortik-feed-index",
    index_version: "1.0.0",
    registry: {
      name: "vortik-semantic-registry",
      version: "0.6.5",
      last_updated: "2026-07-25",
      source_of_truth: "schemas"
    },
    feeds: [entry],
    authority,
    generated_from: ["schema.json", "feed.json"]
  };
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

test("verifyFeed rejects an authority-claiming registry scope", async () => {
  const { entry, feed } = await getFeed("epbs");
  const mutated = clone(feed);
  mutated.authority.registry_scope = "official Ethereum registry";

  assert.throws(
    () => verifyFeed(entry, mutated),
    /authority boundaries are missing or unsafe/
  );
});

test("verifyFeed rejects each duplicated semantic metadata mismatch", async () => {
  const { entry, feed } = await getFeed("epbs");

  for (const field of ["canonical_term", "classification", "status", "anchor_doc"]) {
    const mutated = clone(feed);
    mutated.anchor[field] = `mismatched-${field}`;

    assert.throws(
      () => verifyFeed(entry, mutated),
      new RegExp(`semantic metadata does not match.*${field}`)
    );
  }
});

test("local discovery resolves a feed relative to the selected index mirror", async () => {
  const local = await getFeed("epbs");
  const mirrorRoot = await mkdtemp(join(tmpdir(), "vortik-feed-client-"));
  const mirrorFeeds = join(mirrorRoot, "feeds");

  try {
    await mkdir(mirrorFeeds, { recursive: true });
    const mirroredFeed = clone(local.feed);
    mirroredFeed.instance.summary = "Mirror-specific fixture";
    await writeFile(join(mirrorFeeds, "index.json"), JSON.stringify(makeIndex(local.entry)), "utf8");
    await writeFile(join(mirrorFeeds, "epbs.json"), JSON.stringify(mirroredFeed), "utf8");

    const result = await getFeed("epbs", {
      indexSource: join(mirrorFeeds, "index.json")
    });

    assert.equal(result.feed.instance.summary, "Mirror-specific fixture");
    assert.equal(result.feedSource, join(mirrorFeeds, "epbs.json"));
  } finally {
    await rm(mirrorRoot, { recursive: true, force: true });
  }
});

test("HTTP discovery rejects an authority-claiming index scope", async () => {
  const local = await getFeed("epbs");
  const indexUrl = "https://example.test/feeds/index.json";
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    async json() {
      return makeIndex(local.entry, {
        registry_scope: "official Ethereum registry",
        protocol_authority: false,
        ens_authority: false,
        note: "Unsafe authority fixture."
      });
    }
  });

  await assert.rejects(
    () => listFeeds({ indexSource: indexUrl, fetchImpl }),
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
      ? makeIndex(local.entry)
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
