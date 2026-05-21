import fs from "fs";
import path from "path";

const ROOT = process.cwd();

let errors = 0;

function fail(message) {
  console.error(`❌ ${message}`);
  errors++;
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function filePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(filePath(relativePath)) && fs.statSync(filePath(relativePath)).isFile();
}

function read(relativePath) {
  return fs.readFileSync(filePath(relativePath), "utf8");
}

function readJSON(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function validateExactSync(sourceRelative, docsRelative) {
  if (!exists(sourceRelative)) {
    fail(`Missing source file: ${sourceRelative}`);
    return;
  }

  if (!exists(docsRelative)) {
    fail(`Missing docs mirror file: ${docsRelative}`);
    return;
  }

  const sourceContent = read(sourceRelative);
  const docsContent = read(docsRelative);

  if (sourceContent !== docsContent) {
    fail(`Out of sync: ${docsRelative} must match ${sourceRelative}`);
    return;
  }

  ok(`Synced: ${sourceRelative} -> ${docsRelative}`);
}

function validateAnchorsMapAgainstRegistry() {
  const registry = readJSON("registry.json");
  const anchorsMap = readJSON("maps/anchors-map.json");

  if (!registry || !anchorsMap) {
    return;
  }

  if (!Array.isArray(registry.anchors)) {
    fail("registry.json must contain an anchors array");
    return;
  }

  if (!Array.isArray(anchorsMap)) {
    fail("maps/anchors-map.json must be an array");
    return;
  }

  const registryById = new Map();

  for (const anchor of registry.anchors) {
    if (!anchor.id) {
      fail("registry.json contains an anchor without id");
      continue;
    }

    registryById.set(anchor.id, anchor);
  }

  const mapIds = new Set();

  for (const item of anchorsMap) {
    if (!item || typeof item !== "object") {
      fail("maps/anchors-map.json contains a non-object item");
      continue;
    }

    if (!item.id || typeof item.id !== "string") {
      fail("maps/anchors-map.json contains an item without string id");
      continue;
    }

    if (mapIds.has(item.id)) {
      fail(`maps/anchors-map.json contains duplicate id: ${item.id}`);
      continue;
    }

    mapIds.add(item.id);

    const registryAnchor = registryById.get(item.id);

    if (!registryAnchor) {
      fail(`maps/anchors-map.json contains unknown id: ${item.id}`);
      continue;
    }

    if (item.term !== registryAnchor.canonical_term) {
      fail(
        `maps/anchors-map.json mismatch for ${item.id}.term: expected "${registryAnchor.canonical_term}", found "${item.term}"`
      );
    }

    if (item.classification !== registryAnchor.classification) {
      fail(
        `maps/anchors-map.json mismatch for ${item.id}.classification: expected "${registryAnchor.classification}", found "${item.classification}"`
      );
    }
  }

  for (const anchor of registry.anchors) {
    if (!mapIds.has(anchor.id)) {
      fail(`maps/anchors-map.json is missing anchor id: ${anchor.id}`);
    }
  }

  ok("maps/anchors-map.json aligned with registry.json");
}

function main() {
  console.log("🔍 Validating derived file synchronization...");

  validateExactSync("registry.json", "docs/registry.json");
  validateExactSync("anchors.index.json", "docs/anchors.index.json");
  validateExactSync("market.index.json", "docs/market.index.json");
  validateExactSync("maps/anchors-map.json", "docs/maps/anchors-map.json");

  validateAnchorsMapAgainstRegistry();

  if (errors > 0) {
    console.error(`\nDerived sync validation failed. Errors: ${errors}`);
    process.exit(1);
  }

  console.log("\n✅ Derived sync validation passed.");
}

main();
