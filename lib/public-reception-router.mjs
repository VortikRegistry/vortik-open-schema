import { researchEnsName } from "./ens-research-client.mjs";
import { analyzePublicReceptionInputText } from "./public-reception-input-classifier.mjs";

export const PUBLIC_RECEPTION_PROTOCOL = "vortik-public-reception";
export const PUBLIC_RECEPTION_VERSION = "1.0.0";
export const MAX_PUBLIC_RECEPTION_TEXT_CHARS = 512;

const INPUT_KEYS = new Set(["text", "requestId"]);
const CANDIDATE_TERMS = Object.freeze([
  "candidate submission",
  "submit candidate",
  "semantic candidate",
  "candidate"
]);
const EVIDENCE_TERMS = Object.freeze([
  "contribute evidence",
  "evidence contribution",
  "contribution",
  "contribute"
]);
const COMMERCIAL_TERMS = Object.freeze([
  "commercial interest",
  "acquisition interest",
  "interested in acquiring",
  "interested in buying",
  "acquire",
  "purchase",
  "buy",
  "offer"
]);
const CAPABILITY_TERMS = Object.freeze([
  "capabilities",
  "capability discovery",
  "what can you do",
  "help"
]);
const REGISTRY_TERMS = Object.freeze([
  "registry lookup",
  "registry",
  "feed",
  "feeds",
  "schema",
  "schemas"
]);
const TECHNICAL_TERMS = Object.freeze([
  "technical context",
  "epbs",
  "proposer builder separation",
  "proposer-builder separation",
  "eip 7732",
  "eip-7732",
  "focil",
  "inclusion list",
  "inclusion-list",
  "eip 7805",
  "eip-7805",
  "ethereum name service",
  "semantic research",
  "ens"
]);

export function hasCallerControlledUrlSyntax(text) {
  return analyzePublicReceptionInputText(text).callerControlledUrl;
}

function assertPlainClosedInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Reception input must be an object");
  }
  if (Object.getPrototypeOf(input) !== Object.prototype) {
    throw new TypeError("Reception input must use Object.prototype");
  }
  if (Object.getOwnPropertySymbols(input).length !== 0) {
    throw new TypeError("Reception input must not contain symbol properties");
  }
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const keys = Object.keys(descriptors);
  if (keys.length !== INPUT_KEYS.size || keys.some((key) => !INPUT_KEYS.has(key))) {
    throw new Error("Reception input fields do not match the closed contract");
  }
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!("value" in descriptor) || descriptor.enumerable !== true) {
      throw new TypeError(`Reception input.${key} must be an enumerable data property`);
    }
  }
  if (
    typeof descriptors.text.value !== "string"
    || descriptors.text.value.length < 1
    || Array.from(descriptors.text.value).length > MAX_PUBLIC_RECEPTION_TEXT_CHARS
  ) {
    throw new TypeError("Reception text must be a non-empty bounded string");
  }

  const textAnalysis = analyzePublicReceptionInputText(descriptors.text.value);
  if (textAnalysis.callerControlledUrl) {
    throw new Error("Caller-controlled URLs are not accepted by Reception");
  }
  if (/\0/u.test(descriptors.text.value)) {
    throw new Error("Reception text contains a forbidden control character");
  }
  if (
    typeof descriptors.requestId.value !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(descriptors.requestId.value)
  ) {
    throw new Error("Reception requestId must use the ENS-compatible identifier contract");
  }
  return textAnalysis;
}

