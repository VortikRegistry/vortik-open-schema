import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyReceptionPriority,
  createReceptionObservation,
  createStructuredReceptionLogger
} from "../lib/reception-observability.mjs";

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

  assert.equal(observation.priority, "high");
  assert.equal(observation.commercial_signal, true);
  assert.equal(observation.intent, "commercial_interest");
  assert.equal(observation.identifier, "epbs.eth");
  assert.equal(JSON.stringify(observation).includes("external-agent-message-123"), false);
  assert.equal(JSON.stringify(observation).includes("context-123"), false);
  assert.equal(JSON.stringify(observation).includes("response-123"), false);
});

test("ordinary research remains normal priority", () => {
  assert.equal(classifyReceptionPriority({ intent: "ens_research" }), "normal");
});

test("structured logger emits one JSON line and no raw visitor text", () => {
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
