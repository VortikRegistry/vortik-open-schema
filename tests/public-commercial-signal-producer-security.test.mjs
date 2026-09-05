import assert from "node:assert/strict";
import test from "node:test";

import {
  createAuthenticatedCommercialSignalEnvelope,
  createSanitizedCommercialSignal
} from "../lib/public-commercial-signal-producer.mjs";
import { routePublicReception } from "../lib/public-reception-router.mjs";

const NOW = new Date("2026-09-04T04:00:00.000Z");

function fixedBytes(byte) {
  return (size) => Buffer.alloc(size, byte);
}

function reception() {
  return routePublicReception({
    text: "offer to buy epbs.eth",
    requestId: "block-b-security"
  });
}

function signal() {
  return createSanitizedCommercialSignal(reception(), {
    clock: () => new Date(NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
}

const envelopeOptions = Object.freeze({
  keyId: "key:vortik-public-reception-001",
  clock: () => new Date(NOW),
  randomBytesFactory: fixedBytes(0xcd),
  sign: () => "signature_value_0123456789abcdef"
});

test("producer rejects prototype and accessor Reception objects without invoking getters", () => {
  assert.throws(
    () => createSanitizedCommercialSignal(Object.assign(Object.create(null), reception())),
    /Object\.prototype/
  );

  let getterCalls = 0;
  const forged = {};
  Object.defineProperty(forged, "protocol", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "vortik-public-reception";
    }
  });
  assert.throws(
    () => createSanitizedCommercialSignal(forged),
    /enumerable data property/
  );
  assert.equal(getterCalls, 0);
});

test("producer rejects accessor descriptors even when Object.prototype.value is polluted", () => {
  const trusted = reception();
  const priorValue = Object.getOwnPropertyDescriptor(Object.prototype, "value");
  const valuesByGetter = new WeakMap();
  let fieldGetterCalls = 0;
  const forged = {};

  for (const [key, value] of Object.entries(trusted)) {
    const getter = function forgedFieldGetter() {
      fieldGetterCalls += 1;
      return value;
    };
    valuesByGetter.set(getter, value);
    Object.defineProperty(forged, key, {
      enumerable: true,
      configurable: true,
      get: getter
    });
  }

  Object.defineProperty(Object.prototype, "value", {
    configurable: true,
    get() {
      return valuesByGetter.get(this.get);
    }
  });

  try {
    assert.throws(
      () => createSanitizedCommercialSignal(forged, {
        clock: () => new Date(NOW),
        randomBytesFactory: fixedBytes(0xab)
      }),
      /enumerable data property/
    );
    assert.equal(fieldGetterCalls, 0);
  } finally {
    if (priorValue === undefined) {
      delete Object.prototype.value;
    } else {
      Object.defineProperty(Object.prototype, "value", priorValue);
    }
  }
});

test("producer validates commercial eligibility and closure from one Reception snapshot", () => {
  const trusted = reception();
  const allowedKeys = Object.keys(trusted);
  let ownKeysCalls = 0;
  const target = { ...trusted, widened: "must-not-cross" };
  const forged = new Proxy(target, {
    getPrototypeOf() {
      return Object.prototype;
    },
    ownKeys() {
      ownKeysCalls += 1;
      return ownKeysCalls <= 2 ? [...allowedKeys, "widened"] : allowedKeys;
    },
    getOwnPropertyDescriptor(object, key) {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      if (key === "route" && ownKeysCalls > 2) {
        return { ...descriptor, value: "unsupported" };
      }
      return descriptor;
    }
  });

  assert.throws(
    () => createSanitizedCommercialSignal(forged, {
      clock: () => new Date(NOW),
      randomBytesFactory: fixedBytes(0xab)
    }),
    /unknown fields: widened/
  );
  assert.equal(ownKeysCalls, 1);
});

test("producer reuses Reception's canonical ENS normalization boundary", () => {
  const multiLabel = routePublicReception({
    text: "offer to buy foo.bar.eth",
    requestId: "block-b-multilabel"
  });
  const produced = createSanitizedCommercialSignal(multiLabel, {
    clock: () => new Date(NOW),
    randomBytesFactory: fixedBytes(0xab)
  });
  assert.equal(produced.identifier, "foo.bar.eth");

  const trusted = reception();
  for (const identifier of ["-bad.eth", "bad-.eth", "foo..eth", `${"a".repeat(64)}.eth`]) {
    const forged = {
      ...trusted,
      identifier,
      publicSignal: {
        ...trusted.publicSignal,
        identifier
      }
    };
    assert.throws(
      () => createSanitizedCommercialSignal(forged, {
        clock: () => new Date(NOW),
        randomBytesFactory: fixedBytes(0xab)
      }),
      /supported normalized ENS identifier/,
      identifier
    );
  }
});

test("envelope builder rejects non-canonical timestamps and oversized ENS before signing", async () => {
  let signCalls = 0;
  const options = {
    ...envelopeOptions,
    sign() {
      signCalls += 1;
      return "signature_value_0123456789abcdef";
    }
  };

  await assert.rejects(
    createAuthenticatedCommercialSignalEnvelope({
      ...signal(),
      observed_at: "2026-02-30T04:00:00.000Z"
    }, options),
    /invalid or non-canonical timestamp/
  );

  await assert.rejects(
    createAuthenticatedCommercialSignalEnvelope({
      ...signal(),
      identifier: `${"a".repeat(252)}.eth`
    }, options),
    /private Block B contract/
  );
  assert.equal(signCalls, 0);
});

test("envelope builder rejects accessor-backed signal fields without invoking them", async () => {
  const forged = { ...signal() };
  let getterCalls = 0;
  Object.defineProperty(forged, "identifier", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "epbs.eth";
    }
  });
  await assert.rejects(
    createAuthenticatedCommercialSignalEnvelope(forged, envelopeOptions),
    /enumerable data property/
  );
  assert.equal(getterCalls, 0);
});

