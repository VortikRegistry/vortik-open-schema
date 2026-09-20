import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  createAuthenticatedCommercialSignalEnvelope,
  createSanitizedCommercialSignal,
  SANITIZED_SIGNAL_CONTRACT_VERSION,
  SANITIZED_SIGNAL_PRODUCER,
  SANITIZED_SIGNAL_REASON,
  SANITIZED_SIGNAL_ROUTE
} from "../lib/public-commercial-signal-producer.mjs";
import { routePublicReception } from "../lib/public-reception-router.mjs";

const FIXED_NOW = new Date("2026-09-04T04:00:00.000Z");
const VECTOR_URL = new URL("./fixtures/block-b-sanitized-signal-v1.json", import.meta.url);

function fixedBytes(byte) {
  return (size) => Buffer.alloc(size, byte);
}

function recognizedCommercialReception() {
  return routePublicReception({
    text: "offer 999 ETH for epbs.eth confidential-marker-do-not-cross",
    requestId: "block-b-producer-test"
  });
}

test("public producer emits exactly the private Block B wire fields and nothing else", () => {
  const signal = createSanitizedCommercialSignal(recognizedCommercialReception(), {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  });

  assert.deepEqual(Object.keys(signal), [
    "version",
    "source",
    "producer",
    "correlation_id",
    "identifier",
    "intent",
    "routing_reason",
    "confidence",
    "observed_at",
    "public_route"
  ]);
  assert.deepEqual(signal, {
    version: SANITIZED_SIGNAL_CONTRACT_VERSION,
    source: "agent",
    producer: SANITIZED_SIGNAL_PRODUCER,
    correlation_id: `sig_${"ab".repeat(16)}`,
    identifier: "epbs.eth",
    intent: "commercial_interest",
    routing_reason: SANITIZED_SIGNAL_REASON,
    confidence: "high",
    observed_at: "2026-09-04T04:00:00.000Z",
    public_route: SANITIZED_SIGNAL_ROUTE
  });
  const serialized = JSON.stringify(signal);
  assert.equal(serialized.includes("999"), false);
  assert.equal(serialized.includes("confidential-marker"), false);
  for (const forbidden of [
    "email", "phone", "wallet", "buyer", "price", "valuation",
    "negotiation", "message", "raw_text", "prompt", "conversation"
  ]) {
    assert.equal(forbidden in signal, false, forbidden);
  }
  assert.equal(Object.isFrozen(signal), true);
});

