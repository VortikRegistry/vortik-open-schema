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

function assertUrlOrUnsupportedByBoth(beacon, text) {
  let direct;
  try {
    direct = routePublicReception({ text, requestId: "nfkc-presentation" });
  } catch (error) {
    assert.match(error.message, /URLs are not accepted/, text);
  }
  if (direct) {
    assert.equal(direct.intent, "unsupported", text);
    assert.equal(direct.status, "not_supported", text);
  }

  let a2aData;
  try {
    a2aData = beacon.sendMessage(sendRequest(text)).message.parts[0].data;
  } catch (error) {
    assert.match(error.message, /URLs are not accepted/, text);
  }
  if (a2aData) {
    assert.equal(a2aData.reception.intent, "unsupported", text);
    assert.equal(a2aData.reception.status, "not_supported", text);
  }
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

test("numeric IPv4 authorities with ports fail closed", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "numeric-ipv4-port"
  });

  for (const text of [
    "research 127:80 epbs.eth",
    "research 2130706433:443 epbs.eth",
    "research 0x7f:80 epbs.eth",
    "research 0177:80 epbs.eth",
    "research 127: epbs.eth",
    "research 2130706433: epbs.eth",
    "research 0x7f: epbs.eth",
    "research 0177: epbs.eth",
    "research 127:? epbs.eth",
    "research 0177:# epbs.eth",
    "research 2130706433:# epbs.eth",
    "research 0x7f:? epbs.eth",
    "research 127:80? epbs.eth",
    "research 0177:80# epbs.eth"
  ]) {
    assertUrlRejectedByBoth(beacon, text);
  }
});

test("bare numeric IPv4 hosts with empty URL suffixes fail closed", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "numeric-ipv4-empty-suffix"
  });

  for (const text of [
    "research 127? epbs.eth",
    "research 0177# epbs.eth",
    "research 2130706433? epbs.eth",
    "research 0x7f# epbs.eth"
  ]) {
    assertUrlRejectedByBoth(beacon, text);
  }
});

test("hyphen-punctuated numeric host chunks fail closed", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: () => "numeric-ipv4-hyphen"
  });

  for (const text of [
    "research -127 epbs.eth",
    "research 2130706433- epbs.eth",
    "research -0177 epbs.eth",
    "research 0x7f- epbs.eth",
    "research -127? epbs.eth",
    "research 2130706433-# epbs.eth",
    "research -127:80 epbs.eth",
    "research 127-:80 epbs.eth",
    "research -0177: epbs.eth",
    "research 0x7f-: epbs.eth",
    "research -127:80? epbs.eth",
    "research 2130706433-:# epbs.eth"
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
    assertUrlOrUnsupportedByBoth(beacon, text);
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
