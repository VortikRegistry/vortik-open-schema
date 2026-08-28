import { randomUUID } from "node:crypto";

import {
  MAX_PUBLIC_RECEPTION_TEXT_CHARS,
  normalizePublicReceptionText,
  routePublicReception
} from "./public-reception-router.mjs";

export const A2A_PROTOCOL_BINDING = "HTTP+JSON";
export const A2A_PROTOCOL_VERSION = "1.0";
export const A2A_AGENT_VERSION = "0.2.0";
export const MAX_DISCOVERY_QUERY_CHARS = MAX_PUBLIC_RECEPTION_TEXT_CHARS;

const PUBLIC_SITE = "https://vortikregistry.github.io/vortik-open-schema/";
const PUBLIC_REPOSITORY = "https://github.com/VortikRegistry/vortik-open-schema";
const PUBLIC_DOCS = `${PUBLIC_REPOSITORY}/blob/main/docs`;

const AUTHORITY = Object.freeze({
  protocolAuthority: false,
  ensAuthority: false,
  ownershipInference: false
});

const DISCOVERY_GROUPS = Object.freeze({
  epbs: Object.freeze({
    capabilityId: "ethereum_epbs_semantics",
    title: "Ethereum ePBS semantic discovery",
    summary: "Vortik publishes independent semantic artifacts for enshrined proposer-builder separation and related Ethereum coordination terminology.",
    tags: Object.freeze(["ethereum", "epbs", "proposer-builder-separation", "semantic-registry"]),
    links: Object.freeze([
      Object.freeze({ rel: "feed", href: `${PUBLIC_SITE}feeds/epbs.json` }),
      Object.freeze({ rel: "feed-index", href: `${PUBLIC_SITE}feeds/index.json` }),
      Object.freeze({ rel: "registry", href: `${PUBLIC_SITE}registry.json` }),
      Object.freeze({ rel: "anchor", href: `${PUBLIC_SITE}anchors/epbs.md` })
    ])
  }),
  inclusion: Object.freeze({
    capabilityId: "ethereum_inclusion_list_semantics",
    title: "Ethereum inclusion-list semantic discovery",
    summary: "Vortik publishes independent registry and schema artifacts for selected Ethereum inclusion-list and FOCIL terminology.",
    tags: Object.freeze(["ethereum", "inclusion-list", "focil", "semantic-registry"]),
    links: Object.freeze([
      Object.freeze({ rel: "registry", href: `${PUBLIC_SITE}registry.json` }),
      Object.freeze({ rel: "inclusion-list-schema", href: `${PUBLIC_SITE}schemas/inclusionlist/0.1-draft/schema.json` }),
      Object.freeze({ rel: "feed-index", href: `${PUBLIC_SITE}feeds/index.json` })
    ])
  }),
  ens: Object.freeze({
    capabilityId: "ens_semantic_research_contracts",
    title: "ENS semantic research discovery",
    summary: "Vortik publishes closed request and response contracts for deterministic ENS-style semantic research over canonical repository artifacts.",
    tags: Object.freeze(["ens", "ethereum", "semantic-research", "contracts"]),
    links: Object.freeze([
      Object.freeze({ rel: "request-contract", href: `${PUBLIC_SITE}schemas/queries/vortik-ens-research-request/1.0.0/schema.json` }),
      Object.freeze({ rel: "response-contract", href: `${PUBLIC_SITE}schemas/queries/vortik-ens-research-response/1.0.0/schema.json` }),
      Object.freeze({ rel: "documentation", href: `${PUBLIC_DOCS}/ens-research-client.md` })
    ])
  }),
  feeds: Object.freeze({
    capabilityId: "vortik_public_artifact_discovery",
    title: "Vortik public artifact discovery",
    summary: "Vortik publishes versioned semantic feeds, registry data and machine-readable schemas for deterministic consumption.",
    tags: Object.freeze(["vortik", "feeds", "registry", "schemas"]),
    links: Object.freeze([
      Object.freeze({ rel: "feed-index", href: `${PUBLIC_SITE}feeds/index.json` }),
      Object.freeze({ rel: "registry", href: `${PUBLIC_SITE}registry.json` }),
      Object.freeze({ rel: "agent-discovery", href: `${PUBLIC_SITE}agents/discovery.json` })
    ])
  }),
  contribution: Object.freeze({
    capabilityId: "ens_candidate_contribution_path",
    title: "ENS candidate contribution discovery",
    summary: "Vortik publishes a closed contribution contract and a GitHub Issue collaboration path for conservative review of ENS-style semantic candidates.",
    tags: Object.freeze(["ens", "contribution", "github", "semantic-registry"]),
    links: Object.freeze([
      Object.freeze({ rel: "contract", href: `${PUBLIC_SITE}schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json` }),
      Object.freeze({ rel: "documentation", href: `${PUBLIC_DOCS}/ens-candidate-contributions.md` }),
      Object.freeze({ rel: "submission", href: `${PUBLIC_REPOSITORY}/issues/new?template=ens-candidate-contribution.md` })
    ])
  }),
  generic: Object.freeze({
    capabilityId: "vortik_public_discovery",
    title: "Vortik Registry public discovery",
    summary: "Vortik is an independent semantic registry and deterministic research surface for selected Ethereum coordination terminology.",
    tags: Object.freeze(["vortik", "ethereum", "semantic-registry", "discovery"]),
    links: Object.freeze([
      Object.freeze({ rel: "agent-discovery", href: `${PUBLIC_SITE}agents/discovery.json` }),
      Object.freeze({ rel: "feed-index", href: `${PUBLIC_SITE}feeds/index.json` }),
      Object.freeze({ rel: "registry", href: `${PUBLIC_SITE}registry.json` }),
      Object.freeze({ rel: "repository", href: PUBLIC_REPOSITORY })
    ])
  })
});

