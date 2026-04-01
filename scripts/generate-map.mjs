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
  "ssf"
];

const map = [];

for (const id of order) {
  const anchor = registry.anchors.find(a => a.id === id);
  if (anchor) {
    map.push(anchor.id);
  }
}

const output = map.join("\n↓\n");

fs.writeFileSync("coordination-map.txt", output);

console.log("✅ Coordination map generated.");
