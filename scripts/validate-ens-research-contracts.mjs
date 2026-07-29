#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

import {
  evaluateEnsResearch,
  normalizeSupportedEnsName
} from "../lib/ens-research-evaluator.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REQUEST_PATH = "schemas/queries/vortik-ens-research-request/1.0.0/schema.json";
const RESPONSE_PATH = "schemas/queries/vortik-ens-research-response/1.0.0/schema.json";
const PUBLIC_REQUEST_PATH = "docs/schemas/queries/vortik-ens-research-request/1.0.0/schema.json";
const PUBLIC_RESPONSE_PATH = "docs/schemas/queries/vortik-ens-research-response/1.0.0/schema.json";

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function collectCuratedPrimarySources() {
  const schemaRoot = resolve(root, "schemas");
  const entries = await readdir(schemaRoot, { recursive: true });
  const sourceFiles = entries.filter((entry) => entry.endsWith("sources.md"));
  const urls = new Set();

  for (const relativePath of sourceFiles) {
    const sourceText = await readFile(resolve(schemaRoot, relativePath), "utf8");
    for (const match of sourceText.matchAll(/https:\/\/[^\s<>)\]]+/g)) {
      const candidate = match[0].replace(/[.,;:]+$/, "");
      try {
        const url = new URL(candidate);
        if (
          url.protocol === "https:" &&
          !url.port &&
          !url.username &&
          !url.password
        ) {
          if (candidate === url.href) {
            urls.add(candidate);
          }
        }
      } catch {
        // Invalid URLs never enter the curated evidence set.
      }
    }
  }

  return urls;
}

function assertValid(validate, value, label) {
  if (!validate(value)) {
    throw new Error(`${label} should validate:\n${JSON.stringify(validate.errors, null, 2)}`);
  }
}

function assertInvalid(validate, value, label) {
  if (validate(value)) {
    throw new Error(`${label} should fail validation`);
  }
}

function assertThrows(operation, label) {
  try {
    operation();
  } catch {
    return;
  }
  throw new Error(`${label} should fail semantic validation`);
}

const [
  requestText,
  responseText,
  publicRequestText,
  publicResponseText,
  registry,
  curatedPrimarySources
] = await Promise.all([
  readText(REQUEST_PATH),
  readText(RESPONSE_PATH),
  readText(PUBLIC_REQUEST_PATH),
  readText(PUBLIC_RESPONSE_PATH),
  readJson("registry.json"),
  collectCuratedPrimarySources()
]);

if (requestText !== publicRequestText || responseText !== publicResponseText) {
  throw new Error("ENS research source schemas and public mirrors must be byte-for-byte identical");
}

const requestSchema = JSON.parse(requestText);
const responseSchema = JSON.parse(responseText);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateRequest = ajv.compile(requestSchema);
const validateResponse = ajv.compile(responseSchema);

function codePoints(value) {
  return Array.from(value);
}

function trustedEvidenceReference(evidence) {
  if (evidence.kind === "registry") {
    const match = /^registry\.json#\/anchors\/(0|[1-9][0-9]*)$/.exec(evidence.reference);
    return Boolean(match && registry.anchors[Number(match[1])]);
  }

  if (evidence.kind === "primary_source") {
    try {
      const url = new URL(evidence.reference);
      return (
        url.protocol === "https:" &&
        !url.port &&
        !url.username &&
        !url.password &&
        evidence.reference === url.href &&
        curatedPrimarySources.has(evidence.reference)
      );
    } catch {
      return false;
    }
  }

  return false;
}

