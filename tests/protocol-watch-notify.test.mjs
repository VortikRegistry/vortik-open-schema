import assert from "node:assert/strict";
import test from "node:test";
import { notifyProtocolWatch } from "../scripts/protocol-watch-notify.mjs";

const repository = "VortikRegistry/vortik-open-schema";
const title = "Protocol watch alert — upstream change detected";
const issue = (number, login = "github-actions", is_bot = true) => ({ number, title, author: { login, is_bot } });

function fixture(inventory, creation = `https://github.com/${repository}/issues/143\n`) {
  const calls = [];
  const runGh = (args) => {
    calls.push(args);
    return args[1] === "list" ? JSON.stringify(inventory) : creation;
  };
  return { calls, runGh };
}

test("delivery creates one evidence issue in the canonical repository", () => {
  const f = fixture([]);
  assert.deepEqual(notifyProtocolWatch({ repository, runGh: f.runGh }), {
    delivery: "created", issue_number: 143, issue_url: `https://github.com/${repository}/issues/143`
  });
  assert.deepEqual(f.calls[1], ["issue", "create", "--repo", repository, "--title", title, "--body-file", "protocol-watch/report.md"]);
  assert.equal(f.calls.length, 2);
});

test("a previously delivered bot alert suppresses another creation", () => {
  for (const login of ["github-actions", "github-actions[bot]", "app/github-actions"]) {
    const f = fixture([issue(144, login)]);
    assert.equal(notifyProtocolWatch({ repository, runGh: f.runGh }).delivery, "existing");
    assert.equal(f.calls.length, 1);
  }
});

test("an owner-created evidence alert also suppresses another creation", () => {
  const f = fixture([issue(144, "VortikRegistry", false)]);
  assert.equal(notifyProtocolWatch({ repository, runGh: f.runGh }).issue_number, 144);
  assert.equal(f.calls.length, 1);
});

test("an unrelated author or prefix title cannot suppress a genuine alert", () => {
  const f = fixture([issue(144, "unrelated-user", false), { ...issue(145), title: `${title} forged suffix` }]);
  assert.equal(notifyProtocolWatch({ repository, runGh: f.runGh }).delivery, "created");
});

test("inventory errors or malformed records stop before creating an issue", () => {
  for (const result of ["not-json", "{}", JSON.stringify([{ number: 1, title }]), JSON.stringify([{ number: 0, title, author: null }])]) {
    const calls = [];
    assert.throws(() => notifyProtocolWatch({ repository, runGh: (args) => { calls.push(args); return result; } }), /inventory/);
    assert.equal(calls.length, 1);
  }
  assert.throws(() => notifyProtocolWatch({ repository, runGh: () => { throw new Error("provider error"); } }), /inventory failed/);
});

test("a saturated inventory does not turn an incomplete scan into absence", () => {
  const inventory = Array.from({ length: 1000 }, (_, i) => ({ number: i + 1, title: "unrelated", author: null }));
  const f = fixture(inventory);
  assert.throws(() => notifyProtocolWatch({ repository, runGh: f.runGh }), /reached its limit/);
  assert.equal(f.calls.length, 1);
  inventory[999] = issue(1000);
  assert.equal(notifyProtocolWatch({ repository, runGh: f.runGh }).delivery, "existing");
});

test("a different repository stops before any GitHub operation", () => {
  let calls = 0;
  assert.throws(() => notifyProtocolWatch({ repository: "another/project", runGh: () => { calls++; } }), /canonical repository/);
  assert.equal(calls, 0);
});

test("creation failure does not retry or expose the provider error", () => {
  const calls = [];
  assert.throws(() => notifyProtocolWatch({ repository, runGh: (args) => {
    calls.push(args);
    if (args[1] === "list") return "[]";
    throw new Error("sensitive-provider-detail");
  } }), /^Error: Protocol watch alert creation failed; check existing alerts before retrying$/);
  assert.equal(calls.length, 2);
});

test("an unexpected creation URL cannot be reported as verified delivery", () => {
  for (const url of ["https://example.com/issues/143", "https://github.com/another/project/issues/143", `https://github.com/${repository}/issues/143?redirect=1`]) {
    const f = fixture([], url);
    assert.throws(() => notifyProtocolWatch({ repository, runGh: f.runGh }), /response was not verified/);
    assert.equal(f.calls.length, 2);
  }
});
