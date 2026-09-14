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

function defaultObservationLogger() {
  return process.env.K_SERVICE
    ? createStructuredReceptionLogger()
    : null;
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
      if (observationLogger === null) return response;

      try {
        const inboundMessageId = request.message.messageId;
        const queryText = request.message.parts[0].text;
        const contextId = response.message.contextId;
        const generatedMessageId = response.message.messageId;
        const reception = routePublicReception({
          text: queryText,
          requestId: generatedMessageId
        });
        const observedReception = deriveObservedReception(reception, queryText);
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

      return response;
    }
  });
}
