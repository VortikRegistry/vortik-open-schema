#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const CHANGE_FILE = path.join(ROOT, "updates", "change-request.json");
const REGISTRY_FILE = path.join(ROOT, "registry.json");

const VALID_CLASSIFICATIONS = new Set([
  "core",
  "repairable",
  "premature",
  "external",
  "deprecated"
]);

const VALID_STATUSES = new Set([
  "implemented",
  "eip-active",
  "research"
]);

const VALID_STAGES = new Set([
  "canonical",
  "implemented",
  "emerging",
  "research"
]);

const VALID_TYPES = new Set([
  "primitive",
  "constraint",
  "external_mechanism",
  "external_actor",
  "coordination_surface",
  "misaligned_abstraction"
]);

const VALID_VISIBILITIES = new Set([
  "featured",
  "standard",
  "background",
  "hidden"
]);

const VALID_PRIORITIES = new Set([
  "high",
  "medium",
  "low"
]);

const VALID_SALE_STRATEGIES = new Set([
  "hold",
  "monitor",
  "opportunistic",
  "liquidate"
]);

const ALLOWED_UPDATE_FIELDS = new Set([
  "id",
  "classification",
  "status",
  "status_label",
  "stage",
  "type",
  "canonical_term",
  "role",
  "priority",
  "sale_strategy",
  "visibility",
  "market"
]);

const ALLOWED_MARKET_FIELDS = new Set([
  "priority",
  "sale_strategy",
  "visibility"
]);

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function ensureRepoPath(relativePath, label) {
  if (!relativePath || typeof relativePath !== "string") {
    throw new Error(`${label} must be a non-empty string`);
  }

  const resolved = path.resolve(ROOT, relativePath);
  const root = path.resolve(ROOT);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`${label} points outside the repository: ${relativePath}`);
  }

  return resolved;
}

function ensureAllowedValue(field, value, allowedSet) {
  if (value === undefined) {
    return;
  }

  if (!allowedSet.has(value)) {
    throw new Error(
      `Invalid value for ${field}: "${value}". Allowed values: ${Array.from(
        allowedSet
      ).join(", ")}`
    );
  }
}

