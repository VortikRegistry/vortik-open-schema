import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const order = [
  "orderflowauction",
  "solverlayer",
  "executionmarket",
  "buildermarket",
  "epbs",
  "inclusionlist",
  "commitmentlayer",
  "preconflayer",
  "fastfinality"
];

// 👇 etiquetas más claras (clave)
const labels = {
  orderflowauction: "Order Flow Auctions",
  solverlayer: "Solver Networks",
  executionmarket: "Execution Coordination",
  buildermarket: "Builder Markets",
  epbs: "ePBS",
  inclusionlist: "Inclusion Lists / FOCIL",
  commitmentlayer: "Commitment Signaling",
  preconflayer: "Preconfirmation Systems",
  fastfinality: "Single-Slot Finality"
};

const map = [];

for (const id of order) {
  const anchor = registry.anchors.find(a => a.id === id);
  if (anchor) {
    map.push(labels[id] || anchor.id);
  }
}

const output = `# Coordination Map

${map.join("\n↓\n")}
`;

fs.writeFileSync("coordination-map.txt", output);

console.log("✅ Coordination map generated.");
