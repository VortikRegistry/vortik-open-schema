import { createHash, randomUUID } from "node:crypto";

const ALLOWED_INTENTS = new Set([
  "candidate_submission",
  "evidence_contribution",
  "commercial_interest",
  "ens_research",
  "capability_discovery",
  "registry_lookup",
  "technical_context",
  "unsupported"
]);

const BUSINESS_PRIORITY_INTENTS = new Set(["commercial_interest"]);

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a plain object`);
  }
}

function boundedString(value, label, max = 128) {
  if (typeof value !== "string" || value.length < 1 || value.length > max) {
    throw new TypeError(`${label} must be a bounded non-empty string`);
  }
  return value;
}

function digestOpaque(value, domain) {
  return `sha256:${createHash("sha256")
    .update(domain, "utf8")
    .update("\u0000", "utf8")
    .update(value, "utf8")
    .digest("hex")}`;
}

export function classifyReceptionPriority(reception) {
  assertPlainObject(reception, "reception");
  if (!ALLOWED_INTENTS.has(reception.intent)) return "normal";
  return BUSINESS_PRIORITY_INTENTS.has(reception.intent) ? "high" : "normal";
}

export function createReceptionObservation({
  reception,
  inboundMessageId,
  contextId,
  generatedMessageId,
  observedAt = new Date().toISOString(),
  eventId = randomUUID()
}) {
  assertPlainObject(reception, "reception");
  const intent = boundedString(reception.intent, "reception.intent", 64);
  if (!ALLOWED_INTENTS.has(intent)) throw new Error("unsupported reception intent");

  const event = {
    schema: "vortik_reception_observation/1.0.0",
    event_id: boundedString(eventId, "eventId", 128),
    observed_at: boundedString(observedAt, "observedAt", 64),
    surface: "public_a2a_reception",
    intent,
    status: boundedString(reception.status, "reception.status", 64),
    route: boundedString(reception.route, "reception.route", 64),
    confidence: boundedString(reception.confidence, "reception.confidence", 64),
    priority: classifyReceptionPriority(reception),
    commercial_signal: reception.intent === "commercial_interest",
    identifier: reception.identifier ?? null,
    inbound_message_id_digest: digestOpaque(
      boundedString(inboundMessageId, "inboundMessageId", 128),
      "vortik-reception-inbound-message-id-v1"
    ),
    context_id_digest: digestOpaque(
      boundedString(contextId, "contextId", 128),
      "vortik-reception-context-id-v1"
    ),
    response_message_id_digest: digestOpaque(
      boundedString(generatedMessageId, "generatedMessageId", 128),
      "vortik-reception-response-message-id-v1"
    )
  };

  return Object.freeze(event);
}

export function createStructuredReceptionLogger({ write = (line) => process.stdout.write(line) } = {}) {
  if (typeof write !== "function") throw new TypeError("write must be a function");
  return Object.freeze({
    record(observation) {
      assertPlainObject(observation, "observation");
      write(`${JSON.stringify(observation)}\n`);
    }
  });
}
