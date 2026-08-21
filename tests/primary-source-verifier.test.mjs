import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY,
  createPrimarySourceVerifierWithTrustedTransport
} from "../lib/primary-source-verifier.mjs";
import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const claim = {
  technical_claim: { source_authority_class: "eip" },
  contribution_digest: `sha256:${"1".repeat(64)}`,
  review_digest: `sha256:${"2".repeat(64)}`,
  candidate_name: "candidate.eth",
  normalized_candidate_name: "candidate.eth"
};

const selector = {
  repository_full_name: "ethereum/EIPs",
  commit_sha: "a".repeat(40),
  path: "EIPS/eip-1.md"
};

function gitBlobSha1(bytes) {
  return createHash("sha1")
    .update(Buffer.from(`blob ${bytes.length}\0`, "utf8"))
    .update(bytes)
    .digest("hex");
}

function mockGitHubFetch(bytes = Buffer.from("# EIP-1\n", "utf8"), overrides = {}) {
  const blobSha = gitBlobSha1(bytes);
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url === "https://api.github.com/repos/ethereum/EIPs") {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            id: overrides.repository_id ?? 44971752,
            full_name: overrides.repository_full_name ?? "ethereum/EIPs",
            archived: overrides.archived ?? false
          };
        }
      };
    }
    if (url === `https://api.github.com/repos/ethereum/EIPs/commits/${selector.commit_sha}`) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { sha: overrides.resolved_commit_sha ?? selector.commit_sha };
        }
      };
    }
    if (url === `https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-1.md?ref=${selector.commit_sha}`) {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            type: "file",
            path: overrides.path ?? selector.path,
            sha: overrides.blob_sha ?? blobSha,
            size: overrides.size ?? bytes.length,
            encoding: "base64",
            content: bytes.toString("base64")
          };
        }
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };
  return { fetchImpl, calls, blobSha };
}

function verifierFor(fetchImpl, requestTimeoutMs) {
  return createPrimarySourceVerifierWithTrustedTransport({
    fetchImpl,
    ...(requestTimeoutMs === undefined ? {} : { requestTimeoutMs })
  });
}

test("derives immutable primary-source evidence from allowlisted GitHub bytes", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const { fetchImpl, calls, blobSha } = mockGitHubFetch(bytes);
  const payload = await verifierFor(fetchImpl).verify({ claim, selector });

  assert.equal(calls.length, 3);
  assert.equal(calls[0].options.redirect, "error");
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.equal(calls[1].url, `https://api.github.com/repos/ethereum/EIPs/commits/${selector.commit_sha}`);
  assert.equal(payload.authority_class, "eip");
  assert.equal(payload.retrieval_policy_id, "vortik-primary-source-github-v1");
  assert.equal(payload.retrieved_independently, true);
  assert.equal(payload.repository.repository_id, 44971752);
  assert.equal(payload.repository.repository_full_name, "ethereum/EIPs");
  assert.equal(payload.repository.commit_sha, selector.commit_sha);
  assert.equal(payload.repository.blob_sha, blobSha);
  assert.equal(payload.repository.path, selector.path);
  assert.equal(payload.repository.content_sha256, `sha256:${createHash("sha256").update(bytes).digest("hex")}`);
  assert.equal(payload.claim_binding_digest, sha256CanonicalDigest(claim));
  assert.match(payload.canonical_source_identifier, /^github-artifact-v1:sha256:[0-9a-f]{64}$/);
});

test("binds trusted transport at construction and ignores later global or per-request replacement", async () => {
  const { fetchImpl, calls } = mockGitHubFetch();
  const verifier = verifierFor(fetchImpl);
  const previousFetch = globalThis.fetch;
  let attackerFetchCalled = false;
  globalThis.fetch = async () => {
    attackerFetchCalled = true;
    throw new Error("mutable global transport must not be used");
  };
  try {
    const payload = await verifier.verify({
      claim,
      selector,
      fetchImpl: async () => {
        attackerFetchCalled = true;
        throw new Error("per-request transport must not be used");
      },
      policy: {
        policy_id: "vortik-primary-source-github-v1",
        repositories: [{ repository_full_name: "attacker/repo" }]
      }
    });
    assert.equal(payload.repository.repository_full_name, "ethereum/EIPs");
  } finally {
    globalThis.fetch = previousFetch;
  }
  assert.equal(attackerFetchCalled, false);
  assert.equal(calls.length, 3);
});

test("requires trusted transport at construction", () => {
  assert.throws(
    () => createPrimarySourceVerifierWithTrustedTransport({ fetchImpl: null }),
    /trusted fetch transport at construction/
  );
});

test("bounds stalled trusted transport with a construction-owned timeout", async () => {
  let observedSignal;
  const verifier = verifierFor((_url, options) => {
    observedSignal = options.signal;
    return new Promise(() => {});
  }, 20);

  await assert.rejects(
    verifier.verify({ claim, selector }),
    /trusted GitHub retrieval timed out after 20 ms/
  );
  assert.ok(observedSignal instanceof AbortSignal);
  assert.equal(observedSignal.aborted, true);
});

test("bounds stalled response-body parsing with the same request deadline", async () => {
  const verifier = verifierFor(async () => ({
    ok: true,
    status: 200,
    json() {
      return new Promise(() => {});
    }
  }), 20);

  await assert.rejects(
    verifier.verify({ claim, selector }),
    /trusted GitHub retrieval timed out after 20 ms/
  );
});

