#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(resolve(root, relativePath), "utf8"));
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

const requestSchema = await readJson(
  "schemas/queries/vortik-ens-research-request/1.0.0/schema.json"
);
const responseSchema = await readJson(
  "schemas/queries/vortik-ens-research-response/1.0.0/schema.json"
);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateRequest = ajv.compile(requestSchema);
const validateResponse = ajv.compile(responseSchema);

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
        message: "The submitted value does not conform to the request contract."
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
assertValid(validateResponse, trackedResponse, "tracked response");
assertValid(validateResponse, invalidResponse, "invalid-input response");

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

console.log("ENS research request and response contracts compile and validate");
console.log("EXPECTED FAIL unexpected request instructions");
console.log("EXPECTED FAIL unexpected response tool_call");
console.log("EXPECTED FAIL protocol authority escalation");
console.log("EXPECTED FAIL untracked result with registry entry");
console.log("EXPECTED FAIL invalid input with evidence");
