
import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors;

// Helper para ordenar prioridades
const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

// Ordenar anchors por prioridad
const sorted = anchors
  .filter(a => a.market)
  .sort((a, b) => {
    return priorityOrder[b.market.priority] - priorityOrder[a.market.priority];
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

  grouped[vis].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market.priority,
    sale_strategy: anchor.market.sale_strategy,
    classification: anchor.classification,
    status: anchor.status_label
  });
}

// Resultado final
const marketIndex = {
  registry: registry.registry,
  index_version: "1.0.0",
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

// Guardar archivo
fs.writeFileSync(
  "market.index.json",
  JSON.stringify(marketIndex, null, 2) + "\n"
);

console.log("✅ market.index.json generated");
