import fs from "fs";

const OUTPUT_PATH = "anchors.index.json";
const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const anchors = registry.anchors || [];

function registryLastUpdatedTimestamp() {
  const value = registry.last_updated;

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("registry.json must define a non-empty last_updated value");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`registry.json last_updated is not a valid date: ${value}`);
  }

  return parsed.toISOString();
}

function withoutLastUpdated(value) {
  const { last_updated: _lastUpdated, ...rest } = value;
  return rest;
}

function stableLastUpdated(outputPath, nextComparable) {
  const fallback = registryLastUpdatedTimestamp();

  if (!fs.existsSync(outputPath)) {
    return fallback;
  }

  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const existingComparable = withoutLastUpdated(existing);

    if (JSON.stringify(existingComparable) === JSON.stringify(nextComparable)) {
      return typeof existing.last_updated === "string" && existing.last_updated
        ? existing.last_updated
        : fallback;
    }
  } catch {
    // Invalid or unreadable generated output is replaced deterministically below.
  }

  return fallback;
}

const sortedAnchors = [...anchors].sort((a, b) => a.id.localeCompare(b.id));

const comparableIndex = {
  registry: registry.registry,
  index_version: "1.0.1",
  generated_from: "registry.json",
  anchors: sortedAnchors.map((anchor) => ({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    classification: anchor.classification,
    status: anchor.status,
    status_label: anchor.status_label,
    stage: anchor.stage,
    market_priority: anchor.market_priority,
    type: anchor.type,
    role: anchor.role,
    schema: anchor.schema,
    anchor_doc: anchor.anchor_doc
  }))
};

const anchorsIndex = {
  registry: comparableIndex.registry,
  index_version: comparableIndex.index_version,
  generated_from: comparableIndex.generated_from,
  last_updated: stableLastUpdated(OUTPUT_PATH, comparableIndex),
  anchors: comparableIndex.anchors
};

fs.writeFileSync(
  OUTPUT_PATH,
  JSON.stringify(anchorsIndex, null, 2) + "\n"
);

console.log("✅ anchors.index.json generated from registry.json");
