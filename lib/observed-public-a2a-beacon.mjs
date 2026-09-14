import {
  A2A_PROTOCOL_BINDING,
  A2A_PROTOCOL_VERSION,
  A2A_AGENT_VERSION,
  MAX_DISCOVERY_QUERY_CHARS,
  assertPublicBaseUrl,
  buildPublicA2AAgentCard,
  createPublicA2ABeacon as createBasePublicA2ABeacon
} from "./public-a2a-beacon.mjs";
import { routePublicReception } from "./public-reception-router.mjs";
import {
  createReceptionObservation,
  createStructuredReceptionLogger,
  deriveObservedReception
} from "./reception-observability.mjs";

export {
  A2A_PROTOCOL_BINDING,
  A2A_PROTOCOL_VERSION,
  A2A_AGENT_VERSION,
  MAX_DISCOVERY_QUERY_CHARS,
  assertPublicBaseUrl,
  buildPublicA2AAgentCard
};

export const PUBLIC_HUMAN_FOLLOW_UP = Object.freeze({
  channel: "email",
  address: "vortik.art+registry@gmail.com",
  voluntary: true,
  human_authorization_required: true,
  beacon_stores_contact: false
});

const FOLLOW_UP_INTENTS = new Set([
  "commercial_interest",
  "business_proposal"
]);

function defaultObservationLogger() {
  return process.env.K_SERVICE
    ? createStructuredReceptionLogger()
    : null;
}

function decorateWithHumanFollowUp(response, observedReception) {
  if (!observedReception
    || !FOLLOW_UP_INTENTS.has(observedReception.intent)
    || observedReception.status !== "recognized") {
    return response;
  }

  const part = response?.message?.parts?.[0];
  if (!part || typeof part !== "object") return response;

  let decoratedPart;
  if (part.mediaType === "application/json" && part.data && typeof part.data === "object") {
    decoratedPart = Object.freeze({
      ...part,
      data: Object.freeze({
        ...part.data,
        humanFollowUp: Object.freeze({ ...PUBLIC_HUMAN_FOLLOW_UP })
      })
    });
  } else if (part.mediaType === "text/plain" && typeof part.text === "string") {
    decoratedPart = Object.freeze({
      ...part,
      text: [
        part.text,
        `Optional human follow-up: ${PUBLIC_HUMAN_FOLLOW_UP.address}`,
        "Use this channel only if you choose to continue; the Reception beacon does not retain your contact details."
      ].join("\n")
    });
  } else {
    return response;
  }

  return Object.freeze({
    ...response,
    message: Object.freeze({
      ...response.message,
      parts: Object.freeze([decoratedPart])
    })
  });
}

export function createPublicA2ABeacon({
  publicBaseUrl,
  idFactory,
  observationLogger = defaultObservationLogger()
} = {}) {
  if (observationLogger !== null
    && (!observationLogger || typeof observationLogger.record !== "function")) {
    throw new TypeError("observationLogger must expose record() or be null");
  }

  const beacon = createBasePublicA2ABeacon({ publicBaseUrl, idFactory });

  return Object.freeze({
    agentCard: beacon.agentCard,
    sendMessage(request) {
      const response = beacon.sendMessage(request);
      let observedReception = null;
      let inboundMessageId;
      let contextId;
      let generatedMessageId;

      try {
        inboundMessageId = request.message.messageId;
        const queryText = request.message.parts[0].text;
        contextId = response.message.contextId;
        generatedMessageId = response.message.messageId;
        const reception = routePublicReception({
          text: queryText,
          requestId: generatedMessageId
        });
        observedReception = deriveObservedReception(reception, queryText);
      } catch {
        // Follow-up classification is deliberately fail-soft and must never
        // alter the bounded public response contract on parsing failure.
      }

      if (observationLogger !== null && observedReception !== null) {
        try {
          const observation = createReceptionObservation({
            reception: observedReception,
            inboundMessageId,
            contextId,
            generatedMessageId
          });
          observationLogger.record(observation);
        } catch {
          // Observability is deliberately fail-soft: logging must never change
          // the bounded public response or expose caller content on error.
        }
      }

      return decorateWithHumanFollowUp(response, observedReception);
    }
  });
}
