import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY,
  verifyPrimarySourceFromGitHub
} from "../lib/primary-source-verifier.mjs";
import { sha256CanonicalDigest } from "../lib/trusted-verification-crypto.mjs";

const claim = {
  technical_claim: {
    source_authority_class: "eip"
  },
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

async function withRuntimeFetch(fetchImpl, operation) {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;
  try {
    return await operation();
  } finally {
    globalThis.fetch = previousFetch;
  }
}

test("derives immutable primary-source evidence from allowlisted GitHub bytes", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const { fetchImpl, calls, blobSha } = mockGitHubFetch(bytes);
  const payload = await withRuntimeFetch(fetchImpl, () => verifyPrimarySourceFromGitHub({ claim, selector }));

  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.redirect, "error");
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

test("snapshots the validated selector before asynchronous retrieval", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const blobSha = gitBlobSha1(bytes);
  const mutableSelector = { ...selector };
  const originalSelector = { ...mutableSelector };
  const calls = [];

  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      assert.equal(url, "https://api.github.com/repos/ethereum/EIPs");
      mutableSelector.repository_full_name = "attacker/repo";
      mutableSelector.commit_sha = "b".repeat(40);
      mutableSelector.path = "README.md";
      return {
        ok: true,
        status: 200,
        async json() {
          return { id: 44971752, full_name: "ethereum/EIPs", archived: false };
        }
      };
    }
    if (calls.length === 2) {
      assert.equal(
        url,
        `https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-1.md?ref=${originalSelector.commit_sha}`
      );
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            type: "file",
            path: originalSelector.path,
            sha: blobSha,
            size: bytes.length,
            encoding: "base64",
            content: bytes.toString("base64")
          };
        }
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const payload = await withRuntimeFetch(fetchImpl, () =>
    verifyPrimarySourceFromGitHub({ claim, selector: mutableSelector })
  );

  assert.equal(calls.length, 2);
  assert.equal(payload.repository.repository_full_name, originalSelector.repository_full_name);
  assert.equal(payload.repository.commit_sha, originalSelector.commit_sha);
  assert.equal(payload.repository.path, originalSelector.path);
});

test("validates the one-time selector snapshot instead of rereading accessor values", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const blobSha = gitBlobSha1(bytes);
  let commitReads = 0;
  const accessorSelector = {
    repository_full_name: "ethereum/EIPs",
    get commit_sha() {
      commitReads += 1;
      return commitReads === 1 ? "a".repeat(40) : "main";
    },
    path: "EIPS/eip-1.md"
  };
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      assert.equal(url, "https://api.github.com/repos/ethereum/EIPs");
      return {
        ok: true,
        status: 200,
        async json() {
          return { id: 44971752, full_name: "ethereum/EIPs", archived: false };
        }
      };
    }
    if (calls.length === 2) {
      assert.equal(
        url,
        `https://api.github.com/repos/ethereum/EIPs/contents/EIPS/eip-1.md?ref=${"a".repeat(40)}`
      );
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            type: "file",
            path: "EIPS/eip-1.md",
            sha: blobSha,
            size: bytes.length,
            encoding: "base64",
            content: bytes.toString("base64")
          };
        }
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const payload = await withRuntimeFetch(fetchImpl, () =>
    verifyPrimarySourceFromGitHub({ claim, selector: accessorSelector })
  );

  assert.equal(commitReads, 1);
  assert.equal(payload.repository.commit_sha, "a".repeat(40));
});

test("snapshots the bound claim before asynchronous retrieval", async () => {
  const bytes = Buffer.from("# EIP-1\n", "utf8");
  const blobSha = gitBlobSha1(bytes);
  const mutableClaim = structuredClone(claim);
  const originalClaim = structuredClone(mutableClaim);
  const calls = [];

  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) {
      assert.equal(url, "https://api.github.com/repos/ethereum/EIPs");
      mutableClaim.technical_claim.source_authority_class = "ethereum_spec";
      mutableClaim.candidate_name = "mutated.eth";
      return {
        ok: true,
        status: 200,
        async json() {
          return { id: 44971752, full_name: "ethereum/EIPs", archived: false };
        }
      };
    }
    if (calls.length === 2) {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            type: "file",
            path: selector.path,
            sha: blobSha,
            size: bytes.length,
            encoding: "base64",
            content: bytes.toString("base64")
          };
        }
      };
    }
    throw new Error(`unexpected URL ${url}`);
  };

  const payload = await withRuntimeFetch(fetchImpl, () =>
    verifyPrimarySourceFromGitHub({ claim: mutableClaim, selector })
  );

  assert.equal(payload.authority_class, "eip");
  assert.equal(payload.claim_binding_digest, sha256CanonicalDigest(originalClaim));
  assert.notEqual(payload.claim_binding_digest, sha256CanonicalDigest(mutableClaim));
});

