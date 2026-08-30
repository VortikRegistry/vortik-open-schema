import { normalizeSupportedEnsName } from "./ens-research-evaluator.mjs";

const DOTTED_VERSION_PATTERN = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/iu;
const SINGLE_IPV4_NUMBER_PATTERN = /^(?:0x[0-9a-f]+|0[0-7]+|\d+)$/iu;
const SUPPORTED_SPACED_EIP_NUMBER_PATTERN = /^(?:7732|7805)$/u;
const CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN = /^[\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}.]+$/u;
const HOST_PUNCTUATION_PATTERN = /[!"$&'()*+,;=_`{}~]/u;
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

function decodeUrlPercentEscapes(text) {
  return text.replace(/(?:%[0-9A-Fa-f]{2})+/gu, (encoded) => {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  });
}

function normalizeIdentitySpan(text) {
  return text.normalize("NFKC");
}

function normalizeContextBoundaries(text) {
  return text
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, " ");
}

function normalizeUrlInspectionText(text) {
  return text
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, "");
}

function normalizedDecodedUrlText(text) {
  return normalizeUrlInspectionText(
    decodeUrlPercentEscapes(normalizeUrlInspectionText(text))
  );
}

function sourceBeforeScalar(sourceText, tokenIndex, outerWrapper) {
  const scalarStart = tokenIndex - (outerWrapper?.opener.length ?? 0);
  return normalizeContextBoundaries(sourceText.slice(0, scalarStart));
}

function sourceAfterScalar(sourceText, rawToken, tokenIndex, outerWrapper) {
  const scalarEnd = tokenIndex
    + rawToken.length
    + (outerWrapper?.closer.length ?? 0);
  return normalizeContextBoundaries(sourceText.slice(scalarEnd));
}

function hasClosedCuePrefix(text, cue, { balancedWrapper = false } = {}) {
  const whitespace = /^\s+/u.exec(text)?.[0];
  if (!whitespace) return false;

  const tail = text.slice(whitespace.length).toLowerCase();
  if (
    tail.startsWith(cue)
    && (tail.length === cue.length || /^\s/u.test(tail.slice(cue.length)))
  ) {
    return true;
  }
  if (!balancedWrapper) return false;

  for (const [opener, closer] of BALANCED_OUTER_WRAPPERS) {
    const wrappedCue = `${opener}${cue}${closer}`;
    if (
      tail.startsWith(wrappedCue)
      && (
        tail.length === wrappedCue.length
        || /^\s/u.test(tail.slice(wrappedCue.length))
      )
    ) {
      return true;
    }
  }
  return false;
}

function isExplicitDottedVersion(sourceText, token, tokenIndex, outerWrapper) {
  if (!DOTTED_VERSION_PATTERN.test(token)) return false;
  if (/^v/iu.test(token)) return true;
  return /(?:^|[^\p{L}\p{N}])(?:schema|version|release|contract)\s*$/iu.test(
    sourceBeforeScalar(sourceText, tokenIndex, outerWrapper)
  );
}

function isExplicitEthAmount(sourceText, rawToken, tokenIndex, outerWrapper) {
  if (!/^\d+(?:\.\d+)?$/u.test(rawToken)) return false;
  return hasClosedCuePrefix(
    sourceAfterScalar(sourceText, rawToken, tokenIndex, outerWrapper),
    "eth",
    { balancedWrapper: true }
  );
}

