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
