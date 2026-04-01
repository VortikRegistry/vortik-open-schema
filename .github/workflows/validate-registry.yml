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

function validateAnchorEntry(anchor) {
  assert(anchor.id, `Anchor missing "id": ${JSON.stringify(anchor)}`);
  assert(anchor.ens, `Anchor "${anchor.id}" missing "ens"`);
  assert(anchor.schema, `Anchor "${anchor.id}" missing "schema"`);
  assert(anchor.anchor_doc, `Anchor "${anchor.id}" missing "anchor_doc"`);

  const schemaPath = path.join(ROOT, anchor.schema);
  const docPath = path.join(ROOT, anchor.anchor_doc);

  assert(
    fs.existsSync(schemaPath),
    `Schema file not found for "${anchor.id}": ${anchor.schema}`
  );

  assert(
    fs.existsSync(docPath),
    `Anchor doc not found for "${anchor.id}": ${anchor.anchor_doc}`
  );

  const schema = readJson(schemaPath);

  const schemaId = schema?.properties?.id?.const;
  const schemaEns = schema?.properties?.naming?.properties?.ens?.const;

  assert(
    schemaId,
    `Schema "${anchor.schema}" missing properties.id.const`
  );

  assert(
    schemaEns,
    `Schema "${anchor.schema}" missing naming.properties.ens.const`
  );

  assert(
    anchor.id === schemaId,
    `ID mismatch for "${anchor.id}": registry has "${anchor.id}" but schema has "${schemaId}"`
  );

  assert(
    anchor.ens === schemaEns,
    `ENS mismatch for "${anchor.id}": registry has "${anchor.ens}" but schema has "${schemaEns}"`
  );
}

function validateExternalPrimitive(entry) {
  assert(entry.id, `External primitive missing "id": ${JSON.stringify(entry)}`);
  assert(entry.name, `External primitive "${entry.id}" missing "name"`);
  assert(
    entry.canonical_term,
    `External primitive "${entry.id}" missing "canonical_term"`
  );
  assert(
    entry.category,
    `External primitive "${entry.id}" missing "category"`
  );
  assert(
    entry.coverage_status,
    `External primitive "${entry.id}" missing "coverage_status"`
  );
}

function main() {
  const registry = readJson(REGISTRY_PATH);

  assert(registry.registry, `registry.json missing "registry"`);
  assert(registry.version, `registry.json missing "version"`);
  assert(
    Array.isArray(registry.anchors),
    `registry.json missing "anchors" array`
  );

  const seenIds = new Set();
  const seenEns = new Set();

  for (const anchor of registry.anchors) {
    validateAnchorEntry(anchor);

    assert(
      !seenIds.has(anchor.id),
      `Duplicate anchor id found: "${anchor.id}"`
    );

    assert(
      !seenEns.has(anchor.ens),
      `Duplicate ENS found: "${anchor.ens}"`
    );

    seenIds.add(anchor.id);
    seenEns.add(anchor.ens);
  }

  if (Array.isArray(registry.external_primitives)) {
    const seenExternal = new Set();

    for (const entry of registry.external_primitives) {
      validateExternalPrimitive(entry);

      assert(
        !seenExternal.has(entry.id),
        `Duplicate external primitive id found: "${entry.id}"`
      );

      seenExternal.add(entry.id);
    }
  }

  console.log("✅ Registry validation passed.");
}

try {
  main();
} catch (err) {
  console.error(`❌ Registry validation failed.\n${err.message}`);
  process.exit(1);
}
