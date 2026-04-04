import fs from "fs";

// 📥 cargar registry con protección básica
let registry;
try {
  registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
} catch (err) {
  console.error("❌ Failed to read registry.json");
  process.exit(1);
}

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
  buildermarket: "Payload Construction",
  epbs: "ePBS (Proposer-Builder Separation)",
  inclusionlist: "Inclusion Constraints (FOCIL)",
  ssf: "Finality (Single-Slot Finality)"
};

const map = [];

for (const id of order) {
  const anchor = registry.anchors.find(a => a.id === id);

  if (!anchor) {
    console.warn(`⚠️ Missing anchor: ${id}`);
    continue;
  }

  map.push(labels[id] || anchor.id);
}

// 📄 output final
const output = `# Coordination Pipeline (Ethereum 2026)

${map.join("\n↓\n")}
`;

fs.writeFileSync("coordination-map.txt", output);

console.log("✅ Coordination map generated.");