function isExplicitSupportedEipReference(sourceText, rawToken, tokenIndex, outerWrapper) {
  if (!SUPPORTED_SPACED_EIP_NUMBER_PATTERN.test(rawToken)) return false;
  return /(?:^|[^\p{L}\p{N}])eip\s*$/iu.test(
    sourceBeforeScalar(sourceText, tokenIndex, outerWrapper)
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

function getWholeChunkBalancedWrapper(chunk) {
  if (chunk.length < 3) return null;
  const opener = chunk[0];
  const closer = chunk.at(-1);
  if (BALANCED_OUTER_WRAPPERS.get(opener) !== closer) return null;
  return Object.freeze({ opener, closer });
}

function classifySpan(
  sourceText,
  match,
  {
    completeHostChunk = false,
    outerWrapper = null,
    allowScalarExemptions = true
  } = {}
) {
  const sourceToken = match[0];
  const normalizedToken = normalizeIdentitySpan(sourceToken);
  const urlInspectionToken = normalizeUrlInspectionText(sourceToken);
  const decodedToken = normalizeUrlInspectionText(
    decodeUrlPercentEscapes(urlInspectionToken)
  );
  const percentDecoded = decodedToken !== urlInspectionToken;
  const subject = percentDecoded ? decodedToken : urlInspectionToken;
  const lowerSubject = subject.toLowerCase();
  const hasDot = /[.\u3002\uFF0E\uFF61]/u.test(subject);

  if (!percentDecoded) {
    if (
      allowScalarExemptions
      && (
        isExplicitDottedVersion(sourceText, lowerSubject, match.index, outerWrapper)
        || isExplicitEthAmount(sourceText, normalizedToken, match.index, outerWrapper)
        || isExplicitSupportedEipReference(sourceText, normalizedToken, match.index, outerWrapper)
      )
    ) {
      return Object.freeze({ kind: "text" });
    }

    let sourceIdentifier = sourceToken;
    let ensCandidate = normalizedToken.toLowerCase();
    let supportedEnsName = normalizeSupportedEnsName(ensCandidate);

    if (supportedEnsName !== ensCandidate && sourceToken.endsWith(".") && !sourceToken.endsWith("..")) {
      sourceIdentifier = sourceToken.slice(0, -1);
      ensCandidate = normalizeIdentitySpan(sourceIdentifier).toLowerCase();
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

  const punctuationHostCandidate = completeHostChunk
    && HOST_PUNCTUATION_PATTERN.test(subject)
    && (hasDot || /\d/u.test(subject));
  const shouldTryHost = hasDot
    || SINGLE_IPV4_NUMBER_PATTERN.test(lowerSubject)
    || lowerSubject === "localhost"
    || punctuationHostCandidate;
  if (!shouldTryHost) return Object.freeze({ kind: "text" });

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
    if (asciiLabels.length >= 2 || completeHostChunk) {
      const canonicalDns = hasCanonicalDnsLabels(asciiHostname);
      if (literalMalformedEnsCandidate) {
        if (!canonicalDns || CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerSubject)) {
          return Object.freeze({ kind: "malformed_ens" });
        }
      }
      if (completeHostChunk) return Object.freeze({ kind: "url" });
      return Object.freeze({ kind: "url" });
    }
  } catch {
    if (punctuationHostCandidate) return Object.freeze({ kind: "url" });
    // WHATWG-rejected literal ENS-looking identities remain bounded malformed input.
  }

  if (!percentDecoded && lowerSubject.includes(".eth")) {
    return Object.freeze({ kind: "malformed_ens" });
  }
  return Object.freeze({ kind: "text" });
}

function hasGlobalUrlSyntax(sourceText) {
  const decodedText = normalizedDecodedUrlText(sourceText);
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

  const sourceText = text;
  const names = [];
  const spans = [];
  let malformedIdentifier = false;
  let callerControlledUrl = hasGlobalUrlSyntax(sourceText);
  const chunkMatcher = createReceptionChunkMatcher();
  let chunkMatch;

  while ((chunkMatch = chunkMatcher.exec(sourceText)) !== null) {
    const chunk = chunkMatch[0];
    const decodedChunk = normalizedDecodedUrlText(chunk);

    if (decodedChunk.includes("@")) {
      callerControlledUrl = true;
      continue;
    }

    const outerWrapper = getWholeChunkBalancedWrapper(chunk);
    const semanticToken = outerWrapper
      ? chunk.slice(outerWrapper.opener.length, chunk.length - outerWrapper.closer.length)
      : chunk;
    const semanticIndex = chunkMatch.index + (outerWrapper?.opener.length ?? 0);

    const classification = classifySpan(sourceText, {
      0: semanticToken,
      index: semanticIndex
    }, {
      completeHostChunk: outerWrapper === null,
      outerWrapper,
      allowScalarExemptions: true
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