test("public producer exactly reproduces the shared cross-repo Block B vector", async () => {
  const vector = JSON.parse(await readFile(VECTOR_URL, "utf8"));
  const signal = createSanitizedCommercialSignal(recognizedCommercialReception(), {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
  assert.deepEqual(signal, vector);
});

test("public producer emits nothing for ambiguous or non-commercial Reception results", () => {
  const options = {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  };
  assert.equal(
    createSanitizedCommercialSignal(routePublicReception({
      text: "offer to buy epbs.eth and inclusionlist.eth",
      requestId: "block-b-ambiguous"
    }), options),
    null
  );
  assert.equal(
    createSanitizedCommercialSignal(routePublicReception({
      text: "research epbs.eth",
      requestId: "block-b-research"
    }), options),
    null
  );
});

test("public producer fails closed if the eligible Reception signal is tampered", () => {
  const reception = recognizedCommercialReception();
  assert.throws(
    () => createSanitizedCommercialSignal({
      ...reception,
      publicSignal: {
        ...reception.publicSignal,
        price: "999 ETH"
      }
    }, {
      clock: () => new Date(FIXED_NOW),
      randomBytesFactory: fixedBytes(0xab)
    }),
    /unknown fields/
  );
  assert.throws(
    () => createSanitizedCommercialSignal({
      ...reception,
      identifier: "inclusionlist.eth"
    }, {
      clock: () => new Date(FIXED_NOW),
      randomBytesFactory: fixedBytes(0xab)
    }),
    /must match/
  );
});

test("authenticated envelope matches the existing private ingress signing contract", async () => {
  const signal = createSanitizedCommercialSignal(recognizedCommercialReception(), {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
  let signedRequest = null;
  const envelope = await createAuthenticatedCommercialSignalEnvelope(signal, {
    keyId: "key:vortik-public-reception-001",
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xcd),
    ttlMs: 120_000,
    sign(request) {
      signedRequest = request;
      return "signature_value_0123456789abcdef";
    }
  });

  assert.deepEqual(Object.keys(envelope), [
    "version", "key_id", "channel", "issued_at", "expires_at",
    "nonce", "body", "signature"
  ]);
  assert.equal(Object.getPrototypeOf(envelope), null);
  assert.equal(envelope.version, "1.0");
  assert.equal(envelope.key_id, "key:vortik-public-reception-001");
  assert.equal(envelope.channel, "agent");
  assert.equal(envelope.issued_at, "2026-09-04T04:00:00.000Z");
  assert.equal(envelope.expires_at, "2026-09-04T04:02:00.000Z");
  assert.equal(envelope.nonce, Buffer.alloc(18, 0xcd).toString("base64url"));
  assert.deepEqual(JSON.parse(envelope.body), signal);
  assert.equal(envelope.signature, "signature_value_0123456789abcdef");
  assert.deepEqual(signedRequest, {
    key_id: envelope.key_id,
    signed_payload: JSON.stringify([
      "vortik-authenticated-ingress-v1",
      envelope.version,
      envelope.key_id,
      envelope.channel,
      envelope.issued_at,
      envelope.expires_at,
      envelope.nonce,
      envelope.body
    ])
  });
  assert.equal(JSON.stringify(envelope).includes("confidential-marker"), false);
  assert.equal(Object.isFrozen(envelope), true);
});

test("transport serialization cannot inherit a polluted Object.prototype.toJSON", async () => {
  const signal = createSanitizedCommercialSignal(recognizedCommercialReception(), {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
  const priorDescriptor = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
  let signedPayloadText = null;

  try {
    Object.defineProperty(Object.prototype, "toJSON", {
      configurable: true,
      writable: true,
      value() {
        return { raw_text: "prototype-pollution-marker" };
      }
    });

    const envelope = await createAuthenticatedCommercialSignalEnvelope(signal, {
      keyId: "key:vortik-public-reception-001",
      clock: () => new Date(FIXED_NOW),
      randomBytesFactory: fixedBytes(0xef),
      sign(request) {
        signedPayloadText = request.signed_payload;
        return "signature_value_0123456789abcdef";
      }
    });

    assert.equal(Object.getPrototypeOf(envelope), null);
    const serialized = JSON.stringify(envelope);
    assert.equal(serialized.includes("prototype-pollution-marker"), false);
    assert.equal(serialized.includes("raw_text"), false);
    assert.deepEqual(Object.keys(JSON.parse(serialized)), [
      "version", "key_id", "channel", "issued_at", "expires_at",
      "nonce", "body", "signature"
    ]);
    assert.equal(signedPayloadText.includes("prototype-pollution-marker"), false);
    assert.equal(signedPayloadText.includes("raw_text"), false);
  } finally {
    if (priorDescriptor === undefined) delete Object.prototype.toJSON;
    else Object.defineProperty(Object.prototype, "toJSON", priorDescriptor);
  }
});

test("transport retries can reuse one immutable signal correlation while nonce stays envelope-local", async () => {
  const signal = createSanitizedCommercialSignal(recognizedCommercialReception(), {
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
  const signer = () => "signature_value_0123456789abcdef";
  const first = await createAuthenticatedCommercialSignalEnvelope(signal, {
    keyId: "key:vortik-public-reception-001",
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0x11),
    sign: signer
  });
  const second = await createAuthenticatedCommercialSignalEnvelope(signal, {
    keyId: "key:vortik-public-reception-001",
    clock: () => new Date(FIXED_NOW),
    randomBytesFactory: fixedBytes(0x22),
    sign: signer
  });
  assert.equal(JSON.parse(first.body).correlation_id, signal.correlation_id);
  assert.equal(JSON.parse(second.body).correlation_id, signal.correlation_id);
  assert.equal(first.body, second.body);
  assert.notEqual(first.nonce, second.nonce);
});