const MATCHERS = Object.freeze([
  Object.freeze({ group: "contribution", terms: Object.freeze(["contribute", "contribution", "candidate", "submit semantic candidate"]) }),
  Object.freeze({ group: "epbs", terms: Object.freeze(["epbs", "proposer builder separation", "proposer-builder separation", "eip 7732", "eip-7732"]) }),
  Object.freeze({ group: "inclusion", terms: Object.freeze(["focil", "inclusion list", "inclusion-list", "eip 7805", "eip-7805"]) }),
  Object.freeze({ group: "ens", terms: Object.freeze(["ens", "ethereum name service", "semantic research"]) }),
  Object.freeze({ group: "feeds", terms: Object.freeze(["feed", "feeds", "registry", "schema", "schemas", "vortik"]) })
]);

function protocolError(reason, message) {
  return Object.assign(new Error(message), { a2aReason: reason });
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function assertOnlyKeys(value, allowed, label) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} contains unsupported field ${key}`);
  }
}

function assertBoundedId(value, label, { required = false } = {}) {
  if (value === undefined && !required) return;
  if (typeof value !== "string" || value.length < 1 || value.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(value)) {
    throw new Error(`${label} must be a bounded opaque identifier`);
  }
}

function assertOptionalMetadata(value, label) {
  if (value === undefined) return;
  assertPlainObject(value, label);
}

function assertOptionalExtensions(value) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > 8 || value.some((entry) => typeof entry !== "string" || entry.length < 1 || entry.length > 512)) {
    throw new Error("message extensions must be a bounded string array");
  }
}

function assertDiscoveryText(text) {
  if (typeof text !== "string") throw new Error("A2A discovery requires one text part");
  if (text.length < 1 || text.length > MAX_DISCOVERY_QUERY_CHARS) {
    throw new Error(`A2A discovery text must be 1-${MAX_DISCOVERY_QUERY_CHARS} characters`);
  }
  if (/\b(?:https?|ftp):\/\//i.test(text) || /\bwww\./i.test(text)) {
    throw new Error("caller-controlled URLs are not accepted by the Reception beacon");
  }
  if (/\0/.test(text)) throw new Error("A2A discovery text contains a forbidden control character");
  return normalizePublicReceptionText(text);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesClosedTerm(normalized, term) {
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(term)}(?:$|[^a-z0-9])`);
  return pattern.test(normalized);
}

