import assert from "node:assert/strict";
import test from "node:test";

import {
  createEnsMainnetVerifierWithTrustedProviders,
  keccak256Hex
} from "../lib/ens-mainnet-verifier.mjs";
import { computeEnsLookupResultDigest } from "../lib/trusted-verification-crypto.mjs";

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

function rpcResponse(id, result) {
  const body = JSON.stringify({ jsonrpc: "2.0", id, result });
  return {
    ok: true,
    status: 200,
    headers: { get: () => String(body.length) },
    async text() { return body; }
  };
}

function createMockProvider({
  providerId,
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
      ethCallIndex += 1;
      if (ethCallIndex === 1) return rpcResponse(request.id, addressWord(candidateOwner));
      if (ethCallIndex === 2) return rpcResponse(request.id, addressWord(ethRegistrarOwner));
      if (ethCallIndex === 3) return rpcResponse(request.id, uintWord(expiry));
    }
    throw new Error(`unexpected RPC method ${request.method}`);
  };
  return { provider_id: providerId, rpc_url: `https://${providerId}.example`, fetchImpl };
}

test("keccak implementation matches the Ethereum empty-input vector", () => {
  assert.equal(
    keccak256Hex(Buffer.alloc(0)),
    "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
  );
});

test("derives affirmative 2-of-2 ENS evidence at one shared finalized block", async () => {
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

test("supports only the explicitly bounded normalized ASCII .eth 2LD profile", async () => {
  const verifier = createEnsMainnetVerifierWithTrustedProviders({
    providers: [createMockProvider({ providerId: "rpc-a" }), createMockProvider({ providerId: "rpc-b" })]
  });
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "EPBS.eth" }), /already be normalized/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "sub.epbs.eth" }), /2LD names only/);
  await assert.rejects(() => verifier.verify({ normalizedCandidateName: "épbs.eth" }), /ASCII/);
});

test("provider identities must be distinct and transports are construction-owned", () => {
  assert.throws(
    () => createEnsMainnetVerifierWithTrustedProviders({
      providers: [createMockProvider({ providerId: "same" }), createMockProvider({ providerId: "same" })]
    }),
    /distinct provider identities/
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
