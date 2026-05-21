import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "registry.json");

const AUTO_START = "<!-- AUTO-GENERATED:START -->";
const AUTO_END = "<!-- AUTO-GENERATED:END -->";
const MANUAL_START = "<!-- MANUAL-SOURCES:START -->";
const MANUAL_END = "<!-- MANUAL-SOURCES:END -->";

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function countOccurrences(content, marker) {
  let count = 0;
  let position = 0;

  while ((position = content.indexOf(marker, position)) !== -1) {
    count++;
    position += marker.length;
  }

  return count;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function getSourcesPath(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    throw new Error(`Anchor ${anchor.id} is missing schema path`);
  }

  return path.join(ROOT, path.dirname(anchor.schema), "sources.md");
}

function getClassificationDescription(classification) {
  const descriptions = {
    core: "Protocol-aligned anchor with strong semantic grounding.",
    repairable:
      "Valid underlying concept with imperfect ENS alignment or terminology mismatch.",
    premature:
      "Real or emerging concept that is not yet stable enough to treat as canonical.",
    external:
      "Ethereum-adjacent or external coordination surface outside the current Ethereum L1 protocol core.",
    deprecated:
      "Legacy, broad, or market-oriented abstraction with reduced precision relative to protocol-native terminology."
  };

  return descriptions[classification] || "Semantic classification tracked by the registry.";
}

function getTypeDescription(type) {
  const descriptions = {
    primitive: "Protocol or research primitive tracked as a semantic object.",
    constraint: "Constraint surface affecting coordination behavior.",
    external_actor:
      "External actor or participant outside the current Ethereum L1 protocol core.",
    external_mechanism:
      "External or off-protocol mechanism related to Ethereum coordination.",
    coordination_surface:
      "Broad coordination surface across infrastructure or ecosystem behavior.",
    misaligned_abstraction:
      "Broad abstraction retained for comparison but not treated as canonical."
  };

  return descriptions[type] || "Semantic type tracked by the registry.";
}

function buildAutoSection(registry, anchor) {
  const market = anchor.market || {};

  return `${AUTO_START}
# ${anchor.canonical_term} — Sources

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with \`${anchor.ens}\`.

It supports the machine-readable and human-readable layers of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** ${registry.registry}
- **Registry version:** ${registry.version}
- **Registry ID:** \`${anchor.id}\`
- **Associated ENS:** \`${anchor.ens}\`
- **Canonical term:** ${anchor.canonical_term}
- **Classification:** ${anchor.classification}
- **Status:** ${anchor.status}
- **Status label:** ${anchor.status_label || "not specified"}
- **Stage:** ${anchor.stage || "not specified"}
- **Type:** ${anchor.type}
- **Market priority:** ${market.priority || anchor.market_priority || "not specified"}
- **Sale strategy:** ${market.sale_strategy || "not specified"}
- **Visibility:** ${market.visibility || "not specified"}

---

## Semantic Classification

${getClassificationDescription(anchor.classification)}

---

## Type Interpretation

${getTypeDescription(anchor.type)}

---

## Registry Role

${anchor.role || "No registry role description has been provided."}

---

## Linked Files

- **Anchor document:** \`${anchor.anchor_doc}\`
- **Schema:** \`${anchor.schema}\`

---

## Naming Context

- **ENS anchor:** \`${anchor.ens}\`
- **Canonical term:** ${anchor.canonical_term}

The ENS name is treated as a semantic entry point.

The canonical term is treated as the technical reference used by the registry.

If the ENS name and canonical term diverge, the mismatch should be documented in the corresponding anchor document and schema naming fields.

---

## Source Policy

Sources should prioritize:

- primary EIPs
- official specifications
- client or implementation references
- Ethereum research discussions
- protocol roadmap materials
- directly relevant technical documents

Avoid treating social commentary, price speculation, or unsupported market claims as formal sources.

---

## Maintenance Notes

This section is generated from \`registry.json\`.

Do not manually edit the auto-generated section unless the generation script is being changed.

Curated references and source notes should be placed in the protected section below.
${AUTO_END}`;
}

function buildDefaultManualSection() {
  return `${MANUAL_START}
## Curated References

No curated references have been added for this anchor yet.

## Source Notes

This section is reserved for curated protocol references, implementation notes, or research context when applicable.
${MANUAL_END}`;
}

function extractManualSection(existingContent, sourcesPath) {
  const manualStartCount = countOccurrences(existingContent, MANUAL_START);
  const manualEndCount = countOccurrences(existingContent, MANUAL_END);

  if (manualStartCount === 0 && manualEndCount === 0) {
    return buildDefaultManualSection();
  }

  if (manualStartCount !== 1 || manualEndCount !== 1) {
    throw new Error(
      `${path.relative(
        ROOT,
        sourcesPath
      )} has malformed manual source markers: ${MANUAL_START}=${manualStartCount}, ${MANUAL_END}=${manualEndCount}`
    );
  }

  const startIndex = existingContent.indexOf(MANUAL_START);
  const endIndex = existingContent.indexOf(MANUAL_END);

  if (endIndex < startIndex) {
    throw new Error(
      `${path.relative(ROOT, sourcesPath)} has misordered manual source markers`
    );
  }

  return existingContent.slice(startIndex, endIndex + MANUAL_END.length).trim();
}

function validateAutoMarkers(existingContent, sourcesPath) {
  const autoStartCount = countOccurrences(existingContent, AUTO_START);
  const autoEndCount = countOccurrences(existingContent, AUTO_END);

  if (autoStartCount === 0 && autoEndCount === 0) {
    return;
  }

  if (autoStartCount !== 1 || autoEndCount !== 1) {
    throw new Error(
      `${path.relative(
        ROOT,
        sourcesPath
      )} has malformed auto-generated markers: ${AUTO_START}=${autoStartCount}, ${AUTO_END}=${autoEndCount}`
    );
  }

  const startIndex = existingContent.indexOf(AUTO_START);
  const endIndex = existingContent.indexOf(AUTO_END);

  if (endIndex < startIndex) {
    throw new Error(
      `${path.relative(ROOT, sourcesPath)} has misordered auto-generated markers`
    );
  }
}

function generateSourceDocument(registry, anchor) {
  const sourcesPath = getSourcesPath(anchor);
  const sourcesDir = path.dirname(sourcesPath);

  ensureDirectory(sourcesDir);

  let manualSection = buildDefaultManualSection();

  if (fs.existsSync(sourcesPath)) {
    const existingContent = fs.readFileSync(sourcesPath, "utf8");

    validateAutoMarkers(existingContent, sourcesPath);
    manualSection = extractManualSection(existingContent, sourcesPath);
  }

  const autoSection = buildAutoSection(registry, anchor);

  const nextContent = `${autoSection}

${manualSection}
`;

  fs.writeFileSync(sourcesPath, nextContent);

  console.log(`✅ Generated ${path.relative(ROOT, sourcesPath)}`);
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_PATH);

  if (!Array.isArray(registry.anchors)) {
    throw new Error("registry.json must contain an anchors array");
  }

  for (const anchor of registry.anchors) {
    generateSourceDocument(registry, anchor);
  }

  console.log("✅ Source documents generated from registry.json");
}

main();
