#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const excludedSegments = new Set(['.git', 'node_modules']);
const forbiddenSegment = 'tiendanube';
const findings = [];
const stack = [repoRoot];

while (stack.length > 0) {
  const current = stack.pop();
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (excludedSegments.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    const relative = path.relative(repoRoot, absolute).split(path.sep).join('/');
    const segments = relative.split('/').map((segment) => segment.toLowerCase());
    if (segments.includes(forbiddenSegment)) {
      findings.push(relative);
      continue;
    }
    if (entry.isDirectory()) stack.push(absolute);
  }
}

if (findings.length > 0) {
  console.error('Repository hygiene check failed: TiendaNube/VORTIK-ART assets do not belong in vortik-open-schema.');
  for (const finding of findings.sort()) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('Repository hygiene check passed: no TiendaNube path is present.');
