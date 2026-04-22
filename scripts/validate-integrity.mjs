import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const requiredRootFiles = [
  "registry.json",
  "anchors.index.json",
  "market.index.json",
  "maps/coordination-stack.json",
  "maps/coordination-surfaces.json"
];

const requiredDocsFiles = [
  "docs/registry.json",
  "docs/anchors.index.json",
  "docs/market.index.json",
  "docs/maps/coordination-stack.json",
  "docs/maps/coordination-surfaces.json",
  "docs/index.html",
  "docs/app.html",
  "docs/market.html"
];

for (const file of requiredRootFiles) {
  if (!exists(file)) {
    fail(`Missing required root file: ${file}`);
  } else {
    ok(`Found root file: ${file}`);
  }
}

for (const file of requiredDocsFiles) {
  if (!exists(file)) {
    fail(`Missing required docs file: ${file}`);
  } else {
    ok(`Found docs file: ${file}`);
  }
}

if (!exists("registry.json")) {
  process.exit(process.exitCode || 1);
}

const registry = readJSON(path.join(ROOT, "registry.json"));

if (!Array.isArray(registry.anchors)) {
  fail(`registry.json does not contain a valid anchors array`);
  process.exit(process.exitCode || 1);
}

const seenIds = new Set();

for (const anchor of registry.anchors) {
  if (!isNonEmptyString(anchor.id)) {
    fail(`Anchor without valid id detected`);
    continue;
  }

  if (seenIds.has(anchor.id)) {
    fail(`Duplicate anchor id detected: ${anchor.id}`);
  } else {
    seenIds.add(anchor.id);
  }

  if (!isNonEmptyString(anchor.schema)) {
    fail(`Anchor ${anchor.id} is missing a valid schema path`);
  } else if (!exists(anchor.schema)) {
    fail(`Schema file not found for ${anchor.id}: ${anchor.schema}`);
  } else {
    ok(`Schema exists for ${anchor.id}`);
  }

  if (!isNonEmptyString(anchor.anchor_doc)) {
    fail(`Anchor ${anchor.id} is missing a valid anchor_doc path`);
  } else if (!exists(anchor.anchor_doc)) {
    fail(`Anchor doc not found for ${anchor.id}: ${anchor.anchor_doc}`);
  } else {
    ok(`Anchor doc exists for ${anchor.id}`);
  }
}

if (exists("anchors.index.json")) {
  const anchorsIndex = readJSON(path.join(ROOT, "anchors.index.json"));

  if (!Array.isArray(anchorsIndex.anchors)) {
    fail(`anchors.index.json does not contain a valid anchors array`);
  } else {
    const indexIds = new Set(anchorsIndex.anchors.map(a => a.id).filter(Boolean));

    for (const id of seenIds) {
      if (!indexIds.has(id)) {
        fail(`anchors.index.json is missing id from registry: ${id}`);
      }
    }

    for (const id of indexIds) {
      if (!seenIds.has(id)) {
        fail(`anchors.index.json contains extra id not in registry: ${id}`);
      }
    }

    ok(`anchors.index.json ids are aligned with registry.json`);
  }
}

if (exists("market.index.json")) {
  const marketIndex = readJSON(path.join(ROOT, "market.index.json"));

  if (!marketIndex.segments || typeof marketIndex.segments !== "object") {
    fail(`market.index.json does not contain a valid segments object`);
  } else {
    const segmentNames = ["featured", "standard", "background", "hidden"];

    for (const segmentName of segmentNames) {
      const segment = marketIndex.segments[segmentName];

      if (segment !== undefined && !Array.isArray(segment)) {
        fail(`market.index.json segment "${segmentName}" is not an array`);
        continue;
      }

      if (Array.isArray(segment)) {
        for (const item of segment) {
          if (!isNonEmptyString(item.id)) {
            fail(`market.index.json contains item without valid id in segment "${segmentName}"`);
            continue;
          }

          if (!seenIds.has(item.id)) {
            fail(`market.index.json contains id not found in registry.json: ${item.id}`);
          }
        }
      }
    }

    ok(`market.index.json structure is aligned with registry.json`);
  }
}

if (process.exitCode && process.exitCode !== 0) {
  console.error("\n🚨 Integrity validation failed.");
  process.exit(process.exitCode);
} else {
  console.log("\n🎯 Integrity validation passed.");
}
