import { computeEnsLookupResultDigest } from "./trusted-verification-crypto.mjs";

const ENS_REGISTRY = "0x00000000000c2e074ec69a0dfb2997ba6c7d2e1e";
const BASE_REGISTRAR = "0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";
const DEFAULT_REQUEST_TIMEOUT_MS = 10_000;
const MAX_REQUEST_TIMEOUT_MS = 30_000;
const MAX_RPC_RESPONSE_CHARS = 2_000_000;
const MASK64 = (1n << 64n) - 1n;

const KECCAK_ROTATION = [
  [0, 36, 3, 41, 18],
  [1, 44, 10, 45, 2],
  [62, 6, 43, 15, 61],
  [28, 55, 25, 21, 56],
  [27, 20, 39, 8, 14]
];

const KECCAK_ROUND_CONSTANTS = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an,
  0x8000000080008000n, 0x000000000000808bn, 0x0000000080000001n,
  0x8000000080008081n, 0x8000000000008009n, 0x000000000000008an,
  0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n,
  0x8000000000008003n, 0x8000000000008002n, 0x8000000000000080n,
  0x000000000000800an, 0x800000008000000an, 0x8000000080008081n,
  0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
];

export const DEFAULT_ENS_MAINNET_POLICY = Object.freeze({
  policy_id: "vortik-ens-mainnet-dual-rpc-v1",
  chain_id: 1,
  normalization_profile: "ENSIP-15",
  supported_name_profile: "normalized-ascii-eth-2ld-v1",
  active_definition: "active_eth_2ld_at_finalized_block_v1",
  provider_count: 2,
  contracts: Object.freeze({
    ens_registry: ENS_REGISTRY,
    base_registrar: BASE_REGISTRAR
  })
});

function rotl64(value, shift) {
  if (shift === 0) return value & MASK64;
  const amount = BigInt(shift);
  return ((value << amount) | (value >> (64n - amount))) & MASK64;
}

function keccakF1600(state) {
  for (const roundConstant of KECCAK_ROUND_CONSTANTS) {
    const c = new Array(5).fill(0n);
    const d = new Array(5).fill(0n);
    for (let x = 0; x < 5; x += 1) {
      for (let y = 0; y < 5; y += 1) c[x] ^= state[x + 5 * y];
    }
    for (let x = 0; x < 5; x += 1) d[x] = c[(x + 4) % 5] ^ rotl64(c[(x + 1) % 5], 1);
    for (let x = 0; x < 5; x += 1) {
      for (let y = 0; y < 5; y += 1) state[x + 5 * y] = (state[x + 5 * y] ^ d[x]) & MASK64;
    }

    const b = new Array(25).fill(0n);
    for (let x = 0; x < 5; x += 1) {
      for (let y = 0; y < 5; y += 1) {
        b[y + 5 * ((2 * x + 3 * y) % 5)] = rotl64(state[x + 5 * y], KECCAK_ROTATION[x][y]);
      }
    }
    for (let x = 0; x < 5; x += 1) {
      for (let y = 0; y < 5; y += 1) {
        state[x + 5 * y] = b[x + 5 * y] ^ ((~b[(x + 1) % 5 + 5 * y] & MASK64) & b[(x + 2) % 5 + 5 * y]);
      }
    }
    state[0] ^= roundConstant;
  }
}

function readLaneLE(bytes, offset) {
  let lane = 0n;
  for (let i = 0; i < 8; i += 1) lane |= BigInt(bytes[offset + i] ?? 0) << BigInt(8 * i);
  return lane;
}

function writeLaneLE(lane, output, offset, count) {
  for (let i = 0; i < count; i += 1) output[offset + i] = Number((lane >> BigInt(8 * i)) & 0xffn);
}

export function keccak256Bytes(input) {
  const bytes = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const rate = 136;
  const paddedLength = Math.ceil((bytes.length + 1) / rate) * rate;
  const padded = Buffer.alloc(paddedLength, 0);
  bytes.copy(padded);
  padded[bytes.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const state = new Array(25).fill(0n);
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let lane = 0; lane < rate / 8; lane += 1) state[lane] ^= readLaneLE(padded, offset + lane * 8);
    keccakF1600(state);
  }

  const output = Buffer.alloc(32);
  for (let lane = 0; lane < 4; lane += 1) writeLaneLE(state[lane], output, lane * 8, 8);
  return output;
}

