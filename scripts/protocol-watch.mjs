import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_CONFIG_PATH = "config/protocol-watch.json";
const DEFAULT_BASELINE_PATH = "protocol-watch/baseline.json";
const DEFAULT_CANDIDATE_PATH = "protocol-watch/candidate.json";
const DEFAULT_REPORT_PATH = "protocol-watch/report.md";
const GITHUB_API_ORIGIN = "https://api.github.com";
const DEFAULT_TIMEOUT_MS = 15_000;

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
}

export function parseFrontmatter(text) {
  if (typeof text !== "string" || !text.startsWith("---\n")) return {};
  const end = text.indexOf("\n---", 4);
  if (end < 0) return {};
  const out = {};
  for (const line of text.slice(4, end).split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) out[match[1]] = match[2].trim();
  }
  return out;
}

function sha256Text(text) {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function encodeRepoPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function encodeRepository(repository) {
  return repository.split("/").map(encodeURIComponent).join("/");
}

function headers(token) {
  return {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    ...(token ? { authorization: `Bearer ${token}` } : {})
  };
}

async function fetchJson(url, { fetchImpl, token, timeoutMs }) {
  if (typeof fetchImpl !== "function") throw new TypeError("protocol watch requires fetch");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, { method: "GET", redirect: "error", signal: controller.signal, headers: headers(token) });
    if (!response?.ok) throw new Error(`protocol watch retrieval failed (${response?.status ?? "unknown"}) for ${url}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function validateConfig(config) {
  assertPlainObject(config, "protocol watch config");
  if (config.watch_version !== "1.0.0") throw new Error("unsupported protocol watch config version");
  if (!Array.isArray(config.allowed_repositories) || config.allowed_repositories.length < 1) throw new Error("allowed_repositories must be non-empty");
  if (!Array.isArray(config.sources) || config.sources.length < 1) throw new Error("sources must be non-empty");
  const allowed = new Set(config.allowed_repositories);
  const ids = new Set();
  for (const source of config.sources) {
    assertPlainObject(source, "protocol watch source");
    if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(source.id ?? "")) throw new Error(`invalid source id: ${source.id}`);
    if (ids.has(source.id)) throw new Error(`duplicate source id: ${source.id}`);
    ids.add(source.id);
    if (!allowed.has(source.repository)) throw new Error(`source repository is not allowlisted: ${source.repository}`);
    if (!["github_file", "github_repo_head"].includes(source.kind)) throw new Error(`unsupported source kind: ${source.kind}`);
    if (source.kind === "github_file" && (typeof source.path !== "string" || !source.path || source.path.includes("..") || source.path.startsWith("/"))) throw new Error(`invalid source path: ${source.id}`);
  }
}

async function observeSource(source, context) {
  const repository = encodeRepository(source.repository);
  if (source.kind === "github_file") {
    const url = `${GITHUB_API_ORIGIN}/repos/${repository}/contents/${encodeRepoPath(source.path)}`;
    const file = await fetchJson(url, context);
    if (file?.type !== "file" || file?.path !== source.path || file?.encoding !== "base64" || !/^[0-9a-f]{40}$/.test(file?.sha ?? "")) throw new Error(`invalid GitHub file response for ${source.id}`);
    if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > context.maxSourceBytes) throw new Error(`source exceeds byte limit: ${source.id}`);
    const text = Buffer.from(file.content.replace(/\s+/g, ""), "base64").toString("utf8");
    const frontmatter = parseFrontmatter(text);
    return {
      id: source.id,
      kind: source.kind,
      repository: source.repository,
      path: source.path,
      authority: source.authority,
      relevance: source.relevance,
      fingerprint: file.sha,
      content_sha256: sha256Text(text),
      frontmatter: Object.fromEntries(["eip", "title", "status", "type", "category", "requires"].filter((key) => frontmatter[key] !== undefined).map((key) => [key, frontmatter[key]])),
      source_url: file.html_url
    };
  }

  const repoUrl = `${GITHUB_API_ORIGIN}/repos/${repository}`;
  const repo = await fetchJson(repoUrl, context);
  if (repo?.full_name !== source.repository || repo?.archived === true || typeof repo?.default_branch !== "string") throw new Error(`invalid GitHub repository response for ${source.id}`);
  const branchUrl = `${GITHUB_API_ORIGIN}/repos/${repository}/branches/${encodeURIComponent(repo.default_branch)}`;
  const branch = await fetchJson(branchUrl, context);
  if (!/^[0-9a-f]{40}$/.test(branch?.commit?.sha ?? "")) throw new Error(`invalid GitHub branch response for ${source.id}`);
  return { id: source.id, kind: source.kind, repository: source.repository, branch: repo.default_branch, authority: source.authority, relevance: source.relevance, fingerprint: branch.commit.sha, source_url: `${repo.html_url}/tree/${encodeURIComponent(repo.default_branch)}` };
}

export function compareBaseline(baseline, observed) {
  assertPlainObject(baseline, "protocol watch baseline");
  const prior = new Map((baseline.sources ?? []).map((source) => [source.id, source]));
  const changes = [];
  for (const current of observed) {
    const previous = prior.get(current.id);
    if (!previous) changes.push({ id: current.id, reason: "new_source", previous: null, current });
    else if (previous.fingerprint !== current.fingerprint) changes.push({ id: current.id, reason: "fingerprint_changed", previous, current });
  }
  return changes;
}

export function formatReport({ observedAt, baseline, changes }) {
  const lines = ["# Protocol Watch Alert", "", `Observed at: \`${observedAt}\``, `Baseline reviewed through: \`${baseline.reviewed_through}\``, "", "This draft PR is an evidence alert only. It MUST NOT be merged until a reviewer determines whether the upstream changes require source-note, anchor, registry, feed, map, or documentation updates. The watcher does not mutate canonical registry state and does not auto-merge.", "", "## Changed primary sources", ""];
  for (const change of changes) {
    const current = change.current;
    lines.push(`- **${current.id}** — ${current.repository}${current.path ? ` / \`${current.path}\`` : ""}`);
    lines.push(`  - previous: \`${change.previous?.fingerprint ?? "none"}\``);
    lines.push(`  - current: \`${current.fingerprint}\``);
    if (current.frontmatter?.status) lines.push(`  - current EIP status: \`${current.frontmatter.status}\``);
    lines.push(`  - relevance: ${(current.relevance ?? []).join(", ")}`);
    lines.push(`  - source: ${current.source_url}`);
  }
  lines.push("", "## Required human gate", "", "1. Inspect the upstream diff and primary-source context.", "2. Decide whether Vortik public claims or semantic state are stale.", "3. If needed, update source notes and affected public artifacts in this PR.", "4. Update `protocol-watch/baseline.json` only after that review.", "5. Require `npm run check:public-safety` and `npm run validate` to pass before merge.", "");
  return lines.join("\n");
}

