import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

console.log("✅ registry loaded");
console.log(`Anchors found: ${registry.anchors.length}`);
