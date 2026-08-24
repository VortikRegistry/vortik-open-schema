import { randomUUID } from "node:crypto";

export const A2A_PROTOCOL_BINDING = "HTTP+JSON";
export const A2A_PROTOCOL_VERSION = "1.0";
export const A2A_AGENT_VERSION = "0.1.0";
export const MAX_DISCOVERY_QUERY_CHARS = 512;

const PUBLIC_SITE = "https://vortikregistry.github.io/vortik-open-schema/";
const PUBLIC_REPOSITORY = "https://github.com/VortikRegistry/vortik-open-schema";

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
      Object.freeze({ rel: "schema-index", href: `${PUBLIC_SITE}schemas/` }),
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
      Object.freeze({ rel: "documentation", href: `${PUBLIC_SITE}ens-research-client.html` })
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
      Object.freeze({ rel: "documentation", href: `${PUBLIC_SITE}ens-candidate-contributions.html` }),
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
  Object.freeze({ group: "epbs", terms: Object.freeze(["epbs", "proposer builder separation", "proposer-builder separation", "eip 7732", "eip-7732"]) }),
  Object.freeze({ group: "inclusion", terms: Object.freeze(["focil", "inclusion list", "inclusion-list", "eip 7805", "eip-7805"]) }),
  Object.freeze({ group: "ens", terms: Object.freeze(["ens", "ethereum name service", "semantic research"]) }),
  Object.freeze({ group: "contribution", terms: Object.freeze(["contribute", "contribution", "candidate", "submit semantic candidate"]) }),
  Object.freeze({ group: "feeds", terms: Object.freeze(["feed", "feeds", "registry", "schema", "schemas", "vortik"]) })
]);

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

function normalizeQuery(text) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9._ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assertDiscoveryText(text) {
  if (typeof text !== "string") throw new Error("A2A discovery requires one text part");
  if (text.length < 1 || text.length > MAX_DISCOVERY_QUERY_CHARS) {
    throw new Error(`A2A discovery text must be 1-${MAX_DISCOVERY_QUERY_CHARS} characters`);
  }
  if (/\b(?:https?|ftp):\/\//i.test(text) || /\bwww\./i.test(text)) {
    throw new Error("caller-controlled URLs are not accepted by the discovery beacon");
  }
  if (/\0/.test(text)) throw new Error("A2A discovery text contains a forbidden control character");
  return normalizeQuery(text);
}

function chooseGroup(normalized) {
  for (const matcher of MATCHERS) {
    if (matcher.terms.some((term) => normalized.includes(term))) return DISCOVERY_GROUPS[matcher.group];
  }
  return DISCOVERY_GROUPS.generic;
}

function validateConfiguration(configuration) {
  if (configuration === undefined) return Object.freeze(["text/plain"]);
  assertPlainObject(configuration, "A2A send configuration");
  assertOnlyKeys(configuration, new Set(["acceptedOutputModes"]), "A2A send configuration");
  const modes = configuration.acceptedOutputModes;
  if (!Array.isArray(modes) || modes.length < 1 || modes.length > 2) {
    throw new Error("acceptedOutputModes must contain one or two supported media types");
  }
  const unique = [...new Set(modes)];
  if (unique.length !== modes.length || unique.some((mode) => mode !== "text/plain" && mode !== "application/json")) {
    throw new Error("acceptedOutputModes contains an unsupported media type");
  }
  return Object.freeze(unique);
}

function validateSendMessageRequest(request) {
  assertPlainObject(request, "A2A send-message request");
  assertOnlyKeys(request, new Set(["message", "configuration"]), "A2A send-message request");
  const message = request.message;
  assertPlainObject(message, "A2A user message");
  assertOnlyKeys(message, new Set(["messageId", "contextId", "role", "parts"]), "A2A user message");
  assertBoundedId(message.messageId, "messageId", { required: true });
  assertBoundedId(message.contextId, "contextId");
  if (message.role !== "ROLE_USER") throw new Error("A2A discovery accepts only ROLE_USER messages");
  if (!Array.isArray(message.parts) || message.parts.length !== 1) {
    throw new Error("A2A discovery requires exactly one message part");
  }
  const part = message.parts[0];
  assertPlainObject(part, "A2A message part");
  assertOnlyKeys(part, new Set(["text"]), "A2A message part");
  const normalizedQuery = assertDiscoveryText(part.text);
  if (!normalizedQuery) throw new Error("A2A discovery text is empty after normalization");
  const acceptedOutputModes = validateConfiguration(request.configuration);
  return Object.freeze({ normalizedQuery, acceptedOutputModes, contextId: message.contextId });
}

function responseData(group) {
  return Object.freeze({
    capabilityId: group.capabilityId,
    title: group.title,
    summary: group.summary,
    tags: [...group.tags],
    links: group.links.map((link) => ({ ...link })),
    authority: { ...AUTHORITY },
    externalRetrieval: false,
    persistentTask: false
  });
}

function responseText(group) {
  const links = group.links.map((link) => `${link.rel}: ${link.href}`).join("\n");
  return `${group.title}\n${group.summary}\n${links}\nAuthority: independent Vortik discovery only; no Ethereum or ENS authority is asserted.`;
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
    name: "Vortik Registry Discovery Beacon",
    description: "Read-only deterministic discovery for selected Ethereum coordination semantics and public Vortik artifacts.",
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
    documentationUrl: `${PUBLIC_SITE}public-a2a-beacon.html`,
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
      Object.freeze({ id: "ens-semantic-research", name: "ENS semantic research", description: "Locate closed Vortik contracts for deterministic ENS-style semantic research.", tags: Object.freeze(["ens", "semantic-research", "contracts"]) }),
      Object.freeze({ id: "vortik-public-artifacts", name: "Vortik public artifacts", description: "Locate Vortik feed, registry, schema and contribution entry points.", tags: Object.freeze(["vortik", "feeds", "registry", "schemas"]) })
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
      const group = chooseGroup(validated.normalizedQuery);
      const contextId = validated.contextId ?? idFactory();
      const messageId = idFactory();
      assertBoundedId(contextId, "generated contextId", { required: true });
      assertBoundedId(messageId, "generated messageId", { required: true });
      const useJson = validated.acceptedOutputModes.includes("application/json") && !validated.acceptedOutputModes.includes("text/plain");
      const part = useJson
        ? Object.freeze({ data: responseData(group), mediaType: "application/json" })
        : Object.freeze({ text: responseText(group) });
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
