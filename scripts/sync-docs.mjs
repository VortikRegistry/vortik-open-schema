import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const FILES = [
  "registry.json",
  "anchors.index.json",
  "market.index.json"
];

const DIRS = [
  "maps",
  "schemas",
  "anchors"
];

function ensureExists(targetPath, label = "path") {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing required ${label}: ${targetPath}`);
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`✓ ${src} → ${dest}`);
}

function copyDir(srcDir, destDir) {
  ensureExists(srcDir, "directory");

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFile(src, dest);
    }
  }
}

console.log("🔁 Syncing to docs/...\n");

// Copiar archivos obligatorios
for (const file of FILES) {
  const src = path.join(ROOT, file);
  const dest = path.join(ROOT, "docs", file);

  ensureExists(src, "file");
  copyFile(src, dest);
}

// Copiar directorios obligatorios
for (const dir of DIRS) {
  const srcDir = path.join(ROOT, dir);
  const destDir = path.join(ROOT, "docs", dir);

  copyDir(srcDir, destDir);
}

console.log("\n✅ Sync complete.");
