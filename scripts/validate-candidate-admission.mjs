#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { assertTrustedCandidateAdmissionAvailable } from "../lib/candidate-admission-gate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function git(...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function resolveBaseRef() {
  if (process.env.GITHUB_EVENT_NAME === "pull_request" && process.env.GITHUB_BASE_REF) {
    const remoteBase = `origin/${process.env.GITHUB_BASE_REF}`;
    git("rev-parse", "--verify", remoteBase);
    return remoteBase;
  }

  return git("rev-parse", "HEAD^");
}

async function readCurrentRegistry() {
  return JSON.parse(await readFile(resolve(root, "registry.json"), "utf8"));
}

function readRegistryAt(ref) {
  return JSON.parse(git("show", `${ref}:registry.json`));
}

const baseRef = resolveBaseRef();
const [currentRegistry, baseRegistry] = await Promise.all([
  readCurrentRegistry(),
  Promise.resolve(readRegistryAt(baseRef))
]);

const result = assertTrustedCandidateAdmissionAvailable(baseRegistry, currentRegistry);
console.log(`Candidate admission gate checked against ${baseRef}; blocked=${result.blocked}; sensitive_changes=${result.changes.length}`);
