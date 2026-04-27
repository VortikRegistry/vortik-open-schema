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

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

function getSchemaPath(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    return null;
  }

  return path.join(ROOT, anchor.schema);
}

function syncConstProperty(schema, key, value) {
  if (value === undefined || value === null) return;

  if (!schema.properties) {
    schema.properties = {};
  }

  if (!schema.properties[key]) {
    schema.properties[key] = {
      type: "string"
    };
  }

  schema.properties[key].type = "string";
  schema.properties[key].const = value;
}

function syncNaming(schema, anchor) {
  if (!schema.properties) {
    schema.properties = {};
  }

  if (!schema.properties.naming) {
    schema.properties.naming = {
      type: "object",
      additionalProperties: false,
      required: ["ens", "canonical"],
      properties: {}
    };
  }

  const naming = schema.properties.naming;

  if (!naming.type) {
    naming.type = "object";
  }

  if (!naming.properties) {
    naming.properties = {};
  }

  if (!Array.isArray(naming.required)) {
    naming.required = [];
  }

  for (const field of ["ens", "canonical"]) {
    if (!naming.required.includes(field)) {
      naming.required.push(field);
    }
  }

  if (!naming.properties.ens) {
    naming.properties.ens = {
      type: "string"
    };
  }

  if (!naming.properties.canonical) {
    naming.properties.canonical = {
      type: "string"
    };
  }

  naming.properties.ens.type = "string";
  naming.properties.ens.const = anchor.ens;

  naming.properties.canonical.type = "string";
  naming.properties.canonical.const = anchor.canonical_term;
}

function syncSchemaFromAnchor(schema, anchor) {
  syncConstProperty(schema, "id", anchor.id);
  syncConstProperty(schema, "canonical_term", anchor.canonical_term);
  syncConstProperty(schema, "classification", anchor.classification);
  syncConstProperty(schema, "status", anchor.status);
  syncConstProperty(schema, "type", anchor.type);

  syncNaming(schema, anchor);

  return schema;
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_PATH);
  const anchors = registry.anchors || [];

  if (!Array.isArray(anchors)) {
    throw new Error("registry.json anchors must be an array");
  }

  console.log("🔁 Syncing schema const fields from registry.json...\n");

  let updated = 0;
  let skipped = 0;

  for (const anchor of anchors) {
    const schemaPath = getSchemaPath(anchor);

    if (!schemaPath) {
      fail(`Anchor ${anchor.id || "(unknown)"} is missing schema path`);
      skipped++;
      continue;
    }

    if (!fs.existsSync(schemaPath)) {
      fail(`Schema not found for ${anchor.id}: ${anchor.schema}`);
      skipped++;
      continue;
    }

    const schema = readJSON(schemaPath);
    const before = JSON.stringify(schema);

    syncSchemaFromAnchor(schema, anchor);

    const after = JSON.stringify(schema);

    if (before !== after) {
      writeJSON(schemaPath, schema);
      ok(`Updated schema: ${anchor.schema}`);
      updated++;
    } else {
      ok(`Already aligned: ${anchor.schema}`);
    }
  }

  console.log("\n🎯 Schema sync complete.");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

main();
