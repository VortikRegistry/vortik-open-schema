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

test("parsed multi-label hosts with non-DNS label syntax fail closed", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "host-regression-id"
  });

  for (const host of ["foo_bar.com", "-foo.com", "foo-.com"]) {
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

test("supported ENS and explicit schema versions remain accepted", () => {
  for (const text of [
    "research epbs.eth",
    "research schema 1.5.0 epbs.eth",
    "research schema 1.5.0-beta epbs.eth",
    "research schema v1.5.0-rc1 epbs.eth"
  ]) {
    const direct = routePublicReception({ text, requestId: "positive-regression" });
    assert.equal(direct.intent, "ens_research", text);
    assert.equal(direct.identifier, "epbs.eth", text);
  }
});
