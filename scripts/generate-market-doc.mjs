import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const MARKET_INDEX_PATH = path.join(ROOT, "docs", "market.index.json");
const OUTPUT_PATH = path.join(ROOT, "docs", "market.md");

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeText(value, fallback = "Not specified") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function renderSection(title, description, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  const rows = items.map((item) => {
    return `- **${normalizeText(item.ens)}** — ${normalizeText(item.canonical_term)}  
  - Registry ID: \`${normalizeText(item.id)}\`  
  - Priority: ${normalizeText(item.priority)}  
  - Classification: ${normalizeText(item.classification)}  
  - Status: ${normalizeText(item.status)}  
  - Stage: ${normalizeText(item.stage)}  
  - Type: ${normalizeText(item.type)}`;
  });

  return `## ${title}

${description}

${rows.join("\n\n")}

`;
}

function main() {
  if (!fs.existsSync(MARKET_INDEX_PATH)) {
    throw new Error(`market.index.json not found at ${MARKET_INDEX_PATH}`);
  }

  const market = readJSON(MARKET_INDEX_PATH);

  if (!market.summary || !market.segments) {
    throw new Error("market.index.json must contain summary and segments");
  }

  const output = `# Vortik Strategic Anchors

Auto-generated from \`docs/market.index.json\`.  
Do not edit manually.

This document presents selected ENS anchors tracked by the Vortik Semantic Registry.

It is a strategic visibility layer, not an official protocol specification and not a market-price document.

---

## Summary

- Total anchors: ${normalizeText(market.summary.total)}
- Featured: ${normalizeText(market.summary.featured)}
- Standard: ${normalizeText(market.summary.standard)}
- Background: ${normalizeText(market.summary.background)}
- Hidden: ${normalizeText(market.summary.hidden, 0)}

---

${renderSection(
  "Featured",
  "High-signal anchors with strong strategic visibility inside the registry.",
  market.segments.featured
)}${renderSection(
  "Standard",
  "Tracked anchors with meaningful semantic or external coordination relevance.",
  market.segments.standard
)}${renderSection(
  "Background",
  "Legacy, deprecated, external, or lower-alignment anchors retained for semantic comparison and registry completeness.",
  market.segments.background
)}${renderSection(
  "Hidden",
  "Anchors hidden from standard strategic visibility outputs.",
  market.segments.hidden
)}`;

  fs.writeFileSync(OUTPUT_PATH, output.trimEnd() + "\n");

  console.log("✅ docs/market.md generated");
}

main();
