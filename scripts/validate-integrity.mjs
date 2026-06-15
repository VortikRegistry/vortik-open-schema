import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const REGISTRY_PATH = path.join(ROOT, "registry.json");
const ANCHORS_INDEX_PATH = path.join(ROOT, "anchors.index.json");
const MARKET_INDEX_PATH = path.join(ROOT, "market.index.json");

const AUTO_START = "<!-- AUTO-GENERATED:START -->";
const AUTO_END = "<!-- AUTO-GENERATED:END -->";
const MANUAL_START = "<!-- MANUAL-SOURCES:START -->";
const MANUAL_END = "<!-- MANUAL-SOURCES:END -->";

let errors = 0;
let warnings = 0;

function fail(message) {
  console.error(`❌ ${message}`);
  errors++;
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
  warnings++;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${path.relative(ROOT, filePath)} — ${error.message}`);
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function countOccurrences(content, marker) {
  let count = 0;
  let position = 0;

  while ((position = content.indexOf(marker, position)) !== -1) {
    count++;
    position += marker.length;
  }

  return count;
}

function validateRequiredFile(filePath, label) {
  if (!fileExists(filePath)) {
    fail(`${label} not found: ${path.relative(ROOT, filePath)}`);
    return false;
  }

  return true;
}

function getSchemaPath(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    return null;
  }

  return path.join(ROOT, anchor.schema);
}

function getAnchorDocPath(anchor) {
  if (!anchor.anchor_doc || typeof anchor.anchor_doc !== "string") {
    return null;
  }

  return path.join(ROOT, anchor.anchor_doc);
}

function getSourcesPath(anchor) {
  const schemaPath = getSchemaPath(anchor);

  if (!schemaPath) {
    return null;
  }

  return path.join(path.dirname(schemaPath), "sources.md");
}

function validateSourcesMarkers(anchor, sourcesPath) {
  if (!validateRequiredFile(sourcesPath, `sources.md for ${anchor.id}`)) {
    return;
  }

  const content = fs.readFileSync(sourcesPath, "utf8");

  const markers = [
    ["AUTO-GENERATED:START", AUTO_START],
    ["AUTO-GENERATED:END", AUTO_END],
    ["MANUAL-SOURCES:START", MANUAL_START],
    ["MANUAL-SOURCES:END", MANUAL_END]
  ];

  for (const [label, marker] of markers) {
    const count = countOccurrences(content, marker);

    if (count !== 1) {
      fail(
        `sources.md for ${anchor.id}: expected exactly 1 ${label}, found ${count}`
      );
    }
  }

  const autoStartIndex = content.indexOf(AUTO_START);
  const autoEndIndex = content.indexOf(AUTO_END);
  const manualStartIndex = content.indexOf(MANUAL_START);
  const manualEndIndex = content.indexOf(MANUAL_END);

  if (
    autoStartIndex !== -1 &&
    autoEndIndex !== -1 &&
    autoEndIndex < autoStartIndex
  ) {
    fail(`sources.md for ${anchor.id}: AUTO-GENERATED markers are misordered`);
  }

  if (
    manualStartIndex !== -1 &&
    manualEndIndex !== -1 &&
    manualEndIndex < manualStartIndex
  ) {
    fail(`sources.md for ${anchor.id}: MANUAL-SOURCES markers are misordered`);
  }

  if (
    autoEndIndex !== -1 &&
    manualStartIndex !== -1 &&
    manualStartIndex < autoEndIndex
  ) {
    fail(
      `sources.md for ${anchor.id}: manual section appears inside auto-generated section`
    );
  }
}

function validateSchemaStructure(anchor, schemaPath) {
  if (!validateRequiredFile(schemaPath, `Schema for ${anchor.id}`)) {
    return;
  }

  const schema = readJSON(schemaPath);

  if (!schema) {
    return;
  }

  if (schema.type !== "object") {
    fail(
      `Schema ${anchor.id}: root type must be "object", found "${schema.type}"`
    );
  }

  if (!schema.$schema || typeof schema.$schema !== "string") {
    fail(`Schema ${anchor.id}: missing $schema`);
  }

  if (!schema.$id || typeof schema.$id !== "string") {
    fail(`Schema ${anchor.id}: missing $id`);
  }

  if (!schema.title || typeof schema.title !== "string") {
    fail(`Schema ${anchor.id}: missing title`);
  }

  if (!schema.description || typeof schema.description !== "string") {
    fail(`Schema ${anchor.id}: missing description`);
  }

  if (schema.additionalProperties !== false) {
    fail(`Schema ${anchor.id}: additionalProperties must be false`);
  }

  if (!Array.isArray(schema.required)) {
    fail(`Schema ${anchor.id}: required must be an array`);
  }

  if (!schema.properties || typeof schema.properties !== "object") {
    fail(`Schema ${anchor.id}: missing properties object`);
    return;
  }

  const requiredConstFields = [
    "id",
    "canonical_term",
    "classification",
    "status",
    "type"
  ];

  for (const field of requiredConstFields) {
    const property = schema.properties[field];

    if (!property) {
      fail(`Schema ${anchor.id}: missing properties.${field}`);
      continue;
    }

    if (property.type !== "string") {
      fail(`Schema ${anchor.id}: properties.${field}.type must be "string"`);
    }

    if (property.const === undefined) {
      fail(`Schema ${anchor.id}: missing properties.${field}.const`);
    }
  }

  const expectedFields = {
    id: anchor.id,
    canonical_term: anchor.canonical_term,
    classification: anchor.classification,
    status: anchor.status,
    type: anchor.type
  };

  for (const [field, expectedValue] of Object.entries(expectedFields)) {
    const actualValue = schema.properties[field]?.const;

    if (actualValue !== undefined && actualValue !== expectedValue) {
      fail(
        `Schema ${anchor.id}: ${field} mismatch — registry="${expectedValue}" schema="${actualValue}"`
      );
    }
  }

  const naming = schema.properties.naming;

  if (!naming || typeof naming !== "object") {
    fail(`Schema ${anchor.id}: missing properties.naming`);
    return;
  }

  if (naming.type && naming.type !== "object") {
    fail(`Schema ${anchor.id}: properties.naming.type must be "object"`);
  }

  if (!naming.properties || typeof naming.properties !== "object") {
    fail(`Schema ${anchor.id}: missing properties.naming.properties`);
    return;
  }

  const ensConst = naming.properties.ens?.const;
  const canonicalConst = naming.properties.canonical?.const;

  if (ensConst !== undefined && ensConst !== anchor.ens) {
    fail(
      `Schema ${anchor.id}: naming.ens mismatch — registry="${anchor.ens}" schema="${ensConst}"`
    );
  }

  if (canonicalConst !== undefined && canonicalConst !== anchor.canonical_term) {
    fail(
      `Schema ${anchor.id}: naming.canonical mismatch — registry="${anchor.canonical_term}" schema="${canonicalConst}"`
    );
  }
}

function validateRegistry(registry) {
  console.log("\n🔍 Validating registry.json...");

  if (!registry || typeof registry !== "object") {
    fail("registry.json must contain an object");
    return;
  }

  if (!registry.registry || typeof registry.registry !== "string") {
    fail("registry.json missing registry string");
  }

  if (!registry.version || typeof registry.version !== "string") {
    fail("registry.json missing version string");
  }

  if (!Array.isArray(registry.anchors)) {
    fail("registry.json anchors must be an array");
    return;
  }

  if (registry.anchors.length === 0) {
    fail("registry.json anchors array is empty");
  }

  const ids = new Set();
  const ensNames = new Set();

  for (const anchor of registry.anchors) {
    const label = anchor.id || "(missing id)";

    const requiredFields = [
      "id",
      "ens",
      "canonical_term",
      "classification",
      "status",
      "type",
      "schema",
      "anchor_doc"
    ];

    for (const field of requiredFields) {
      if (
        anchor[field] === undefined ||
        anchor[field] === null ||
        anchor[field] === ""
      ) {
        fail(`Anchor ${label}: missing required field "${field}"`);
      }
    }

    if (ids.has(anchor.id)) {
      fail(`Duplicate anchor id: ${anchor.id}`);
    }

    if (anchor.id) {
      ids.add(anchor.id);
    }

    if (ensNames.has(anchor.ens)) {
      fail(`Duplicate ENS name: ${anchor.ens}`);
    }

    if (anchor.ens) {
      ensNames.add(anchor.ens);
    }

    if (!anchor.market || typeof anchor.market !== "object") {
      warn(`Anchor ${label}: missing market object`);
    } else {
      for (const field of ["priority", "visibility"]) {
        if (!anchor.market[field]) {
          warn(`Anchor ${label}: missing market.${field}`);
        }
      }
    }
  }

  ok(`Registry anchors checked: ${registry.anchors.length}`);
}

function validateAnchorFiles(registry) {
  console.log("\n🔍 Validating anchor-linked files...");

  for (const anchor of registry.anchors) {
    const schemaPath = getSchemaPath(anchor);
    const anchorDocPath = getAnchorDocPath(anchor);
    const sourcesPath = getSourcesPath(anchor);

    if (!schemaPath) {
      fail(`Anchor ${anchor.id}: missing schema path`);
    } else {
      validateSchemaStructure(anchor, schemaPath);
    }

    if (!anchorDocPath) {
      fail(`Anchor ${anchor.id}: missing anchor_doc path`);
    } else {
      validateRequiredFile(anchorDocPath, `Anchor document for ${anchor.id}`);
    }

    if (!sourcesPath) {
      fail(`Anchor ${anchor.id}: could not resolve sources.md path`);
    } else {
      validateSourcesMarkers(anchor, sourcesPath);
    }
  }
}

function validateAnchorsIndex(registry) {
  console.log("\n🔍 Validating anchors.index.json...");

  if (!fileExists(ANCHORS_INDEX_PATH)) {
    warn("anchors.index.json not found");
    return;
  }

  const index = readJSON(ANCHORS_INDEX_PATH);

  if (!index) {
    return;
  }

  const registryIds = new Set(registry.anchors.map((anchor) => anchor.id));

  let indexAnchors = [];

  if (Array.isArray(index.anchors)) {
    indexAnchors = index.anchors;
  } else if (Array.isArray(index.items)) {
    indexAnchors = index.items;
  } else {
    warn("anchors.index.json does not expose anchors/items array");
    return;
  }

  const indexIds = new Set(indexAnchors.map((anchor) => anchor.id));

  for (const id of registryIds) {
    if (!indexIds.has(id)) {
      fail(`anchors.index.json missing anchor id: ${id}`);
    }
  }

  for (const id of indexIds) {
    if (!registryIds.has(id)) {
      fail(`anchors.index.json contains unknown anchor id: ${id}`);
    }
  }

  ok("anchors.index.json aligned with registry ids");
}

function validateMarketIndex(registry) {
  console.log("\n🔍 Validating market.index.json...");

  if (!fileExists(MARKET_INDEX_PATH)) {
    warn("market.index.json not found");
    return;
  }

  const marketIndex = readJSON(MARKET_INDEX_PATH);

  if (!marketIndex) {
    return;
  }

  if (!marketIndex.segments || typeof marketIndex.segments !== "object") {
    fail("market.index.json missing segments object");
    return;
  }

  const expectedSegments = ["featured", "standard", "background", "hidden"];

  for (const segment of expectedSegments) {
    if (!Array.isArray(marketIndex.segments[segment])) {
      fail(`market.index.json segments.${segment} must be an array`);
    }
  }

  const indexedIds = new Set();

  for (const segment of expectedSegments) {
    const items = marketIndex.segments[segment] || [];

    for (const item of items) {
      if (!item.id) {
        fail(`market.index.json segment ${segment}: item missing id`);
        continue;
      }

      if (indexedIds.has(item.id)) {
        fail(`market.index.json duplicate id across segments: ${item.id}`);
      }

      indexedIds.add(item.id);
    }
  }

  const registryIdsWithMarket = new Set(
    registry.anchors
      .filter((anchor) => anchor.market && anchor.market.visibility !== "hidden")
      .map((anchor) => anchor.id)
  );

  for (const id of registryIdsWithMarket) {
    if (!indexedIds.has(id)) {
      fail(`market.index.json missing anchor id: ${id}`);
    }
  }

  ok("market.index.json checked");
}

function validateDocsSync() {
  console.log("\n🔍 Validating docs sync targets...");

  const pairs = [
    ["registry.json", "docs/registry.json"],
    ["anchors.index.json", "docs/anchors.index.json"],
    ["market.index.json", "docs/market.index.json"],
    ["schemas/index.md", "docs/schemas/index.md"],
    ["maps/emerging-signals.json", "docs/maps/emerging-signals.json"],
    ["maps/coordination-stack.json", "docs/maps/coordination-stack.json"],
    ["maps/coordination-surfaces.json", "docs/maps/coordination-surfaces.json"],
    ["maps/coordination-map.md", "docs/maps/coordination-map.md"]
  ];

  for (const [sourceRelative, docsRelative] of pairs) {
    const sourcePath = path.join(ROOT, sourceRelative);
    const docsPath = path.join(ROOT, docsRelative);

    if (!fileExists(sourcePath)) {
      warn(`Source sync file missing: ${sourceRelative}`);
      continue;
    }

    if (!fileExists(docsPath)) {
      warn(`Docs sync file missing: ${docsRelative}`);
      continue;
    }

    const sourceContent = fs.readFileSync(sourcePath, "utf8");
    const docsContent = fs.readFileSync(docsPath, "utf8");

    if (sourceContent !== docsContent) {
      fail(`Docs file out of sync: ${docsRelative}`);
    }
  }

  ok("Docs sync targets checked");
}

function main() {
  console.log("🔐 Vortik integrity validation\n");

  if (!validateRequiredFile(REGISTRY_PATH, "registry.json")) {
    process.exit(1);
  }

  const registry = readJSON(REGISTRY_PATH);

  if (!registry) {
    process.exit(1);
  }

  validateRegistry(registry);

  if (Array.isArray(registry.anchors)) {
    validateAnchorFiles(registry);
    validateAnchorsIndex(registry);
    validateMarketIndex(registry);
  }

  validateDocsSync();

  console.log("\n🎯 Integrity validation complete.");

  if (warnings > 0) {
    console.log(`Warnings: ${warnings}`);
  }

  if (errors > 0) {
    console.error(`Errors: ${errors}`);
    process.exit(1);
  }

  console.log("✅ No integrity errors found.");
}

main();
