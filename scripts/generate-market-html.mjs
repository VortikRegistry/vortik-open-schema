import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors || [];

const featured = anchors.filter(a => a.market?.visibility === "featured");
const standard = anchors.filter(a => a.market?.visibility === "standard");
const background = anchors.filter(a => a.market?.visibility === "background");

console.log("✅ registry loaded");
console.log(`Total anchors: ${anchors.length}`);
console.log(`Featured: ${featured.length}`);
console.log(`Standard: ${standard.length}`);
console.log(`Background: ${background.length}`);
