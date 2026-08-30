import { normalizeSupportedEnsName } from "./ens-research-evaluator.mjs";

const DOTTED_VERSION_PATTERN = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/iu;
const SINGLE_IPV4_NUMBER_PATTERN = /^(?:0x[0-9a-f]+|0[0-7]+|\d+)$/iu;
const SUPPORTED_SPACED_EIP_NUMBER_PATTERN = /^(?:7732|7805)$/u;
const CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN = /^[\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}.]+$/u;
const BALANCED_OUTER_WRAPPERS = new Map([
  ["(", ")"],
  ["[", "]"],
  ["{", "}"],
  ["<", ">"],
  ["\"", "\""],
  ["'", "'"]
]);

// The outer scanner owns every non-whitespace caller chunk. Authority and host
// identity are decided at that level before punctuation-aware children can expose
// a suffix that was not a standalone caller identifier.
function createReceptionChunkMatcher() {
  return /\S+/gu;
}

// This scanner is only an outer-punctuation convenience. If it would split one
// caller chunk into multiple semantic spans, the complete interior chunk is
// classified first and children are never independently interpreted as ENS.
function createReceptionSpanMatcher() {
  return /[^\s!"#$&'()*+,/:;<=>?\[\]\\^`{|}~]+/gu;
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

function normalizeInsideSpan(text) {
  return text
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, "");
}

function normalizedDecodedChunk(text) {
  return normalizeInsideSpan(decodeUrlPercentEscapes(normalizeInsideSpan(text)));
}

function isExplicitDottedVersion(sourceText, token, tokenIndex) {
  if (!DOTTED_VERSION_PATTERN.test(token)) return false;
  if (/^v/iu.test(token)) return true;
  return /(?:^|[^\p{L}\p{N}])(?:schema|version|release|contract)\s*$/iu.test(
    normalizeInsideSpan(sourceText.slice(0, tokenIndex))
  );
}

function isExplicitEthAmount(sourceText, rawToken, tokenIndex) {
  if (!/^\d+(?:\.\d+)?$/u.test(rawToken)) return false;
  return /^\s+eth(?:$|[^\p{L}\p{N}])/iu.test(
    normalizeInsideSpan(sourceText.slice(tokenIndex + rawToken.length))
  );
}

function isExplicitSupportedEipReference(sourceText, rawToken, tokenIndex) {
  if (!SUPPORTED_SPACED_EIP_NUMBER_PATTERN.test(rawToken)) return false;
  return /(?:^|[^\p{L}\p{N}])eip\s*$/iu.test(
    normalizeInsideSpan(sourceText.slice(0, tokenIndex))
  );
}

function isParsedIpv4Hostname(asciiHostname) {
  const labels = asciiHostname.split(".");
  return labels.length === 4 && labels.every(
    (label) => /^\d{1,3}$/u.test(label) && Number(label) <= 255
  );
}

function hasCanonicalDnsLabels(asciiHostname) {
  const labels = asciiHostname.split(".");
  return asciiHostname.length <= 253
    && labels.length >= 2
    && labels.every((label) => (
      label.length <= 63
      && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u.test(label)
    ));
}

function isBalancedOuterWrapper(chunk, localMatch) {
  const prefix = chunk.slice(0, localMatch.index);
  const suffix = chunk.slice(localMatch.index + localMatch[0].length);
  return prefix.length === 1
    && suffix.length === 1
    && BALANCED_OUTER_WRAPPERS.get(prefix) === suffix;
}

function classifySpan(sourceText, match, { completeHostChunk = false } = {}) {
  const sourceToken = match[0];
  const normalizedToken = normalizeInsideSpan(sourceToken);
  const decodedToken = normalizeInsideSpan(decodeUrlPercentEscapes(normalizedToken));
  const percentDecoded = decodedToken !== normalizedToken;
  const subject = percentDecoded ? decodedToken : normalizedToken;
  const leadingDots = /^\.+/u.exec(subject)?.[0].length ?? 0;
  const identityToken = subject.slice(leadingDots).replace(/\.+$/u, "");
  const lowerIdentity = identityToken.toLowerCase();
  const parseToken = subject.slice(leadingDots);
  const hasDot = /[.\u3002\uFF0E\uFF61]/u.test(subject);

  // Contextual scalar/version syntax is decided before numeric WHATWG parsing,
  // but only for literal caller text. Percent decoding never manufactures an
  // exemption because downstream consumers did not receive that literal token.
  if (!percentDecoded) {
    if (
      isExplicitDottedVersion(sourceText, lowerIdentity, match.index)
      || isExplicitEthAmount(sourceText, normalizedToken, match.index)
      || isExplicitSupportedEipReference(sourceText, normalizedToken, match.index)
    ) {
      return Object.freeze({ kind: "text" });
    }

    const supportedEnsName = normalizeSupportedEnsName(lowerIdentity);
    if (supportedEnsName === lowerIdentity) {
      const sourceLeadingDots = /^\.+/u.exec(sourceToken)?.[0].length ?? 0;
      const sourceIdentifier = sourceToken.slice(sourceLeadingDots).replace(/\.+$/u, "");
      return Object.freeze({
        kind: "ens",
        name: supportedEnsName,
        start: match.index + sourceLeadingDots,
        end: match.index + sourceLeadingDots + sourceIdentifier.length
      });
    }
  }

  // Parent chunks containing any normalized/decoded `@` are rejected before this
  // function is called. Keep this guard as defense in depth for direct reuse.
  if (subject.includes("@")) return Object.freeze({ kind: "url" });

  const shouldTryHost = hasDot
    || SINGLE_IPV4_NUMBER_PATTERN.test(lowerIdentity)
    || lowerIdentity === "localhost";
  if (!shouldTryHost) return Object.freeze({ kind: "text" });

  try {
    const parsed = new URL(`https://${parseToken}`);
    if (parsed.username || parsed.password) {
      return Object.freeze({ kind: "url" });
    }

    const asciiHostname = parsed.hostname.toLowerCase();
    if (isParsedIpv4Hostname(asciiHostname) || asciiHostname === "localhost") {
      return Object.freeze({ kind: "url" });
    }

    const asciiLabels = asciiHostname.split(".");
    if (asciiLabels.length >= 2) {
      // A parent chunk that punctuation tokenization would split is classified as
      // one hostname identity. If WHATWG accepts that complete identity, no child
      // suffix may inherit the ENS exemption, regardless of hostname punctuation.
      if (completeHostChunk) return Object.freeze({ kind: "url" });

      const canonicalDns = hasCanonicalDnsLabels(asciiHostname);
      if (!percentDecoded && lowerIdentity.includes(".eth")) {
        // Canonical DNS-shaped tokens only enter the malformed ENS lane when their
        // literal identity remains inside the closed ENS alphabet. Noncanonical
        // WHATWG hosts may remain bounded malformed ENS-like text, matching the
        // pre-existing no-research contract without granting a URL exemption.
        if (!canonicalDns || CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerIdentity)) {
          return Object.freeze({ kind: "malformed_ens" });
        }
      }
      return Object.freeze({ kind: "url" });
    }
  } catch {
    // A token rejected by WHATWG is not treated as a caller hostname. The complete
    // source span remains indivisible, so normalization cannot expose a suffix.
  }

  if (!percentDecoded && lowerIdentity.includes(".eth")) {
    return Object.freeze({ kind: "malformed_ens" });
  }
  return Object.freeze({ kind: "text" });
}

