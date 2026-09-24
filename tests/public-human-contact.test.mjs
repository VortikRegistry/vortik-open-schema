import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/observed-public-a2a-beacon.mjs";
import { createCloudRunAgentBeaconServer } from "../service/cloud-run-agent-beacon.mjs";

const CONTACT = { rel: "human-contact", href: "https://x.com/VortikRegistry" };
const FOLLOW_UP = {
  channel: "x", address: CONTACT.href, voluntary: true,
  human_authorization_required: true, beacon_stores_contact: false
};

function beacon(options = {}) {
  let id = 0;
  return createPublicA2ABeacon({
    publicBaseUrl: "https://beacon.example.test",
    idFactory: () => `contact-test-${++id}`,
    observationLogger: null,
    sanitizedSignalLogger: null,
    ...options
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

test("commercial JSON has one X destination in existing follow-up and link fields outside the signal", () => {
  const result = data(beacon(), "interested in buying epbs.eth");
  assert.deepEqual(result.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
  assert.deepEqual(result.humanFollowUp, FOLLOW_UP);
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
    "publicSignal", "reception", "summary", "tags", "title", "humanFollowUp"
  ].sort());
});

test("commercial text contains one buyer-initiated destination and matching limitations", () => {
  const text = beacon().sendMessage(request("buy epbs.eth", "text/plain")).message.parts[0].text;
  assertNotice(text);
  assert.ok(text.includes(`Optional human follow-up: ${CONTACT.href}`));
  assert.equal(text.split(CONTACT.href).length - 1, 1);
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

test("ambiguous commercial interest offers human contact without upgrading or transporting the signal", () => {
  const events = [];
  const instance = beacon({ sanitizedSignalLogger: { record: (event) => events.push(event) } });
  for (const text of ["buy", "buy epbs.eth inclusionlist.eth"]) {
    const result = data(instance, text);
    assert.deepEqual(result.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
    assert.deepEqual(result.humanFollowUp, FOLLOW_UP);
    assert.equal(result.reception.status, "needs_bounded_identifier");
    assert.equal(result.publicSignal.identifier, null);
    assert.equal(result.publicSignal.confidence, "low");
    assert.equal(result.publicSignal.privateHandoff, false);
  }
  assert.deepEqual(events, []);
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
  assert.deepEqual(result.humanFollowUp, FOLLOW_UP);
  const serialized = JSON.stringify(result);
  for (const forbidden of ["attacker", "private-price", "private-body"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
  const url = new URL(result.humanFollowUp.address);
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  assert.equal(url.username, "");
  assert.equal(url.password, "");
});

test("the fixed output destination remains forbidden as a caller-controlled input URL", () => {
  assert.throws(() => beacon().sendMessage(request(`buy epbs.eth ${CONTACT.href}`)), /caller-controlled URLs/i);
  const input = request("buy epbs.eth");
  input.humanContact = CONTACT;
  assert.throws(() => beacon().sendMessage(input), /unsupported field humanContact/);
});

test("mutating returned links or signals cannot change subsequent contact responses", () => {
  const instance = beacon();
  const first = data(instance, "buy epbs.eth");
  first.links.find((link) => link.rel === "human-contact").href = "https://attacker.example";
  first.publicSignal.privateHandoff = true;
  assert.throws(() => { first.humanFollowUp.address = "https://attacker.example"; }, TypeError);
  const second = data(instance, "buy epbs.eth");
  assert.deepEqual(second.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
  assert.deepEqual(second.humanFollowUp, FOLLOW_UP);
  assert.equal(second.publicSignal.privateHandoff, false);
});

test("rendering contact never fetches an external endpoint and survives logging failure", (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", () => {
    throw new Error("unexpected outbound request");
  });
  const brokenLogger = { record() { throw new Error("logger failure"); } };
  const instance = beacon({ observationLogger: brokenLogger, sanitizedSignalLogger: brokenLogger });
  assert.deepEqual(data(instance, "buy epbs.eth").humanFollowUp, FOLLOW_UP);
  const text = instance.sendMessage(request("offer epbs.eth", "text/plain")).message.parts[0].text;
  assert.ok(text.includes(CONTACT.href));
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.deepEqual(instance.agentCard.capabilities, {
    streaming: false, pushNotifications: false, extendedAgentCard: false
  });
});

test("business proposals use the same X destination and never fall back to the previous email", () => {
  const instance = beacon();
  for (const text of ["strategic partnership proposal for epbs.eth", "buy epbs.eth", "buy"]) {
    for (const mode of ["text/plain", "application/json"]) {
      const part = instance.sendMessage(request(text, mode)).message.parts[0];
      const serialized = JSON.stringify(part);
      assert.equal(serialized.includes("gmail.com"), false);
      assert.equal(serialized.includes("mailto:"), false);
      if (mode === "application/json") {
        assert.deepEqual(part.data.humanFollowUp, FOLLOW_UP);
        assert.deepEqual(part.data.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
        assertNotice(part.data.summary);
      } else {
        assert.equal(part.text.split(CONTACT.href).length - 1, 1);
        assertNotice(part.text);
      }
    }
  }
});

test("HTTP runtime returns the selected X destination in text and JSON without an email fallback", async () => {
  const server = createCloudRunAgentBeaconServer({ publicBaseUrl: "https://beacon.example.test" });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    for (const mode of ["text/plain", "application/json"]) {
      const response = await fetch(`${origin}/a2a/v1/message:send`, {
        method: "POST",
        headers: { "content-type": "application/a2a+json", "a2a-version": "1.0" },
        body: JSON.stringify(request("buy epbs.eth", mode))
      });
      assert.equal(response.status, 200);
      const result = await response.json();
      const part = result.message.parts[0];
      assert.equal(part.mediaType, mode);
      assert.equal(JSON.stringify(result).includes("gmail.com"), false);
      if (mode === "application/json") {
        assert.deepEqual(part.data.humanFollowUp, FOLLOW_UP);
        assert.deepEqual(part.data.links.filter((link) => link.rel === "human-contact"), [CONTACT]);
        assert.equal(part.data.publicSignal.privateHandoff, false);
        assertNotice(part.data.summary);
      } else {
        assertNotice(part.text);
        assert.equal(part.text.split(CONTACT.href).length - 1, 1);
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
