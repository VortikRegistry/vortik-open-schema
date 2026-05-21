import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "registry.json");

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function ensureObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function updateConstProperty(schema, field, value, anchorId) {
  if (value === undefined || value === null) {
    return false;
  }

  schema.properties = ensureObject(schema.properties);

  if (!schema.properties[field] || typeof schema.properties[field] !== "object") {
    schema.properties[field] = {};
  }

  const property = schema.properties[field];
  let changed = false;

  if (property.type !== "string") {
    property.type = "string";
    changed = true;
  }

  if (property.const !== value) {
    console.log(
      `Updating ${anchorId}: properties.${field}.const ${property.const} -> ${value}`
    );
    property.const = value;
    changed = true;
  }

  return changed;
}

function updateNaming(schema, anchor) {
  schema.properties = ensureObject(schema.properties);

  if (!schema.properties.naming || typeof schema.properties.naming !== "object") {
    schema.properties.naming = {};
  }

  const naming = schema.properties.naming;
  let changed = false;

  if (naming.type !== "object") {
    naming.type = "object";
    changed = true;
  }

  if (naming.additionalProperties !== false) {
    naming.additionalProperties = false;
    changed = true;
  }

  if (!Array.isArray(naming.required)) {
    naming.required = [];
    changed = true;
  }

  for (const requiredField of ["ens", "canonical", "mismatch", "notes"]) {
    if (!naming.required.includes(requiredField)) {
      naming.required.push(requiredField);
      changed = true;
    }
  }

  if (!naming.properties || typeof naming.properties !== "object") {
    naming.properties = {};
    changed = true;
  }

  if (!naming.properties.ens || typeof naming.properties.ens !== "object") {
    naming.properties.ens = {};
    changed = true;
  }

  if (naming.properties.ens.type !== "string") {
    naming.properties.ens.type = "string";
    changed = true;
  }

  if (naming.properties.ens.const !== anchor.ens) {
    console.log(
      `Updating ${anchor.id}: naming.ens.const ${naming.properties.ens.const} -> ${anchor.ens}`
    );
    naming.properties.ens.const = anchor.ens;
    changed = true;
  }

  if (
    !naming.properties.canonical ||
    typeof naming.properties.canonical !== "object"
  ) {
    naming.properties.canonical = {};
    changed = true;
  }

  if (naming.properties.canonical.type !== "string") {
    naming.properties.canonical.type = "string";
    changed = true;
  }

  if (naming.properties.canonical.const !== anchor.canonical_term) {
    console.log(
      `Updating ${anchor.id}: naming.canonical.const ${naming.properties.canonical.const} -> ${anchor.canonical_term}`
    );
    naming.properties.canonical.const = anchor.canonical_term;
    changed = true;
  }

  if (
    !naming.properties.mismatch ||
    typeof naming.properties.mismatch !== "object"
  ) {
    naming.properties.mismatch = {};
    changed = true;
  }

  if (naming.properties.mismatch.type !== "boolean") {
    naming.properties.mismatch.type = "boolean";
    changed = true;
  }

  if (naming.properties.mismatch.const === undefined) {
    naming.properties.mismatch.const = anchor.ens !== `${anchor.id}.eth`;
    changed = true;
  }

  if (!naming.properties.notes || typeof naming.properties.notes !== "object") {
    naming.properties.notes = {};
    changed = true;
  }

  if (naming.properties.notes.type !== "string") {
    naming.properties.notes.type = "string";
    changed = true;
  }

  if (!naming.properties.notes.minLength) {
    naming.properties.notes.minLength = 5;
    changed = true;
  }

  return changed;
}

function ensureSchemaBasics(schema, anchor) {
  let changed = false;

  if (!schema.$schema) {
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
    changed = true;
  }

  if (!schema.$id) {
    schema.$id = `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${anchor.schema}`;
    changed = true;
  }

  if (!schema.title) {
    schema.title = `Vortik Open Schema — ${anchor.canonical_term}`;
    changed = true;
  }

  if (!schema.description) {
    schema.description = `Machine-readable schema for the ${anchor.canonical_term} semantic anchor within the Vortik Semantic Registry. Research artifact; not an official protocol specification.`;
    changed = true;
  }

  if (schema.type !== "object") {
    schema.type = "object";
    changed = true;
  }

  if (schema.additionalProperties !== false) {
    schema.additionalProperties = false;
    changed = true;
  }

  if (!Array.isArray(schema.required)) {
    schema.required = [];
    changed = true;
  }

  const requiredFields = [
    "id",
    "version",
    "canonical_term",
    "classification",
    "status",
    "type",
    "summary",
    "pipeline_position",
    "coordination_role",
    "protocol_grounding",
    "naming",
    "sources"
  ];

  for (const field of requiredFields) {
    if (!schema.required.includes(field)) {
      schema.required.push(field);
      changed = true;
    }
  }

  schema.properties = ensureObject(schema.properties);

  return changed;
}

function syncSchema(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    console.warn(`⚠️ Anchor ${anchor.id} has no schema path. Skipping.`);
    return false;
  }

  const schemaPath = path.join(ROOT, anchor.schema);

  if (!fs.existsSync(schemaPath)) {
    console.warn(`⚠️ Schema not found for ${anchor.id}: ${anchor.schema}`);
    return false;
  }

  const schema = readJSON(schemaPath);
  let changed = false;

  changed = ensureSchemaBasics(schema, anchor) || changed;

  changed = updateConstProperty(schema, "id", anchor.id, anchor.id) || changed;
  changed =
    updateConstProperty(
      schema,
      "canonical_term",
      anchor.canonical_term,
      anchor.id
    ) || changed;
  changed =
    updateConstProperty(
      schema,
      "classification",
      anchor.classification,
      anchor.id
    ) || changed;
  changed =
    updateConstProperty(schema, "status", anchor.status, anchor.id) || changed;
  changed = updateConstProperty(schema, "type", anchor.type, anchor.id) || changed;

  changed = updateNaming(schema, anchor) || changed;

  if (changed) {
    writeJSON(schemaPath, schema);
    console.log(`✅ Synced ${anchor.schema}`);
  } else {
    console.log(`✓ Already synced ${anchor.schema}`);
  }

  return changed;
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_PATH);

  if (!Array.isArray(registry.anchors)) {
    throw new Error("registry.json must contain anchors array");
  }

  let modified = 0;

  for (const anchor of registry.anchors) {
    if (syncSchema(anchor)) {
      modified++;
    }
  }

  console.log(`\nSchema sync complete. Modified files: ${modified}`);
}

main();
