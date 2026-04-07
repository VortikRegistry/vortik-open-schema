const fs = require("fs");

const registry = JSON.parse(fs.readFileSync("registry.json"));
const changes = JSON.parse(fs.readFileSync("updates/change-request.json"));

const ALLOWED_FIELDS = [
  "canonical_term",
  "classification"
];

function applyUpdate(target, update) {
  Object.keys(update).forEach(key => {
    if (!ALLOWED_FIELDS.includes(key)) {
      console.error(`Invalid field: ${key}`);
      process.exit(1);
    }
    target[key] = update[key];
  });
}

changes.anchors.forEach(change => {
  const { id, update } = change;

  const registryAnchor = registry.anchors.find(a => a.id === id);
  if (!registryAnchor) {
    console.error(`Anchor not found in registry: ${id}`);
    process.exit(1);
  }

  applyUpdate(registryAnchor, update);

  const schemaPath = registryAnchor.schema;
  if (fs.existsSync(schemaPath)) {
    const schema = JSON.parse(fs.readFileSync(schemaPath));
    applyUpdate(schema, update);
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
  }

  const anchorPath = registryAnchor.anchor_doc;
  if (fs.existsSync(anchorPath)) {
    let content = fs.readFileSync(anchorPath, "utf-8");

    if (update.canonical_term) {
      content = content.replace(
        /Canonical term:.*\n/,
        `Canonical term: ${update.canonical_term}\n`
      );
    }

    if (update.classification) {
      content = content.replace(
        /Classification:.*\n/,
        `Classification: ${update.classification}\n`
      );
    }

    fs.writeFileSync(anchorPath, content);
  }
});

fs.writeFileSync("registry.json", JSON.stringify(registry, null, 2));

console.log("Changes applied.");
