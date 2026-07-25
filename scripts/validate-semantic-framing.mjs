#!/usr/bin/env node
import fs from 'node:fs';

const RULES = [
  {
    id: 'fast-finality-umbrella',
    files: [
      'anchors/fastfinality.md',
      'docs/anchors/fastfinality.md',
      'anchors/README.md',
      'docs/anchors/README.md',
      'SEMANTIC-STATUS.md',
    ],
    required: [
      /Fast Finality/i,
      /single-slot finality \(SSF\)/i,
    ],
    forbidden: [
      /fast finality.{0,100}(?:only|merely|just).{0,100}(?:approximation|less precise)/i,
      /single-slot finality.{0,100}(?:displac|replac).{0,100}fast finality/i,
      /fastfinality\.eth.{0,160}single-slot finality \(SSF\).{0,80}(?:more precise|strongest canonical)/i,
    ],
  },
];

const findings = [];

for (const rule of RULES) {
  for (const file of rule.files) {
    if (!fs.existsSync(file)) {
      findings.push(`${rule.id}: missing required file ${file}`);
      continue;
    }

    const content = fs.readFileSync(file, 'utf8');

    for (const pattern of rule.required) {
      if (!pattern.test(content)) {
        findings.push(`${rule.id}: ${file} is missing required framing ${pattern}`);
      }
    }

    for (const pattern of rule.forbidden) {
      if (pattern.test(content)) {
        findings.push(`${rule.id}: ${file} contains obsolete framing ${pattern}`);
      }
    }
  }
}

if (findings.length > 0) {
  console.error('Semantic framing validation failed.');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Semantic framing validation passed: ${RULES.length} rule set(s) checked.`);
