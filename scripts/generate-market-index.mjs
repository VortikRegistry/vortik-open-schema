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

const allowedSaleStrategies = new Set([
  "strategic_custody",
  "selective_inquiry",
  "transfer_ready"
]);

const legacySaleStrategyMap = {
  hold: "strategic_custody",
  monitor: "selective_inquiry",
  opportunistic: "selective_inquiry",
  liquidate: "transfer_ready"
};

function normalizeSaleStrategy(value, anchorId) {
  if (allowedSaleStrategies.has(value)) {
    return value;
  }

  if (legacySaleStrategyMap[value]) {
    console.warn(
      `⚠️  Legacy sale_strategy "${value}" found in "${anchorId}". Normalized to "${legacySaleStrategyMap[value]}".`
    );
    return legacySaleStrategyMap[value];
  }

  console.warn(
    `⚠️  Missing or unknown sale_strategy "${value}" found in "${anchorId}". Defaulted to "selective_inquiry".`
  );

  return "selective_inquiry";
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
  const saleStrategy = normalizeSaleStrategy(anchor.market?.sale_strategy, anchor.id);

  grouped[visibility].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market?.priority,
    sale_strategy: saleStrategy,
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
console.log("✅ sale_strategy values normalized to strategic_custody / selective_inquiry / transfer_ready");
