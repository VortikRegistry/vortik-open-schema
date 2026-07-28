#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const SCAN_TARGETS = [
  'registry.json',
  'registry.schema.json',
  'anchors',
  'schemas',
  'maps',
  'docs',
  'examples',
  'feeds',
  'README.md',
  'ARCHITECTURE.md',
  'PRIMITIVES.md',
  'REGISTRY.md',
  'SEMANTIC-STATUS.md',
  'PRIMITIVE-DOCUMENT-SPEC.md',
  'CONTRIBUTING.md',
  'registry-map.md',
  'market.index.json',
  'anchors.index.json',
  'scripts/generate-market-index.mjs',
  'scripts/generate-market-doc.mjs',
  'scripts/generate-market-html.mjs',
];

const EXCLUDED_PATHS = new Set([
  '.specify/memory/constitution.md',
  'scripts/check-public-safety.mjs',
]);

const EXCLUDED_DIR_SEGMENTS = new Set(['.git', 'node_modules']);
const TEXT_EXTENSIONS = new Set(['.json', '.md', '.html', '.htm', '.txt', '.yml', '.yaml', '.mjs', '.js']);

const BLOCKED_CONCEPTS = [
  { concept: 'buyer', reason: 'buyer targeting belongs outside public registry data' },
  { concept: 'target buyer', reason: 'buyer targeting belongs outside public registry data' },
  { concept: 'probable buyer', reason: 'buyer targeting belongs outside public registry data' },
  { concept: 'intended buyer', reason: 'buyer targeting belongs outside public registry data' },
  { concept: 'asking range', reason: 'financial ranges belong outside public registry data' },
  { concept: 'floor price', reason: 'pricing strategy belongs outside public registry data' },
  { concept: 'stretch price', reason: 'pricing strategy belongs outside public registry data' },
  { concept: 'sale window', reason: 'sale timing belongs outside public registry data' },
  { concept: 'outreach', reason: 'outreach material belongs outside public registry data' },
  { concept: 'lead', reason: 'private lead lists belong outside public registry data' },
  { concept: 'private lead', reason: 'private lead lists belong outside public registry data' },
  { concept: 'lead list', reason: 'private lead lists belong outside public registry data' },
  { concept: 'target entity', reason: 'target entities belong outside public registry data' },
  { concept: 'sale_strategy', reason: 'sale strategy belongs outside public registry data' },
  { concept: 'private_strategy', reason: 'private strategy belongs outside public registry data' },
  { concept: 'negotiation', reason: 'negotiation notes belong outside public registry data' },
  { concept: 'negotiation_notes', reason: 'negotiation notes belong outside public registry data' },
  { concept: 'estimated_market_value', reason: 'valuation data belongs outside public registry data' },
  { concept: 'commercial_tier', reason: 'commercial metadata belongs outside public registry data' },
  { concept: 'pricing', reason: 'pricing strategy belongs outside public registry data' },
  { concept: 'price range', reason: 'financial ranges belong outside public registry data' },
  { concept: 'ETH range', reason: 'financial ranges belong outside public registry data' },
  { concept: 'acquisition strategy', reason: 'acquisition strategy belongs outside public registry data' },
  { concept: 'monetization notes', reason: 'monetization notes belong outside public registry data' },
  { concept: 'private watchlist', reason: 'private watchlists belong outside public registry data' },
  { concept: 'sales strategy', reason: 'sales strategy belongs outside public registry data' },
  { concept: 'sales pitch', reason: 'sales pitch belongs outside public registry data' },
  { concept: 'acquisition inquiry', reason: 'acquisition inquiries belong outside public registry data' },
  { concept: 'acquisition inquiries', reason: 'acquisition inquiries belong outside public registry data' },
  { concept: 'qualified acquisition inquiry', reason: 'acquisition inquiries belong outside public registry data' },
  { concept: 'qualified acquisition inquiries', reason: 'acquisition inquiries belong outside public registry data' },
  { concept: 'strategic inquiries reviewed', reason: 'commercial inquiry status belongs outside public registry data' },
  { concept: 'private case by case review', reason: 'private commercial review belongs outside public registry data' },
  { concept: 'transfer decisions', reason: 'transfer intent belongs outside public registry data' },
  { concept: 'sale inquiry', reason: 'sale inquiries belong outside public registry data' },
  { concept: 'sale inquiries', reason: 'sale inquiries belong outside public registry data' },
  { concept: 'for sale', reason: 'availability belongs outside public registry data' },
  { concept: 'price disclosed privately', reason: 'private pricing belongs outside public registry data' },
  { concept: 'public inquiry policy', reason: 'commercial inquiry policy belongs outside public registry data' },
];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenPattern(token, index) {
  const escaped = escapeRegex(token);
  if (index === 0) return escaped;
  const camel = token[0].toUpperCase() + token.slice(1);
  return `(?:[\\s_-]+${escaped}|${escapeRegex(camel)})`;
}