function ensureOptionalString(field, value) {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} must be a non-empty string when provided`);
  }
}

function validateUnknownFields(object, allowedFields, label) {
  for (const key of Object.keys(object)) {
    if (!allowedFields.has(key)) {
      throw new Error(
        `${label} contains unsupported field "${key}". Supported fields: ${Array.from(
          allowedFields
        ).join(", ")}`
      );
    }
  }
}

function normalizeUpdate(rawUpdate, index) {
  if (!rawUpdate || typeof rawUpdate !== "object" || Array.isArray(rawUpdate)) {
    throw new Error(`updates[${index}] must be an object`);
  }

  validateUnknownFields(rawUpdate, ALLOWED_UPDATE_FIELDS, `updates[${index}]`);

  const update = { ...rawUpdate };

  if (!update.id || typeof update.id !== "string") {
    throw new Error(`updates[${index}].id must be a non-empty string`);
  }

  if (update.market !== undefined) {
    if (!update.market || typeof update.market !== "object" || Array.isArray(update.market)) {
      throw new Error(`updates[${index}].market must be an object when provided`);
    }

    validateUnknownFields(update.market, ALLOWED_MARKET_FIELDS, `updates[${index}].market`);

    for (const field of ALLOWED_MARKET_FIELDS) {
      if (update.market[field] !== undefined && update[field] !== undefined) {
        throw new Error(
          `updates[${index}] defines both ${field} and market.${field}. Use only one form.`
        );
      }

      if (update.market[field] !== undefined) {
        update[field] = update.market[field];
      }
    }

    delete update.market;
  }

  ensureAllowedValue("classification", update.classification, VALID_CLASSIFICATIONS);
  ensureAllowedValue("status", update.status, VALID_STATUSES);
  ensureAllowedValue("stage", update.stage, VALID_STAGES);
  ensureAllowedValue("type", update.type, VALID_TYPES);
  ensureAllowedValue("market.visibility", update.visibility, VALID_VISIBILITIES);
  ensureAllowedValue("market.priority", update.priority, VALID_PRIORITIES);
  ensureAllowedValue("market.sale_strategy", update.sale_strategy, VALID_SALE_STRATEGIES);

  ensureOptionalString("status_label", update.status_label);
  ensureOptionalString("canonical_term", update.canonical_term);
  ensureOptionalString("role", update.role);

  return update;
}

function updateIfChanged(object, field, value, label) {
  if (value === undefined) {
    return false;
  }

  if (object[field] !== value) {
    console.log(`Updating ${label}.${field}: ${object[field]} -> ${value}`);
    object[field] = value;
    return true;
  }

  return false;
}

function updateSchemaConst(schema, field, value, label) {
  if (value === undefined) {
    return false;
  }

  if (!schema.properties || !schema.properties[field]) {
    throw new Error(`Schema ${label}: missing properties.${field}`);
  }

  if (schema.properties[field].const !== value) {
    console.log(
      `Updating schema ${label}.properties.${field}.const: ${schema.properties[field].const} -> ${value}`
    );
    schema.properties[field].const = value;
    return true;
  }

  return false;
}

function updateSchemaNaming(schema, anchor, label) {
  let modified = false;

  const naming = schema.properties?.naming?.properties;

  if (!naming) {
    throw new Error(`Schema ${label}: missing properties.naming.properties`);
  }

  if (naming.ens?.const !== undefined && naming.ens.const !== anchor.ens) {
    console.log(
      `Updating schema ${label}.naming.ens.const: ${naming.ens.const} -> ${anchor.ens}`
    );
    naming.ens.const = anchor.ens;
    modified = true;
  }

  if (
    naming.canonical?.const !== undefined &&
    naming.canonical.const !== anchor.canonical_term
  ) {
    console.log(
      `Updating schema ${label}.naming.canonical.const: ${naming.canonical.const} -> ${anchor.canonical_term}`
    );
    naming.canonical.const = anchor.canonical_term;
    modified = true;
  }

  return modified;
}

function getSchemaPath(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    throw new Error(`Anchor ${anchor.id}: missing schema path`);
  }

  return ensureRepoPath(anchor.schema, `Anchor ${anchor.id} schema`);
}

function loadAndValidateChangeRequest(registry) {
  if (!fs.existsSync(CHANGE_FILE)) {
    console.log("No updates/change-request.json found. Exiting.");
    process.exit(0);
  }

  const change = readJSON(CHANGE_FILE);

  if (!change || typeof change !== "object" || Array.isArray(change)) {
    throw new Error("updates/change-request.json must contain an object");
  }

  if (!Array.isArray(change.updates)) {
    console.log("No updates array found in change-request.json. Exiting.");
    process.exit(0);
  }

  const registryIds = new Set(registry.anchors.map((anchor) => anchor.id));
  const seenUpdateIds = new Set();

  const updates = change.updates.map((rawUpdate, index) => {
    const update = normalizeUpdate(rawUpdate, index);

    if (!registryIds.has(update.id)) {
      throw new Error(`Unknown anchor id in updates[${index}]: ${update.id}`);
    }

    if (seenUpdateIds.has(update.id)) {
      throw new Error(`Duplicate update for anchor id: ${update.id}`);
    }

    seenUpdateIds.add(update.id);
    return update;
  });

  return updates;
}

function applyUpdateToAnchor(anchor, update) {
  let modified = false;

  modified = updateIfChanged(anchor, "classification", update.classification, anchor.id) || modified;
  modified = updateIfChanged(anchor, "status", update.status, anchor.id) || modified;
  modified = updateIfChanged(anchor, "status_label", update.status_label, anchor.id) || modified;
  modified = updateIfChanged(anchor, "stage", update.stage, anchor.id) || modified;
  modified = updateIfChanged(anchor, "type", update.type, anchor.id) || modified;
  modified = updateIfChanged(anchor, "canonical_term", update.canonical_term, anchor.id) || modified;
  modified = updateIfChanged(anchor, "role", update.role, anchor.id) || modified;

  if (!anchor.market || typeof anchor.market !== "object" || Array.isArray(anchor.market)) {
    anchor.market = {};
    modified = true;
  }

  modified = updateIfChanged(anchor.market, "priority", update.priority, `${anchor.id}.market`) || modified;
  modified = updateIfChanged(anchor.market, "sale_strategy", update.sale_strategy, `${anchor.id}.market`) || modified;
  modified = updateIfChanged(anchor.market, "visibility", update.visibility, `${anchor.id}.market`) || modified;

  return modified;
}

function syncAnchorSchema(anchor) {
  const schemaPath = getSchemaPath(anchor);

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema not found for ${anchor.id}: ${anchor.schema}`);
  }

  const schema = readJSON(schemaPath);
  let modified = false;

  modified = updateSchemaConst(schema, "id", anchor.id, anchor.id) || modified;
  modified = updateSchemaConst(schema, "canonical_term", anchor.canonical_term, anchor.id) || modified;
  modified = updateSchemaConst(schema, "classification", anchor.classification, anchor.id) || modified;
  modified = updateSchemaConst(schema, "status", anchor.status, anchor.id) || modified;
  modified = updateSchemaConst(schema, "type", anchor.type, anchor.id) || modified;
  modified = updateSchemaNaming(schema, anchor, anchor.id) || modified;

  if (modified) {
    writeJSON(schemaPath, schema);
  }

  return modified;
}

function main() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_FILE);

  if (!Array.isArray(registry.anchors)) {
    throw new Error("registry.json must contain anchors array");
  }

  const updates = loadAndValidateChangeRequest(registry);

  if (updates.length === 0) {
    console.log("updates/change-request.json contains an empty updates array. Exiting.");
    return;
  }

  let registryModified = false;
  let schemaModified = false;

  for (const update of updates) {
    const anchor = registry.anchors.find((item) => item.id === update.id);

    registryModified = applyUpdateToAnchor(anchor, update) || registryModified;
    schemaModified = syncAnchorSchema(anchor) || schemaModified;
  }

  if (registryModified) {
    writeJSON(REGISTRY_FILE, registry);
  }

  if (registryModified || schemaModified) {
    console.log("Changes applied successfully.");
  } else {
    console.log("No changes applied.");
  }
}

try {
  main();
} catch (error) {
  console.error(`❌ Failed to apply registry changes.\n${error.message}`);
  process.exit(1);
}
