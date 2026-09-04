import { randomBytes } from "node:crypto";

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
const PUBLIC_SIGNAL_FIELDS = Object.freeze([
  "identifier",
  "normalizedIntent",
  "routingReason",
  "confidence",
  "privateHandoff"
]);

function assertClosedDataObject(value, label, allowedFields) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    throw new TypeError(`${label} must use Object.prototype`);
  }
  if (Object.getOwnPropertySymbols(value).length !== 0) {
    throw new TypeError(`${label} must not contain symbol properties`);
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Object.keys(descriptors);
  const unknown = keys.filter((key) => !allowedFields.includes(key));
  const missing = allowedFields.filter((key) => !keys.includes(key));
  if (unknown.length !== 0) {
    throw new Error(`${label} contains unknown fields: ${unknown.join(", ")}`);
  }
  if (missing.length !== 0) {
    throw new Error(`${label} is missing fields: ${missing.join(", ")}`);
  }
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`${label}.${key} must be an enumerable data property`);
    }
  }
  return descriptors;
}

function canonicalUtcNow(clock, label) {
  if (typeof clock !== "function") throw new TypeError(`${label} clock must be a function`);
  const value = clock();
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(`${label} clock must return a valid Date`);
  }
  return value.toISOString();
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

function assertEligibleReception(reception) {
  if (reception === null || typeof reception !== "object" || Array.isArray(reception)) {
    throw new TypeError("Reception result must be an object");
  }
  if (reception.protocol !== PUBLIC_RECEPTION_PROTOCOL || reception.version !== PUBLIC_RECEPTION_VERSION) {
    throw new Error("Reception result does not belong to the supported public protocol version");
  }

  const eligible = reception.intent === "commercial_interest"
    && reception.status === "recognized"
    && reception.route === SANITIZED_SIGNAL_ROUTE
    && reception.confidence === "high";
  if (!eligible) return null;

  const descriptors = assertClosedDataObject(
    reception.publicSignal,
    "Reception publicSignal",
    PUBLIC_SIGNAL_FIELDS
  );
  const identifier = descriptors.identifier.value;
  if (typeof identifier !== "string" || !/^[a-z0-9-]+\.eth$/u.test(identifier) || identifier.length > 255) {
    throw new Error("Reception publicSignal identifier is not a supported normalized ENS identifier");
  }
  if (identifier !== reception.identifier) {
    throw new Error("Reception identifier and publicSignal identifier must match");
  }
  if (descriptors.normalizedIntent.value !== "commercial_interest") {
    throw new Error("Reception publicSignal intent is not eligible for sanitized handoff");
  }
  if (descriptors.routingReason.value !== SANITIZED_SIGNAL_REASON) {
    throw new Error("Reception publicSignal routing reason is not eligible for sanitized handoff");
  }
  if (descriptors.confidence.value !== "high") {
    throw new Error("Reception publicSignal confidence is not eligible for sanitized handoff");
  }
  if (descriptors.privateHandoff.value !== false) {
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
  return JSON.stringify([
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

export async function createAuthenticatedCommercialSignalEnvelope(signal, {
  keyId,
  sign,
  clock = () => new Date(),
  randomBytesFactory = randomBytes,
  ttlMs = 120_000
} = {}) {
  assertClosedDataObject(signal, "sanitized signal", PRIVATE_SIGNAL_FIELDS);
  if (signal.version !== SANITIZED_SIGNAL_CONTRACT_VERSION
    || signal.source !== "agent"
    || signal.producer !== SANITIZED_SIGNAL_PRODUCER
    || signal.intent !== "commercial_interest"
    || signal.routing_reason !== SANITIZED_SIGNAL_REASON
    || signal.confidence !== "high"
    || signal.public_route !== SANITIZED_SIGNAL_ROUTE
    || typeof signal.correlation_id !== "string"
    || !/^sig_[a-f0-9]{32}$/u.test(signal.correlation_id)
    || typeof signal.identifier !== "string"
    || !/^[a-z0-9-]+\.eth$/u.test(signal.identifier)) {
    throw new Error("sanitized signal does not match the private Block B contract");
  }
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
  const expiresAt = new Date(issuedAtDate.getTime() + ttlMs).toISOString();
  const nonce = randomToken(
    randomBytesFactory,
    18,
    "Block B envelope"
  ).toString("base64url");
  const unsigned = Object.freeze({
    version: "1.0",
    key_id: keyId,
    channel: "agent",
    issued_at: issuedAt,
    expires_at: expiresAt,
    nonce,
    body: JSON.stringify(signal)
  });
  const signature = await sign(Object.freeze({
    key_id: keyId,
    signed_payload: signedPayload(unsigned)
  }));
  if (typeof signature !== "string" || !/^[A-Za-z0-9_-]{16,512}$/u.test(signature)) {
    throw new Error("Block B signer returned an invalid signature encoding");
  }
  return Object.freeze({ ...unsigned, signature });
}
