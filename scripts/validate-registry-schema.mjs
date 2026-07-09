import Ajv from "ajv";
import { readFile } from "node:fs/promises";

const schemaPath = new URL("../registry.schema.json", import.meta.url);
const registryPath = new URL("../registry.json", import.meta.url);

async function readJson(pathUrl, label) {
  let raw;

  try {
    raw = await readFile(pathUrl, "utf8");
  } catch (error) {
    throw new Error(`Unable to read ${label}: ${error.message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse ${label} as JSON: ${error.message}`);
  }
}

function formatValidationError(error) {
  const location = error.instancePath || "/";
  const detail = error.message ?? "failed validation";
  const params = Object.keys(error.params ?? {}).length > 0
    ? ` (${JSON.stringify(error.params)})`
    : "";

  return `- ${location}: ${detail}${params}`;
}

try {
  const [schema, registry] = await Promise.all([
    readJson(schemaPath, "registry.schema.json"),
    readJson(registryPath, "registry.json"),
  ]);

  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  if (!validate(registry)) {
    console.error("❌ registry.schema.json validation failed.");
    for (const error of validate.errors ?? []) {
      console.error(formatValidationError(error));
    }
    process.exit(1);
  }

  console.log("✅ registry.json conforms to registry.schema.json.");
} catch (error) {
  console.error("❌ registry.schema.json validation failed.");
  console.error(error.message);
  process.exit(1);
}
