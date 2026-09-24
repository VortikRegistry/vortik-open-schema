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
  createSanitizedCommercialSignal,
  createSanitizedCommercialSignalLogEvent
} from "./public-commercial-signal-producer.mjs";
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

// Owner-selected public destination, never derived from input or used for egress.
export const PUBLIC_HUMAN_FOLLOW_UP = Object.freeze({
  channel: "x",
  address: "https://x.com/VortikRegistry",
  voluntary: true,
  human_authorization_required: true,
  beacon_stores_contact: false
});

const HUMAN_CONTACT_NOTICE = "For a human commercial conversation, initiate contact through X · @VortikRegistry. This optional external path sends no message or owner notification from the beacon and does not guarantee a reply. No availability, price, terms or sale is confirmed; final commercial decisions require the owner's approval. Do not post confidential offers publicly.";

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
    || (observedReception.intent !== "commercial_interest"
      && observedReception.status !== "recognized")) {
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
        summary: `${part.data.summary} ${HUMAN_CONTACT_NOTICE}`,
        links: [
          ...part.data.links.map((link) => ({ ...link })),
          { rel: "human-contact", href: PUBLIC_HUMAN_FOLLOW_UP.address }
        ],
        humanFollowUp: Object.freeze({ ...PUBLIC_HUMAN_FOLLOW_UP })
      })
    });
  } else if (part.mediaType === "text/plain" && typeof part.text === "string") {
    decoratedPart = Object.freeze({
      ...part,
      text: [
        part.text,
        HUMAN_CONTACT_NOTICE,
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
  observationLogger = defaultObservationLogger(),
  sanitizedSignalLogger = defaultObservationLogger()
} = {}) {
  if (observationLogger !== null
    && (!observationLogger || typeof observationLogger.record !== "function")) {
    throw new TypeError("observationLogger must expose record() or be null");
  }
  if (sanitizedSignalLogger !== null
    && (!sanitizedSignalLogger || typeof sanitizedSignalLogger.record !== "function")) {
    throw new TypeError("sanitizedSignalLogger must expose record() or be null");
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
      let reception = null;

      try {
        inboundMessageId = request.message.messageId;
        const queryText = request.message.parts[0].text;
        contextId = response.message.contextId;
        generatedMessageId = response.message.messageId;
        reception = routePublicReception({
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

      if (sanitizedSignalLogger !== null && reception !== null) {
        try {
          const signal = createSanitizedCommercialSignal(reception);
          if (signal !== null) {
            sanitizedSignalLogger.record(createSanitizedCommercialSignalLogEvent(signal));
          }
        } catch {
          // The platform-mediated transport candidate is deliberately
          // fail-soft and never changes the public response contract.
        }
      }

      return decorateWithHumanFollowUp(response, observedReception);
    }
  });
}
