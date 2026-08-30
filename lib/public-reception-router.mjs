import { researchEnsName } from "./ens-research-client.mjs";
import { normalizeSupportedEnsName } from "./ens-research-evaluator.mjs";

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

const DOTTED_VERSION_PATTERN = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/iu;
const SINGLE_IPV4_NUMBER_PATTERN = /^(?:0x[0-9a-f]+|0[0-7]+|\d+)$/iu;
const SUPPORTED_SPACED_EIP_NUMBER_PATTERN = /^(?:7732|7805)$/u;
const CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN = /^[\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}.]+$/u;

function createClosedTextTokenMatcher() {
  return /[^\s!"#$%&'()*+,/:;<=>?@\[\]\\^`{|}~]+/gu;
}

function createPercentAwareTextTokenMatcher() {
  return /[^\s!"#$&'()*+,/:;<=>?@\[\]\\^`{|}~]+/gu;
}

function isExplicitDottedVersion(text, token, tokenIndex) {
  if (!DOTTED_VERSION_PATTERN.test(token)) return false;
  if (/^v/iu.test(token)) return true;
  return /(?:^|[^\p{L}\p{N}])(?:schema|version|release|contract)\s*$/iu.test(
    text.slice(0, tokenIndex)
  );
}

function isExplicitEthAmount(text, rawToken, tokenIndex) {
  if (!/^\d+(?:\.\d+)?$/u.test(rawToken)) return false;
  return /^\s+eth(?:$|[^\p{L}\p{N}])/iu.test(
    text.slice(tokenIndex + rawToken.length)
  );
}

function isExplicitSupportedEipReference(text, rawToken, tokenIndex) {
  if (!SUPPORTED_SPACED_EIP_NUMBER_PATTERN.test(rawToken)) return false;
  return /(?:^|[^\p{L}\p{N}])eip\s*$/iu.test(text.slice(0, tokenIndex));
}

function decodeUrlPercentEscapes(text) {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/gu, (encoded) => {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  });
}

function hasSchemelessHostname(text, { allowEnsExemption = true } = {}) {
  // Keep the normalized caller token byte-for-character here. WHATWG handles its
  // own Unicode hostname separators during parsing; preserving them lets the ENS
  // exemption use the same literal `.eth` identity signal as inspectEnsNames().
  const hostnameText = text;
  const tokenMatcher = createClosedTextTokenMatcher();
  let match;
  while ((match = tokenMatcher.exec(hostnameText)) !== null) {
    const rawToken = match[0];
    const token = rawToken.replace(/^\.+|\.+$/gu, "");
    const parseToken = rawToken.replace(/^\.+/gu, "");
    const lowerToken = token.toLowerCase();
    const hasDot = /[.\u3002\uFF0E\uFF61]/u.test(rawToken);
    const isSupportedEnsName = allowEnsExemption
      && normalizeSupportedEnsName(lowerToken) === lowerToken;
    if (
      isSupportedEnsName
      || isExplicitDottedVersion(hostnameText, lowerToken, match.index)
      || isExplicitEthAmount(hostnameText, rawToken, match.index)
      || isExplicitSupportedEipReference(hostnameText, rawToken, match.index)
      || (!hasDot && !SINGLE_IPV4_NUMBER_PATTERN.test(lowerToken))
    ) continue;

    try {
      const parsed = new URL(`https://${parseToken}`);
      const asciiHostname = parsed.hostname.toLowerCase();
      const asciiLabels = asciiHostname.split(".");
      const isParsedIpv4 = asciiLabels.length === 4 && asciiLabels.every(
        (label) => /^\d{1,3}$/u.test(label) && Number(label) <= 255
      );
      if (isParsedIpv4) return true;

      const hasCanonicalDnsLabels = asciiHostname.length <= 253
        && asciiLabels.length >= 2
        && asciiLabels.every((label) => (
          label.length <= 63
          && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u.test(label)
        ));
      if (hasCanonicalDnsLabels) {
        if (
          allowEnsExemption
          && lowerToken.endsWith(".eth")
          && CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerToken)
        ) continue;
        return true;
      }

      if (asciiLabels.length >= 2) {
        if (allowEnsExemption && lowerToken.includes(".eth")) continue;
        return true;
      }
    } catch {
      // A token the platform URL parser rejects is not treated as a hostname.
    }
  }
  return /(?:^|[^\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}])localhost(?:$|[^\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}])/iu.test(hostnameText);
}

