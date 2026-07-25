import fs from "fs";

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

const sortedAnchors = [...anchors].sort((a, b) => a.id.localeCompare(b.id));

const anchorsIndex = {
  registry: registry.registry,
  index_version: "1.0.1",
  generated_from: "registry.json",
  last_updated: registryLastUpdatedTimestamp(),
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

fs.writeFileSync(
  "anchors.index.json",
  JSON.stringify(anchorsIndex, null, 2) + "\n"
);

console.log("✅ anchors.index.json generated from registry.json");
