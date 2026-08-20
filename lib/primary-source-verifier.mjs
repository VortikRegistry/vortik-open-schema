import { createHash } from "node:crypto";

import {
  computePrimarySourceCanonicalIdentifier,
  sha256CanonicalDigest
} from "./trusted-verification-crypto.mjs";

const GITHUB_API_ORIGIN = "https://api.github.com";
const MAX_SOURCE_BYTES = 1_000_000;
const MAX_BASE64_SOURCE_CHARS = Math.ceil(MAX_SOURCE_BYTES / 3) * 4 + 16;

export const DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY = Object.freeze({
  policy_id: "vortik-primary-source-github-v1",
  provider: "github",
  repositories: Object.freeze([
    Object.freeze({
      repository_id: 44971752,
      repository_full_name: "ethereum/EIPs",
      authority_classes: Object.freeze(["eip", "ethereum_official_repository"]),
      path_prefixes: Object.freeze(["EIPS/"])
    }),
    Object.freeze({
      repository_id: 149554797,
      repository_full_name: "ethereum/consensus-specs",
      authority_classes: Object.freeze(["ethereum_spec", "ethereum_official_repository"]),
      path_prefixes: Object.freeze(["specs/"])
    }),
    Object.freeze({
      repository_id: 286791346,
      repository_full_name: "ethereum/execution-specs",
      authority_classes: Object.freeze(["ethereum_spec", "ethereum_official_repository"]),
      path_prefixes: Object.freeze(["src/ethereum/"])
    })
  ])
});

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
}

function assertSourceSelector(selector) {
  assertPlainObject(selector, "primary-source selector");
  if (!/^[0-9a-f]{40}$/.test(selector.commit_sha ?? "")) {
    throw new Error("primary-source commit_sha must be an exact lowercase 40-hex commit");
  }
  if (typeof selector.repository_full_name !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(selector.repository_full_name)) {
    throw new Error("primary-source repository_full_name is invalid");
  }
  if (typeof selector.path !== "string" || selector.path.length < 1 || selector.path.length > 512) {
    throw new Error("primary-source path is invalid");
  }
  if (selector.path.startsWith("/") || selector.path.includes("\\") || selector.path.split("/").some((part) => part === ".." || part === "." || part === "")) {
    throw new Error("primary-source path must be a normalized repository-relative path");
  }
}

function snapshotSourceSelector(selector) {
  assertPlainObject(selector, "primary-source selector");
  return Object.freeze({
    repository_full_name: selector.repository_full_name,
    commit_sha: selector.commit_sha,
    path: selector.path
  });
}

function snapshotVerificationClaim(claim) {
  assertPlainObject(claim, "verification claim");
  let snapshot;
  try {
    snapshot = structuredClone(claim);
  } catch {
    throw new TypeError("verification claim must be snapshotable structured data");
  }
  assertPlainObject(snapshot, "verification claim snapshot");
  return snapshot;
}

function resolveAllowedRepository(claim, selector) {
  assertPlainObject(claim, "verification claim");
  const authorityClass = claim?.technical_claim?.source_authority_class;
  if (typeof authorityClass !== "string") throw new Error("verification claim lacks source authority class");

  const matches = DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY.repositories.filter(
    (entry) => entry.repository_full_name === selector.repository_full_name
  );
  if (matches.length !== 1) throw new Error("primary-source repository is not allowlisted");
  const [entry] = matches;

  if (!entry.authority_classes.includes(authorityClass)) {
    throw new Error("primary-source repository is not authorized for the claim authority class");
  }
  if (!entry.path_prefixes.some((prefix) => selector.path.startsWith(prefix))) {
    throw new Error("primary-source path is outside the allowlisted repository prefixes");
  }
  return { entry, authorityClass };
}