function chooseGroup(normalized) {
  for (const matcher of MATCHERS) {
    if (matcher.terms.some((term) => matchesClosedTerm(normalized, term))) return DISCOVERY_GROUPS[matcher.group];
  }
  return DISCOVERY_GROUPS.generic;
}

function validateConfiguration(configuration) {
  if (configuration === undefined) return Object.freeze(["text/plain"]);
  assertPlainObject(configuration, "A2A send configuration");
  assertOnlyKeys(configuration, new Set(["acceptedOutputModes", "taskPushNotificationConfig", "historyLength", "returnImmediately"]), "A2A send configuration");

  if (configuration.taskPushNotificationConfig !== undefined) {
    throw protocolError("PUSH_NOTIFICATION_NOT_SUPPORTED", "push notifications are not supported by the Reception beacon");
  }
  if (configuration.historyLength !== undefined && (!Number.isSafeInteger(configuration.historyLength) || configuration.historyLength < 0 || configuration.historyLength > 1000)) {
    throw new Error("historyLength must be an integer between 0 and 1000");
  }
  if (configuration.returnImmediately !== undefined && typeof configuration.returnImmediately !== "boolean") {
    throw new Error("returnImmediately must be boolean");
  }

  const modes = configuration.acceptedOutputModes;
  if (modes === undefined) return Object.freeze(["text/plain"]);
  if (!Array.isArray(modes) || modes.length < 1 || modes.length > 8) {
    throw new Error("acceptedOutputModes must contain one to eight media types");
  }
  const unique = [...new Set(modes)];
  if (unique.length !== modes.length || unique.some((mode) => typeof mode !== "string" || mode.length > 128)) {
    throw new Error("acceptedOutputModes must contain unique bounded strings");
  }
  const supported = unique.filter((mode) => mode === "text/plain" || mode === "application/json");
  if (supported.length === 0) {
    throw protocolError("CONTENT_TYPE_NOT_SUPPORTED", "none of the requested output media types are supported");
  }
  return Object.freeze(supported);
}

function validateSendMessageRequest(request) {
  assertPlainObject(request, "A2A send-message request");
  assertOnlyKeys(request, new Set(["message", "configuration", "metadata", "tenant"]), "A2A send-message request");
  assertOptionalMetadata(request.metadata, "A2A send request metadata");
  if (request.tenant !== undefined && request.tenant !== "") throw new Error("tenant routing is not configured for this AgentInterface");

  const message = request.message;
  assertPlainObject(message, "A2A user message");
  assertOnlyKeys(message, new Set(["messageId", "contextId", "taskId", "referenceTaskIds", "role", "parts", "metadata", "extensions"]), "A2A user message");
  assertBoundedId(message.messageId, "messageId", { required: true });
  assertBoundedId(message.contextId, "contextId");
  assertOptionalMetadata(message.metadata, "A2A message metadata");
  assertOptionalExtensions(message.extensions);
  if (message.taskId !== undefined) {
    assertBoundedId(message.taskId, "taskId", { required: true });
    throw protocolError("TASK_NOT_FOUND", "the stateless Reception beacon retains no tasks");
  }
  if (message.referenceTaskIds !== undefined) {
    if (!Array.isArray(message.referenceTaskIds) || message.referenceTaskIds.length > 8) throw new Error("referenceTaskIds must be a bounded array");
    for (const taskId of message.referenceTaskIds) assertBoundedId(taskId, "referenceTaskId", { required: true });
    if (message.referenceTaskIds.length > 0) throw protocolError("TASK_NOT_FOUND", "the stateless Reception beacon retains no referenced tasks");
  }
  if (message.role !== "ROLE_USER") throw new Error("A2A discovery accepts only ROLE_USER messages");
  if (!Array.isArray(message.parts) || message.parts.length !== 1) {
    throw new Error("A2A discovery requires exactly one message part");
  }

  const part = message.parts[0];
  assertPlainObject(part, "A2A message part");
  assertOnlyKeys(part, new Set(["text", "mediaType", "filename", "metadata"]), "A2A message part");
  assertOptionalMetadata(part.metadata, "A2A message part metadata");
  if (part.mediaType !== undefined && part.mediaType !== "text/plain") {
    throw protocolError("CONTENT_TYPE_NOT_SUPPORTED", "the Reception beacon accepts only text/plain input parts");
  }
  if (part.filename !== undefined && (typeof part.filename !== "string" || part.filename.length > 128)) {
    throw new Error("message part filename must be a bounded string");
  }
  const normalizedQuery = assertDiscoveryText(part.text);
  if (!normalizedQuery) throw new Error("A2A discovery text is empty after normalization");
  const acceptedOutputModes = validateConfiguration(request.configuration);
  return Object.freeze({
    queryText: part.text,
    normalizedQuery,
    acceptedOutputModes,
    contextId: message.contextId
  });
}