test("rejects a hex-shaped ref that does not resolve to the exact commit", async () => {
  const { fetchImpl, calls } = mockGitHubFetch(undefined, { resolved_commit_sha: "b".repeat(40) });
  await assert.rejects(
    verifierFor(fetchImpl).verify({ claim, selector }),
    /does not resolve to the requested immutable commit/
  );
  assert.equal(calls.length, 2);
});

test("snapshots the validated selector before asynchronous retrieval", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const blobSha = gitBlobSha1(bytes);
  const mutableSelector = { ...selector };
  const originalSelector = { ...mutableSelector };
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      mutableSelector.repository_full_name = "attacker/repo";
      mutableSelector.commit_sha = "b".repeat(40);
      mutableSelector.path = "README.md";
      return { ok: true, status: 200, async json() { return { id: 44971752, full_name: "ethereum/EIPs", archived: false }; } };
    }
    if (calls.length === 2) {
      assert.equal(url, `https://api.github.com/repos/ethereum/EIPs/commits/${originalSelector.commit_sha}`);
      return { ok: true, status: 200, async json() { return { sha: originalSelector.commit_sha }; } };
    }
    if (calls.length === 3) {
      assert.equal(url, `https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-1.md?ref=${originalSelector.commit_sha}`);
      return {
        ok: true,
        status: 200,
        async json() {
          return { type: "file", path: originalSelector.path, sha: blobSha, size: bytes.length, encoding: "base64", content: bytes.toString("base64") };
        }
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const payload = await verifierFor(fetchImpl).verify({ claim, selector: mutableSelector });
  assert.equal(payload.repository.repository_full_name, originalSelector.repository_full_name);
  assert.equal(payload.repository.commit_sha, originalSelector.commit_sha);
  assert.equal(payload.repository.path, originalSelector.path);
});

test("validates the one-time selector snapshot instead of rereading accessor values", async () => {
  let commitReads = 0;
  const accessorSelector = {
    repository_full_name: "ethereum/EIPs",
    get commit_sha() {
      commitReads += 1;
      return commitReads === 1 ? selector.commit_sha : "main";
    },
    path: selector.path
  };
  const { fetchImpl } = mockGitHubFetch();
  const payload = await verifierFor(fetchImpl).verify({ claim, selector: accessorSelector });
  assert.equal(commitReads, 1);
  assert.equal(payload.repository.commit_sha, selector.commit_sha);
});

test("snapshots the bound claim before asynchronous retrieval", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const blobSha = gitBlobSha1(bytes);
  const mutableClaim = structuredClone(claim);
  const originalClaim = structuredClone(mutableClaim);
  let call = 0;
  const fetchImpl = async () => {
    call += 1;
    if (call === 1) {
      mutableClaim.technical_claim.source_authority_class = "ethereum_spec";
      mutableClaim.candidate_name = "mutated.eth";
      return { ok: true, status: 200, async json() { return { id: 44971752, full_name: "ethereum/EIPs", archived: false }; } };
    }
    if (call === 2) return { ok: true, status: 200, async json() { return { sha: selector.commit_sha }; } };
    if (call === 3) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { type: "file", path: selector.path, sha: blobSha, size: bytes.length, encoding: "base64", content: bytes.toString("base64") };
        }
      };
    }
    throw new Error("unexpected request");
  };

  const payload = await verifierFor(fetchImpl).verify({ claim: mutableClaim, selector });
  assert.equal(payload.authority_class, "eip");
  assert.equal(payload.claim_binding_digest, sha256CanonicalDigest(originalClaim));
  assert.notEqual(payload.claim_binding_digest, sha256CanonicalDigest(mutableClaim));
});

test("rejects a repository outside the trusted allowlist before transport use", async () => {
  let called = false;
  const verifier = verifierFor(async () => {
    called = true;
    throw new Error("must not fetch");
  });
  await assert.rejects(
    verifier.verify({ claim, selector: { ...selector, repository_full_name: "attacker/repo" } }),
    /not allowlisted/
  );
  assert.equal(called, false);
});

test("rejects repository authority mismatch and unsafe paths", async () => {
  const { fetchImpl } = mockGitHubFetch();
  const verifier = verifierFor(fetchImpl);
  const mismatchedClaim = structuredClone(claim);
  mismatchedClaim.technical_claim.source_authority_class = "ethereum_spec";
  await assert.rejects(verifier.verify({ claim: mismatchedClaim, selector }), /not authorized for the claim authority class/);
  await assert.rejects(verifier.verify({ claim, selector: { ...selector, path: "../README.md" } }), /normalized repository-relative path/);
  await assert.rejects(verifier.verify({ claim, selector: { ...selector, path: "README.md" } }), /outside the allowlisted repository prefixes/);
});

test("rejects repository identity, blob and decoded-size drift", async () => {
  await assert.rejects(
    verifierFor(mockGitHubFetch(undefined, { repository_id: 999 }).fetchImpl).verify({ claim, selector }),
    /repository identity does not match trusted allowlist/
  );
  await assert.rejects(
    verifierFor(mockGitHubFetch(undefined, { blob_sha: "b".repeat(40) }).fetchImpl).verify({ claim, selector }),
    /blob SHA does not match retrieved source bytes/
  );
  await assert.rejects(
    verifierFor(mockGitHubFetch(undefined, { size: 1 }).fetchImpl).verify({ claim, selector }),
    /decoded size does not match GitHub metadata/
  );
});

test("default policy stays narrowly scoped to known Ethereum repositories", () => {
  assert.deepEqual(
    DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY.repositories.map((entry) => entry.repository_full_name),
    ["ethereum/EIPs", "ethereum/consensus-specs", "ethereum/execution-specs"]
  );
});
