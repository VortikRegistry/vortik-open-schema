import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const scanTargets = [
  "registry.json",
  "registry.schema.json",
  "anchors",
  "schemas",
  "maps",
  "docs",
  "README.md",
  "market.index.json",
  "anchors.index.json",
  "generated",
  "public",
  "dist",
  "build",
];

const ignoredPathParts = new Set([
  ".git",
  "node_modules",
]);

const ignoredRelativePaths = new Set([
  ".specify/memory/constitution.md",
  "scripts/check-public-safety.mjs",
]);

const ignoredFileNames = new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
]);

const fixturePathPattern = /(^|\/)(__fixtures__|fixtures|test-fixtures|tests\/fixtures|test\/fixtures)(\/|$)/i;

const blockedConcepts = [
  { concept: "buyer", reason: "buyer targeting belongs outside public registry data" },
  { concept: "target buyer", reason: "buyer targeting belongs outside public registry data" },
  { concept: "probable buyer", reason: "buyer targeting belongs outside public registry data" },
  { concept: "intended buyer", reason: "buyer targeting belongs outside public registry data" },
  { concept: "asking range", reason: "financial ranges belong outside public registry data" },
  { concept: "floor price", reason: "pricing strategy belongs outside public registry data" },
  { concept: "stretch price", reason: "pricing strategy belongs outside public registry data" },
  { concept: "sale window", reason: "sale timing belongs outside public registry data" },
  { concept: "outreach", reason: "outreach material belongs outside public registry data" },
  { concept: "lead", reason: "private lead tracking belongs outside public registry data" },
  { concept: "target entity", reason: "target entity tracking belongs outside public registry data" },
  { concept: "sale_strategy", reason: "sale strategy belongs outside public registry data" },
  { concept: "private_strategy", reason: "private strategy belongs outside public registry data" },
  { concept: "negotiation", reason: "negotiation logic belongs outside public registry data" },
  { concept: "negotiation_notes", reason: "negotiation notes belong outside public registry data" },
  { concept: "estimated_market_value", reason: "market valuation belongs outside public registry data" },
  { concept: "commercial_tier", reason: "commercial operating metadata belongs outside public registry data" },
  { concept: "pricing", reason: "pricing belongs outside public registry data" },
  { concept: "price range", reason: "financial ranges belong outside public registry data" },
  { concept: "ETH range", reason: "financial ranges belong outside public registry data" },
  { concept: "acquisition strategy", reason: "acquisition strategy belongs outside public registry data" },
  { concept: "monetization notes", reason: "private monetization notes belong outside public registry data" },
  { concept: "private watchlist", reason: "private watchlists belong outside public registry data" },
  { concept: "sales strategy", reason: "sales strategy belongs outside public registry data" },
  { concept: "sales pitch", reason: "sales pitch belongs outside public registry data" },
];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function shouldIgnore(relativePath) {
  const posixPath = toPosix(relativePath);

  if (ignoredRelativePaths.has(posixPath)) return true;
  if (fixturePathPattern.test(posixPath)) return true;
  if (ignoredFileNames.has(path.basename(posixPath))) return true;
  if (path.basename(posixPath).startsWith("internal-")) return true;

  return posixPath.split("/").some((part) => ignoredPathParts.has(part));
}

function normalizeText(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizedConceptWords(concept) {
  return normalizeText(concept)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
}

function conceptPattern(concept) {
  const normalizedConcept = normalizeText(concept);
  const escapedWords = normalizedConceptWords(concept);

  return new RegExp(`(^|\\s)${escapedWords.join("\\s+")}(?=\\s|$)`, "i");
}

function safePolicyPattern(concept) {
  const phrase = normalizedConceptWords(concept).join("\\s+");
  return new RegExp(`(^|\\s)(not|no|without|avoid|reject|rejects|rejected|block|blocks|blocked|forbid|forbids|forbidden|exclude|excludes|excluded|prevent|prevents|must not|do not|rather than)(\\s+\\w+){0,12}\\s+${phrase}(?=\\s|$)|(^|\\s)${phrase}(\\s+\\w+){0,12}\\s+(outside|forbidden|excluded|blocked|rejected|not public|not publicly|private only)(?=\\s|$)`, "i");
}

const checks = blockedConcepts.map((entry) => ({
  ...entry,
  pattern: conceptPattern(entry.concept),
  safePattern: safePolicyPattern(entry.concept),
}));

function collectFiles(target) {
  const absolutePath = path.join(repoRoot, target);
  if (!fs.existsSync(absolutePath)) return [];

  const relativePath = toPosix(path.relative(repoRoot, absolutePath));
  if (shouldIgnore(relativePath)) return [];

  const stat = fs.statSync(absolutePath);
  if (stat.isFile()) return [absolutePath];
  if (!stat.isDirectory()) return [];

  const files = [];
  for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
    const entryPath = path.join(absolutePath, entry.name);
    const entryRelativePath = toPosix(path.relative(repoRoot, entryPath));

    if (shouldIgnore(entryRelativePath)) continue;

    if (entry.isDirectory()) {
      files.push(...collectFiles(entryRelativePath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function isSafeTechnicalUse(check, normalizedLine, rawLine, context = {}) {
  if (context.inNonClaimBlock) return true;
  if (check.safePattern.test(normalizedLine)) return true;

  if (check.concept === "lead" && /(^|\s|[.#"'-])lead([\s.{#=>"']|$)/i.test(rawLine)) return true;

  if (check.concept === "pricing") {
    return /(^|\s)(protocol|execution|technical|semantic|surface|temporal|hedging|value|cryptographic|proofs|production|verification|delivery)(\s|$)/i.test(normalizedLine);
  }

  return false;
}

function scanFile(filePath) {
  const relativePath = toPosix(path.relative(repoRoot, filePath));
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const findings = [];

  let nonClaimBlockRemaining = 0;

  lines.forEach((line, index) => {
    const normalizedLine = normalizeText(line);
    const inNonClaimBlock = nonClaimBlockRemaining > 0;

    if (/should not be interpreted as saying that|boundary conditions and non claims/.test(normalizedLine)) {
      nonClaimBlockRemaining = 12;
    } else if (nonClaimBlockRemaining > 0) {
      nonClaimBlockRemaining -= 1;
    }
    if (!normalizedLine) return;

    for (const check of checks) {
      if (check.pattern.test(normalizedLine) && !isSafeTechnicalUse(check, normalizedLine, line, { inNonClaimBlock })) {
        findings.push({
          file: relativePath,
          line: index + 1,
          concept: check.concept,
          reason: check.reason,
        });
      }
    }
  });

  return findings;
}

const filesToScan = [...new Set(scanTargets.flatMap(collectFiles))].sort();
const findings = filesToScan.flatMap(scanFile);

if (findings.length > 0) {
  console.error("Public safety scan failed. Private/commercial strategy terms were found in public registry-facing files.\n");

  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line}`);
    console.error(`  matched concept: ${finding.concept}`);
    console.error(`  reason: ${finding.reason}`);
  }

  console.error(`\nFailure summary: ${findings.length} issue(s) found across ${new Set(findings.map((finding) => finding.file)).size} file(s).`);
  process.exit(1);
}

console.log(`Public safety scan passed: ${filesToScan.length} public registry-facing file(s) checked.`);
