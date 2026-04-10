import fs from "fs";

// ---------- LOAD MODEL ----------

let model;

try {
  model = JSON.parse(fs.readFileSync("maps/coordination-stack.json", "utf8"));
} catch (err) {
  console.error("❌ Failed to read coordination-stack.json");
  process.exit(1);
}

// ---------- BUILD OUTPUT ----------

let output = `# Coordination Surfaces Map (Ethereum)\n\n`;

output += `Model: ${model.model} v${model.version}\n`;
output += `Type: ${model.type}\n\n`;

output += `## Principles\n`;
for (const p of model.principles) {
  output += `- ${p}\n`;
}

output += `\n---\n\n`;

output += `## Domains\n\n`;

for (const domain of model.domains) {
  output += `### ${domain.name}\n`;
  output += `- id: ${domain.id}\n`;
  output += `- description: ${domain.description}\n`;
  output += `- anchors: ${domain.anchors.join(", ")}\n`;

  if (domain.upstream.length > 0) {
    output += `- upstream: ${domain.upstream.join(", ")}\n`;
  }

  if (domain.downstream.length > 0) {
    output += `- downstream: ${domain.downstream.join(", ")}\n`;
  }

  if (domain.interacts_with.length > 0) {
    output += `- interacts_with: ${domain.interacts_with.join(", ")}\n`;
  }

  output += `\n`;
}

output += `---\n\n`;

output += `## Relationships\n\n`;

for (const rel of model.relationships) {
  if (rel.type === "flow") {
    output += `- flow: ${rel.from} → ${rel.to}\n`;
  }

  if (rel.type === "overlap") {
    output += `- overlap: ${rel.between.join(" ↔ ")}\n`;
  }
}

output += `\n---\n\n`;

output += `## Notes\n\n`;

for (const note of model.notes) {
  output += `- ${note}\n`;
}

// ---------- WRITE FILE ----------

fs.writeFileSync("maps/coordination-map.md", output);

console.log("✅ Coordination surfaces map generated.");
