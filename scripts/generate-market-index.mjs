import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const anchors = registry.anchors || [];

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

const allowedVisibility = new Set([
  "featured",
  "standard",
  "background",
  "hidden"
]);

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

function normalizeVisibility(value, anchorId) {
  if (allowedVisibility.has(value)) {
    return value;
  }

  console.warn(
    `⚠️  Missing or unknown visibility "${value}" found in "${anchorId}". Defaulted to "standard".`
  );

  return "standard";
}

const grouped = {
  featured: [],
  standard: [],
  background: [],
  hidden: []
};

const sorted = anchors
  .filter((anchor) => anchor.market)
  .sort((a, b) => {
    const aPriority = priorityOrder[a.market?.priority] || 0;
    const bPriority = priorityOrder[b.market?.priority] || 0;

    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }

    return String(a.id).localeCompare(String(b.id));
  });

for (const anchor of sorted) {
  const visibility = normalizeVisibility(anchor.market?.visibility, anchor.id);
  grouped[visibility].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market?.priority,
    visibility,
    classification: anchor.classification,
    status: anchor.status,
    status_label: anchor.status_label,
    stage: anchor.stage,
    type: anchor.type
  });
}

const marketIndex = {
  registry: registry.registry,
  index_version: "1.1.0",
  generated_from: "registry.json",
  last_updated: registryLastUpdatedTimestamp(),
  scope: "technical semantic prioritization only",
  summary: {
    total: anchors.length,
    featured: grouped.featured.length,
    standard: grouped.standard.length,
    background: grouped.background.length,
    hidden: grouped.hidden.length
  },
  segments: grouped
};

const output = JSON.stringify(marketIndex, null, 2) + "\n";

fs.writeFileSync("market.index.json", output);
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/market.index.json", output);

console.log("✅ market.index.json generated");
console.log("✅ docs/market.index.json generated");
console.log("✅ strategic index contains technical registry metadata only");
