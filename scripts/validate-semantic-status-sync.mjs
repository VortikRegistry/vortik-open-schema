import fs from 'node:fs';

const registryPath = 'registry.json';
const semanticStatusPath = 'SEMANTIC-STATUS.md';

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const semanticStatus = fs.readFileSync(semanticStatusPath, 'utf8');

if (!Array.isArray(registry.anchors)) {
  throw new Error(`${registryPath} must contain an anchors array.`);
}

const registryAnchors = new Map(registry.anchors.map((anchor) => [anchor.id, anchor]));
const rows = [];
let inAnchorTable = false;
let currentSection = null;

for (const line of semanticStatus.split(/\r?\n/)) {
  const sectionMatch = line.match(/^##\s+(.+)$/);
  if (sectionMatch) {
    currentSection = sectionMatch[1].trim();
    inAnchorTable = false;
    continue;
  }

  const cells = line
    .trim()
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());

  if (cells.length === 5 && cells.join('|') === 'Anchor ID|ENS|Canonical term|Type|Status') {
    inAnchorTable = true;
    continue;
  }

  if (!inAnchorTable) {
    continue;
  }

  if (cells.length !== 5 || cells.every((cell) => /^-+$/.test(cell))) {
    continue;
  }

  const [anchorId, ens, canonicalTerm, type, status] = cells.map((cell) => {
    const codeMatch = cell.match(/^`([^`]+)`$/);
    return codeMatch ? codeMatch[1] : cell;
  });

  rows.push({
    id: anchorId,
    ens,
    canonical_term: canonicalTerm,
    type,
    status,
    section: currentSection,
  });
}

const errors = [];
const seen = new Set();

for (const row of rows) {
  if (seen.has(row.id)) {
    errors.push(`Duplicate SEMANTIC-STATUS.md row for anchor '${row.id}'.`);
    continue;
  }
  seen.add(row.id);

  const anchor = registryAnchors.get(row.id);
  if (!anchor) {
    errors.push(`Extra SEMANTIC-STATUS.md row '${row.id}' in section '${row.section}' is not present in ${registryPath}.`);
    continue;
  }

  const comparisons = [
    ['ENS name', 'ens', row.ens],
    ['canonical term', 'canonical_term', row.canonical_term],
    ['type', 'type', row.type],
    ['status', 'status', row.status],
  ];

  for (const [label, key, actual] of comparisons) {
    const expected = anchor[key];
    if (actual !== expected) {
      errors.push(
        `Mismatch for '${row.id}' ${label}: SEMANTIC-STATUS.md has '${actual}', ${registryPath} has '${expected}'.`,
      );
    }
  }
}

for (const anchor of registry.anchors) {
  if (!seen.has(anchor.id)) {
    errors.push(`Missing SEMANTIC-STATUS.md row for registry anchor '${anchor.id}'.`);
  }
}

if (errors.length > 0) {
  console.error('SEMANTIC-STATUS.md is not aligned with registry.json:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`SEMANTIC-STATUS.md is aligned with registry.json (${rows.length} anchors checked).`);