function githubPathUrl(repositoryFullName, path, commitSha) {
  const repository = repositoryFullName.split("/").map(encodeURIComponent).join("/");
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${GITHUB_API_ORIGIN}/repos/${repository}/contents/${encodedPath}?ref=${encodeURIComponent(commitSha)}`;
}

function githubRepositoryUrl(repositoryFullName) {
  const repository = repositoryFullName.split("/").map(encodeURIComponent).join("/");
  return `${GITHUB_API_ORIGIN}/repos/${repository}`;
}

function githubCommitUrl(repositoryFullName, commitSha) {
  const repository = repositoryFullName.split("/").map(encodeURIComponent).join("/");
  return `${GITHUB_API_ORIGIN}/repos/${repository}/commits/${encodeURIComponent(commitSha)}`;
}

async function fetchJsonExact(url) {
  if (typeof globalThis.fetch !== "function") throw new TypeError("primary-source verifier requires runtime fetch");
  const response = await globalThis.fetch(url, {
    method: "GET",
    redirect: "error",
    headers: {
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28"
    }
  });
  if (!response || response.ok !== true) {
    throw new Error(`trusted GitHub retrieval failed with status ${response?.status ?? "unknown"}`);
  }
  return response.json();
}

function decodeGitHubContent(file) {
  if (file?.type !== "file" || file?.encoding !== "base64" || typeof file.content !== "string") {
    throw new Error("GitHub source response is not an inline base64 file");
  }
  if (!Number.isSafeInteger(file.size) || file.size < 0 || file.size > MAX_SOURCE_BYTES) {
    throw new Error("primary-source artifact exceeds verifier byte limit");
  }
  const compactBase64 = file.content.replace(/\s+/g, "");
  if (compactBase64.length > MAX_BASE64_SOURCE_CHARS) {
    throw new Error("primary-source encoded artifact exceeds verifier byte limit");
  }
  const bytes = Buffer.from(compactBase64, "base64");
  if (bytes.length !== file.size || bytes.length > MAX_SOURCE_BYTES) {
    throw new Error("primary-source decoded size does not match GitHub metadata");
  }
  return bytes;
}

function gitBlobSha1(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, "utf8");
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

function sha256Bytes(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

export async function verifyPrimarySourceFromGitHub({ claim, selector }) {
  const source = snapshotSourceSelector(selector);
  assertSourceSelector(source);
  const boundClaim = snapshotVerificationClaim(claim);
  const claimBindingDigest = sha256CanonicalDigest(boundClaim);
  const { entry, authorityClass } = resolveAllowedRepository(boundClaim, source);

  const repository = await fetchJsonExact(githubRepositoryUrl(source.repository_full_name));
  if (repository?.id !== entry.repository_id || repository?.full_name !== entry.repository_full_name || repository?.archived === true) {
    throw new Error("GitHub repository identity does not match trusted allowlist");
  }

  const resolvedCommit = await fetchJsonExact(githubCommitUrl(source.repository_full_name, source.commit_sha));
  if (resolvedCommit?.sha !== source.commit_sha) {
    throw new Error("GitHub ref does not resolve to the requested immutable commit");
  }

  const file = await fetchJsonExact(githubPathUrl(source.repository_full_name, source.path, source.commit_sha));
  if (file?.path !== source.path || typeof file?.sha !== "string" || !/^[0-9a-f]{40}$/.test(file.sha)) {
    throw new Error("GitHub source response does not match the requested immutable path");
  }

  const bytes = decodeGitHubContent(file);
  const computedBlobSha = gitBlobSha1(bytes);
  if (computedBlobSha !== file.sha) throw new Error("GitHub blob SHA does not match retrieved source bytes");

  const payload = {
    authority_class: authorityClass,
    retrieval_policy_id: DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY.policy_id,
    retrieved_independently: true,
    canonical_source_identifier: "",
    repository: {
      provider: "github",
      repository_id: repository.id,
      repository_full_name: repository.full_name,
      commit_sha: source.commit_sha,
      blob_sha: computedBlobSha,
      path: source.path,
      content_sha256: sha256Bytes(bytes)
    },
    claim_binding_digest: claimBindingDigest
  };
  payload.canonical_source_identifier = computePrimarySourceCanonicalIdentifier(payload);

  return Object.freeze(structuredClone(payload));
}

export { MAX_SOURCE_BYTES };
