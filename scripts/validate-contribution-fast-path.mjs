#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE_PATH = ".github/ISSUE_TEMPLATE/ens-candidate-contribution.md";
const SCHEMA_PATH = "schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json";
const PUBLIC_SCHEMA_PATH = "docs/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json";
const ISSUE_URL = "https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=ens-candidate-contribution.md";

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const [template, schemaText, publicSchemaText, contributing, contributionDocs, requirementsText] = await Promise.all([
  readText(TEMPLATE_PATH),
  readText(SCHEMA_PATH),
  readText(PUBLIC_SCHEMA_PATH),
  readText("CONTRIBUTING.md"),
  readText("docs/ens-candidate-contributions.md"),
  readText("verification/requirements.json")
]);

assert(schemaText === publicSchemaText, "Candidate contribution source/public schemas must remain byte-identical");

const jsonBlocks = [...template.matchAll(/```json\n([\s\S]*?)\n```/gu)];
assert(jsonBlocks.length === 1, "Contribution Issue template must contain exactly one machine-readable JSON block");

let artifact;
try {
  artifact = JSON.parse(jsonBlocks[0][1]);
} catch (error) {
  throw new Error(`Contribution Issue template JSON must parse: ${error.message}`);
}

const schema = JSON.parse(schemaText);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
assert(validate(artifact), `Contribution Issue template artifact violates schema:\n${JSON.stringify(validate.errors, null, 2)}`);

assert(artifact.contribution_id === "replace-me-001", "Fast-path template must expose the stable-ID placeholder");
assert(artifact.contributor?.kind === "human", "Fast-path template must use a valid default contributor kind");
assert(Object.keys(artifact.contributor).length === 1, "Fast-path default contributor must stay minimal");
assert(artifact.candidate?.name === "candidate-name.eth", "Fast-path template must expose the candidate-name placeholder");
assert(Object.keys(artifact.candidate).sort().join(",") === "name,rationale", "Fast-path default candidate must stay minimal");
assert(Array.isArray(artifact.evidence) && artifact.evidence.length === 1, "Fast-path default artifact must require exactly one example evidence item");
assert(artifact.evidence[0]?.kind === "primary_source", "Fast-path default evidence should teach primary-source preference");

for (const text of [contributing, contributionDocs]) {
  assert(text.includes(ISSUE_URL), "Contribution docs must link the one-click Issue fast path");
  assert(text.includes("machine-readable"), "Contribution docs must describe the machine-readable path");
}

const requirements = JSON.parse(requirementsText);
assert(requirements.implementation_state?.primary_source_verifier_implemented === true, "Primary-source verifier must remain implemented");
assert(requirements.implementation_state?.ens_mainnet_verifier_implemented === true, "ENS mainnet verifier must remain implemented");
assert(requirements.implementation_state?.trusted_receipt_issuance === false, "Contribution fast path must not open trusted receipt issuance");
assert(requirements.admission?.enabled === false, "Contribution fast path must not open candidate admission");
assert(requirements.admission?.commercial_authority === false, "Contribution fast path must not create commercial authority");
assert(requirements.ens_mainnet_verification?.ownership_inference === false, "Contribution fast path must not infer ownership");

console.log("Contribution fast path validated");
console.log("Issue template JSON is schema-valid, minimal and machine-readable");
console.log("Trusted verifier runtimes remain implemented while issuance and admission remain closed");