function conceptRegex(concept) {
  const normalized = concept.replace(/[_-]+/g, ' ').trim();
  const tokens = normalized.split(/\s+/);
  const body = tokens.map(tokenPattern).join('');
  return new RegExp(`(?<![A-Za-z0-9])${body}(?![A-Za-z0-9])`, 'i');
}

const MATCHERS = BLOCKED_CONCEPTS.map((entry) => ({ ...entry, regex: conceptRegex(entry.concept) }));

function isExcluded(relativePath) {
  const parts = relativePath.split('/');
  return EXCLUDED_PATHS.has(relativePath)
    || parts.some((part) => EXCLUDED_DIR_SEGMENTS.has(part))
    || parts.some((part) => /fixture/i.test(part));
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function collectFiles(target) {
  const absolute = path.join(repoRoot, target);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [absolute];
  if (!stat.isDirectory()) return [];

  const files = [];
  const stack = [absolute];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absoluteEntry = path.join(current, entry.name);
      const relativeEntry = toPosix(path.relative(repoRoot, absoluteEntry));
      if (isExcluded(relativeEntry)) continue;
      if (entry.isDirectory()) stack.push(absoluteEntry);
      else if (entry.isFile() && isTextFile(absoluteEntry)) files.push(absoluteEntry);
    }
  }
  return files;
}

function matchedClause(line, matchIndex, matchLength) {
  const separators = /[.;!?:\n]/g;
  let start = 0;
  let end = line.length;
  let separator;

  while ((separator = separators.exec(line)) !== null) {
    if (separator.index < matchIndex) {
      start = separator.index + 1;
      continue;
    }

    if (separator.index >= matchIndex + matchLength) {
      end = separator.index;
      break;
    }
  }

  return line.slice(start, end).toLowerCase();
}

function isNegativePolicyLanguage(line, matcher, match) {
  const clause = matchedClause(line, match.index, match[0].length);
  const termPattern = matcher.regex.source;
  const beforeNegation = new RegExp(`\\b(no|not|never|avoid|without|rather than|separate from|exclude|excludes|excluded|forbid|forbids|forbidden|ban|bans|banned|block|blocks|blocked|disallow|disallows|disallowed|reject|rejects|rejected|must not|do not include)\\b[^.;!?:]{0,80}${termPattern}`);
  const afterNegation = new RegExp(`${termPattern}[^.;!?:]{0,80}\\b(must not|is not allowed|are not allowed|should not|forbidden|banned|blocked|disallowed|rejected|outside public registry data|should not be interpreted|not be interpreted|not be used|does not imply|do not infer|separate from)\\b`);
  return beforeNegation.test(clause) || afterNegation.test(clause);
}

function hasPricingStrategyContext(lower) {
  return /\bpricing\b.{0,120}\b(guidance|range|eth|floor|stretch|valuation|sale|commercial|private|strategy|negotiation)\b/.test(lower)
    || /\b(guidance|range|eth|floor|stretch|valuation|sale|commercial|private|strategy|negotiation)\b.{0,120}\bpricing\b/.test(lower);
}

