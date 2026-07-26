import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function readJson(relativePath) {
  const raw = await readFile(resolve(root, relativePath), "utf8");
  return JSON.parse(raw);
}

const registry = await readJson("registry.json");
if (registry.source_of_truth !== "schemas") {
  throw new Error(`Unexpected registry source_of_truth: ${registry.source_of_truth}`);
}

const anchor = registry.anchors.find((entry) => entry.id === "epbs");
if (!anchor) {
  throw new Error("Registry entry 'epbs' was not found");
}
if (!anchor.schema?.startsWith("schemas/")) {
  throw new Error(`Registry entry 'epbs' has an invalid schema path: ${anchor.schema}`);
}

const [schema, validInstance, invalidInstance] = await Promise.all([
  readJson(anchor.schema),
  readJson("examples/epbs.valid.json"),
  readJson("examples/epbs.invalid.json")
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

if (!validate(validInstance)) {
  throw new Error(`Expected valid fixture to pass:\n${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

if (validate(invalidInstance)) {
  throw new Error("Expected invalid fixture to fail schema validation");
}

const invalidErrors = validate.errors ?? [];
const isolatesStatusConst = invalidErrors.some(
  (error) => error.instancePath === "/status" && error.keyword === "const"
);
if (!isolatesStatusConst) {
  throw new Error(`Invalid fixture failed for an unexpected reason:\n${ajv.errorsText(invalidErrors, { separator: "\n" })}`);
}

console.log(`Resolved ${anchor.schema} from registry.json`);
console.log("PASS examples/epbs.valid.json");
console.log("EXPECTED FAIL examples/epbs.invalid.json (/status must match the schema constant)");
