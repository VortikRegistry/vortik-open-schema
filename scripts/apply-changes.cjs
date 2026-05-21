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

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function resolveRepoPath(relativePath) {
  return path.join(ROOT, relativePath);
}

function getSchemaPath(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    return null;
  }

  return resolveRepoPath(anchor.schema);
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
    console.warn(`Schema ${label}: missing properties.${field}`);
    return false;
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
    console.warn(`Schema ${label}: missing properties.naming.properties`);
    return false;
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

if (!fs.existsSync(CHANGE_FILE)) {
  console.log("No updates/change-request.json found. Exiting.");
  process.exit(0);
}

if (!fs.existsSync(REGISTRY_FILE)) {
  throw new Error("registry.json not found");
}

const change = readJSON(CHANGE_FILE);
const registry = readJSON(REGISTRY_FILE);

if (!Array.isArray(registry.anchors)) {
  throw new Error("registry.json must contain anchors array");
}

if (!Array.isArray(change.updates)) {
  console.log("No updates array found in change-request.json. Exiting.");
  process.exit(0);
}

let modified = false;

for (const update of change.updates) {
  const { id } = update;

  if (!id) {
    console.warn("Skipping update without id");
    continue;
  }

  const anchor = registry.anchors.find((item) => item.id === id);

  if (!anchor) {
    console.warn(`Anchor not found: ${id}`);
    continue;
  }

  ensureAllowedValue("classification", update.classification, VALID_CLASSIFICATIONS);
  ensureAllowedValue("status", update.status, VALID_STATUSES);
  ensureAllowedValue("market.visibility", update.visibility, VALID_VISIBILITIES);
  ensureAllowedValue("market.priority", update.priority, VALID_PRIORITIES);
  ensureAllowedValue(
    "market.sale_strategy",
    update.sale_strategy,
    VALID_SALE_STRATEGIES
  );

  modified =
    updateIfChanged(anchor, "classification", update.classification, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "status", update.status, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "status_label", update.status_label, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "stage", update.stage, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "type", update.type, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "canonical_term", update.canonical_term, id) ||
    modified;

  modified =
    updateIfChanged(anchor, "role", update.role, id) ||
    modified;

  if (!anchor.market || typeof anchor.market !== "object") {
    anchor.market = {};
    modified = true;
  }

  modified =
    updateIfChanged(anchor.market, "priority", update.priority, `${id}.market`) ||
    modified;

  modified =
    updateIfChanged(
      anchor.market,
      "sale_strategy",
      update.sale_strategy,
      `${id}.market`
    ) || modified;

  modified =
    updateIfChanged(
      anchor.market,
      "visibility",
      update.visibility,
      `${id}.market`
    ) || modified;

  const schemaPath = getSchemaPath(anchor);

  if (!schemaPath) {
    console.warn(`Schema path missing for ${id}`);
    continue;
  }

  if (!fs.existsSync(schemaPath)) {
    console.warn(`Schema not found for ${id}: ${anchor.schema}`);
    continue;
  }

  const schema = readJSON(schemaPath);
  let schemaModified = false;

  schemaModified =
    updateSchemaConst(schema, "id", anchor.id, id) || schemaModified;

  schemaModified =
    updateSchemaConst(schema, "canonical_term", anchor.canonical_term, id) ||
    schemaModified;

  schemaModified =
    updateSchemaConst(schema, "classification", anchor.classification, id) ||
    schemaModified;

  schemaModified =
    updateSchemaConst(schema, "status", anchor.status, id) || schemaModified;

  schemaModified =
    updateSchemaConst(schema, "type", anchor.type, id) || schemaModified;

  schemaModified = updateSchemaNaming(schema, anchor, id) || schemaModified;

  if (schemaModified) {
    writeJSON(schemaPath, schema);
    modified = true;
  }
}

if (modified) {
  writeJSON(REGISTRY_FILE, registry);
  console.log("Changes applied successfully.");
} else {
  console.log("No changes applied.");
}
