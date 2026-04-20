import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors || [];

const featured = anchors.filter(a => a.market?.visibility === "featured");
const standard = anchors.filter(a => a.market?.visibility === "standard");
const background = anchors.filter(a => a.market?.visibility === "background");

const renderCard = (anchor, tier) => {
  const isFeatured = tier === "featured";
  const isStandard = tier === "standard";

  const badge = isFeatured
    ? `<span class="badge badge-core">strategic transfer only</span>`
    : isStandard
    ? `<span class="badge badge-selective">selective discussion</span>`
    : `<span class="badge badge-available">available</span>`;

  const pricing = isFeatured
    ? `<span class="card-pricing">price on request</span>`
    : "";

  return `
      <div class="card ${isFeatured ? "card-core" : isStandard ? "card-selective" : ""}">
        <div class="card-top">
          <div class="card-name">${anchor.ens || anchor.id}</div>
        </div>
        <div class="card-term">
          ${anchor.canonical_term}<br>
          ${anchor.role}
        </div>
        <div class="card-footer">
          ${badge}
          ${pricing}
        </div>
      </div>`;
};

const featuredHtml = featured.map(a => renderCard(a, "featured")).join("\n");
const standardHtml = standard.map(a => renderCard(a, "standard")).join("\n");
const backgroundHtml = background.map(a => renderCard(a, "background")).join("\n");

console.log("✅ registry loaded");
console.log(`Total anchors: ${anchors.length}`);
console.log(`Featured: ${featured.length}`);
console.log(`Standard: ${standard.length}`);
console.log(`Background: ${background.length}`);
console.log("✅ HTML cards generated");