function receptionMetadata(reception) {
  return Object.freeze({
    protocol: reception.protocol,
    version: reception.version,
    intent: reception.intent,
    status: reception.status,
    route: reception.route,
    confidence: reception.confidence,
    ...(reception.identifier === undefined ? {} : { identifier: reception.identifier })
  });
}

function responseData(group, reception) {
  return Object.freeze({
    capabilityId: group.capabilityId,
    title: group.title,
    summary: group.summary,
    tags: [...group.tags],
    links: group.links.map((link) => ({ ...link })),
    authority: { ...AUTHORITY },
    externalRetrieval: false,
    persistentTask: false,
    reception: receptionMetadata(reception),
    ...(reception.ensResearch === undefined
      ? {}
      : { ensResearch: structuredClone(reception.ensResearch) }),
    ...(reception.publicSignal === undefined
      ? {}
      : { publicSignal: { ...reception.publicSignal } })
  });
}

function researchResponseText(reception) {
  const research = reception.ensResearch;
  const lines = [
    "Vortik ENS semantic research",
    `Name: ${research.query.normalized_name ?? "unsupported"}`,
    `State: ${research.result.state}`
  ];
  if (research.result.registry_entry) {
    lines.push(`Canonical term: ${research.result.registry_entry.canonical_term}`);
    lines.push(`Registry status: ${research.result.registry_entry.status}`);
  }
  if (research.result.related_terms.length > 0) {
    lines.push(`Related terms: ${research.result.related_terms.map((entry) => entry.term).join(", ")}`);
  }
  for (const evidence of research.result.evidence) {
    lines.push(`Evidence: ${evidence.reference}`);
  }
  for (const limitation of research.result.limitations) {
    lines.push(`Limitation: ${limitation}`);
  }
  lines.push("Authority: independent Vortik research only; no Ethereum, ENS, ownership or commercial authority is asserted.");
  return lines.join("\n");
}

function responseText(group, reception) {
  if (reception.ensResearch) return researchResponseText(reception);
  if (reception.intent === "commercial_interest") {
    return [
      "Vortik public Reception",
      `Intent: ${reception.intent}`,
      `Status: ${reception.status}`,
      "Only a bounded non-sensitive signal was recognized.",
      "No availability, price, negotiation, transfer or private routing is asserted.",
      "Authority: informational routing only; human authorization remains required."
    ].join("\n");
  }
  const links = group.links.map((link) => `${link.rel}: ${link.href}`).join("\n");
  return `${group.title}\n${group.summary}\nReception intent: ${reception.intent}\n${links}\nAuthority: independent Vortik discovery only; no Ethereum or ENS authority is asserted.`;
}