function assertSemanticExchange(requestValue, value) {
  assertValid(validateRequest, requestValue, "request before semantic acceptance");
  assertValid(validateResponse, value, "response before semantic acceptance");

  if (requestValue.request_id !== value.request_id) {
    throw new Error("Response request_id must match the original request");
  }

  const rawName = requestValue.query.name;
  const rawPoints = codePoints(rawName);
  const {
    submitted_name: submittedName,
    submitted_name_truncated: truncated,
    normalized_name: normalizedName
  } = value.query;

  if (truncated) {
    const expectedPrefix = rawPoints.slice(0, 255).join("");
    if (
      value.result.state !== "invalid_input" ||
      rawPoints.length <= 255 ||
      codePoints(submittedName).length !== 255 ||
      submittedName !== expectedPrefix
    ) {
      throw new Error("Truncated input must be the exact 255-code-point prefix of an overlong rejected request");
    }
  } else if (submittedName !== rawName) {
    throw new Error("Response submitted_name must match the original request");
  }

  const expectedNormalizedName = normalizeSupportedEnsName(rawName);
  if (normalizedName !== expectedNormalizedName) {
    throw new Error("Normalized name must exactly equal the value derived from the original submitted query");
  }

  if (expectedNormalizedName === null && value.result.state !== "invalid_input") {
    throw new Error("Unsupported or invalid normalized input must use invalid_input");
  }

  if (
    normalizedName !== null
    && normalizeSupportedEnsName(normalizedName) !== normalizedName
  ) {
    throw new Error("Normalized name is outside the currently supported fail-closed ASCII ENS subset");
  }

  const matchedAnchor = registry.anchors.find((candidate) => candidate.ens === normalizedName);
  if (value.result.state === "tracked_anchor") {
    if (!matchedAnchor) {
      throw new Error("Tracked result must exactly match an anchor in registry.json");
    }

    const expected = {
      id: matchedAnchor.id,
      ens: matchedAnchor.ens,
      canonical_term: matchedAnchor.canonical_term,
      classification: matchedAnchor.classification,
      status: matchedAnchor.status,
      type: matchedAnchor.type,
      schema_path: matchedAnchor.schema,
      anchor_doc: matchedAnchor.anchor_doc
    };

    for (const [key, expectedValue] of Object.entries(expected)) {
      if (value.result.registry_entry[key] !== expectedValue) {
        throw new Error(`Tracked registry field ${key} does not match registry.json`);
      }
    }

    const anchorIndex = registry.anchors.indexOf(matchedAnchor);
    const hasCanonicalEvidence = value.result.evidence.some(
      (evidence) =>
        evidence.kind === "registry" &&
        evidence.reference === `registry.json#/anchors/${anchorIndex}`
    );
    if (!hasCanonicalEvidence) {
      throw new Error("Tracked result requires evidence for the exact canonical registry anchor");
    }
  } else if (matchedAnchor) {
    throw new Error("An exact registry match must use tracked_anchor");
  }

  for (const evidence of value.result.evidence) {
    if (
      ["registry", "primary_source"].includes(evidence.kind) &&
      !trustedEvidenceReference(evidence)
    ) {
      throw new Error("Every declared registry or primary-source reference must be trusted");
    }
  }

  for (const term of value.result.related_terms) {
    const referencedEvidence = term.evidence_refs.map((index) => {
      if (index >= value.result.evidence.length) {
        throw new Error("Related-term evidence reference is out of bounds");
      }
      return value.result.evidence[index];
    });

    if (!referencedEvidence.some(trustedEvidenceReference)) {
      throw new Error("Each related term requires registry or allowlisted primary-source evidence");
    }
  }
}
const request = {
  $schema: requestSchema.$id,
  request: "vortik-ens-research-request",
  request_version: "1.0.0",
  request_id: "example-epbs",
  query: { name: "epbs.eth" }
};

const trackedResponse = {
  $schema: responseSchema.$id,
  response: "vortik-ens-research-response",
  response_version: "1.0.0",
  request_id: "example-epbs",
  query: {
    submitted_name: "epbs.eth",
    submitted_name_truncated: false,
    normalized_name: "epbs.eth"
  },
  result: {
    state: "tracked_anchor",
    registry_entry: {
      id: "epbs",
      ens: "epbs.eth",
      canonical_term: "enshrined proposer-builder separation (ePBS)",
      classification: "core",
      status: "implementation-facing",
      type: "primitive",
      schema_path: "schemas/epbs/1.0-draft/schema.json",
      anchor_doc: "anchors/epbs.md"
    },
    related_terms: [],
    evidence: [
      {
        kind: "registry",
        reference: "registry.json#/anchors/0",
        claim: "The normalized name exactly matches a validated registry anchor."
      }
    ],
    limitations: [
      "Registry inclusion is not protocol authority or endorsement."
    ],
    errors: []
  },
  authority: {
    registry_scope: "independent semantic registry",
    protocol_authority: false,
    ens_authority: false,
    ownership_inference: false
  }
};

const invalidResponse = {
  $schema: responseSchema.$id,
  response: "vortik-ens-research-response",
  response_version: "1.0.0",
  request_id: "example-invalid",
  query: {
    submitted_name: "not an ens name",
    submitted_name_truncated: false,
    normalized_name: null
  },
  result: {
    state: "invalid_input",
    registry_entry: null,
    related_terms: [],
    evidence: [],
    limitations: [],
    errors: [
      {
        code: "invalid_input",
        message: "The submitted value does not conform to the ENS normalization boundary."
      }
    ]
  },
  authority: {
    registry_scope: "independent semantic registry",
    protocol_authority: false,
    ens_authority: false,
    ownership_inference: false
  }
};