test("envelope builder serializes only captured primitives without re-enumerating a changing Proxy", async () => {
  const trusted = signal();
  const allowedKeys = Object.keys(trusted);
  let ownKeysCalls = 0;
  const target = { ...trusted, raw_text: "must-not-cross" };
  const forged = new Proxy(target, {
    getPrototypeOf() {
      return Object.prototype;
    },
    ownKeys() {
      ownKeysCalls += 1;
      return ownKeysCalls === 1 ? allowedKeys : [...allowedKeys, "raw_text"];
    },
    getOwnPropertyDescriptor(object, key) {
      return Object.getOwnPropertyDescriptor(object, key);
    }
  });

  const envelope = await createAuthenticatedCommercialSignalEnvelope(forged, envelopeOptions);
  const body = JSON.parse(envelope.body);
  assert.deepEqual(body, trusted);
  assert.equal("raw_text" in body, false);
  assert.equal(envelope.body.includes("must-not-cross"), false);
  assert.equal(ownKeysCalls, 1);
});

test("envelope serialization ignores inherited Object.prototype.toJSON hooks", async () => {
  const prior = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
  let signedPayload;
  Object.defineProperty(Object.prototype, "toJSON", {
    configurable: true,
    value() {
      return { raw_text: "prototype-pollution-must-not-cross" };
    }
  });

  try {
    const envelope = await createAuthenticatedCommercialSignalEnvelope(signal(), {
      ...envelopeOptions,
      sign(request) {
        signedPayload = request.signed_payload;
        return "signature_value_0123456789abcdef";
      }
    });
    const body = JSON.parse(envelope.body);
    assert.equal(body.identifier, "epbs.eth");
    assert.equal("raw_text" in body, false);
    assert.equal(envelope.body.includes("prototype-pollution-must-not-cross"), false);
    assert.equal(signedPayload.includes("prototype-pollution-must-not-cross"), false);
    assert.equal(JSON.parse(signedPayload)[7], envelope.body);
  } finally {
    if (prior === undefined) {
      delete Object.prototype.toJSON;
    } else {
      Object.defineProperty(Object.prototype, "toJSON", prior);
    }
  }
});
