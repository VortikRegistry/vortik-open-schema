import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

let checked = 0;
let errors = 0;

function fail(message) {
  console.error(`❌ ${message}`);
  errors++;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".json")) {
      continue;
    }

    checked++;
    const relativePath = path.relative(ROOT, fullPath);

    try {
      const raw = fs.readFileSync(fullPath, "utf8");
      JSON.parse(raw);
    } catch (error) {
      fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    }
  }
}

console.log("🔍 Validating all JSON files...");
walk(ROOT);

if (errors > 0) {
  console.error(`\nJSON validation failed. Files checked: ${checked}. Errors: ${errors}.`);
  process.exit(1);
}

console.log(`✅ All JSON files are valid. Files checked: ${checked}.`);
