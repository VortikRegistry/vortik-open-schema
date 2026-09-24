import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/public-a2a-beacon.mjs";

const CONTACT = { rel: "human-contact", href: "https://x.com/VortikRegistry" };

function beacon() {
  let id = 0;
  return createPublicA2ABeacon({
    publicBaseUrl: "https://beacon.example.test",
    idFactory: () => `contact-test-${++id}`
  });
}

function request(text, mode = "application/json") {
  return {
    message: { messageId: "client-1", role: "ROLE_USER", parts: [{ text }] },
    configuration: { acceptedOutputModes: [mode] }
  };
}

function data(instance, text) {
  return instance.sendMessage(request(text)).message.parts[0].data;
}

function assertNotice(text) {
  assert.match(text, /initiate contact through X · @VortikRegistry/);
  assert.match(text, /sends no message or owner notification from the beacon/);
  assert.match(text, /does not guarantee a reply/);
  assert.match(text, /No availability, price, terms or sale is confirmed/);
  assert.match(text, /final commercial decisions require the owner's approval/);
  assert.match(text, /Do not post confidential offers publicly/);
}

test("commercial JSON adds only a fixed human-contact link outside the sanitized signal", () => {
  const result = data(beacon(), "interested in buying epbs.eth");
  assert.deepEqual(result.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
  assertNotice(result.summary);
  assert.deepEqual(result.publicSignal, {
    identifier: "epbs.eth",
    normalizedIntent: "commercial_interest",
    routingReason: "explicit_interest_language_with_single_ens_identifier",
    confidence: "high",
    privateHandoff: false
  });
  assert.equal(result.reception.route, "sanitized_signal_only");
  assert.equal(result.externalRetrieval, false);
  assert.equal(result.persistentTask, false);
  assert.deepEqual(result.authority, {
    protocolAuthority: false, ensAuthority: false, ownershipInference: false
  });
  assert.deepEqual(Object.keys(result).sort(), [
    "authority", "capabilityId", "externalRetrieval", "links", "persistentTask",
    "publicSignal", "reception", "summary", "tags", "title"
  ].sort());
});

test("commercial text contains the same buyer-initiated destination and limitations", () => {
  const result = beacon().sendMessage(request("buy epbs.eth", "text/plain"));
  const text = result.message.parts[0].text;
  assertNotice(text);
  assert.ok(text.includes(`Human contact (buyer-initiated): ${CONTACT.href}`));
  assert.match(text, /human authorization remains required/);
  assert.match(text, /No availability, price, negotiation, transfer or private routing is asserted/);
});

test("prices and private markers are neither echoed nor used to reject a contact", () => {
  const instance = beacon();
  for (const amount of ["1", "999999"]) {
    for (const mode of ["text/plain", "application/json"]) {
      const part = instance.sendMessage(request(`offer ${amount} ETH for epbs.eth private-marker-z71`, mode)).message.parts[0];
      const serialized = JSON.stringify(part);
      assert.equal(serialized.includes(`${amount} ETH`), false);
      assert.equal(serialized.includes("private-marker-z71"), false);
      assert.ok(serialized.includes(CONTACT.href));
    }
  }
});

test("ambiguous commercial interest still offers human contact without upgrading signal confidence", () => {
  const instance = beacon();
  for (const text of ["buy", "buy epbs.eth inclusionlist.eth"]) {
    const result = data(instance, text);
    assert.deepEqual(result.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
    assert.equal(result.reception.status, "needs_bounded_identifier");
    assert.equal(result.publicSignal.identifier, null);
    assert.equal(result.publicSignal.confidence, "low");
    assert.equal(result.publicSignal.privateHandoff, false);
  }
});

test("noncommercial discovery and contribution responses are not converted to sales contact", () => {
  const instance = beacon();
  for (const text of ["help", "epbs", "candidate epbs.eth", "contribute evidence", "registry"]) {
    for (const mode of ["text/plain", "application/json"]) {
      const part = instance.sendMessage(request(text, mode)).message.parts[0];
      assert.equal(JSON.stringify(part).includes(CONTACT.href), false, text);
    }
  }
});

test("caller metadata cannot replace the destination or inject a message into its URL", () => {
  const input = request("buy epbs.eth");
  input.metadata = { humanContact: "https://attacker.example", price: "private-price" };
  input.message.metadata = { href: "https://x.com/attacker", message: "private-body" };
  input.message.parts[0].metadata = { contact: "https://attacker.example" };
  const result = beacon().sendMessage(input).message.parts[0].data;
  assert.deepEqual(result.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
  const serialized = JSON.stringify(result);
  for (const forbidden of ["attacker", "private-price", "private-body"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
  const url = new URL(result.links.find((link) => link.rel === "human-contact").href);
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.equal(url.username, "");
  assert.equal(url.password, "");
});

test("even the allowlisted output destination remains forbidden as a caller-controlled input URL", () => {
  assert.throws(() => beacon().sendMessage(request(`buy epbs.eth ${CONTACT.href}`)), /caller-controlled URLs/i);
  const input = request("buy epbs.eth");
  input.humanContact = CONTACT;
  assert.throws(() => beacon().sendMessage(input), /unsupported field humanContact/);
});

test("mutating a returned link or public signal cannot change subsequent contact responses", () => {
  const instance = beacon();
  const first = data(instance, "buy epbs.eth");
  first.links.find((link) => link.rel === "human-contact").href = "https://attacker.example";
  first.publicSignal.privateHandoff = true;
  const second = data(instance, "buy epbs.eth");
  assert.deepEqual(second.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
  assert.equal(second.publicSignal.privateHandoff, false);
});

test("rendering the contact path does not fetch X or any external endpoint", (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("unexpected outbound request");
  });
  const instance = beacon();
  instance.sendMessage(request("buy epbs.eth"));
  instance.sendMessage(request("offer epbs.eth", "text/plain"));
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.deepEqual(instance.agentCard.capabilities, {
    streaming: false, pushNotifications: false, extendedAgentCard: false
  });
});