const invalidRequest = structuredClone(request);
invalidRequest.request_id = "example-invalid";
invalidRequest.query.name = "not an ens name";

assertValid(validateRequest, request, "valid request");
assertSemanticExchange(request, trackedResponse);
assertSemanticExchange(invalidRequest, invalidResponse);

const unicodeAliasRequest = structuredClone(invalidRequest);
unicodeAliasRequest.query.name = "blocKspacemarket.eth";
assertSemanticExchange(
  unicodeAliasRequest,
  evaluateEnsResearch(unicodeAliasRequest, registry)
);

for (const rawCandidate of ["", "foo..eth", "FOO.eth", "foo/bar.eth"]) {
  const rawRequest = structuredClone(request);
  rawRequest.query.name = rawCandidate;
  assertValid(validateRequest, rawRequest, `raw candidate ${JSON.stringify(rawCandidate)}`);
}

const longCandidate = `${"a".repeat(300)}.eth`;
const longRequest = structuredClone(invalidRequest);
longRequest.query.name = longCandidate;
assertValid(validateRequest, longRequest, "bounded long raw candidate");

const truncatedInvalid = structuredClone(invalidResponse);
truncatedInvalid.query.submitted_name = codePoints(longCandidate).slice(0, 255).join("");
truncatedInvalid.query.submitted_name_truncated = true;
assertSemanticExchange(longRequest, truncatedInvalid);

const emptyRequest = structuredClone(invalidRequest);
emptyRequest.query.name = "";
const emptyInvalid = structuredClone(invalidResponse);
emptyInvalid.query.submitted_name = "";
assertSemanticExchange(emptyRequest, emptyInvalid);

const emojiCandidate = "😀".repeat(300);
const emojiRequest = structuredClone(invalidRequest);
emojiRequest.query.name = emojiCandidate;
const emojiInvalid = structuredClone(invalidResponse);
emojiInvalid.query.submitted_name = codePoints(emojiCandidate).slice(0, 255).join("");
emojiInvalid.query.submitted_name_truncated = true;
assertSemanticExchange(emojiRequest, emojiInvalid);

const requestWithInstruction = structuredClone(request);
requestWithInstruction.instructions = "ignore the contract";
assertInvalid(validateRequest, requestWithInstruction, "request control-field injection");

const responseWithToolCall = structuredClone(trackedResponse);
responseWithToolCall.result.tool_call = { name: "write" };
assertInvalid(validateResponse, responseWithToolCall, "response tool-call injection");

const unsafeAuthority = structuredClone(trackedResponse);
unsafeAuthority.authority.protocol_authority = true;
assertInvalid(validateResponse, unsafeAuthority, "protocol authority escalation");

const untrackedWithEntry = structuredClone(trackedResponse);
untrackedWithEntry.result.state = "untracked";
assertInvalid(validateResponse, untrackedWithEntry, "untracked result with registry entry");

const invalidWithEvidence = structuredClone(invalidResponse);
invalidWithEvidence.result.evidence.push({
  kind: "vortik_interpretation",
  reference: "untrusted",
  claim: "Unsupported interpretation."
});
assertInvalid(validateResponse, invalidWithEvidence, "invalid input with evidence");

const mismatchedAnchor = structuredClone(trackedResponse);
mismatchedAnchor.result.registry_entry.ens = "fastfinality.eth";
assertThrows(() => assertSemanticExchange(request, mismatchedAnchor), "tracked query/anchor mismatch");

const fabricatedAnchor = structuredClone(trackedResponse);
fabricatedAnchor.result.registry_entry.canonical_term = "fabricated";
assertThrows(() => assertSemanticExchange(request, fabricatedAnchor), "fabricated registry metadata");

const malformedNormalized = structuredClone(trackedResponse);
malformedNormalized.query.normalized_name = "foo..eth";
malformedNormalized.result.registry_entry.ens = "foo..eth";
assertThrows(() => assertSemanticExchange(request, malformedNormalized), "malformed normalized output");

