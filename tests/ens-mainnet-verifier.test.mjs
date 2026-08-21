import assert from "node:assert/strict";
import test from "node:test";

import {
  createEnsMainnetVerifierWithTrustedProviders,
  keccak256Hex
} from "../lib/ens-mainnet-verifier.mjs";
import { computeEnsLookupResultDigest } from "../lib/trusted-verification-crypto.mjs";

const CANONICAL_ENS_REGISTRY = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e";
const BASE_REGISTRAR = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";
const CANDIDATE_OWNER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const SHARED_BLOCK = {
  number: "0x64",
  hash: `0x${"11".repeat(32)}`,
  stateRoot: `0x${"22".repeat(32)}`,
  parentHash: `0x${"33".repeat(32)}`,
  timestamp: "0x6553f100"
};
const EXPIRY = 1_800_000_000;

function addressWord(address) {
  return `0x${address.slice(2).padStart(64, "0")}`;
}

function uintWord(value) {
  return `0x${BigInt(value).toString(16).padStart(64, "0")}`;
}

function streamedResponse(bytes, { contentLength = bytes.byteLength } = {}) {
  return {
    ok: true,
    status: 200,
    headers: {
      get(name) {
        if (String(name).toLowerCase() !== "content-length") return null;
        return contentLength === null ? null : String(contentLength);
      }
    },
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      }
    })
  };
}

function rpcResponse(id, result) {
  const body = Buffer.from(JSON.stringify({ jsonrpc: "2.0", id, result }), "utf8");
  return streamedResponse(body);
}

function createMockProvider({
  providerId,
  rpcUrl,
  finalizedNumber = 100,
  chainId = "0x1",
  exactHash = SHARED_BLOCK.hash,
  candidateOwner = CANDIDATE_OWNER,
  ethRegistrarOwner = BASE_REGISTRAR,
  expiry = EXPIRY,
  stall = false
}) {
  let ethCallIndex = 0;
  const fetchImpl = async (_url, options) => {
    if (stall) return new Promise(() => {});
    const request = JSON.parse(options.body);
    if (request.method === "eth_chainId") return rpcResponse(request.id, chainId);
    if (request.method === "eth_getBlockByNumber") {
      if (request.params[0] === "finalized") {
        const number = `0x${finalizedNumber.toString(16)}`;
        return rpcResponse(request.id, finalizedNumber === 100 ? { ...SHARED_BLOCK, number } : {
          ...SHARED_BLOCK,
          number,
          hash: `0x${"44".repeat(32)}`,
          stateRoot: `0x${"55".repeat(32)}`,
          parentHash: `0x${"66".repeat(32)}`,
          timestamp: "0x6553f118"
        });
      }
      return rpcResponse(request.id, { ...SHARED_BLOCK, hash: exactHash });
    }
    if (request.method === "eth_call") {
      assert.deepEqual(request.params[1], {
        blockHash: SHARED_BLOCK.hash,
        requireCanonical: true
      });
      ethCallIndex += 1;
      if (ethCallIndex === 1) return rpcResponse(request.id, addressWord(candidateOwner));
      if (ethCallIndex === 2) return rpcResponse(request.id, addressWord(ethRegistrarOwner));
      if (ethCallIndex === 3) return rpcResponse(request.id, uintWord(expiry));
    }
    throw new Error(`unexpected RPC method ${request.method}`);
  };
  return {
    provider_id: providerId,
    rpc_url: rpcUrl ?? `https://${providerId}.example`,
    fetchImpl
  };
}

function createConcurrentMockProvider(providerId) {
  const fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    await new Promise((resolve) => setTimeout(resolve, 2));
    if (request.method === "eth_chainId") return rpcResponse(request.id, "0x1");
    if (request.method === "eth_getBlockByNumber") return rpcResponse(request.id, SHARED_BLOCK);
    if (request.method === "eth_call") {
      assert.deepEqual(request.params[1], {
        blockHash: SHARED_BLOCK.hash,
        requireCanonical: true
      });
      const to = request.params[0].to.toLowerCase();
      if (to === BASE_REGISTRAR) return rpcResponse(request.id, uintWord(EXPIRY));
      if (to === CANONICAL_ENS_REGISTRY) return rpcResponse(request.id, addressWord(BASE_REGISTRAR));
      throw new Error(`unexpected eth_call target ${to}`);
    }
    throw new Error(`unexpected RPC method ${request.method}`);
  };
  return {
    provider_id: providerId,
    rpc_url: `https://${providerId}.example`,
    fetchImpl
  };
}

function createOversizeProvider(providerId) {
  return {
    provider_id: providerId,
    rpc_url: `https://${providerId}.example`,
    async fetchImpl() {
      return streamedResponse(new Uint8Array(2_000_001), { contentLength: null });
    }
  };
}

test("keccak implementation matches the Ethereum empty-input vector", () => {
  assert.equal(
    keccak256Hex(Buffer.alloc(0)),
    "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
  );
});

