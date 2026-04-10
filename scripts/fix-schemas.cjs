#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const SCHEMAS_DIR = path.join(ROOT, "schemas");

// ---------- Helpers ----------

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, callback);
    } else if (file === "schema.json") {
      callback(fullPath);
    }
  }
}

// ---------- Fix logic ----------

let fixedCount = 0;
let errorCount = 0;
let warningCount = 0;

walk(SCHEMAS_DIR, (file) => {
  try {
    const schema = readJSON(file);

    let modified = false;

    // FIX 1: remove invalid root-level classification
    if (schema.classification) {
      console.log(`Removing root classification in: ${file}`);
      delete schema.classification;
      modified = true;
    }

    // FIX 2: remove invalid root-level canonical_term
    if (schema.canonical_term) {
      console.log(`Removing root canonical_term in: ${file}`);
      delete schema.canonical_term;
      modified = true;
    }

    // FIX 3: ensure classification exists in properties
    if (
      !schema.properties ||
      !schema.properties.classification ||
      !schema.properties.classification.const
    ) {
      console.warn(`Missing classification const in: ${file}`);
      warningCount++;
    }

    // FIX 4: ensure canonical_term exists in properties
    if (
      !schema.properties ||
      !schema.properties.canonical_term ||
      !schema.properties.canonical_term.const
    ) {
      console.warn(`Missing canonical_term const in: ${file}`);
      warningCount++;
    }

    if (modified) {
      writeJSON(file, schema);
      fixedCount++;
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
    errorCount++;
  }
});

// ---------- Summary ----------

console.log("\n---- Fix Schemas Summary ----");
console.log(`Schemas fixed: ${fixedCount}`);
console.log(`Warnings: ${warningCount}`);
console.log(`Errors: ${errorCount}`);
