
const fs = require("fs");

const registry = JSON.parse(fs.readFileSync("registry.json"));

// ===== GENERAR MAP =====
const map = registry.anchors.map(a => ({
  id: a.id,
  term: a.canonical_term,
  classification: a.classification
}));

fs.writeFileSync("maps/anchors-map.json", JSON.stringify(map, null, 2));

// ===== GENERAR INDEX SIMPLE =====
let index = "# Vortik Index\n\n";

registry.anchors.forEach(a => {
  index += `- ${a.canonical_term} (${a.id})\n`;
});

fs.writeFileSync("INDEX.md", index);

console.log("Views generated.");