test("derives affirmative 2-of-2 ENS evidence at one shared finalized block hash", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a", finalizedNumber: 100 }),
      createMockProvider({ providerId: "rpc-b", finalizedNumber: 102 })
    ]
  });

  const payload = await verifier.verify({ normalizedCandidateName: "epbs.eth" });
  assert.equal(payload.chain_id, 1);
  assert.equal(payload.normalization_profile, "ENSIP-15");
  assert.equal(payload.normalized_candidate_name, "epbs.eth");
  assert.equal(payload.block.number, 100);
  assert.equal(payload.block.hash, SHARED_BLOCK.hash);
  assert.equal(payload.block.finalized, true);
  assert.equal(payload.lookup.registry_record_exists, true);
  assert.equal(payload.lookup.eth_registrar_owner_matches_base_registrar, true);
  assert.equal(payload.lookup.active_registration, true);
  assert.equal(payload.lookup.base_registrar_expiry, EXPIRY);
  assert.equal(payload.providers.length, 2);
  assert.deepEqual(payload.providers.map((provider) => provider.provider_id), ["rpc-a", "rpc-b"]);
  assert.equal(payload.lookup.lookup_result_digest, computeEnsLookupResultDigest(payload));
  assert.deepEqual(
    Object.keys(payload.lookup).sort(),
    [
      "registry_record_exists",
      "eth_registrar_owner_matches_base_registrar",
      "base_registrar_expiry",
      "active_registration",
      "lookup_result_digest"
    ].sort()
  );
  assert.equal(JSON.stringify(payload).includes(CANDIDATE_OWNER), false);
});

test("fails closed when providers disagree on the selected finalized block", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a" }),
      createMockProvider({ providerId: "rpc-b", exactHash: `0x${"99".repeat(32)}` })
    ]
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /disagree on the selected finalized block/
  );
});

test("fails closed on negative or inactive ENS state", async () => {
  const zero = "0x0000000000000000000000000000000000000000";
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a", candidateOwner: zero }),
      createMockProvider({ providerId: "rpc-b", candidateOwner: zero })
    ]
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /no registry record/
  );
});

test("fails closed when the .eth registrar boundary is not canonical", async () => {
  const wrong = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a", ethRegistrarOwner: wrong }),
      createMockProvider({ providerId: "rpc-b", ethRegistrarOwner: wrong })
    ]
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /registrar boundary/
  );
});

test("requires mainnet from both trusted providers", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a" }),
      createMockProvider({ providerId: "rpc-b", chainId: "0xaa36a7" })
    ]
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /chain_id 1/
  );
});

test("supports only the explicitly bounded ENSIP-15-valid ASCII .eth 2LD profile", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [createMockProvider({ providerId: "rpc-a" }), createMockProvider({ providerId: "rpc-b" })]
  });
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "EPBS.eth" }), /already be normalized/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "sub.epbs.eth" }), /2LD names only/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "épbs.eth" }), /ASCII/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "xn--foo.eth" }), /ASCII/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "ab--cd.eth" }), /ASCII/);
});

test("provider identities and canonical network authorities must both be distinct", () => {
  assert.throws(
    () => createEnsMainnetVerifierWithTrustedProviders({
      providers: [createMockProvider({ providerId: "same" }), createMockProvider({ providerId: "same" })]
    }),
    /distinct provider identities/
  );

  assert.throws(
    () => createEnsMainnetVerifierWithTrustedProviders({
      providers: [
        createMockProvider({ providerId: "rpc-a", rpcUrl: "https://shared-rpc.example" }),
        createMockProvider({ providerId: "rpc-b", rpcUrl: "https://shared-rpc.example/other-path" })
      ]
    }),
    /distinct provider network authorities/
  );

  assert.throws(
    () => createEnsMainnetVerifierWithTrustedProviders({
      providers: [
        createMockProvider({ providerId: "rpc-a", rpcUrl: "https://shared-rpc.example/" }),
        createMockProvider({ providerId: "rpc-b", rpcUrl: "https://shared-rpc.example./" })
      ]
    }),
    /distinct provider network authorities/
  );

  assert.throws(
    () => createEnsMainnetVerifierWithTrustedProviders({
      providers: [
        createMockProvider({ providerId: "rpc-a" }),
        createMockProvider({ providerId: "rpc-b", rpcUrl: "https://rpc-b.example/?" })
      ]
    }),
    /query component or empty query delimiter/
  );
});

test("supports overlapping verification calls without cross-request JSON-RPC ID drift", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [createConcurrentMockProvider("rpc-a"), createConcurrentMockProvider("rpc-b")]
  });

  const [first, second] = await Promise.all([
    verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    verifier.verify({ normalizedCandidateName: "inclusionlist.eth" })
  ]);

  assert.equal(first.normalized_candidate_name, "epbs.eth");
  assert.equal(second.normalized_candidate_name, "inclusionlist.eth");
});

test("cuts off chunked RPC responses before buffering beyond the verifier limit", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [createOversizeProvider("rpc-a"), createMockProvider({ providerId: "rpc-b" })]
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /response exceeds verifier size limit/
  );
});

test("bounds stalled trusted RPC transports with a construction-owned timeout", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [
      createMockProvider({ providerId: "rpc-a", stall: true }),
      createMockProvider({ providerId: "rpc-b" })
    ],
    requestTimeoutMs: 10
  });
  await assert.rejects(
    () => verifier.verify({ normalizedCandidateName: "epbs.eth" }),
    /timed out after 10 ms/
  );
});