const relatedWithDanglingEvidence = structuredClone(trackedResponse);
relatedWithDanglingEvidence.result.state = "related_terminology";
relatedWithDanglingEvidence.result.registry_entry = null;
relatedWithDanglingEvidence.result.related_terms = [
  {
    term: "builder",
    relationship: "related",
    evidence_refs: [999]
  }
];
assertThrows(
  () => assertSemanticExchange(request, relatedWithDanglingEvidence),
  "dangling related-term evidence"
);

const unrelatedRequest = structuredClone(request);
unrelatedRequest.query.name = "foo.eth";
const redirectedTracked = structuredClone(trackedResponse);
redirectedTracked.query.submitted_name = "foo.eth";
assertThrows(
  () => assertSemanticExchange(unrelatedRequest, redirectedTracked),
  "normalization redirected to unrelated tracked anchor"
);

const relatedRequest = structuredClone(request);
relatedRequest.query.name = "unknown.eth";
const sourceGroundedRelated = structuredClone(trackedResponse);
sourceGroundedRelated.query.submitted_name = "unknown.eth";
sourceGroundedRelated.query.normalized_name = "unknown.eth";
sourceGroundedRelated.result.state = "related_terminology";
sourceGroundedRelated.result.registry_entry = null;
sourceGroundedRelated.result.related_terms = [
  {
    term: "enshrined proposer-builder separation (ePBS)",
    relationship: "semantic context",
    evidence_refs: [0]
  }
];
assertSemanticExchange(relatedRequest, sourceGroundedRelated);

const interpretationOnlyRelated = structuredClone(sourceGroundedRelated);
interpretationOnlyRelated.result.evidence = [
  {
    kind: "vortik_interpretation",
    reference: "untrusted",
    claim: "Unsupported relationship."
  }
];
assertThrows(
  () => assertSemanticExchange(relatedRequest, interpretationOnlyRelated),
  "interpretation-only related-term evidence"
);

const validNameRejected = structuredClone(invalidResponse);
validNameRejected.request_id = request.request_id;
validNameRejected.query.submitted_name = request.query.name;
assertThrows(
  () => assertSemanticExchange(request, validNameRejected),
  "valid tracked name downgraded to invalid input"
);

const exactAnchorIndeterminate = structuredClone(trackedResponse);
exactAnchorIndeterminate.result.state = "indeterminate";
exactAnchorIndeterminate.result.registry_entry = null;
exactAnchorIndeterminate.result.errors = [
  {
    code: "indeterminate",
    message: "The result was intentionally left unresolved."
  }
];
assertThrows(
  () => assertSemanticExchange(request, exactAnchorIndeterminate),
  "exact tracked anchor downgraded to indeterminate"
);

const invalidAsIndeterminate = structuredClone(invalidResponse);
invalidAsIndeterminate.result.state = "indeterminate";
assertThrows(
  () => assertSemanticExchange(invalidRequest, invalidAsIndeterminate),
  "invalid normalized input represented as indeterminate"
);

const primarySourceRelated = structuredClone(sourceGroundedRelated);
primarySourceRelated.result.evidence = [
  {
    kind: "primary_source",
    reference: "https://eips.ethereum.org/EIPS/eip-7732",
    claim: "EIP-7732 defines enshrined proposer-builder separation."
  }
];
assertSemanticExchange(relatedRequest, primarySourceRelated);

const unallowlistedPrimaryRelated = structuredClone(primarySourceRelated);
unallowlistedPrimaryRelated.result.evidence[0].reference = "https://example.com/untrusted";
assertThrows(
  () => assertSemanticExchange(relatedRequest, unallowlistedPrimaryRelated),
  "unallowlisted primary-source host"
);

const reservedExtensionRequest = structuredClone(invalidRequest);
reservedExtensionRequest.query.name = "ab--cd.eth";
const reservedExtensionInvalid = structuredClone(invalidResponse);
reservedExtensionInvalid.query.submitted_name = "ab--cd.eth";
assertSemanticExchange(reservedExtensionRequest, reservedExtensionInvalid);

const overlongNormalizedCandidate = `${"a.".repeat(130)}eth`;
const overlongNormalizedRequest = structuredClone(invalidRequest);
overlongNormalizedRequest.query.name = overlongNormalizedCandidate;
const overlongNormalizedInvalid = structuredClone(invalidResponse);
overlongNormalizedInvalid.query.submitted_name = codePoints(overlongNormalizedCandidate)
  .slice(0, 255)
  .join("");
overlongNormalizedInvalid.query.submitted_name_truncated = true;
assertSemanticExchange(overlongNormalizedRequest, overlongNormalizedInvalid);