function hasPercentDecodedHostname(text) {
  const tokenMatcher = createPercentAwareTextTokenMatcher();
  let match;
  while ((match = tokenMatcher.exec(text)) !== null) {
    const rawToken = match[0];
    if (!/%[0-9A-Fa-f]{2}/u.test(rawToken)) continue;
    const decodedToken = decodeUrlPercentEscapes(rawToken)
      .normalize("NFKC")
      .replace(/[\t\n\r]/gu, "");
    if (decodedToken === rawToken) continue;
    if (hasSchemelessHostname(decodedToken, { allowEnsExemption: false })) return true;
  }
  return false;
}

function hasAuthorityUserinfoSyntax(text) {
  // Match the authority itself, not surrounding sentence/URL punctuation. This
  // uses the same closed delimiter set as Reception's tokenization but keeps `@`
  // inside the candidate so wrapped forms cannot expose an ENS suffix downstream.
  const matcher = /[^\s!"#$%&'()*+,/:;<=>?@\[\]\\^`{|}~]+@[^\s!"#$%&'()*+,/:;<=>?@\[\]\\^`{|}~]+/gu;
  let match;
  while ((match = matcher.exec(text)) !== null) {
    try {
      const parsed = new URL(`https://${match[0]}`);
      if (parsed.username || parsed.password) return true;
    } catch {
      // Only complete authority spans accepted by WHATWG are rejected here.
    }
  }
  return false;
}

export function hasCallerControlledUrlSyntax(text) {
  if (typeof text !== "string") {
    throw new TypeError("Reception URL inspection text must be a string");
  }
  const normalizedOriginalText = text
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, "");
  if (hasPercentDecodedHostname(normalizedOriginalText)) return true;

  const normalizedText = decodeUrlPercentEscapes(normalizedOriginalText)
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, "");
  return (
    /[A-Za-z][A-Za-z0-9+.-]*:/u.test(normalizedText)
    || /[\\/]/u.test(normalizedText)
    || /\bwww[.\u3002\uFF0E\uFF61]/iu.test(normalizedText)
    || /(?:^|\s)\S*[?#]\S+/u.test(normalizedText)
    || /\[[0-9A-Fa-f:.]*:[0-9A-Fa-f:.]*\]/u.test(normalizedText)
    || hasAuthorityUserinfoSyntax(normalizedText)
    || hasSchemelessHostname(normalizedText)
  );
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
  if (hasCallerControlledUrlSyntax(descriptors.text.value)) {
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

function inspectEnsNames(text) {
  const names = [];
  const spans = [];
  const matcher = createClosedTextTokenMatcher();
  let malformedIdentifier = false;
  let match;
  while ((match = matcher.exec(text)) !== null) {
    const leadingDots = /^\.+/u.exec(match[0])?.[0].length ?? 0;
    const rawIdentifier = match[0].slice(leadingDots).replace(/\.+$/u, "");
    const identifier = rawIdentifier.normalize("NFKC");
    if (!identifier.toLowerCase().includes(".eth")) continue;
    const name = normalizeSupportedEnsName(identifier);
    if (name === null) {
      malformedIdentifier = true;
      continue;
    }
    if (!names.includes(name)) names.push(name);
    const start = match.index + leadingDots;
    spans.push(Object.freeze({ start, end: start + rawIdentifier.length }));
  }
  return Object.freeze({
    names: Object.freeze(names),
    spans: Object.freeze(spans),
    malformedIdentifier
  });
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
  assertPlainClosedInput(input);
  const ensInspection = inspectEnsNames(input.text);
  const names = ensInspection.names;
  const normalizedText = normalizePublicReceptionText(
    maskEnsNamesForIntent(input.text, ensInspection.spans)
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