function isPolicyOrTechnicalSafe(line, matcher, match) {
  const concept = matcher.concept;
  const lower = line.toLowerCase();

  if (isNegativePolicyLanguage(lower, matcher, match)) return true;

  if ((concept === 'lead' || concept === 'private lead' || concept === 'lead list')
    && (/class=["'][^"']*\b[\w-]*lead\b/.test(lower) || /^\s*\.[\w-]*lead\b/.test(lower))) return true;

  if (concept === 'pricing') {
    if (hasPricingStrategyContext(lower)) return false;
    if (/\bpricing\b.{0,100}\b(relevance|input|claim|claims|assumption|assumptions|interpretation|surface|signal|policy)\b/.test(lower)) return true;
    if (/\b(gas|temporal|execution value|cryptographic proofs|proof-generation|repricing|publicly_priced|not_publicly_priced|schemas)\b/.test(lower)) return true;
  }

  if (concept.includes('buyer') || concept === 'buyer') {
    if (/\brather than\b.{0,120}\bbuyer segment\b/.test(lower)) return true;
    if (/\b(should not|not) be interpreted\b.{0,120}\b(imply|implies)\b.{0,80}\bbuyer\b/.test(lower)) return true;
    if (/\b(imply|implies)\s+buyer targeting or commercial demand\b/.test(lower)) return true;
  }

  if (concept === 'price range' && /\b(no|not|avoid|without|do not include)\b.{0,80}\bprice ranges?\b/.test(lower)) return true;

  return false;
}

function unsafeMatches(line) {
  const findings = [];

  for (const matcher of MATCHERS) {
    const match = matcher.regex.exec(line);
    if (match && !isPolicyOrTechnicalSafe(line, matcher, match)) {
      findings.push(matcher);
    }
  }

  return findings;
}

const UNSAFE_REGRESSION_SAMPLES = [
  'Strategic acquisition inquiries may be reviewed case by case.',
  'Available for qualified acquisition inquiry.',
  'Strategic inquiries reviewed.',
  'Private case-by-case review.',
  'Transfer decisions are evaluated privately.',
  'This name is for sale.',
  'Price disclosed privately.',
  'No public pricing; acquisition inquiries are reviewed.'
];

for (const sample of UNSAFE_REGRESSION_SAMPLES) {
  if (unsafeMatches(sample).length === 0) {
    throw new Error(`Public safety regression failed to reject: ${sample}`);
  }
}

const SAFE_REGRESSION_SAMPLES = [
  'The public registry must not contain acquisition inquiries.',
  'No acquisition inquiries are allowed in public registry data.',
  'Transfer decisions belong outside public registry data.',
  'Do not describe an ENS name as for sale in public registry data.'
];

for (const sample of SAFE_REGRESSION_SAMPLES) {
  if (unsafeMatches(sample).length !== 0) {
    throw new Error(`Public safety regression rejected policy language: ${sample}`);
  }
}

const files = [...new Set(SCAN_TARGETS.flatMap(collectFiles))].sort();
const findings = [];

for (const file of files) {
  const relative = toPosix(path.relative(repoRoot, file));
  if (isExcluded(relative) || !isTextFile(file)) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const matcher of unsafeMatches(line)) {
      findings.push({ file: relative, line: index + 1, concept: matcher.concept, reason: matcher.reason });
    }
  });
}

if (findings.length > 0) {
  console.error('Public safety scan failed. Private/commercial strategy terms were found in public registry-facing files.');
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} matched "${finding.concept}" — ${finding.reason}.`);
  }
  console.error(`Public safety scan failed with ${findings.length} issue(s) across ${new Set(findings.map((finding) => finding.file)).size} file(s).`);
  process.exit(1);
}

console.log(`Public safety scan passed: scanned ${files.length} public registry-facing file(s); no private/commercial strategy terms detected.`);