export function keccak256Hex(input) {
  return keccak256Bytes(input).toString("hex");
}

function namehash(name) {
  let node = Buffer.alloc(32, 0);
  const labels = name.split(".");
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    node = keccak256Bytes(Buffer.concat([node, keccak256Bytes(Buffer.from(labels[i], "utf8"))]));
  }
  return node.toString("hex");
}

function labelTokenId(label) {
  return BigInt(`0x${keccak256Hex(Buffer.from(label, "utf8"))}`);
}

function assertNormalizedAsciiEth2ld(name) {
  if (typeof name !== "string" || name.length < 5 || name.length > 255) {
    throw new TypeError("ENS verifier requires a normalized candidate name string");
  }
  if (name !== name.toLowerCase()) throw new Error("ENS candidate name must already be normalized");
  if (!name.endsWith(".eth") || name.split(".").length !== 2) {
    throw new Error("ENS verifier v0.1 supports exact .eth 2LD names only");
  }
  const [label] = name.split(".");
  if (
    Buffer.byteLength(label, "utf8") > 63 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label) ||
    /^..--/.test(label)
  ) {
    throw new Error("ENS verifier v0.1 supports the normalized ASCII .eth 2LD subset only");
  }
  return name;
}

function assertTimeout(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > MAX_REQUEST_TIMEOUT_MS) {
    throw new TypeError(`ENS verifier request timeout must be an integer from 1 to ${MAX_REQUEST_TIMEOUT_MS} ms`);
  }
}

function assertProviderConfig(provider) {
  if (!provider || typeof provider !== "object" || Array.isArray(provider)) throw new TypeError("ENS provider must be an object");
  if (typeof provider.provider_id !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(provider.provider_id)) {
    throw new Error("ENS provider_id is invalid");
  }
  if (typeof provider.fetchImpl !== "function") throw new TypeError("ENS provider requires a trusted fetch transport");
  let url;
  try {
    url = new URL(provider.rpc_url);
  } catch {
    throw new Error("ENS provider rpc_url is invalid");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error("ENS provider rpc_url must be an HTTPS endpoint without embedded credentials or fragment");
  }
  return Object.freeze({
    provider_id: provider.provider_id,
    rpc_url: url.toString(),
    fetchImpl: provider.fetchImpl
  });
}

function bindProvider(provider, requestTimeoutMs) {
  const trusted = assertProviderConfig(provider);
  let requestId = 0;
  return Object.freeze({
    provider_id: trusted.provider_id,
    rpc_url: trusted.rpc_url,
    async rpc(method, params) {
      requestId += 1;
      const controller = new AbortController();
      let timeoutId;
      const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error(`ENS RPC ${trusted.provider_id} timed out after ${requestTimeoutMs} ms`));
        }, requestTimeoutMs);
      });
      try {
        const response = await Promise.race([
          trusted.fetchImpl(trusted.rpc_url, {
            method: "POST",
            redirect: "error",
            signal: controller.signal,
            headers: { "content-type": "application/json", accept: "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: requestId, method, params })
          }),
          timeout
        ]);
        if (!response || response.ok !== true) throw new Error(`ENS RPC ${trusted.provider_id} failed with status ${response?.status ?? "unknown"}`);
        const contentLength = Number(response.headers?.get?.("content-length") ?? 0);
        if (Number.isFinite(contentLength) && contentLength > MAX_RPC_RESPONSE_CHARS) throw new Error("ENS RPC response exceeds verifier size limit");
        const text = await Promise.race([Promise.resolve().then(() => response.text()), timeout]);
        if (typeof text !== "string" || text.length > MAX_RPC_RESPONSE_CHARS) throw new Error("ENS RPC response exceeds verifier size limit");
        let json;
        try { json = JSON.parse(text); } catch { throw new Error(`ENS RPC ${trusted.provider_id} returned invalid JSON`); }
        if (json?.jsonrpc !== "2.0" || json?.id !== requestId) throw new Error(`ENS RPC ${trusted.provider_id} returned mismatched JSON-RPC metadata`);
        if (json.error) throw new Error(`ENS RPC ${trusted.provider_id} returned an error`);
        if (!("result" in json)) throw new Error(`ENS RPC ${trusted.provider_id} omitted result`);
        return json.result;
      } finally {
        clearTimeout(timeoutId);
        controller.abort();
      }
    }
  });
}

