import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "registry.json");

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to read JSON: ${filePath}\n${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

function validateAnchorEntry(anchor) {
  assert(anchor.id, `Anchor missing "id"`);
  assert(anchor.ens, `Anchor "${anchor.id}" missing "ens"`);
  assert(anchor.schema, `Anchor "${anchor.id}" missing "schema"`);
  assert(anchor.anchor_doc, `Anchor "${anchor.id}" missing "anchor_doc"`);

  const schemaPath = path.join(ROOT, anchor.schema);
  const docPath = path.join(ROOT, anchor.anchor_doc);

  assert(fs.existsSync(schemaPath), `Missing schema: ${anchor.schema}`);
  assert(fs.existsSync(docPath), `Missing anchor doc: ${anchor.anchor_doc}`);

  const schema = readJson(schemaPath);

  const schemaId = schema?.properties?.id?.const;
  const schemaEns = schema?.properties?.naming?.properties?.ens?.const;
  const schemaTerm = schema?.properties?.canonical_term?.const;
  const schemaClassification = schema?.properties?.classification?.const;

  assert(schemaId, `Schema missing id.const`);
  assert(schemaEns, `Schema missing ens.const`);

  assert(anchor.id === schemaId, `ID mismatch: ${anchor.id}`);
  assert(anchor.ens === schemaEns, `ENS mismatch: ${anchor.ens}`);

  // 🔥 NUEVO — validación semántica

  if (anchor.canonical_term && schemaTerm) {
    if (anchor.canonical_term !== schemaTerm) {
      warn(
        `canonical_term mismatch for "${anchor.id}" (registry vs schema)`
      );
    }
  }

  if (anchor.classification && schemaClassification) {
    if (anchor.classification !== schemaClassification) {
      warn(
        `classification mismatch for "${anchor.id}" (registry vs schema)`
      );
    }
  }

  // sanity checks

  if (anchor.ens && !anchor.ens.endsWith(".eth")) {
    warn(`ENS does not end with .eth: ${anchor.ens}`);
  }

  if (anchor.id !== anchor.id.toLowerCase()) {
    warn(`Anchor id not lowercase: ${anchor.id}`);
  }
}

function validateExternalPrimitive(entry) {
  assert(entry.id, `External primitive missing id`);
  assert(entry.name, `External primitive "${entry.id}" missing name`);
  assert(entry.canonical_term, `Missing canonical_term`);
  assert(entry.category, `Missing category`);
  assert(entry.coverage_status, `Missing coverage_status`);

  // warning checks

  if (!entry.summary || entry.summary.length < 20) {
    warn(`Weak summary for external primitive "${entry.id}"`);
  }
}

function main() {
  const registry = readJson(REGISTRY_PATH);

  assert(registry.registry, `Missing registry name`);
  assert(registry.version, `Missing version`);
  assert(Array.isArray(registry.anchors), `Missing anchors array`);

  const seenIds = new Set();
  const seenEns = new Set();

  for (const anchor of registry.anchors) {
    validateAnchorEntry(anchor);

    assert(!seenIds.has(anchor.id), `Duplicate id: ${anchor.id}`);
    assert(!seenEns.has(anchor.ens), `Duplicate ENS: ${anchor.ens}`);

    seenIds.add(anchor.id);
    seenEns.add(anchor.ens);
  }

  if (Array.isArray(registry.external_primitives)) {
    const seenExternal = new Set();

    for (const entry of registry.external_primitives) {
      validateExternalPrimitive(entry);

      assert(
        !seenExternal.has(entry.id),
        `Duplicate external id: ${entry.id}`
      );

      seenExternal.add(entry.id);
    }
  }

  console.log("✅ Registry validation passed (V2).");
}

try {
  main();
} catch (err) {
  console.error(`❌ Validation failed.\n${err.message}`);
  process.exit(1);
}
