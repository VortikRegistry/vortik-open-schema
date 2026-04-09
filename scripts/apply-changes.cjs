#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const CHANGE_FILE = path.join(ROOT, "updates", "change-request.json");
const REGISTRY_FILE = path.join(ROOT, "registry.json");
const SCHEMAS_DIR = path.join(ROOT, "schemas");

// ---------- Helpers ----------

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function findSchemaFile(anchorId, version) {
  const dir = path.join(SCHEMAS_DIR, anchorId, version);
  if (!fs.existsSync(dir)) return null;

  const file = path.join(dir, "schema.json");
  return fs.existsSync(file) ? file : null;
}

// ---------- Load files ----------

if (!fs.existsSync(CHANGE_FILE)) {
  console.log("No change-request.json found. Exiting.");
  process.exit(0);
}

const change = readJSON(CHANGE_FILE);

if (!fs.existsSync(REGISTRY_FILE)) {
  throw new Error("registry.json not found");
}

const registry = readJSON(REGISTRY_FILE);

// ---------- Apply changes ----------

let modified = false;

for (const update of change.updates || []) {
  const { id, classification } = update;

  const anchor = registry.anchors?.find(a => a.id === id);
  if (!anchor) {
    console.warn(`Anchor not found: ${id}`);
    continue;
  }

  // 1. Update registry
  if (anchor.classification !== classification) {
    console.log(`Updating registry: ${id} -> ${classification}`);
    anchor.classification = classification;
    modified = true;
  }

  // 2. Update schema
  const schemaPath = findSchemaFile(id, anchor.version);
  if (!schemaPath) {
    console.warn(`Schema not found for ${id}`);
    continue;
  }

  const schema = readJSON(schemaPath);

  if (
    schema.properties &&
    schema.properties.classification &&
    schema.properties.classification.const !== classification
  ) {
    console.log(`Updating schema: ${id} -> ${classification}`);
    schema.properties.classification.const = classification;

    // 🔥 CRITICAL FIX: remove root-level corruption
    if (schema.classification) {
      console.log(`Cleaning root classification in ${id}`);
      delete schema.classification;
    }

    writeJSON(schemaPath, schema);
    modified = true;
  }
}

// ---------- Save registry ----------

if (modified) {
  writeJSON(REGISTRY_FILE, registry);
  console.log("Changes applied successfully.");
} else {
  console.log("No changes applied.");
}
