import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors || [];

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

const grouped = {
  featured: [],
  standard: [],
  background: [],
  hidden: []
};

const sorted = anchors
  .filter(anchor => anchor.market)
  .sort((a, b) => {
    const aPriority = priorityOrder[a.market?.priority] || 0;
    const bPriority = priorityOrder[b.market?.priority] || 0;
    return bPriority - aPriority;
  });

for (const anchor of sorted) {
  const visibility = anchor.market?.visibility || "standard";

  if (!grouped[visibility]) {
    grouped[visibility] = [];
  }

  grouped[visibility].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market?.priority,
    sale_strategy: anchor.market?.sale_strategy,
    classification: anchor.classification,
    status: anchor.status,
    status_label: anchor.status_label,
    stage: anchor.stage,
    type: anchor.type
  });
}

const marketIndex = {
  registry: registry.registry,
  index_version: "1.0.1",
  generated_from: "registry.json",
  last_updated: new Date().toISOString(),
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
