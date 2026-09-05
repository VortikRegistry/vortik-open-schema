import { randomBytes } from "node:crypto";

import { normalizeSupportedEnsName } from "./ens-research-evaluator.mjs";
import {
  PUBLIC_RECEPTION_PROTOCOL,
  PUBLIC_RECEPTION_VERSION
} from "./public-reception-router.mjs";

export const SANITIZED_SIGNAL_CONTRACT_VERSION = "1.0.0";
export const SANITIZED_SIGNAL_PRODUCER = "vortik-public-reception";
export const SANITIZED_SIGNAL_ROUTE = "sanitized_signal_only";
export const SANITIZED_SIGNAL_REASON = "explicit_interest_language_with_single_ens_identifier";

const PRIVATE_SIGNAL_FIELDS = Object.freeze([
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
const ELIGIBLE_RECEPTION_FIELDS = Object.freeze([
  "protocol",
  "version",
  "intent",
  "status",
  "route",
  "confidence",
  "discoveryGroup",
  "identifier",
  "publicSignal"
]);
const PUBLIC_SIGNAL_FIELDS = Object.freeze([
  "identifier",
  "normalizedIntent",
  "routingReason",
  "confidence",
  "privateHandoff"
]);

function readDataDescriptors(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError(`${label} must use Object.prototype`);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Object.getOwnPropertySymbols(descriptors).length !== 0) {
    throw new TypeError(`${label} must not contain symbol properties`);
  }
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`${label}.${key} must be an enumerable data property`);
    }
  }
  return descriptors;
}

function assertClosedDescriptors(descriptors, label, allowedFields) {
  const keys = Object.keys(descriptors);
  const unknown = keys.filter((key) => !allowedFields.includes(key));
  const missing = allowedFields.filter((key) => !keys.includes(key));
  if (unknown.length !== 0) {
    throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
  }
  if (missing.length !== 0) {
    throw new Error(`${label} is missing fields: ${missing.join(", ")}`);
  }
  return descriptors;
}

function assertClosedDataObject(value, label, allowedFields) {
  return assertClosedDescriptors(readDataDescriptors(value, label), label, allowedFields);
}

function canonicalUtcNow(clock, label) {
  if (typeof clock !== "function") throw new TypeError(`${label} clock must be a function`);
  const value = clock();
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(`${label} clock must return a valid Date`);
  }
  return value.toISOString();
}

function assertCanonicalUtcTimestamp(value, label) {
  if (typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    throw new TypeError(`${label} must be canonical UTC RFC 3339 with millisecond precision`);
  }
  let canonical;
  try {
    canonical = new Date(value).toISOString();
  } catch {
    throw new TypeError(`${label} contains an invalid timestamp`);
  }
  if (canonical !== value) {
    throw new TypeError(`${label} contains an invalid or non-canonical timestamp`);
  }
  return value;
}

function randomToken(randomBytesFactory, size, label) {
  if (typeof randomBytesFactory !== "function") {
    throw new TypeError(`${label} random byte factory must be a function`);
  }
  const value = randomBytesFactory(size);
  if (!Buffer.isBuffer(value) || value.byteLength !== size) {
    throw new TypeError(`${label} random byte factory must return exactly ${size} bytes`);
  }
  return value;
}

function isCanonicalSupportedEnsName(value) {
  return typeof value === "string" && normalizeSupportedEnsName(value) === value;
}

function stringifyCanonicalTuple(values) {
  const tuple = [...values];
  Object.setPrototypeOf(tuple, null);
  return JSON.stringify(tuple);
}

function assertEligibleReception(reception) {
  const descriptors = readDataDescriptors(reception, "Reception result");
  if (descriptors.protocol?.value !== PUBLIC_RECEPTION_PROTOCOL
    || descriptors.version?.value !== PUBLIC_RECEPTION_VERSION) {
    throw new Error("Reception result does not belong to the supported public protocol version");
  }

  const eligible = descriptors.intent?.value === "commercial_interest"
    && descriptors.status?.value === "recognized"
    && descriptors.route?.value === SANITIZED_SIGNAL_ROUTE
    && descriptors.confidence?.value === "high";
  if (!eligible) return null;

  const eligibleDescriptors = assertClosedDescriptors(
    descriptors,
    "eligible Reception result",
    ELIGIBLE_RECEPTION_FIELDS
  );
  if (eligibleDescriptors.discoveryGroup.value !== "generic") {
    throw new Error("eligible Reception result must remain in the bounded generic discovery group");
  }
  const publicDescriptors = assertClosedDataObject(
    eligibleDescriptors.publicSignal.value,
    "Reception publicSignal",
    PUBLIC_SIGNAL_FIELDS
  );
  const identifier = publicDescriptors.identifier.value;
  if (!isCanonicalSupportedEnsName(identifier)) {
    throw new Error("Reception publicSignal identifier is not a supported normalized ENS identifier");
  }
  if (identifier !== eligibleDescriptors.identifier.value) {
    throw new Error("Reception identifier and publicSignal identifier must match");
  }
  if (publicDescriptors.normalizedIntent.value !== "commercial_interest") {
    throw new Error("Reception publicSignal intent is not eligible for sanitized handoff");
  }
  if (publicDescriptors.routingReason.value !== SANITIZED_SIGNAL_REASON) {
    throw new Error("Reception publicSignal routing reason is not eligible for sanitized handoff");
  }
  if (publicDescriptors.confidence.value !== "high") {
    throw new Error("Reception publicSignal confidence is not eligible for sanitized handoff");
  }
  if (publicDescriptors.privateHandoff.value !== false) {
    throw new Error("Reception publicSignal must remain public-only before runtime handoff");
  }
  return identifier;
}

