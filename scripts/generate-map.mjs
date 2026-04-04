import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

// 🔥 pipeline real (actualizado)
const order = [
  "orderflowauction",
  "solverlayer",
  "buildermarket",
  "epbs",
  "inclusionlist",
  "ssf"
];

// 👇 etiquetas alineadas con narrativa actual
const labels = {
  orderflowauction: "Order Flow Routing",
  solverlayer: "Solver Coordination",
  buildermarket: "Builder Construction",
  epbs: "ePBS (Proposer-Builder Separation)",
  inclusionlist: "Inclusion Constraints (FOCIL)",
  ssf: "Finality (Single-Slot Finality)"
};

const map = [];

for (const id of order) {
  const anchor = registry.anchors.find(a => a.id === id);
  if (anchor) {
    map.push(labels[id] || anchor.id);
  }
}

const output = `# Coordination Pipeline (Ethereum 2026)

${map.join("\n↓\n")}
`;

fs.writeFileSync("coordination-map.txt", output);

console.log("✅ Coordination map generated.");