function parseHexQuantity(value, label) {
  if (typeof value !== "string" || !/^0x(?:0|[1-9a-fA-F][0-9a-fA-F]*)$/.test(value)) throw new Error(`${label} is not a canonical hex quantity`);
  const parsed = BigInt(value);
  if (parsed > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${label} exceeds safe integer range`);
  return Number(parsed);
}

function normalizeHash(value, label) {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) throw new Error(`${label} must be a 32-byte hex value`);
  return value.toLowerCase();
}

function parseBlock(value, finalized) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("ENS RPC block response is invalid");
  return Object.freeze({
    number: parseHexQuantity(value.number, "block number"),
    hash: normalizeHash(value.hash, "block hash"),
    state_root: normalizeHash(value.stateRoot, "block state root"),
    parent_hash: normalizeHash(value.parentHash, "block parent hash"),
    timestamp: parseHexQuantity(value.timestamp, "block timestamp"),
    finalized
  });
}

function blockTag(number) {
  return `0x${number.toString(16)}`;
}

function sameBlock(a, b) {
  return a.number === b.number && a.hash === b.hash && a.state_root === b.state_root && a.parent_hash === b.parent_hash && a.timestamp === b.timestamp;
}

function selector(signature) {
  return keccak256Hex(Buffer.from(signature, "utf8")).slice(0, 8);
}

const OWNER_SELECTOR = selector("owner(bytes32)");
const NAME_EXPIRES_SELECTOR = selector("nameExpires(uint256)");

function callDataBytes32(functionSelector, wordHex) {
  return `0x${functionSelector}${wordHex.padStart(64, "0")}`;
}

function callDataUint(functionSelector, value) {
  return `0x${functionSelector}${value.toString(16).padStart(64, "0")}`;
}

function parseWord(value, label) {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) throw new Error(`${label} must be one ABI word`);
  return value.slice(2).toLowerCase();
}

function parseAddressWord(value, label) {
  const word = parseWord(value, label);
  if (!/^0{24}[0-9a-f]{40}$/.test(word)) throw new Error(`${label} is not a canonical address ABI word`);
  return `0x${word.slice(24)}`;
}

function parseUintWord(value, label) {
  const word = parseWord(value, label);
  const parsed = BigInt(`0x${word}`);
  if (parsed > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${label} exceeds safe integer range`);
  return Number(parsed);
}

async function ethCall(provider, to, data, block) {
  return provider.rpc("eth_call", [
    { to, data },
    { blockHash: block.hash, requireCanonical: true }
  ]);
}

async function deriveProviderLookup(provider, normalizedName, block) {
  const label = normalizedName.slice(0, -4);
  const candidateNode = namehash(normalizedName);
  const ethNode = namehash("eth");
  const tokenId = labelTokenId(label);

  const candidateOwner = parseAddressWord(
    await ethCall(provider, ENS_REGISTRY, callDataBytes32(OWNER_SELECTOR, candidateNode), block),
    "ENS registry candidate owner"
  );
  const ethRegistrarOwner = parseAddressWord(
    await ethCall(provider, ENS_REGISTRY, callDataBytes32(OWNER_SELECTOR, ethNode), block),
    "ENS .eth registrar owner"
  );
  const expiry = parseUintWord(
    await ethCall(provider, BASE_REGISTRAR, callDataUint(NAME_EXPIRES_SELECTOR, tokenId), block),
    "ENS base registrar expiry"
  );

  return Object.freeze({
    registry_record_exists: candidateOwner !== "0x0000000000000000000000000000000000000000",
    eth_registrar_owner_matches_base_registrar: ethRegistrarOwner === BASE_REGISTRAR,
    base_registrar_expiry: expiry,
    active_registration: candidateOwner !== "0x0000000000000000000000000000000000000000" &&
      ethRegistrarOwner === BASE_REGISTRAR && expiry > block.timestamp
  });
}

