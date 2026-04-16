
import fs from "fs";

const market = JSON.parse(fs.readFileSync("market.index.json", "utf8"));

const section = (title, items) => {
  if (!items.length) return "";

  const rows = items.map(i => {
    return `- **${i.ens}** — ${i.canonical_term}  
  priority: ${i.priority}  
  classification: ${i.classification}  
  status: ${i.status}`;
  });

  return `## ${title}\n\n${rows.join("\n\n")}\n\n`;
};

let output = `# Vortik Market Layer

Auto-generated from market.index.json  
Do not edit manually.

---

## Summary

- Total anchors: ${market.summary.total}
- Featured: ${market.summary.featured}
- Standard: ${market.summary.standard}
- Background: ${market.summary.background}

---

`;

output += section("🔥 Featured (High Signal)", market.segments.featured);
output += section("Standard", market.segments.standard);
output += section("Background", market.segments.background);

fs.writeFileSync("docs/market.md", output);

console.log("✅ market.md generated");
