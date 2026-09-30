import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const check = fileURLToPath(new URL('../scripts/check-public-safety.mjs', import.meta.url));
const fullCatalog = JSON.parse(readFileSync(new URL('../docs/ethereum-catalog.json', import.meta.url), 'utf8'));
const fixture = () => ({
  contract: fullCatalog.contract,
  sources: structuredClone(fullCatalog.sources),
  proposals: structuredClone(fullCatalog.proposals.filter((entry) => [7609, 7915].includes(entry.number))),
});

function scan(catalog, extraFile) {
  const directory = mkdtempSync(join(tmpdir(), 'vortik-catalog-safety-'));
  try {
    mkdirSync(join(directory, 'docs'));
    writeFileSync(join(directory, 'docs/ethereum-catalog.json'), JSON.stringify(catalog, null, 2));
    if (extraFile) writeFileSync(join(directory, 'README.md'), extraFile);
    return spawnSync(process.execPath, [check], { cwd: directory, encoding: 'utf8', timeout: 10_000 });
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('protocol metadata does not become a blanket exception for commercial text', () => {
  assert.equal(scan(fixture()).status, 0);
  const changed = fixture();
  changed.proposals[0].description += ' Private floor price is disclosed privately.';
  const rejected = scan(changed);
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /floor price/);
  assert.equal(scan(fixture(), 'This name is for sale.').status, 1);
});

test('the exception requires the reviewed source identity and exact file scope', () => {
  const unpinned = fixture();
  unpinned.sources[0].commit = 'a'.repeat(40);
  assert.equal(scan(unpinned).status, 1);
  const wrongPath = fixture();
  wrongPath.proposals[0].path = 'EIPS/eip-1.md';
  assert.equal(scan(wrongPath).status, 1);
  assert.equal(scan(fixture(), 'Adaptive mean reversion blob pricing').status, 1);
});
