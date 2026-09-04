import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/public-a2a-beacon.mjs";
import { routePublicReception } from "../lib/public-reception-router.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function sendRequest(text) {
  return {
    message: {
      messageId: "whole-chunk-authority",
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
    () => routePublicReception({ text, requestId: "whole-chunk-authority" }),
    /URLs are not accepted/,
    text
  );
  assert.throws(
    () => beacon.sendMessage(sendRequest(text)),
    /URLs are not accepted/,
    text
  );
}

test("punctuation-derived children never acquire scalar authority", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "whole-chunk-scalar-id"
  });

  for (const text of [
    "research EIP 7732!x epbs.eth",
    "research EIP x!7732 epbs.eth",
    "offer 999!x ETH for epbs.eth",
    "offer x!999 ETH for epbs.eth",
    "research EIP 7732！ epbs.eth",
    "research EIP 7732！x epbs.eth",
    "offer 999！x ETH for epbs.eth",
    "offer x！999 ETH for epbs.eth"
  ]) {
    assertUrlRejectedByBoth(beacon, text);
  }
});

test("only whole chunks or exact balanced wrappers may carry semantic authority", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "whole-chunk-positive-id"
  });

  for (const text of [
    "research epbs.eth",
    "research epbs.eth.",
    "research (epbs.eth)",
    "research \"epbs.eth\"",
    "research EIP 7732 epbs.eth",
    "research EIP (7732) epbs.eth",
    "research schema 1.5.0 epbs.eth",
    "research schema (1.5.0) epbs.eth"
  ]) {
    const direct = routePublicReception({ text, requestId: "whole-chunk-positive" });
    assert.equal(direct.intent, "ens_research", text);
    assert.equal(direct.identifier, "epbs.eth", text);

    const response = beacon.sendMessage(sendRequest(text));
    assert.equal(response.message.parts[0].data.reception.intent, "ens_research", text);
    assert.equal(response.message.parts[0].data.reception.identifier, "epbs.eth", text);
  }

  const commercialText = "offer 999 (ETH) for epbs.eth";
  const directCommercial = routePublicReception({
    text: commercialText,
    requestId: "whole-chunk-commercial"
  });
  assert.equal(directCommercial.intent, "commercial_interest");
  assert.equal(directCommercial.publicSignal.identifier, "epbs.eth");

  const a2aCommercial = beacon.sendMessage(sendRequest(commercialText));
  assert.equal(a2aCommercial.message.parts[0].data.reception.intent, "commercial_interest");
  assert.equal(a2aCommercial.message.parts[0].data.publicSignal.identifier, "epbs.eth");
});

test("compatibility punctuation is normalized before authority is decided", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "whole-chunk-nfkc-id"
  });

  for (const text of [
    "research 7732！x epbs.eth",
    "research x！7732 epbs.eth",
    "research 999！x epbs.eth",
    "research x！999 epbs.eth"
  ]) {
    assertUrlRejectedByBoth(beacon, text);
  }
});
