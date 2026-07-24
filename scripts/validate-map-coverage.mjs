import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const MAPS = [
  {
    path: "maps/coordination-surfaces.json",
    collections: ["surfaces", "ambiguous_surfaces"]
  },
  {
    path: "maps/coordination-stack.json",
    collections: ["domains"]
  }
];

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath);

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read ${relativePath}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates].sort();
}

function assertExactIds(label, actualIds, registryIds) {
  const actualSet = new Set(actualIds);
  const missing = [...registryIds].filter((id) => !actualSet.has(id)).sort();
  const unknown = [...actualSet].filter((id) => !registryIds.has(id)).sort();
  const duplicates = findDuplicates(actualIds);

  assert(
    missing.length === 0,
    `${label} is missing registry anchor id(s): ${missing.join(", ")}`
  );
  assert(
    unknown.length === 0,
    `${label} contains unknown anchor id(s): ${unknown.join(", ")}`
  );
  assert(
    duplicates.length === 0,
    `${label} contains duplicate anchor id(s): ${duplicates.join(", ")}`
  );
}

function collectMappedIds(map, config) {
  const mappedIds = [];

  for (const collectionName of config.collections) {
    const collection = map[collectionName];
    assert(
      Array.isArray(collection),
      `${config.path} missing array "${collectionName}"`
    );

    for (const group of collection) {
      assert(
        Array.isArray(group.anchors),
        `${config.path} ${collectionName} entry "${group.id ?? "<missing id>"}" missing anchors array`
      );
      mappedIds.push(...group.anchors);
    }
  }

  return mappedIds;
}

function validateMap(config, registry, registryIds) {
  const map = readJson(config.path);
  const declaredIds = map?.coverage?.registry_anchors_mapped;
  const expectedCoverageStatus = `complete_for_registry_v${registry.version}`;

  assert(
    Array.isArray(declaredIds),
    `${config.path} missing coverage.registry_anchors_mapped array`
  );
  assert(
    map?.coverage?.coverage_status === expectedCoverageStatus,
    `${config.path} coverage_status must be "${expectedCoverageStatus}", found ${JSON.stringify(map?.coverage?.coverage_status)}`
  );

  assertExactIds(`${config.path} declared coverage`, declaredIds, registryIds);

  const mappedIds = collectMappedIds(map, config);
  assertExactIds(`${config.path} mapped anchors`, mappedIds, registryIds);

  console.log(`✅ ${config.path} covers all ${registryIds.size} registry anchors exactly once.`);
}

function main() {
  const registry = readJson("registry.json");

  assert(Array.isArray(registry.anchors), "registry.json missing anchors array");

  const registryIds = new Set(registry.anchors.map((anchor) => anchor.id));
  assert(
    registryIds.size === registry.anchors.length,
    "registry.json contains duplicate anchor ids"
  );

  for (const config of MAPS) {
    validateMap(config, registry, registryIds);
  }

  console.log("✅ Coordination map coverage validation passed.");
}

try {
  main();
} catch (error) {
  console.error(`❌ Coordination map coverage validation failed.\n${error.message}`);
  process.exit(1);
}