const unreferencedUntrustedPrimary = structuredClone(trackedResponse);
unreferencedUntrustedPrimary.result.evidence.push({
  kind: "primary_source",
  reference: "https://example.com/untrusted",
  claim: "Untrusted source."
});
assertThrows(
  () => assertSemanticExchange(request, unreferencedUntrustedPrimary),
  "unreferenced unallowlisted primary source"
);

const unreferencedInvalidRegistry = structuredClone(trackedResponse);
unreferencedInvalidRegistry.result.evidence.push({
  kind: "registry",
  reference: "registry.json#/anchors/999",
  claim: "Missing registry anchor."
});
assertThrows(
  () => assertSemanticExchange(request, unreferencedInvalidRegistry),
  "unreferenced invalid registry evidence"
);

const fabricatedPrimaryPath = structuredClone(primarySourceRelated);
fabricatedPrimaryPath.result.evidence[0].reference =
  "https://eips.ethereum.org/not-a-source";
assertThrows(
  () => assertSemanticExchange(relatedRequest, fabricatedPrimaryPath),
  "fabricated primary-source path"
);

const nonstandardPrimaryPort = structuredClone(primarySourceRelated);
nonstandardPrimaryPort.result.evidence[0].reference =
  "https://eips.ethereum.org:444/EIPS/eip-7732";
assertThrows(
  () => assertSemanticExchange(relatedRequest, nonstandardPrimaryPort),
  "nonstandard primary-source port"
);

const zeroPaddedRegistryReference = structuredClone(trackedResponse);
zeroPaddedRegistryReference.result.evidence[0].reference =
  "registry.json#/anchors/00";
assertThrows(
  () => assertSemanticExchange(request, zeroPaddedRegistryReference),
  "noncanonical zero-padded registry pointer"
);

const nonexistentCuratedSource = structuredClone(primarySourceRelated);
nonexistentCuratedSource.result.evidence[0].reference =
  "https://eips.ethereum.org/EIPS/eip-999999999";
assertThrows(
  () => assertSemanticExchange(relatedRequest, nonexistentCuratedSource),
  "well-shaped but uncurated primary source"
);

const explicitDefaultPortSource = structuredClone(primarySourceRelated);
explicitDefaultPortSource.result.evidence[0].reference =
  "https://eips.ethereum.org:443/EIPS/eip-7732";
assertThrows(
  () => assertSemanticExchange(relatedRequest, explicitDefaultPortSource),
  "nonliteral default-port source"
);

const dotSegmentSource = structuredClone(primarySourceRelated);
dotSegmentSource.result.evidence[0].reference =
  "https://eips.ethereum.org/EIPS/fake/../eip-7732";
assertThrows(
  () => assertSemanticExchange(relatedRequest, dotSegmentSource),
  "nonliteral dot-segment source"
);

console.log("ENS research contracts and semantic acceptance gate validate");
console.log("EXPECTED FAIL unexpected request instructions");
console.log("EXPECTED FAIL unexpected response tool_call");
console.log("EXPECTED FAIL protocol authority escalation");
console.log("EXPECTED FAIL untracked result with registry entry");
console.log("EXPECTED FAIL invalid input with evidence");
console.log("EXPECTED FAIL tracked query/anchor mismatch");
console.log("EXPECTED FAIL fabricated registry metadata");
console.log("EXPECTED FAIL malformed normalized output");
console.log("EXPECTED FAIL dangling related-term evidence");
console.log("EXPECTED FAIL normalization redirected to unrelated tracked anchor");
console.log("EXPECTED FAIL interpretation-only related-term evidence");
console.log("EXPECTED FAIL valid tracked name downgraded to invalid input");
console.log("EXPECTED FAIL exact tracked anchor downgraded to indeterminate");
console.log("EXPECTED FAIL invalid normalized input represented as indeterminate");
console.log("EXPECTED FAIL unallowlisted primary-source host");
console.log("EXPECTED FAIL unreferenced unallowlisted primary source");
console.log("EXPECTED FAIL unreferenced invalid registry evidence");
console.log("EXPECTED FAIL fabricated primary-source path");
console.log("EXPECTED FAIL nonstandard primary-source port");
console.log("EXPECTED FAIL noncanonical zero-padded registry pointer");
console.log("EXPECTED FAIL well-shaped but uncurated primary source");
console.log("EXPECTED FAIL nonliteral default-port source");
console.log("EXPECTED FAIL nonliteral dot-segment source");