export function createSanitizedCommercialSignal(reception, {
  clock = () => new Date(),
  randomBytesFactory = randomBytes
} = {}) {
  const identifier = assertEligibleReception(reception);
  if (identifier === null) return null;
  const correlationId = `sig_${randomToken(
    randomBytesFactory,
    16,
    "sanitized signal"
  ).toString("hex")}`;
  return Object.freeze({
    version: SANITIZED_SIGNAL_CONTRACT_VERSION,
    source: "agent",
    producer: SANITIZED_SIGNAL_PRODUCER,
    correlation_id: correlationId,
    identifier,
    intent: "commercial_interest",
    routing_reason: SANITIZED_SIGNAL_REASON,
    confidence: "high",
    observed_at: canonicalUtcNow(clock, "sanitized signal"),
    public_route: SANITIZED_SIGNAL_ROUTE
  });
}

function signedPayload(envelope) {
  return stringifyCanonicalTuple([
    "vortik-authenticated-ingress-v1",
    envelope.version,
    envelope.key_id,
    envelope.channel,
    envelope.issued_at,
    envelope.expires_at,
    envelope.nonce,
    envelope.body
  ]);
}

function assertPrivateSignalContract(signal) {
  const descriptors = assertClosedDataObject(signal, "sanitized signal", PRIVATE_SIGNAL_FIELDS);
  const correlationId = descriptors.correlation_id.value;
  const identifier = descriptors.identifier.value;
  const observedAt = descriptors.observed_at.value;
  if (descriptors.version.value !== SANITIZED_SIGNAL_CONTRACT_VERSION
    || descriptors.source.value !== "agent"
    || descriptors.producer.value !== SANITIZED_SIGNAL_PRODUCER
    || descriptors.intent.value !== "commercial_interest"
    || descriptors.routing_reason.value !== SANITIZED_SIGNAL_REASON
    || descriptors.confidence.value !== "high"
    || descriptors.public_route.value !== SANITIZED_SIGNAL_ROUTE
    || typeof correlationId !== "string"
    || !/^sig_[a-f0-9]{32}$/u.test(correlationId)
    || !isCanonicalSupportedEnsName(identifier)) {
    throw new Error("sanitized signal does not match the private Block B contract");
  }
  assertCanonicalUtcTimestamp(observedAt, "sanitized signal.observed_at");

  const captured = Object.assign(Object.create(null), {
    version: descriptors.version.value,
    source: descriptors.source.value,
    producer: descriptors.producer.value,
    correlation_id: correlationId,
    identifier,
    intent: descriptors.intent.value,
    routing_reason: descriptors.routing_reason.value,
    confidence: descriptors.confidence.value,
    observed_at: observedAt,
    public_route: descriptors.public_route.value
  });
  return Object.freeze(captured);
}

export async function createAuthenticatedCommercialSignalEnvelope(signal, {
  keyId,
  sign,
  clock = () => new Date(),
  randomBytesFactory = randomBytes,
  ttlMs = 120_000
} = {}) {
  const validatedSignal = assertPrivateSignalContract(signal);
  if (typeof keyId !== "string" || !/^[A-Za-z0-9:_-]{3,128}$/u.test(keyId)) {
    throw new TypeError("Block B keyId is invalid");
  }
  if (typeof sign !== "function") throw new TypeError("Block B signer must be injected at runtime");
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 1_000 || ttlMs > 300_000) {
    throw new RangeError("Block B envelope ttlMs must be between 1000 and 300000");
  }

  const issuedAtDate = clock();
  if (!(issuedAtDate instanceof Date) || !Number.isFinite(issuedAtDate.getTime())) {
    throw new TypeError("Block B envelope clock must return a valid Date");
  }
  const issuedAt = issuedAtDate.toISOString();
  let expiresAt;
  try {
    expiresAt = new Date(issuedAtDate.getTime() + ttlMs).toISOString();
  } catch {
    throw new RangeError("Block B envelope expiry is outside the supported timestamp range");
  }
  const nonce = randomToken(
    randomBytesFactory,
    18,
    "Block B envelope"
  ).toString("base64url");
  const unsigned = Object.assign(Object.create(null), {
    version: "1.0",
    key_id: keyId,
    channel: "agent",
    issued_at: issuedAt,
    expires_at: expiresAt,
    nonce,
    body: JSON.stringify(validatedSignal)
  });
  Object.freeze(unsigned);
  const signature = await sign(Object.freeze({
    key_id: keyId,
    signed_payload: signedPayload(unsigned)
  }));
  if (typeof signature !== "string" || !/^[A-Za-z0-9_-]{16,512}$/u.test(signature)) {
    throw new Error("Block B signer returned an invalid signature encoding");
  }
  const envelope = Object.assign(Object.create(null), unsigned, { signature });
  return Object.freeze(envelope);
}
