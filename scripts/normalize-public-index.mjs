import fs from "node:fs";

const INDEX_PATH = "docs/index.html";
const COMMERCIAL_COPY = "High-signal anchors derived from protocol alignment and semantic convergence. This is not a marketplace. It is a registry view reflecting where Ethereum’s coordination language appears to be narrowing first. Strategic acquisition inquiries may be reviewed case by case. No public pricing is provided.";
const NEUTRAL_COPY = "High-signal anchors derived from protocol alignment and semantic convergence. This is not a marketplace. It is a registry view reflecting where Ethereum’s coordination language appears to be narrowing first.";

const source = fs.readFileSync(INDEX_PATH, "utf8");
const occurrences = source.split(COMMERCIAL_COPY).length - 1;

if (occurrences > 1) {
  throw new Error(`Expected at most one legacy commercial paragraph in ${INDEX_PATH}; found ${occurrences}`);
}

const normalized = source.replace(COMMERCIAL_COPY, NEUTRAL_COPY);

if (/strategic acquisition inquir|no public pricing|private case-by-case review|transfer decisions/i.test(normalized)) {
  throw new Error(`${INDEX_PATH} still contains public commercial policy language`);
}

fs.writeFileSync(INDEX_PATH, normalized);
console.log(`✅ ${INDEX_PATH} normalized to technical registry copy`);
