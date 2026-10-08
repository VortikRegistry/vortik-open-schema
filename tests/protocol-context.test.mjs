import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertProtocolContext, getAnchorContext, readProtocolContext } from "../lib/protocol-context.mjs";

const registry = JSON.parse(await readFile(new URL("../registry.json", import.meta.url), "utf8"));
const snapshot = await readProtocolContext();
const mutate = (change) => {
  const data = structuredClone(snapshot);
  change(data);
  return data;
};

test("source review covers the canonical registry without replacing its date or labels", () => {
  assert.deepEqual(snapshot.anchors.map((entry) => entry.id).sort(), registry.anchors.map((entry) => entry.id).sort());
  assert.equal(snapshot.registry.last_updated, registry.last_updated);
  assert.notEqual(snapshot.reviewed_at, snapshot.registry.last_updated);
  assert.equal("classification" in snapshot.anchors[0], false);
});

test("reviewed EIP status and fork assignment retain distinct meanings", () => {
  const records = new Map(snapshot.eips.map((entry) => [entry.number, entry]));
  for (const [number, status, fork, assignment] of [
    [7732, "Last Call", "Glamsterdam", "scheduled"],
    [7805, "Draft", "Hegotá", "scheduled"],
    [7928, "Last Call", "Glamsterdam", "scheduled"],
    [8025, "Draft", "Hegotá", "proposed"],
    [8146, "Draft", "Hegotá", "declined"],
    [8282, "Last Call", "Glamsterdam", "scheduled"]
  ]) {
    assert.equal(records.get(number).document_status, status);
    assert.equal(records.get(number).fork.name, fork);
    assert.equal(records.get(number).fork.assignment, assignment);
  }
});

test("an elapsed Sepolia schedule is unverified without activation evidence", () => {
  const fork = snapshot.forks.find((entry) => entry.name === "Glamsterdam");
  assert.deepEqual(fork.activations.find((entry) => entry.network === "Sepolia"), {
    network: "Sepolia", status: "unverified", activation_at: null, epoch: null, slot: null
  });
  const mainnet = fork.activations.find((entry) => entry.network === "Mainnet");
  assert.equal(mainnet.status, "not_scheduled");
  assert.equal(mainnet.activation_at, null);
});

test("unreviewed historical fork context stays null instead of becoming not deployed", () => {
  const fee = snapshot.eips.find((entry) => entry.number === 1559);
  assert.equal(fee.document_status, "Final");
  assert.equal(fee.fork, null);
  assert.deepEqual(getAnchorContext(snapshot, "blockspacemarket").related_forks, []);
});

test("research concepts and related EIPs do not acquire an anchor activation state", () => {
  const research = getAnchorContext(snapshot, "fastfinality.eth");
  assert.equal(research.anchor.id, "ssf");
  assert.equal(research.anchor.context_kind, "research");
  assert.deepEqual(research.related_eips, []);
  const proof = getAnchorContext(snapshot, "provingmarket");
  assert.equal(proof.related_eips[0].fork.assignment, "proposed");
  assert.equal("status" in proof.anchor, false);
  assert.equal("activation_at" in proof.anchor, false);
});

test("unknown status or a field conflating canonical status with source context is rejected", () => {
  assert.throws(() => assertProtocolContext(mutate((data) => { data.eips[0].document_status = "scheduled"; }), registry), /contract/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.anchors[0].status = "active"; }), registry), /contract/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.forks[0].activations[0].status = "ready"; }), registry), /contract/);
});

test("missing references and duplicate identities fail instead of silently reducing coverage", () => {
  assert.throws(() => assertProtocolContext(mutate((data) => { data.anchors.pop(); }), registry), /every canonical anchor/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.anchors[0].eip_refs.push(999999); }), registry), /missing EIP/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.sources.push({ ...data.sources[0] }); }), registry), /duplicate source/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.eips[1].fork.source_ref = "eip-1559"; }), registry), /assignment source/);
});

test("registry identity and separate review dates cannot silently drift", () => {
  assert.throws(() => assertProtocolContext(mutate((data) => { data.anchors[0].ens = "unrelated.eth"; }), registry), /anchor identity/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.registry.last_updated = data.reviewed_at; }), registry), /differs from canonical/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.reviewed_at = "2026-01-01"; }), registry), /predates its referenced registry/);
});

test("primary source links reject alternate origins, embedded credentials and local traversal", () => {
  for (const url of [
    "http://eips.ethereum.org/EIPS/eip-1559",
    "https://eips.ethereum.org.attacker.example/EIPS/eip-1559",
    "https://eips.ethereum.org@attacker.example/EIPS/eip-1559",
    "https://user:pass@eips.ethereum.org/EIPS/eip-1559",
    "https://localhost/EIPS/eip-1559"
  ]) {
    assert.throws(() => assertProtocolContext(mutate((data) => { data.sources[0].url = url; }), registry), /Protocol context/);
  }
  assert.throws(() => assertProtocolContext(mutate((data) => { data.review_path = "research/../private.md"; }), registry), /unsafe local path/);
});

test("a genuine primary source for the wrong EIP is insufficient", () => {
  assert.throws(() => assertProtocolContext(mutate((data) => { data.eips[0].source_ref = "eip-7732"; }), registry), /exact EIP/);
});

test("activation requires a date while unknown and unscheduled states require explicit nulls", () => {
  const scheduled = (change) => mutate((data) => {
    data.reviewed_at = "2026-09-30";
    Object.assign(data.forks[0].activations[0], {
      status: "scheduled", activation_at: "2026-10-06T13:53:36Z", epoch: 353024, slot: 11296768
    });
    change(data);
  });
  assert.throws(() => assertProtocolContext(scheduled((data) => { data.forks[0].activations[0].activation_at = null; }), registry), /contract/);
  assert.throws(() => assertProtocolContext(mutate((data) => { data.forks[0].activations[1].activation_at = "2026-10-06T13:53:36Z"; }), registry), /contract/);
  assert.throws(() => assertProtocolContext(mutate((data) => { delete data.forks[0].activations[1].activation_at; }), registry), /contract/);
  assert.throws(() => assertProtocolContext(scheduled((data) => { data.forks[0].activations[0].status = "active"; }), registry), /future activation cannot be active/);
  assert.throws(() => assertProtocolContext(scheduled((data) => { data.reviewed_at = "2026-10-08"; }), registry), /scheduled date predates review/);
  assert.throws(() => assertProtocolContext(scheduled((data) => { data.forks[0].activations[0].slot += 1; }), registry), /epoch and slot/);
  const unknown = mutate((data) => { data.forks[0].activations[1].status = "unverified"; });
  assert.doesNotThrow(() => assertProtocolContext(unknown, registry));
});

test("local query returns an isolated result and rejects unknown anchors", () => {
  const result = getAnchorContext(snapshot, "epbs.eth");
  assert.equal(result.sources.some((entry) => entry.id === "glamsterdam-activation"), true);
  result.related_eips[0].document_status = "Final";
  assert.equal(snapshot.eips.find((entry) => entry.number === 7732).document_status, "Last Call");
  assert.throws(() => getAnchorContext(snapshot, "unknown"), /Unknown context anchor/);
});