export function normalizePublicReceptionText(text) {
  if (typeof text !== "string") throw new TypeError("Reception text must be a string");
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9._ -]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesClosedTerm(normalizedText, term) {
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegex(term)}(?:$|[^a-z0-9])`, "u")
    .test(normalizedText);
}

function includesAny(normalizedText, terms) {
  return terms.some((term) => includesClosedTerm(normalizedText, term));
}

function maskEnsNamesForIntent(text, spans) {
  if (spans.length === 0) return text;
  let masked = "";
  let cursor = 0;
  for (const span of spans) {
    masked += text.slice(cursor, span.start);
    masked += " ";
    cursor = span.end;
  }
  return `${masked}${text.slice(cursor)}`;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function route({
  intent,
  status,
  routeId,
  confidence,
  discoveryGroup,
  identifier,
  ensResearch,
  publicSignal
}) {
  return deepFreeze({
    protocol: PUBLIC_RECEPTION_PROTOCOL,
    version: PUBLIC_RECEPTION_VERSION,
    intent,
    status,
    route: routeId,
    confidence,
    discoveryGroup,
    ...(identifier === undefined ? {} : { identifier }),
    ...(ensResearch === undefined ? {} : { ensResearch }),
    ...(publicSignal === undefined ? {} : { publicSignal })
  });
}

export function routePublicReception(input) {
  const textAnalysis = assertPlainClosedInput(input);
  const ensInspection = textAnalysis.ensInspection;
  const names = ensInspection.names;
  const normalizedText = normalizePublicReceptionText(
    maskEnsNamesForIntent(textAnalysis.sourceText, ensInspection.spans)
  );
  if (!normalizedText && names.length === 0) {
    throw new Error("Reception text is empty after normalization");
  }
  const uniqueIdentifier = names.length === 1 ? names[0] : undefined;

  if (ensInspection.malformedIdentifier) {
    return route({
      intent: "unsupported",
      status: "not_supported",
      routeId: "public_capability_discovery",
      confidence: "deterministic",
      discoveryGroup: "generic"
    });
  }

  if (includesAny(normalizedText, CANDIDATE_TERMS)) {
    return route({
      intent: "candidate_submission",
      status: uniqueIdentifier ? "routed" : "needs_bounded_identifier",
      routeId: "public_github_issue_path",
      confidence: "explicit",
      discoveryGroup: "contribution",
      identifier: uniqueIdentifier
    });
  }

  if (includesAny(normalizedText, EVIDENCE_TERMS)) {
    return route({
      intent: "evidence_contribution",
      status: "routed",
      routeId: "public_contribution_contract",
      confidence: "explicit",
      discoveryGroup: "contribution",
      identifier: uniqueIdentifier
    });
  }

  if (includesAny(normalizedText, COMMERCIAL_TERMS)) {
    const recognized = names.length === 1;
    return route({
      intent: "commercial_interest",
      status: recognized ? "recognized" : "needs_bounded_identifier",
      routeId: "sanitized_signal_only",
      confidence: recognized ? "high" : "low",
      discoveryGroup: "generic",
      identifier: uniqueIdentifier,
      publicSignal: {
        identifier: uniqueIdentifier ?? null,
        normalizedIntent: "commercial_interest",
        routingReason: recognized
          ? "explicit_interest_language_with_single_ens_identifier"
          : "ambiguous_or_missing_ens_identifier",
        confidence: recognized ? "high" : "low",
        privateHandoff: false
      }
    });
  }

  if (names.length === 1) {
    const ensResearch = researchEnsName(names[0], { requestId: input.requestId });
    return route({
      intent: "ens_research",
      status: "completed",
      routeId: "canonical_local_ens_research",
      confidence: "deterministic",
      discoveryGroup: "ens",
      identifier: names[0],
      ensResearch
    });
  }

  if (names.length > 1) {
    return route({
      intent: "unsupported",
      status: "multiple_identifiers_not_supported",
      routeId: "public_capability_discovery",
      confidence: "deterministic",
      discoveryGroup: "generic"
    });
  }

  if (includesAny(normalizedText, CAPABILITY_TERMS)) {
    return route({
      intent: "capability_discovery",
      status: "completed",
      routeId: "public_capability_discovery",
      confidence: "explicit",
      discoveryGroup: "generic"
    });
  }

  if (includesAny(normalizedText, REGISTRY_TERMS)) {
    return route({
      intent: "registry_lookup",
      status: "routed",
      routeId: "allowlisted_public_artifacts",
      confidence: "explicit",
      discoveryGroup: "auto"
    });
  }

  if (includesAny(normalizedText, TECHNICAL_TERMS)) {
    return route({
      intent: "technical_context",
      status: "routed",
      routeId: "allowlisted_public_artifacts",
      confidence: "explicit",
      discoveryGroup: "auto"
    });
  }

  return route({
    intent: "unsupported",
    status: "not_supported",
    routeId: "public_capability_discovery",
    confidence: "deterministic",
    discoveryGroup: "generic"
  });
}
