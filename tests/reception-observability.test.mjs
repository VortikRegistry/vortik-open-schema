import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import Ajv from "ajv";
import addFormats from "ajv-formats";

import { createPublicA2ABeacon } from "../lib/observed-public-a2a-beacon.mjs";
import {
  classifyBusinessProposalText,
  classifyReceptionPriority,
  createReceptionObservation,
  createStructuredReceptionLogger,
  deriveObservedReception
} from "../lib/reception-observability.mjs";

const schema = JSON.parse(readFileSync(
  new URL("../schemas/observability/vortik-reception-observation/1.0.0/schema.json", import.meta.url),
  "utf8"
));
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validateObservation = ajv.compile(schema);

const commercialReception = Object.freeze({
  intent: "commercial_interest",
  status: "recognized",
  route: "sanitized_signal_only",
  confidence: "high",
  identifier: "epbs.eth"
});

test("commercial reception becomes a high-priority sanitized observation", () => {
  const observation = createReceptionObservation({
    reception: commercialReception,
    inboundMessageId: "external-agent-message-123",
    contextId: "context-123",
    generatedMessageId: "response-123",
    observedAt: "2026-09-14T01:30:00.000Z",
    eventId: "event-123"
  });

  assert.equal(validateObservation(observation), true, JSON.stringify(validateObservation.errors));
  assert.equal(observation.priority, "high");
  assert.equal(observation.severity, "WARNING");
  assert.equal(observation.commercial_signal, true);
  assert.equal(observation.business_signal, true);
  assert.equal(observation.intent, "commercial_interest");
  assert.equal(observation.identifier, "epbs.eth");
  assert.equal(observation.visitor_identity, "unverified");
  assert.equal(JSON.stringify(observation).includes("external-agent-message-123"), false);
  assert.equal(JSON.stringify(observation).includes("context-123"), false);
  assert.equal(JSON.stringify(observation).includes("response-123"), false);
});

test("explicit partnership language becomes a bounded business proposal alert", () => {
  assert.equal(classifyBusinessProposalText("We have a strategic partnership proposal for epbs.eth"), true);
  const observed = deriveObservedReception({
    intent: "ens_research",
    status: "completed",
    route: "canonical_local_ens_research",
    confidence: "deterministic",
    identifier: "epbs.eth"
  }, "We have a strategic partnership proposal for epbs.eth");

  assert.equal(observed.intent, "business_proposal");
  assert.equal(observed.route, "sanitized_business_signal_only");
  assert.equal(classifyReceptionPriority(observed), "high");
});

test("ordinary research remains normal priority", () => {
  assert.equal(classifyReceptionPriority({ intent: "ens_research" }), "normal");
});

test("structured logger emits one JSON line and no raw visitor identifiers", () => {
  const lines = [];
  const logger = createStructuredReceptionLogger({ write: (line) => lines.push(line) });
  const observation = createReceptionObservation({
    reception: commercialReception,
    inboundMessageId: "buyer-message",
    contextId: "ctx",
    generatedMessageId: "response",
    observedAt: "2026-09-14T01:30:00.000Z",
    eventId: "event-log"
  });

  logger.record(observation);
  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.event_id, "event-log");
  assert.equal(parsed.commercial_signal, true);
  assert.equal(lines[0].includes("buyer-message"), false);
});

test("observed A2A beacon records a business proposal without persisting raw text", () => {
  const observations = [];
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: Object.freeze({ record: (event) => observations.push(event) })
  });

  const rawText = "We have a strategic partnership proposal for epbs.eth";
  const response = beacon.sendMessage({
    message: {
      messageId: "external-agent-42",
      contextId: "context-42",
      role: "ROLE_USER",
      parts: [{ text: rawText, mediaType: "text/plain" }]
    },
    configuration: { acceptedOutputModes: ["application/json"] }
  });

  assert.equal(response.message.messageId, "response-id");
  assert.equal(observations.length, 1);
  assert.equal(validateObservation(observations[0]), true, JSON.stringify(validateObservation.errors));
  assert.equal(observations[0].intent, "business_proposal");
  assert.equal(observations[0].priority, "high");
  assert.equal(observations[0].identifier, "epbs.eth");
  assert.equal(JSON.stringify(observations[0]).includes(rawText), false);
  assert.equal(JSON.stringify(observations[0]).includes("external-agent-42"), false);
});
