import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors || [];

// Helper para ordenar prioridades
const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

// Ordenar anchors por prioridad
const sorted = anchors
  .filter(anchor => anchor.market)
  .sort((a, b) => {
    const aPriority = priorityOrder[a.market.priority] || 0;
    const bPriority = priorityOrder[b.market.priority] || 0;
    return bPriority - aPriority;
  });

// Agrupar por visibilidad
const grouped = {
  featured: [],
  standard: [],
  background: [],
  hidden: []
};

for (const anchor of sorted) {
  const vis = anchor.market.visibility || "standard";

  if (!grouped[vis]) {
    grouped[vis] = [];
  }

  grouped[vis].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market.priority,
    sale_strategy: anchor.market.sale_strategy,
    classification: anchor.classification,
    status: anchor.status,
    status_label: anchor.status_label,
    stage: anchor.stage,
    type: anchor.type
  });
}

// Resultado final
const marketIndex = {
  registry: registry.registry,
  index_version: "1.0.1",
  generated_from: "registry.json",
  last_updated: new Date().toISOString(),
  summary: {
    total: anchors.length,
    featured: grouped.featured.length,
    standard: grouped.standard.length,
    background: grouped.background.length
  },
  segments: grouped
};

// Guardar archivo dentro de docs para GitHub Pages
fs.writeFileSync(
  "docs/market.index.json",
  JSON.stringify(marketIndex, null, 2) + "\n"
);

console.log("✅ docs/market.index.json generated");
