import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/public-a2a-beacon.mjs";
import { routePublicReception } from "../lib/public-reception-router.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function sendRequest(text) {
  return {
    message: {
      messageId: "final-scope-reduction",
      role: "ROLE_USER",
      parts: [{ text }]
    },
    configuration: {
      acceptedOutputModes: ["application/json"]
    }
  };
}

function assertUrlRejectedByBoth(beacon, text) {
  assert.throws(
    () => routePublicReception({ text, requestId: "final-scope-reduction" }),
    /URLs are not accepted/,
    text
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest(text)),
    /URLs are not accepted/,
    text
  );
}

test("wrapped inner tokens retain complete-host authority", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "wrapped-inner-host"
  });

  for (const text of [
    "research EIP (7732!x) epbs.eth",
    "offer (999!x) ETH for epbs.eth"
  ]) {
    assertUrlRejectedByBoth(beacon, text);
  }
});

test("NFKC does not manufacture presentation authority", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "nfkc-presentation"
  });

  for (const text of [
    "research （epbs.eth）",
    "research ［epbs.eth］",
    "research epbs.eth．"
  ]) {
    assert.throws(
      () => routePublicReception({ text, requestId: "nfkc-presentation" }),
      /URLs are not accepted|not_supported|unsupported/i,
      text
    );
  }
});

test("exact ASCII presentation forms remain supported", () => {
  for (const text of [
    "research (epbs.eth)",
    "research [epbs.eth]",
    "research epbs.eth."
  ]) {
    const direct = routePublicReception({ text, requestId: "ascii-presentation" });
    assert.equal(direct.intent, "ens_research", text);
    assert.equal(direct.identifier, "epbs.eth", text);
  }
});
