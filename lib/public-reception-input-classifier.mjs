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

function createReceptionChunkMatcher() {
  return /\S+/gu;
}

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
  const lowerSubject = subject.toLowerCase();
  const hasDot = /[.\u3002\uFF0E\uFF61]/u.test(subject);

  if (!percentDecoded) {
    if (
      isExplicitDottedVersion(sourceText, lowerSubject, match.index)
      || isExplicitEthAmount(sourceText, normalizedToken, match.index)
      || isExplicitSupportedEipReference(sourceText, normalizedToken, match.index)
    ) {
      return Object.freeze({ kind: "text" });
    }

    let sourceIdentifier = sourceToken;
    let ensCandidate = normalizedToken.toLowerCase();
    let supportedEnsName = normalizeSupportedEnsName(ensCandidate);

    if (supportedEnsName !== ensCandidate && sourceToken.endsWith(".") && !sourceToken.endsWith("..")) {
      sourceIdentifier = sourceToken.slice(0, -1);
      ensCandidate = normalizeInsideSpan(sourceIdentifier).toLowerCase();
      supportedEnsName = normalizeSupportedEnsName(ensCandidate);
    }

    if (supportedEnsName === ensCandidate) {
      return Object.freeze({
        kind: "ens",
        name: supportedEnsName,
        start: match.index,
        end: match.index + sourceIdentifier.length
      });
    }
  }

  if (subject.includes("@")) return Object.freeze({ kind: "url" });

  const shouldTryHost = hasDot
    || SINGLE_IPV4_NUMBER_PATTERN.test(lowerSubject)
    || lowerSubject === "localhost";
  if (!shouldTryHost) return Object.freeze({ kind: "text" });

  // The bounded malformed-ENS lane is reserved for one literal, closed-alphabet
  // ENS-like identity with non-empty labels. Empty labels (`..`) are hostname
  // syntax and can never be collapsed into a supported ENS suffix.
  const literalMalformedEnsCandidate = !percentDecoded
    && !normalizedToken.startsWith(".")
    && !normalizedToken.endsWith(".")
    && !lowerSubject.includes("..")
    && lowerSubject.includes(".eth")
    && CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerSubject);

  try {
    const parsed = new URL(`https://${subject}`);
    if (parsed.username || parsed.password) {
      return Object.freeze({ kind: "url" });
    }

    const asciiHostname = parsed.hostname.toLowerCase();
    if (isParsedIpv4Hostname(asciiHostname) || asciiHostname === "localhost") {
      return Object.freeze({ kind: "url" });
    }

    const asciiLabels = asciiHostname.split(".");
    if (asciiLabels.length >= 2) {
      if (completeHostChunk) return Object.freeze({ kind: "url" });

      const canonicalDns = hasCanonicalDnsLabels(asciiHostname);
      if (literalMalformedEnsCandidate) {
        if (!canonicalDns || CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerSubject)) {
          return Object.freeze({ kind: "malformed_ens" });
        }
      }
      return Object.freeze({ kind: "url" });
    }
  } catch {
    // WHATWG-rejected literal ENS-looking identities remain bounded malformed input.
  }

  if (!percentDecoded && lowerSubject.includes(".eth")) {
    return Object.freeze({ kind: "malformed_ens" });
  }
  return Object.freeze({ kind: "text" });
}

function hasGlobalUrlSyntax(sourceText) {
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

    if (normalizedDecodedChunk(chunk).includes("@")) {
      callerControlledUrl = true;
      continue;
    }

    const spanMatcher = createReceptionSpanMatcher();
    const localMatches = Array.from(chunk.matchAll(spanMatcher));
    if (localMatches.length === 0) continue;

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