function hasGlobalUrlSyntax(sourceText) {
  // Normalize before decoding so compatibility percent signs (for example U+FF05)
  // cannot manufacture a percent escape after the URL scan has already run.
  const decodedText = normalizedDecodedChunk(sourceText);
  return (
    /[A-Za-z][A-Za-z0-9+.-]*:/u.test(decodedText)
    || /[\\/]/u.test(decodedText)
    || /\bwww[.\u3002\uFF0E\uFF61]/iu.test(decodedText)
    || /(?:^|\s)\S*[?#]\S+/u.test(decodedText)
    || /\[[0-9A-Fa-f:.]*:[0-9A-Fa-f:.]*\]/u.test(decodedText)
  );
}

export function analyzePublicReceptionInputText(text) {
  if (typeof text !== "string") {
    throw new TypeError("Reception URL inspection text must be a string");
  }

  const sourceText = text.replace(/[\t\n\r]/gu, "");
  const names = [];
  const spans = [];
  let malformedIdentifier = false;
  let callerControlledUrl = hasGlobalUrlSyntax(sourceText);
  const chunkMatcher = createReceptionChunkMatcher();
  let chunkMatch;

  while ((chunkMatch = chunkMatcher.exec(sourceText)) !== null) {
    const chunk = chunkMatch[0];

    // Authority ownership is decided on the complete whitespace-bounded chunk.
    // URL-valid punctuation, wrappers, repeated delimiters, NFKC `＠`, and `%40`
    // therefore cannot split the authority and expose an ENS suffix downstream.
    if (normalizedDecodedChunk(chunk).includes("@")) {
      callerControlledUrl = true;
      continue;
    }

    const spanMatcher = createReceptionSpanMatcher();
    const localMatches = Array.from(chunk.matchAll(spanMatcher));
    if (localMatches.length === 0) continue;

    // Multiple child spans prove punctuation exists inside the caller identity,
    // not merely around it. Classify the complete interior from first span start
    // through last span end exactly once; never reinterpret any child as ENS.
    if (localMatches.length > 1) {
      const first = localMatches[0];
      const last = localMatches[localMatches.length - 1];
      const coreStart = first.index;
      const coreEnd = last.index + last[0].length;
      const classification = classifySpan(sourceText, {
        0: chunk.slice(coreStart, coreEnd),
        index: chunkMatch.index + coreStart
      }, { completeHostChunk: true });

      if (classification.kind === "url") callerControlledUrl = true;
      else if (classification.kind === "malformed_ens") malformedIdentifier = true;
      else if (normalizedDecodedChunk(chunk.slice(coreStart, coreEnd)).toLowerCase().includes(".eth")) {
        malformedIdentifier = true;
      }
      continue;
    }

    const localMatch = localMatches[0];
    const coversWholeChunk = localMatch.index === 0 && localMatch[0].length === chunk.length;

    // A single child does not prove punctuation is merely decorative: WHATWG also
    // accepts many one-sided punctuation forms as host syntax (for example
    // `!epbs.eth` and `epbs.eth!`). Inspect the complete caller chunk first unless
    // it is one explicit balanced presentation wrapper around the child identity.
    if (!coversWholeChunk && !isBalancedOuterWrapper(chunk, localMatch)) {
      const chunkClassification = classifySpan(sourceText, {
        0: chunk,
        index: chunkMatch.index
      }, { completeHostChunk: true });

      if (chunkClassification.kind === "url") {
        callerControlledUrl = true;
        continue;
      }
      if (chunkClassification.kind === "malformed_ens") {
        malformedIdentifier = true;
        continue;
      }
      if (normalizedDecodedChunk(chunk).toLowerCase().includes(".eth")) {
        malformedIdentifier = true;
        continue;
      }
    }

    const classification = classifySpan(sourceText, {
      0: localMatch[0],
      index: chunkMatch.index + localMatch.index
    });
    if (classification.kind === "url") {
      callerControlledUrl = true;
      continue;
    }
    if (classification.kind === "malformed_ens") {
      malformedIdentifier = true;
      continue;
    }
    if (classification.kind === "ens") {
      if (!names.includes(classification.name)) names.push(classification.name);
      spans.push(Object.freeze({
        start: classification.start,
        end: classification.end
      }));
    }
  }

  return Object.freeze({
    sourceText,
    callerControlledUrl,
    ensInspection: Object.freeze({
      names: Object.freeze(names),
      spans: Object.freeze(spans),
      malformedIdentifier
    })
  });
}
