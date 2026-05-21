#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "registry.json");

const REQUIRED_FIELDS = [
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

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function schemaVersionFromPath(schemaPath) {
  const parts = schemaPath.split(/[\\/]/);
  const schemaJsonIndex = parts.lastIndexOf("schema.json");

  if (schemaJsonIndex > 0) {
    return parts[schemaJsonIndex - 1];
  }

  return undefined;
}

function defaultSchemaId(anchor) {
  return `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${anchor.schema}`;
}

function ensureObject(value, fallback = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  return value;
}

function ensureStringConstProperty(schema, field, constValue, description) {
  schema.properties = ensureObject(schema.properties);

  if (!schema.properties[field] || typeof schema.properties[field] !== "object") {
    schema.properties[field] = {};
  }

  schema.properties[field].type = "string";
  schema.properties[field].const = constValue;

  if (description && !schema.properties[field].description) {
    schema.properties[field].description = description;
  }
}

function ensureRequired(schema, field) {
  if (!Array.isArray(schema.required)) {
    schema.required = [];
  }

  if (!schema.required.includes(field)) {
    schema.required.push(field);
  }
}

function ensureRequiredFields(schema) {
  if (!Array.isArray(schema.required)) {
    schema.required = [];
  }

  for (const field of REQUIRED_FIELDS) {
    ensureRequired(schema, field);
  }
}

function ensureNaming(schema, anchor) {
  schema.properties = ensureObject(schema.properties);

  if (!schema.properties.naming || typeof schema.properties.naming !== "object") {
    schema.properties.naming = {};
  }

  const naming = schema.properties.naming;

  naming.type = "object";
  naming.additionalProperties = false;

  if (!Array.isArray(naming.required)) {
    naming.required = [];
  }

  for (const field of ["ens", "canonical", "mismatch", "notes"]) {
    if (!naming.required.includes(field)) {
      naming.required.push(field);
    }
  }

  if (!naming.properties || typeof naming.properties !== "object") {
    naming.properties = {};
  }

  if (!naming.properties.ens || typeof naming.properties.ens !== "object") {
    naming.properties.ens = {};
  }

  naming.properties.ens.type = "string";
  naming.properties.ens.const = anchor.ens;

  if (!naming.properties.canonical || typeof naming.properties.canonical !== "object") {
    naming.properties.canonical = {};
  }

  naming.properties.canonical.type = "string";
  naming.properties.canonical.const = anchor.canonical_term;

  if (!naming.properties.mismatch || typeof naming.properties.mismatch !== "object") {
    naming.properties.mismatch = {};
  }

  if (naming.properties.mismatch.type !== "boolean") {
    naming.properties.mismatch.type = "boolean";
  }

  if (naming.properties.mismatch.const === undefined) {
    naming.properties.mismatch.const = anchor.ens !== `${anchor.id}.eth`;
  }

  if (!naming.properties.notes || typeof naming.properties.notes !== "object") {
    naming.properties.notes = {};
  }

  naming.properties.notes.type = "string";

  if (!naming.properties.notes.minLength) {
    naming.properties.notes.minLength = 5;
  }
}

function fixSchema(anchor) {
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
  const before = JSON.stringify(schema);

  schema.$schema = schema.$schema || "https://json-schema.org/draft/2020-12/schema";
  schema.$id = schema.$id || defaultSchemaId(anchor);
  schema.title = schema.title || `Vortik Open Schema — ${anchor.canonical_term}`;
  schema.description =
    schema.description ||
    `Machine-readable schema for the ${anchor.canonical_term} semantic anchor within the Vortik Semantic Registry. Research artifact; not an official protocol specification.`;

  schema.type = "object";
  schema.additionalProperties = false;
  schema.properties = ensureObject(schema.properties);

  ensureRequiredFields(schema);

  ensureStringConstProperty(
    schema,
    "id",
    anchor.id,
    "Registry identifier for this semantic anchor."
  );

  ensureStringConstProperty(
    schema,
    "version",
    schemaVersionFromPath(anchor.schema) || schema.properties.version?.const || "0.1-research",
    "Schema version for this anchor."
  );

  ensureStringConstProperty(
    schema,
    "canonical_term",
    anchor.canonical_term,
    "Canonical technical term tracked by this anchor."
  );

  ensureStringConstProperty(
    schema,
    "classification",
    anchor.classification,
    "Semantic classification within the Vortik registry."
  );

  ensureStringConstProperty(
    schema,
    "status",
    anchor.status,
    "Current maturity/status of the tracked anchor."
  );

  ensureStringConstProperty(
    schema,
    "type",
    anchor.type,
    "Semantic type within the Vortik registry."
  );

  if (!schema.properties.summary || typeof schema.properties.summary !== "object") {
    schema.properties.summary = {
      type: "string",
      description: anchor.role || "Short semantic summary for this anchor.",
      minLength: 20
    };
  } else {
    schema.properties.summary.type = "string";
    schema.properties.summary.minLength = schema.properties.summary.minLength || 20;
  }

  if (
    !schema.properties.pipeline_position ||
    typeof schema.properties.pipeline_position !== "object"
  ) {
    schema.properties.pipeline_position = {
      type: "array",
      description:
        "Interpretive coordination domains where this anchor is most relevant.",
      minItems: 1,
      items: {
        type: "string",
        minLength: 3
      }
    };
  } else {
    schema.properties.pipeline_position.type = "array";
    schema.properties.pipeline_position.minItems =
      schema.properties.pipeline_position.minItems || 1;

    if (!schema.properties.pipeline_position.items) {
      schema.properties.pipeline_position.items = {
        type: "string",
        minLength: 3
      };
    }
  }

  if (
    !schema.properties.coordination_role ||
    typeof schema.properties.coordination_role !== "object"
  ) {
    schema.properties.coordination_role = {
      type: "array",
      description: "Key coordination functions performed by this anchor.",
      minItems: 1,
      items: {
        type: "string",
        minLength: 5
      }
    };
  } else {
    schema.properties.coordination_role.type = "array";
    schema.properties.coordination_role.minItems =
      schema.properties.coordination_role.minItems || 1;

    if (!schema.properties.coordination_role.items) {
      schema.properties.coordination_role.items = {
        type: "string",
        minLength: 5
      };
    }
  }

  if (
    !schema.properties.protocol_grounding ||
    typeof schema.properties.protocol_grounding !== "object"
  ) {
    schema.properties.protocol_grounding = {
      type: "array",
      description:
        "Primary protocol, research, or ecosystem references grounding this anchor.",
      minItems: 1,
      items: {
        type: "string",
        minLength: 5
      }
    };
  } else {
    schema.properties.protocol_grounding.type = "array";
    schema.properties.protocol_grounding.minItems =
      schema.properties.protocol_grounding.minItems || 1;

    if (!schema.properties.protocol_grounding.items) {
      schema.properties.protocol_grounding.items = {
        type: "string",
        minLength: 5
      };
    }
  }

  ensureNaming(schema, anchor);

  if (!schema.properties.sources || typeof schema.properties.sources !== "object") {
    schema.properties.sources = {
      type: "array",
      description: "Primary source references for this anchor.",
      minItems: 1,
      items: {
        type: "string",
        format: "uri"
      }
    };
  } else {
    schema.properties.sources.type = "array";
    schema.properties.sources.minItems = schema.properties.sources.minItems || 1;

    if (!schema.properties.sources.items) {
      schema.properties.sources.items = {
        type: "string",
        format: "uri"
      };
    }
  }

  const after = JSON.stringify(schema);

  if (before !== after) {
    writeJSON(schemaPath, schema);
    console.log(`✅ Fixed schema: ${anchor.schema}`);
    return true;
  }

  console.log(`✓ Schema already aligned: ${anchor.schema}`);
  return false;
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_PATH);

  if (!Array.isArray(registry.anchors)) {
    throw new Error("registry.json must contain an anchors array");
  }

  let changed = 0;

  for (const anchor of registry.anchors) {
    if (fixSchema(anchor)) {
      changed++;
    }
  }

  console.log(`\nSchema fix complete. Modified files: ${changed}`);
}

main();