function assertAffirmativeLookup(lookup) {
  if (lookup.registry_record_exists !== true) throw new Error("ENS candidate has no registry record at finalized block");
  if (lookup.eth_registrar_owner_matches_base_registrar !== true) throw new Error("ENS .eth registrar boundary does not match canonical Base Registrar");
  if (lookup.active_registration !== true) throw new Error("ENS candidate is not actively registered at finalized block");
}

export function createEnsMainnetVerifierWithTrustedProviders({
  providers,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS
}) {
  assertTimeout(requestTimeoutMs);
  if (!Array.isArray(providers) || providers.length !== 2) throw new Error("ENS verifier requires exactly two trusted providers");
  const boundProviders = providers.map((provider) => bindProvider(provider, requestTimeoutMs));
  if (new Set(boundProviders.map((provider) => provider.provider_id)).size !== 2) throw new Error("ENS verifier requires two distinct provider identities");
  if (new Set(boundProviders.map((provider) => provider.rpc_url)).size !== 2) throw new Error("ENS verifier requires two distinct provider endpoints");

  return Object.freeze({
    async verify({ normalizedCandidateName }) {
      const normalizedName = assertNormalizedAsciiEth2ld(normalizedCandidateName);

      const chainIds = await Promise.all(boundProviders.map((provider) => provider.rpc("eth_chainId", [])));
      if (chainIds.some((value) => parseHexQuantity(value, "chain id") !== 1)) throw new Error("ENS verifier requires Ethereum mainnet chain_id 1 from both providers");

      const finalizedTips = await Promise.all(boundProviders.map(async (provider) => parseBlock(
        await provider.rpc("eth_getBlockByNumber", ["finalized", false]),
        true
      )));
      const selectedNumber = Math.min(...finalizedTips.map((block) => block.number));
      const exactBlocks = await Promise.all(boundProviders.map(async (provider) => parseBlock(
        await provider.rpc("eth_getBlockByNumber", [blockTag(selectedNumber), false]),
        true
      )));

      if (!sameBlock(exactBlocks[0], exactBlocks[1])) throw new Error("ENS providers disagree on the selected finalized block");
      for (let i = 0; i < exactBlocks.length; i += 1) {
        if (finalizedTips[i].number === selectedNumber && !sameBlock(finalizedTips[i], exactBlocks[i])) {
          throw new Error(`ENS provider ${boundProviders[i].provider_id} changed its finalized block identity`);
        }
      }
      const block = exactBlocks[0];

      const lookups = await Promise.all(boundProviders.map((provider) => deriveProviderLookup(provider, normalizedName, block)));
      if (JSON.stringify(lookups[0]) !== JSON.stringify(lookups[1])) throw new Error("ENS providers disagree on finalized ENS lookup evidence");
      assertAffirmativeLookup(lookups[0]);

      const payload = {
        chain_id: 1,
        normalization_profile: DEFAULT_ENS_MAINNET_POLICY.normalization_profile,
        active_definition: DEFAULT_ENS_MAINNET_POLICY.active_definition,
        normalized_candidate_name: normalizedName,
        contracts: structuredClone(DEFAULT_ENS_MAINNET_POLICY.contracts),
        block: structuredClone(block),
        provider_policy_id: DEFAULT_ENS_MAINNET_POLICY.policy_id,
        providers: [],
        lookup: {
          ...structuredClone(lookups[0]),
          lookup_result_digest: ""
        }
      };
      payload.lookup.lookup_result_digest = computeEnsLookupResultDigest(payload);
      payload.providers = boundProviders.map((provider) => ({
        provider_id: provider.provider_id,
        block_hash: block.hash,
        state_root: block.state_root,
        timestamp: block.timestamp,
        lookup_result_digest: payload.lookup.lookup_result_digest
      }));

      return Object.freeze(structuredClone(payload));
    }
  });
}

export { DEFAULT_REQUEST_TIMEOUT_MS, MAX_REQUEST_TIMEOUT_MS };