export function assertPublicBaseUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.length < 1 || rawUrl.length > 2048) {
    throw new Error("publicBaseUrl must be a bounded HTTPS URL");
  }
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("publicBaseUrl must be a valid HTTPS URL");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("publicBaseUrl must be a credential-free HTTPS origin");
  }
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new Error("publicBaseUrl must not contain a path");
  }
  return url.origin;
}

export function buildPublicA2AAgentCard({ publicBaseUrl }) {
  const origin = assertPublicBaseUrl(publicBaseUrl);
  return Object.freeze({
    name: "Vortik Registry Reception Beacon",
    description: "Read-only deterministic Reception routing, ENS semantic research and discovery over public Vortik artifacts.",
    supportedInterfaces: Object.freeze([
      Object.freeze({
        url: `${origin}/a2a/v1`,
        protocolBinding: A2A_PROTOCOL_BINDING,
        protocolVersion: A2A_PROTOCOL_VERSION
      })
    ]),
    provider: Object.freeze({
      organization: "Vortik Registry",
      url: PUBLIC_SITE
    }),
    version: A2A_AGENT_VERSION,
    documentationUrl: `${PUBLIC_DOCS}/public-a2a-beacon.md`,
    capabilities: Object.freeze({
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false
    }),
    defaultInputModes: Object.freeze(["text/plain"]),
    defaultOutputModes: Object.freeze(["text/plain", "application/json"]),
    skills: Object.freeze([
      Object.freeze({ id: "ethereum-epbs-semantics", name: "Ethereum ePBS semantics", description: "Locate Vortik public artifacts for ePBS and proposer-builder separation terminology.", tags: Object.freeze(["ethereum", "epbs", "semantics"]) }),
      Object.freeze({ id: "ethereum-inclusion-list-semantics", name: "Ethereum inclusion-list semantics", description: "Locate Vortik public artifacts for inclusion-list and FOCIL terminology.", tags: Object.freeze(["ethereum", "inclusion-list", "focil"]) }),
      Object.freeze({ id: "ens-semantic-research", name: "ENS semantic research", description: "Execute deterministic ENS-style semantic research over canonical Vortik artifacts.", tags: Object.freeze(["ens", "semantic-research", "contracts"]) }),
      Object.freeze({ id: "vortik-public-artifacts", name: "Vortik public artifacts", description: "Locate Vortik feed, registry, schema and contribution entry points.", tags: Object.freeze(["vortik", "feeds", "registry", "schemas"]) }),
      Object.freeze({ id: "vortik-public-reception", name: "Vortik public Reception", description: "Classify bounded public intents without external retrieval, private memory or action authority.", tags: Object.freeze(["routing", "reception", "read-only"]) })
    ])
  });
}

export function createPublicA2ABeacon({ publicBaseUrl, idFactory = randomUUID } = {}) {
  if (typeof idFactory !== "function") throw new TypeError("idFactory must be a function");
  const agentCard = buildPublicA2AAgentCard({ publicBaseUrl });

  return Object.freeze({
    agentCard,
    sendMessage(request) {
      const validated = validateSendMessageRequest(request);
      const contextId = validated.contextId ?? idFactory();
      const messageId = idFactory();
      assertBoundedId(contextId, "generated contextId", { required: true });
      assertBoundedId(messageId, "generated messageId", { required: true });
      const reception = routePublicReception({
        text: validated.queryText,
        requestId: messageId
      });
      const group = reception.discoveryGroup === "auto"
        ? chooseGroup(validated.normalizedQuery)
        : DISCOVERY_GROUPS[reception.discoveryGroup];
      if (!group) throw new Error("Reception selected an unsupported discovery group");
      const useJson = validated.acceptedOutputModes.includes("application/json") && !validated.acceptedOutputModes.includes("text/plain");
      const part = useJson
        ? Object.freeze({ data: responseData(group, reception), mediaType: "application/json" })
        : Object.freeze({ text: responseText(group, reception), mediaType: "text/plain" });
      return Object.freeze({
        message: Object.freeze({
          messageId,
          contextId,
          role: "ROLE_AGENT",
          parts: Object.freeze([part])
        })
      });
    }
  });
}
