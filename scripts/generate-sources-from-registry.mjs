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

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exitCode = 1;
}

function normalizeText(value, fallback = "Not specified") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function getSchemaDir(anchor) {
  if (!anchor.schema || typeof anchor.schema !== "string") {
    return null;
  }

  return path.dirname(anchor.schema);
}

function getSourcesPath(anchor) {
  const schemaDir = getSchemaDir(anchor);

  if (!schemaDir) {
    return null;
  }

  return path.join(ROOT, schemaDir, "sources.md");
}

function extractManualSection(existingContent) {
  if (!existingContent) {
    return defaultManualSection();
  }

  const startIndex = existingContent.indexOf(MANUAL_START);
  const endIndex = existingContent.indexOf(MANUAL_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return defaultManualSection();
  }

  const manualBlock = existingContent.slice(
    startIndex + MANUAL_START.length,
    endIndex
  ).trim();

  if (!manualBlock) {
    return defaultManualSection();
  }

  return manualBlock;
}

function defaultManualSection() {
  return `## Manual Source References

Add primary references, research threads, implementation notes, or protocol links here.

Suggested format:

- Title  
  URL

## Manual Notes

Add any human-reviewed source notes here.`;
}

function classificationMeaning(classification) {
  const map = {
    core: "Protocol-aligned anchor with strong semantic grounding.",
    repairable: "Valid underlying concept with imperfect ENS alignment or terminology mismatch.",
    premature: "Real or emerging concept not yet stable enough to treat as canonical.",
    external: "Ethereum-adjacent or external coordination surface outside the current L1 protocol core.",
    deprecated: "Legacy, broad, or market-oriented abstraction with reduced precision relative to protocol-native terminology.",
    valid: "Valid semantic surface with meaningful ecosystem or technical relevance."
  };

  return map[classification] || "Classification meaning not specified.";
}

function typeMeaning(type) {
  const map = {
    primitive: "Protocol or research primitive tracked as a semantic object.",
    role: "Actor or role-like semantic surface.",
    constraint: "Constraint surface affecting coordination behavior.",
    mechanism: "Mechanism or process relevant to Ethereum coordination.",
    coordination_surface: "Broad coordination surface across infrastructure or ecosystem behavior.",
    external_actor: "External actor or participant outside the current L1 protocol core.",
    external_mechanism: "External or off-protocol mechanism related to Ethereum coordination.",
    misaligned_abstraction: "Broad abstraction retained for comparison but not treated as canonical.",
    market: "Market-oriented abstraction or ecosystem coordination surface."
  };

  return map[type] || "Type meaning not specified.";
}

function buildAutoSection(anchor, registry) {
  const id = normalizeText(anchor.id);
  const ens = normalizeText(anchor.ens);
  const canonical = normalizeText(anchor.canonical_term);
  const classification = normalizeText(anchor.classification);
  const status = normalizeText(anchor.status);
  const statusLabel = normalizeText(anchor.status_label, "Not specified");
  const stage = normalizeText(anchor.stage, "Not specified");
  const type = normalizeText(anchor.type);
  const role = normalizeText(anchor.role);
  const schema = normalizeText(anchor.schema);
  const anchorDoc = normalizeText(anchor.anchor_doc);
  const marketPriority = normalizeText(anchor.market_priority, "Not specified");
  const saleStrategy = normalizeText(anchor.market?.sale_strategy, "Not specified");
  const visibility = normalizeText(anchor.market?.visibility, "Not specified");

  const title = `${canonical} — Sources`;

  return `${AUTO_START}
# ${title}

## Overview

This document compiles source context and terminology support for the Vortik semantic anchor associated with \`${ens}\`.

It supports the machine-readable and human-readable layers of the **Vortik Semantic Registry**.

This document is a research-support artifact. It is not an official Ethereum protocol specification.

---

## Registry Metadata

- **Registry:** ${normalizeText(registry.registry, "vortik-semantic-registry")}
- **Registry version:** ${normalizeText(registry.version, "Not specified")}
- **Registry ID:** \`${id}\`
- **Associated ENS:** \`${ens}\`
- **Canonical term:** ${canonical}
- **Classification:** ${classification}
- **Status:** ${status}
- **Status label:** ${statusLabel}
- **Stage:** ${stage}
- **Type:** ${type}
- **Market priority:** ${marketPriority}
- **Sale strategy:** ${saleStrategy}
- **Visibility:** ${visibility}

---

## Semantic Classification

${classificationMeaning(anchor.classification)}

---

## Type Interpretation

${typeMeaning(anchor.type)}

---

## Registry Role

${role}

---

## Linked Files

- **Anchor document:** \`${anchorDoc}\`
- **Schema:** \`${schema}\`

---

## Naming Context

- **ENS anchor:** \`${ens}\`
- **Canonical term:** ${canonical}

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

Manual sources and notes should be placed in the protected manual section below.
${AUTO_END}`;
}

function buildSourcesDocument(anchor, registry, existingContent) {
  const autoSection = buildAutoSection(anchor, registry);
  const manualSection = extractManualSection(existingContent);

  return `${autoSection}

${MANUAL_START}
${manualSection}
${MANUAL_END}
`;
}

function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("registry.json not found");
  }

  const registry = readJSON(REGISTRY_PATH);

  if (!Array.isArray(registry.anchors)) {
    throw new Error("registry.json does not contain a valid anchors array");
  }

  console.log("🔁 Generating sources.md files from registry.json...\n");

  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const anchor of registry.anchors) {
    if (!anchor.id) {
      fail("Anchor without id detected");
      skipped++;
      continue;
    }

    const sourcesPath = getSourcesPath(anchor);

    if (!sourcesPath) {
      fail(`Anchor ${anchor.id} is missing schema path`);
      skipped++;
      continue;
    }

    const schemaDir = path.dirname(sourcesPath);

    if (!fs.existsSync(schemaDir)) {
      fail(`Schema directory not found for ${anchor.id}: ${schemaDir}`);
      skipped++;
      continue;
    }

    const existed = fs.existsSync(sourcesPath);
    const existingContent = existed ? fs.readFileSync(sourcesPath, "utf8") : "";
    const nextContent = buildSourcesDocument(anchor, registry, existingContent);

    if (!existed) {
      writeFile(sourcesPath, nextContent);
      ok(`Created sources: ${path.relative(ROOT, sourcesPath)}`);
      created++;
      continue;
    }

    if (existingContent !== nextContent) {
      writeFile(sourcesPath, nextContent);
      ok(`Updated sources: ${path.relative(ROOT, sourcesPath)}`);
      updated++;
    } else {
      ok(`Already aligned: ${path.relative(ROOT, sourcesPath)}`);
    }
  }

  console.log("\n🎯 Sources generation complete.");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);

  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
}

main();
