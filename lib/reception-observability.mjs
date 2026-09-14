import { createHash, randomUUID } from "node:crypto";

const ALLOWED_INTENTS = new Set([
  "candidate_submission",
  "evidence_contribution",
  "commercial_interest",
  "business_proposal",
  "ens_research",
  "capability_discovery",
  "registry_lookup",
  "technical_context",
  "unsupported"
]);

const BUSINESS_PRIORITY_INTENTS = new Set([
  "commercial_interest",
  "business_proposal"
]);

const BUSINESS_PROPOSAL_TERMS = Object.freeze([
  "business proposal",
  "commercial proposal",
  "partnership proposal",
  "strategic partnership",
  "business opportunity",
  "licensing proposal",
  "integration proposal",
  "collaboration proposal",
  "joint venture",
  "interested in partnering",
  "want to partner",
  "partner with you",
  "work together",
  "propuesta comercial",
  "propuesta de negocio",
  "alianza estrategica",
  "oportunidad de negocio",
  "trabajar juntos"
]);

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

function normalizeSignalText(text) {
  if (typeof text !== "string") throw new TypeError("signal text must be a string");
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9._ -]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function includesClosedTerm(normalized, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "u").test(normalized);
}

export function classifyBusinessProposalText(text) {
  const normalized = normalizeSignalText(text);
  return BUSINESS_PROPOSAL_TERMS.some((term) => includesClosedTerm(normalized, term));
}

export function deriveObservedReception(reception, queryText) {
  assertPlainObject(reception, "reception");
  if (reception.intent === "commercial_interest") return reception;
  if (!classifyBusinessProposalText(queryText)) return reception;

  return Object.freeze({
    intent: "business_proposal",
    status: "recognized",
    route: "sanitized_business_signal_only",
    confidence: reception.identifier ? "high" : "explicit",
    ...(reception.identifier === undefined ? {} : { identifier: reception.identifier })
  });
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

  const priority = classifyReceptionPriority(reception);
  const event = {
    severity: priority === "high" ? "WARNING" : "INFO",
    schema: "vortik_reception_observation/1.0.0",
    event_type: "reception_observation",
    event_id: boundedString(eventId, "eventId", 128),
    observed_at: boundedString(observedAt, "observedAt", 64),
    surface: "public_a2a_reception",
    intent,
    status: boundedString(reception.status, "reception.status", 64),
    route: boundedString(reception.route, "reception.route", 64),
    confidence: boundedString(reception.confidence, "reception.confidence", 64),
    priority,
    commercial_signal: reception.intent === "commercial_interest",
    business_signal: priority === "high",
    identifier: reception.identifier ?? null,
    visitor_identity: "unverified",
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
