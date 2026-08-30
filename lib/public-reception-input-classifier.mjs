import { normalizeSupportedEnsName } from "./ens-research-evaluator.mjs";

const DOTTED_VERSION_PATTERN = /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/iu;
const SINGLE_IPV4_NUMBER_PATTERN = /^(?:0x[0-9a-f]+|0[0-7]+|\d+)$/iu;
const SUPPORTED_SPACED_EIP_NUMBER_PATTERN = /^(?:7732|7805)$/u;
const CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN = /^[\p{L}\p{M}\p{N}\p{Pc}\p{Pd}\p{Cf}.]+$/u;

// One scanner owns URL/authority/hostname/ENS identity. `@` and `%` deliberately
// remain inside a span so WHATWG parsing sees the same authority/host candidate
// that ENS classification sees. Surrounding sentence/URL punctuation is bounded
// before classification instead of being repaired by downstream regexes.
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

function canonicalizeText(text) {
  return text
    .normalize("NFKC")
    .replace(/[\t\n\r]/gu, "");
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

function isParsedIpv4Hostname(asciiHostname) {
  const labels = asciiHostname.split(".");
  return labels.length === 4 && labels.every(
    (label) => /^\d{1,3}$/u.test(label) && Number(label) <= 255
  );
}

function classifySpan(canonicalText, match) {
  const rawToken = match[0];
  const decodedToken = canonicalizeText(decodeUrlPercentEscapes(rawToken));
  const provenanceChanged = decodedToken !== rawToken;
  const subject = provenanceChanged ? decodedToken : rawToken;
  const leadingDots = /^\.+/u.exec(subject)?.[0].length ?? 0;
  const identityToken = subject.slice(leadingDots).replace(/\.+$/u, "");
  const lowerIdentity = identityToken.toLowerCase();
  const parseToken = subject.slice(leadingDots);
  const hasDot = /[.\u3002\uFF0E\uFF61]/u.test(subject);

  // Contextual scalar/version syntax is decided before numeric WHATWG parsing,
  // but only for literal caller text. Percent decoding never manufactures an
  // exemption because downstream consumers did not receive that literal token.
  if (!provenanceChanged) {
    if (
      isExplicitDottedVersion(canonicalText, lowerIdentity, match.index)
      || isExplicitEthAmount(canonicalText, rawToken, match.index)
      || isExplicitSupportedEipReference(canonicalText, rawToken, match.index)
    ) {
      return Object.freeze({ kind: "text" });
    }

    const supportedEnsName = normalizeSupportedEnsName(lowerIdentity);
    if (supportedEnsName === lowerIdentity) {
      return Object.freeze({
        kind: "ens",
        name: supportedEnsName,
        start: match.index + leadingDots,
        end: match.index + leadingDots + identityToken.length
      });
    }
  }

  // A complete span owns every @ delimiter. WHATWG therefore sees repeated @,
  // fullwidth @ after NFKC, and percent-decoded @ as one authority candidate.
  if (subject.includes("@")) {
    try {
      const parsed = new URL(`https://${parseToken}`);
      if (parsed.username || parsed.password) {
        return Object.freeze({ kind: "url" });
      }
    } catch {
      // Invalid authority-like text is not split again for ENS extraction.
    }
  }

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
      // Literal malformed ENS-like tokens remain in the bounded unsupported lane.
      // Identities synthesized by percent decoding never receive this exemption.
      if (
        !provenanceChanged
        && lowerIdentity.includes(".eth")
        && CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerIdentity)
      ) {
        return Object.freeze({ kind: "malformed_ens" });
      }
      return Object.freeze({ kind: "url" });
    }
  } catch {
    // A token rejected by WHATWG is not a caller-controlled hostname. Crucially,
    // this same complete span is also the ENS unit, so no suffix can be re-tokenized.
  }

  if (
    !provenanceChanged
    && lowerIdentity.includes(".eth")
    && CLOSED_ENS_IDENTIFIER_TOKEN_PATTERN.test(lowerIdentity)
  ) {
    return Object.freeze({ kind: "malformed_ens" });
  }
  return Object.freeze({ kind: "text" });
}

function hasGlobalUrlSyntax(canonicalText) {
  const decodedText = canonicalizeText(decodeUrlPercentEscapes(canonicalText));
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

  const canonicalText = canonicalizeText(text);
  const names = [];
  const spans = [];
  let malformedIdentifier = false;
  let callerControlledUrl = hasGlobalUrlSyntax(canonicalText);
  const matcher = createReceptionSpanMatcher();
  let match;

  while ((match = matcher.exec(canonicalText)) !== null) {
    const classification = classifySpan(canonicalText, match);
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
    canonicalText,
    callerControlledUrl,
    ensInspection: Object.freeze({
      names: Object.freeze(names),
      spans: Object.freeze(spans),
      malformedIdentifier
    })
  });
}
