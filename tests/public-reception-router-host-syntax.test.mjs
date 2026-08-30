import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/public-a2a-beacon.mjs";
import { routePublicReception } from "../lib/public-reception-router.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function sendRequest(text) {
  return {
    message: {
      messageId: "external-agent-host-regression",
      role: "ROLE_USER",
      parts: [{ text }]
    },
    configuration: {
      acceptedOutputModes: ["application/json"]
    }
  };
}

test("parsed caller-controlled host forms fail closed", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "host-regression-id"
  });

  for (const host of [
    "foo_bar.com",
    "-foo.com",
    "foo-.com",
    "foo。eth_bar.com",
    "foo｡eth_bar.com",
    "127",
    "0177",
    "0x7f",
    "example.",
    "example．"
  ]) {
    const text = `research ${host} epbs.eth`;
    assert.throws(
      () => routePublicReception({ text, requestId: "host-regression" }),
      /URLs are not accepted/,
      host
    );
    assert.throws(
      () => beacon.sendMessage(sendRequest(text)),
      /URLs are not accepted/,
      host
    );
  }
});

test("complete userinfo authority spans fail before ENS tokenization", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "userinfo-regression-id"
  });

  for (const authority of [
    "user@epbs.eth",
    "user@example.com",
    "user＠epbs.eth",
    "user%40epbs.eth",
    "user@epbs.eth.",
    "user@@epbs.eth",
    "user@@example.com",
    "user@@@epbs.eth",
    "user＠＠epbs.eth",
    "user%40%40epbs.eth",
    "user%40@epbs.eth",
    "[user@epbs.eth]",
    "<user@epbs.eth>",
    "(user@epbs.eth)",
    "{user@epbs.eth}",
    "\"user@epbs.eth\"",
    "'user@epbs.eth'",
    ",user@epbs.eth,",
    ";user@epbs.eth;"
  ]) {
    const text = `research ${authority}`;
    assert.throws(
      () => routePublicReception({ text, requestId: "userinfo-regression" }),
      /URLs are not accepted/,
      authority
    );
    assert.throws(
      () => beacon.sendMessage(sendRequest(text)),
      /URLs are not accepted/,
      authority
    );
  }
});

test("authority-like spans never expose an ENS suffix to a second tokenizer", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "authority-identity-id"
  });

  for (const text of [
    "research @@epbs.eth",
    "research user@@@epbs.eth",
    "research user%40%40epbs.eth"
  ]) {
    try {
      const direct = routePublicReception({ text, requestId: "authority-identity" });
      assert.notEqual(direct.intent, "ens_research", text);
      assert.equal(Object.hasOwn(direct, "identifier"), false, text);
    } catch (error) {
      assert.match(error.message, /URLs are not accepted/, text);
    }

    try {
      const response = beacon.sendMessage(sendRequest(text));
      const reception = response.message.parts[0].data.reception;
      assert.notEqual(reception.intent, "ens_research", text);
      assert.equal(Object.hasOwn(reception, "identifier"), false, text);
    } catch (error) {
      assert.match(error.message, /URLs are not accepted/, text);
    }
  }
});

test("percent-decoded host identity cannot inherit the malformed ENS exemption", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "percent-host-regression-id"
  });

  for (const host of [
    "foo.eth%5fbar.com",
    "foo.eth%5Fbar.com",
    "foo%2eeth%5fbar.com",
    "epbs%2eeth"
  ]) {
    const text = `research ${host}`;
    assert.throws(
      () => routePublicReception({ text, requestId: "percent-host-regression" }),
      /URLs are not accepted/,
      host
    );
    assert.throws(
      () => beacon.sendMessage(sendRequest(text)),
      /URLs are not accepted/,
      host
    );
  }

  const literalMalformed = routePublicReception({
    text: "research foo_epbs.eth",
    requestId: "literal-malformed-ens"
  });
  assert.equal(literalMalformed.intent, "unsupported");
  assert.equal(literalMalformed.status, "not_supported");

  const literalMalformedA2A = beacon.sendMessage(sendRequest("research foo_epbs.eth"));
  assert.equal(literalMalformedA2A.message.parts[0].data.reception.intent, "unsupported");
});

test("advertised EIP references route to technical discovery without becoming IPv4", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "eip-regression-id"
  });

  for (const [text, capabilityId] of [
    ["EIP 7732", "ethereum_epbs_semantics"],
    ["EIP-7732", "ethereum_epbs_semantics"],
    ["EIP 7805", "ethereum_inclusion_list_semantics"],
    ["EIP-7805", "ethereum_inclusion_list_semantics"]
  ]) {
    const direct = routePublicReception({ text, requestId: "eip-regression" });
    assert.equal(direct.intent, "technical_context", text);
    assert.equal(direct.status, "routed", text);
    assert.equal(direct.route, "allowlisted_public_artifacts", text);

    const response = beacon.sendMessage(sendRequest(text));
    const data = response.message.parts[0].data;
    assert.equal(data.reception.intent, "technical_context", text);
    assert.equal(data.capabilityId, capabilityId, text);
  }

  for (const text of [
    "research EIP 7732 epbs.eth",
    "research EIP 7805 epbs.eth"
  ]) {
    const direct = routePublicReception({ text, requestId: "eip-ens-regression" });
    assert.equal(direct.intent, "ens_research", text);
    assert.equal(direct.identifier, "epbs.eth", text);
    assert.doesNotThrow(() => beacon.sendMessage(sendRequest(text)), text);
  }
});

test("supported ENS, sentence punctuation and explicit schema versions remain accepted", () => {
  for (const text of [
    "research epbs.eth",
    "research epbs.eth.",
    "research schema 1.5.0 epbs.eth",
    "research schema 1.5.0-beta epbs.eth",
    "research schema v1.5.0-rc1 epbs.eth"
  ]) {
    const direct = routePublicReception({ text, requestId: "positive-regression" });
    assert.equal(direct.intent, "ens_research", text);
    assert.equal(direct.identifier, "epbs.eth", text);
  }
});
