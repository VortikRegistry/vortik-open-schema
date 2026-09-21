import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  createPublicA2ABeacon,
  PUBLIC_HUMAN_FOLLOW_UP
} from "../lib/observed-public-a2a-beacon.mjs";
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
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateObservation = ajv.compile(schema);

const commercialReception = Object.freeze({
  intent: "commercial_interest",
  status: "recognized",
  route: "sanitized_signal_only",
  confidence: "high",
  identifier: "epbs.eth"
});

function a2aRequest(text, {
  messageId = "external-agent-42",
  contextId = "context-42",
  output = "application/json"
} = {}) {
  return {
    message: {
      messageId,
      contextId,
      role: "ROLE_USER",
      parts: [{ text, mediaType: "text/plain" }]
    },
    configuration: { acceptedOutputModes: [output] }
  };
}

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
  const response = beacon.sendMessage(a2aRequest(rawText));

  assert.equal(response.message.messageId, "response-id");
  assert.equal(observations.length, 1);
  assert.equal(validateObservation(observations[0]), true, JSON.stringify(validateObservation.errors));
  assert.equal(observations[0].intent, "business_proposal");
  assert.equal(observations[0].priority, "high");
  assert.equal(observations[0].identifier, "epbs.eth");
  assert.equal(JSON.stringify(observations[0]).includes(rawText), false);
  assert.equal(JSON.stringify(observations[0]).includes("external-agent-42"), false);
  assert.deepEqual(response.message.parts[0].data.humanFollowUp, PUBLIC_HUMAN_FOLLOW_UP);
});

test("recognized commercial interest emits one closed platform transport candidate", () => {
  const observations = [];
  const transportCandidates = [];
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: Object.freeze({ record: (event) => observations.push(event) }),
    sanitizedSignalLogger: Object.freeze({ record: (event) => transportCandidates.push(event) })
  });

  const rawText = "We want to acquire epbs.eth for 999 ETH confidential-marker";
  beacon.sendMessage(a2aRequest(rawText));

  assert.equal(observations.length, 1);
  assert.equal(transportCandidates.length, 1);
  const event = transportCandidates[0];
  assert.equal(event.schema, "vortik_sanitized_commercial_signal_log/1.0.0");
  assert.equal(event.signal.identifier, "epbs.eth");
  assert.equal(event.signal.intent, "commercial_interest");
  assert.equal(JSON.stringify(event).includes(rawText), false);
  assert.equal(JSON.stringify(event).includes("999"), false);
  assert.equal(JSON.stringify(event).includes("confidential-marker"), false);
});

test("ordinary research emits no platform transport candidate", () => {
  const transportCandidates = [];
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: null,
    sanitizedSignalLogger: Object.freeze({ record: (event) => transportCandidates.push(event) })
  });

  beacon.sendMessage(a2aRequest("research epbs.eth"));
  assert.equal(transportCandidates.length, 0);
});

test("recognized commercial interest receives a voluntary machine-readable human follow-up channel", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: null
  });

  const response = beacon.sendMessage(a2aRequest("We want to acquire epbs.eth and discuss an offer"));
  const followUp = response.message.parts[0].data.humanFollowUp;

  assert.deepEqual(followUp, PUBLIC_HUMAN_FOLLOW_UP);
  assert.equal(followUp.channel, "email");
  assert.equal(followUp.address, "vortik.art+registry@gmail.com");
  assert.equal(followUp.voluntary, true);
  assert.equal(followUp.human_authorization_required, true);
  assert.equal(followUp.beacon_stores_contact, false);
});

test("recognized commercial interest receives the same follow-up channel in text mode", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: null
  });

  const response = beacon.sendMessage(a2aRequest(
    "We are interested in buying epbs.eth",
    { output: "text/plain" }
  ));
  const text = response.message.parts[0].text;

  assert.match(text, /Optional human follow-up: vortik\.art\+registry@gmail\.com/u);
  assert.match(text, /does not retain your contact details/u);
});

test("ordinary ENS research does not expose the follow-up channel", () => {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: "https://example.test",
    idFactory: () => "response-id",
    observationLogger: null
  });

  const jsonResponse = beacon.sendMessage(a2aRequest("research epbs.eth"));
  assert.equal(Object.hasOwn(jsonResponse.message.parts[0].data, "humanFollowUp"), false);

  const textResponse = beacon.sendMessage(a2aRequest(
    "research epbs.eth",
    { output: "text/plain" }
  ));
  assert.equal(textResponse.message.parts[0].text.includes(PUBLIC_HUMAN_FOLLOW_UP.address), false);
});
