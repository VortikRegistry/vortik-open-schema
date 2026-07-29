#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REQUEST_PATH = "schemas/queries/vortik-ens-research-request/1.0.0/schema.json";
const RESPONSE_PATH = "schemas/queries/vortik-ens-research-response/1.0.0/schema.json";
const PUBLIC_REQUEST_PATH = "docs/schemas/queries/vortik-ens-research-request/1.0.0/schema.json";
const PUBLIC_RESPONSE_PATH = "docs/schemas/queries/vortik-ens-research-response/1.0.0/schema.json";
const ASCII_NORMALIZED_ENS = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+eth$/;

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
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

const [requestText, responseText, publicRequestText, publicResponseText, registry] =
  await Promise.all([
    readText(REQUEST_PATH),
    readText(RESPONSE_PATH),
    readText(PUBLIC_REQUEST_PATH),
    readText(PUBLIC_RESPONSE_PATH),
    readJson("registry.json")
  ]);

if (requestText !== publicRequestText || responseText !== publicResponseText) {
  throw new Error("ENS research source schemas and public mirrors must be byte-for-byte identical");
}

const requestSchema = JSON.parse(requestText);
const responseSchema = JSON.parse(responseText);
const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateRequest = ajv.compile(requestSchema);
const validateResponse = ajv.compile(responseSchema);

function assertSemanticResponse(value) {
  assertValid(validateResponse, value, "response before semantic acceptance");

  const { submitted_name: submittedName, submitted_name_truncated: truncated, normalized_name: normalizedName } =
    value.query;

  if (truncated && (value.result.state !== "invalid_input" || submittedName.length !== 255)) {
    throw new Error("Truncated input is allowed only as a 255-character invalid-input prefix");
  }

  if (normalizedName !== null && !ASCII_NORMALIZED_ENS.test(normalizedName)) {
    throw new Error("Normalized name is outside the currently supported fail-closed ASCII ENS subset");
  }

  if (value.result.state === "tracked_anchor") {
    const anchor = registry.anchors.find((candidate) => candidate.ens === normalizedName);
    if (!anchor) {
      throw new Error("Tracked result must exactly match an anchor in registry.json");
    }

    const expected = {
      id: anchor.id,
      ens: anchor.ens,
      canonical_term: anchor.canonical_term,
      classification: anchor.classification,
      status: anchor.status,
      type: anchor.type,
      schema_path: anchor.schema,
      anchor_doc: anchor.anchor_doc
    };

    for (const [key, expectedValue] of Object.entries(expected)) {
      if (value.result.registry_entry[key] !== expectedValue) {
        throw new Error(`Tracked registry field ${key} does not match registry.json`);
      }
    }
  }

  for (const term of value.result.related_terms) {
    for (const index of term.evidence_refs) {
      if (index >= value.result.evidence.length) {
        throw new Error("Related-term evidence reference is out of bounds");
      }
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

assertValid(validateRequest, request, "valid request");
assertSemanticResponse(trackedResponse);
assertSemanticResponse(invalidResponse);

for (const rawCandidate of ["", "foo..eth", "FOO.eth", "foo/bar.eth"]) {
  const rawRequest = structuredClone(request);
  rawRequest.query.name = rawCandidate;
  assertValid(validateRequest, rawRequest, `raw candidate ${JSON.stringify(rawCandidate)}`);
}

const longCandidate = `${"a".repeat(300)}.eth`;
const longRequest = structuredClone(request);
longRequest.query.name = longCandidate;
assertValid(validateRequest, longRequest, "bounded long raw candidate");

const truncatedInvalid = structuredClone(invalidResponse);
truncatedInvalid.query.submitted_name = longCandidate.slice(0, 255);
truncatedInvalid.query.submitted_name_truncated = true;
assertSemanticResponse(truncatedInvalid);

const emptyInvalid = structuredClone(invalidResponse);
emptyInvalid.query.submitted_name = "";
assertSemanticResponse(emptyInvalid);

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
assertThrows(() => assertSemanticResponse(mismatchedAnchor), "tracked query/anchor mismatch");

const fabricatedAnchor = structuredClone(trackedResponse);
fabricatedAnchor.result.registry_entry.canonical_term = "fabricated";
assertThrows(() => assertSemanticResponse(fabricatedAnchor), "fabricated registry metadata");

const malformedNormalized = structuredClone(trackedResponse);
malformedNormalized.query.normalized_name = "foo..eth";
malformedNormalized.result.registry_entry.ens = "foo..eth";
assertThrows(() => assertSemanticResponse(malformedNormalized), "malformed normalized output");

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
  () => assertSemanticResponse(relatedWithDanglingEvidence),
  "dangling related-term evidence"
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