export async function runProtocolWatch({ config, baseline, fetchImpl = globalThis.fetch, token = process.env.GITHUB_TOKEN, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  validateConfig(config);
  assertPlainObject(baseline, "protocol watch baseline");
  const context = { fetchImpl, token, timeoutMs, maxSourceBytes: config.max_source_bytes ?? 1_000_000 };
  const observed = [];
  for (const source of config.sources) observed.push(await observeSource(source, context));
  return { observed, changes: compareBaseline(baseline, observed) };
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendGitHubOutput(path, key, value) {
  if (path) writeFileSync(path, `${key}=${value}\n`, { encoding: "utf8", flag: "a" });
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const githubOutputIndex = process.argv.indexOf("--github-output");
  const githubOutput = githubOutputIndex >= 0 ? process.argv[githubOutputIndex + 1] : null;
  const config = JSON.parse(readFileSync(resolve(process.env.PROTOCOL_WATCH_CONFIG ?? DEFAULT_CONFIG_PATH), "utf8"));
  const baseline = JSON.parse(readFileSync(resolve(process.env.PROTOCOL_WATCH_BASELINE ?? DEFAULT_BASELINE_PATH), "utf8"));
  const observedAt = new Date().toISOString();
  const { observed, changes } = await runProtocolWatch({ config, baseline });
  const changed = changes.length > 0;
  appendGitHubOutput(githubOutput, "changed", changed ? "true" : "false");
  appendGitHubOutput(githubOutput, "change_count", String(changes.length));

  if (changed && args.has("--write-candidate")) {
    writeJson(resolve(DEFAULT_CANDIDATE_PATH), { candidate_version: "1.0.0", observed_at: observedAt, baseline_reviewed_through: baseline.reviewed_through, changes, observed_sources: observed });
    mkdirSync(dirname(resolve(DEFAULT_REPORT_PATH)), { recursive: true });
    writeFileSync(resolve(DEFAULT_REPORT_PATH), formatReport({ observedAt, baseline, changes }), "utf8");
  }

  console.log(JSON.stringify({ changed, change_count: changes.length, changed_sources: changes.map((change) => change.id) }));
  if (changed && args.has("--fail-on-change")) process.exitCode = 2;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
