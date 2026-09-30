#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { buildEthereumCatalog } from "../lib/ethereum-catalog.mjs";

const root = new URL("../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("scripts/ethereum-catalog-sources.json", root), "utf8"));
const args = process.argv.slice(2);
const paths = {};
let check = false;
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--check") check = true;
  else if (["--eips", "--ercs"].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith("--")) {
    const key = args[i].slice(2);
    if (paths[key]) throw new Error(`Duplicate --${key}`);
    paths[key] = args[++i];
  } else throw new Error(`Unsupported argument: ${args[i]}`);
}
if (!paths.eips || !paths.ercs) {
  throw new Error("Usage: node scripts/generate-ethereum-catalog.mjs --eips /local/EIPs --ercs /local/ERCs [--check]");
}

function git(path, args, input) {
  return execFileSync("git", ["-C", path, ...args], {
    input, maxBuffer: 128 * 1024 * 1024,
    // Missing objects must fail. A partial clone must not fetch during generation.
    env: { ...process.env, GIT_NO_LAZY_FETCH: "1", GIT_TERMINAL_PROMPT: "0" }
  });
}

function pinnedDocuments(source) {
  const path = paths[source.id];
  const origin = git(path, ["remote", "get-url", "origin"]).toString().trim();
  const accepted = [`https://github.com/${source.repository}`, `https://github.com/${source.repository}.git`, `git@github.com:${source.repository}.git`];
  if (!accepted.some((entry) => entry.toLowerCase() === origin.toLowerCase())) {
    throw new Error(`${source.id}: origin must identify the locked official repository`);
  }
  const actual = git(path, ["rev-parse", "--verify", `${source.commit}^{commit}`]).toString().trim();
  if (actual !== source.commit) throw new Error(`${source.id}: locked source commit is unavailable`);
  const license = git(path, ["show", `${source.commit}:LICENSE.md`]).toString();
  if (!license.includes("CC0 1.0 Universal")) throw new Error(`${source.id}: expected pinned CC0 license not found`);
  const listing = git(path, ["ls-tree", "-r", "-z", source.commit, "--", source.directory]).toString();
  const entries = listing.split("\0").filter(Boolean).map((line) => {
    const match = /^(\d+) (\w+) ([a-f0-9]{40})\t(.+)$/.exec(line);
    if (!match) throw new Error(`${source.id}: unsupported git tree entry`);
    return { mode: match[1], type: match[2], oid: match[3], path: match[4] };
  }).filter((entry) => entry.path.endsWith(".md"));
  for (const entry of entries) {
    if (entry.type !== "blob" || !["100644", "100755"].includes(entry.mode)) throw new Error(`Non-file proposal: ${entry.path}`);
  }
  const batch = git(path, ["cat-file", "--batch"], entries.map((entry) => entry.oid).join("\n") + "\n");
  let offset = 0;
  return {
    id: source.id,
    documents: entries.map((entry) => {
      const end = batch.indexOf(10, offset);
      const header = batch.subarray(offset, end).toString();
      const match = /^([a-f0-9]{40}) blob (\d+)$/.exec(header);
      if (!match || match[1] !== entry.oid) throw new Error(`Missing pinned blob: ${entry.path}`);
      const size = Number(match[2]);
      const start = end + 1;
      const content = new TextDecoder("utf-8", { fatal: true }).decode(batch.subarray(start, start + size));
      offset = start + size + 1;
      if (offset > batch.length || batch[offset - 1] !== 10) throw new Error(`Incomplete blob: ${entry.path}`);
      return { path: entry.path, content };
    })
  };
}

const data = buildEthereumCatalog(manifest, manifest.sources.map(pinnedDocuments));
const serialized = JSON.stringify(data, null, 2) + "\n";
const target = new URL("docs/ethereum-catalog.json", root);
if (check) {
  if (await readFile(target, "utf8") !== serialized) throw new Error("Committed Ethereum catalog differs from pinned official source metadata");
  console.log("Ethereum catalog exactly matches pinned upstream git objects.");
} else {
  await writeFile(target, serialized);
  console.log(`Generated Ethereum catalog: ${data.coverage.records} records from ${data.coverage.scanned_files} source files.`);
}