test("rejects a repository outside the trusted allowlist before network access", async () => {
  let called = false;
  await withRuntimeFetch(async () => {
    called = true;
    throw new Error("must not fetch");
  }, async () => {
    await assert.rejects(
      verifyPrimarySourceFromGitHub({ claim, selector: { ...selector, repository_full_name: "attacker/repo" } }),
      /not allowlisted/
    );
  });
  assert.equal(called, false);
});

test("rejects a repository that is not authorized for the claim authority class", async () => {
  const mismatchedClaim = structuredClone(claim);
  mismatchedClaim.technical_claim.source_authority_class = "ethereum_spec";
  await assert.rejects(
    verifyPrimarySourceFromGitHub({ claim: mismatchedClaim, selector }),
    /not authorized for the claim authority class/
  );
});

test("rejects path traversal and paths outside allowed prefixes", async () => {
  await assert.rejects(
    verifyPrimarySourceFromGitHub({ claim, selector: { ...selector, path: "../README.md" } }),
    /normalized repository-relative path/
  );
  await assert.rejects(
    verifyPrimarySourceFromGitHub({ claim, selector: { ...selector, path: "README.md" } }),
    /outside the allowlisted repository prefixes/
  );
});

test("rejects repository identity drift", async () => {
  const { fetchImpl } = mockGitHubFetch(undefined, { repository_id: 999 });
  await withRuntimeFetch(fetchImpl, async () => {
    await assert.rejects(
      verifyPrimarySourceFromGitHub({ claim, selector }),
      /repository identity does not match trusted allowlist/
    );
  });
});

test("rejects blob metadata detached from retrieved bytes", async () => {
  const { fetchImpl } = mockGitHubFetch(undefined, { blob_sha: "b".repeat(40) });
  await withRuntimeFetch(fetchImpl, async () => {
    await assert.rejects(
      verifyPrimarySourceFromGitHub({ claim, selector }),
      /blob SHA does not match retrieved source bytes/
    );
  });
});

test("rejects decoded-size metadata mismatch", async () => {
  const { fetchImpl } = mockGitHubFetch(undefined, { size: 1 });
  await withRuntimeFetch(fetchImpl, async () => {
    await assert.rejects(
      verifyPrimarySourceFromGitHub({ claim, selector }),
      /decoded size does not match GitHub metadata/
    );
  });
});

test("caller cannot replace the runtime-owned fetch or source policy per request", async () => {
  const { fetchImpl, calls } = mockGitHubFetch();
  let attackerFetchCalled = false;
  await withRuntimeFetch(fetchImpl, async () => {
    const payload = await verifyPrimarySourceFromGitHub({
      claim,
      selector,
      fetchImpl: async () => {
        attackerFetchCalled = true;
        throw new Error("caller fetch must be ignored");
      },
      policy: {
        policy_id: "vortik-primary-source-github-v1",
        provider: "github",
        repositories: [{
          repository_id: 1,
          repository_full_name: "attacker/repo",
          authority_classes: ["eip"],
          path_prefixes: [""]
        }]
      }
    });
    assert.equal(payload.repository.repository_full_name, "ethereum/EIPs");
  });
  assert.equal(attackerFetchCalled, false);
  assert.equal(calls.length, 2);
});

test("default policy stays narrowly scoped to known Ethereum repositories", () => {
  assert.deepEqual(
    DEFAULT_PRIMARY_SOURCE_GITHUB_POLICY.repositories.map((entry) => entry.repository_full_name),
    ["ethereum/EIPs", "ethereum/consensus-specs", "ethereum/execution-specs"]
  );
});
