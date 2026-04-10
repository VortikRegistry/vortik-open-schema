import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchorsIndex = {
  registry: registry.registry,
  index_version: "1.0.0",
  generated_from: "registry.json",
  anchors: registry.anchors.map(anchor => ({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    classification: anchor.classification,
    status: anchor.status,
    type: anchor.type,
    role: anchor.role,
    schema: anchor.schema,
    anchor_doc: anchor.anchor_doc
  }))
};

fs.writeFileSync(
  "anchors.index.json",
  JSON.stringify(anchorsIndex, null, 2) + "\n"
);

console.log("✅ anchors.index.json generated from registry.json");
