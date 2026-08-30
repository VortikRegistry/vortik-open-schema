#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { access, readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = "schemas/agents/vortik-agent-discovery/1.5.0/schema.json";
const manifestPath = "agents/discovery.json";
const contributionContractPath = "schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json";
const publicContributionContractPath = "docs/schemas/queries/vortik-ens-candidate-contribution/1.0.0/schema.json";
const contributionTemplatePath = ".github/ISSUE_TEMPLATE/ens-candidate-contribution.md";
const contributionSubmissionUrl = "https://github.com/VortikRegistry/vortik-open-schema/issues/new?template=ens-candidate-contribution.md";
const publicA2ABaseUrl = "https://vortik-agent-beacon-dtdch3ioxa-rj.a.run.app";
const historicalDiscoveryVersions = ["1.0.0", "1.1.0", "1.2.0", "1.3.0", "1.4.0"];

function git(...args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function resolveBaseRef() {
  if (process.env.GITHUB_EVENT_NAME === "pull_request" && process.env.GITHUB_BASE_REF) {
    const remoteBase = `origin/${process.env.GITHUB_BASE_REF}`;
    git("rev-parse", "--verify", remoteBase);
    return remoteBase;
  }
  return git("rev-parse", "HEAD^").trim();
}

async function readText(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

async function readJson(relativePath) {
  return JSON.parse(await readText(relativePath));
}

async function requirePath(relativePath, errors) {
  try {
    await access(resolve(root, relativePath));
  } catch {
    errors.push(`referenced path does not exist: ${relativePath}`);
  }
}

async function listFiles(relativeDir) {
  const absoluteDir = resolve(root, relativeDir);
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = resolve(currentDir, entry.name);
      if (entry.isDirectory()) await walk(entryPath);
      else if (entry.isFile()) files.push(relative(absoluteDir, entryPath).split(sep).join("/"));
    }
  }

  await walk(absoluteDir);
  return files.sort();
}

function inventoryDiff(sourceFiles, publicFiles) {
  const source = new Set(sourceFiles);
  const published = new Set(publicFiles);
  return {
    missing: sourceFiles.filter((file) => !published.has(file)),
    extra: publicFiles.filter((file) => !source.has(file))
  };
}

async function verifyMirrorInventory(sourceDir, publicDir, label) {
  const [sourceFiles, publicFiles] = await Promise.all([listFiles(sourceDir), listFiles(publicDir)]);
  const { missing, extra } = inventoryDiff(sourceFiles, publicFiles);
  if (missing.length > 0 || extra.length > 0) {
    const details = [
      ...missing.map((file) => `missing public mirror: ${publicDir}/${file}`),
      ...extra.map((file) => `stale public mirror: ${publicDir}/${file}`)
    ];
    throw new Error(`${label} directory inventories differ:\n${details.join("\n")}`);
  }

  for (const file of sourceFiles) {
    const [source, published] = await Promise.all([
      readText(`${sourceDir}/${file}`),
      readText(`${publicDir}/${file}`)
    ]);
    if (source !== published) throw new Error(`${label} mirror must be byte-identical: ${file}`);
  }
}

async function verifyHistoricalSchemas(baseRef) {
  for (const version of historicalDiscoveryVersions) {
    const sourcePath = `schemas/agents/vortik-agent-discovery/${version}/schema.json`;
    const publicPath = `docs/schemas/agents/vortik-agent-discovery/${version}/schema.json`;
    const [currentSource, currentPublic] = await Promise.all([readText(sourcePath), readText(publicPath)]);
    const baseSource = git("show", `${baseRef}:${sourcePath}`);
    const basePublic = git("show", `${baseRef}:${publicPath}`);
    if (currentSource !== baseSource || currentPublic !== basePublic || currentSource !== currentPublic) {
      throw new Error(`Historical agent discovery ${version} source/public contract must remain byte-identical to ${baseRef}`);
    }
  }
}

function assertValid(validate, value, label) {
  if (!validate(value)) throw new Error(`${label} should validate:\n${JSON.stringify(validate.errors, null, 2)}`);
}

function assertInvalid(validate, value, label) {
  if (validate(value)) throw new Error(`${label} should fail validation`);
}

const baseRef = resolveBaseRef();
const [schema, manifest, contributionText, publicContributionText] = await Promise.all([
  readJson(schemaPath),
  readJson(manifestPath),
  readText(contributionContractPath),
  readText(publicContributionContractPath)
]);

if (contributionText !== publicContributionText) {
  throw new Error("ENS candidate contribution source contract and public mirror must be byte-identical");
}

await verifyHistoricalSchemas(baseRef);

const contributionSchema = JSON.parse(contributionText);
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const validateContribution = ajv.compile(contributionSchema);

assertValid(validate, manifest, "agents/discovery.json 1.5.0 live-service manifest with Agent Card runtime capability delegation");

const integrityErrors = [];
for (const capability of manifest.capabilities) {
  if (capability.local_entrypoint) await requirePath(capability.local_entrypoint, integrityErrors);
  if (capability.local_execution_entrypoint) await requirePath(capability.local_execution_entrypoint, integrityErrors);
  if (capability.library_entrypoint) await requirePath(capability.library_entrypoint, integrityErrors);
  if (capability.http_entrypoint) await requirePath(capability.http_entrypoint, integrityErrors);
  if (capability.router_entrypoint) await requirePath(capability.router_entrypoint, integrityErrors);
  if (capability.contract) await requirePath(capability.contract, integrityErrors);
  if (capability.documentation) await requirePath(capability.documentation, integrityErrors);
  if (capability.request_contract) await requirePath(capability.request_contract, integrityErrors);
  if (capability.response_contract) await requirePath(capability.response_contract, integrityErrors);
}
await requirePath(contributionTemplatePath, integrityErrors);

const feedCapability = manifest.capabilities.find((entry) => entry.id === "discover_vortik_feeds");
const feedIndex = await readJson(feedCapability.local_entrypoint);
if (feedIndex.index !== "vortik-feed-index" || feedIndex.index_version !== "1.0.0") {
  integrityErrors.push("feed discovery capability does not point to vortik-feed-index 1.0.0");
}

const ensCapability = manifest.capabilities.find((entry) => entry.id === "research_ens_semantics");
const [requestContract, responseContract] = await Promise.all([
  readJson(ensCapability.request_contract),
  readJson(ensCapability.response_contract)
]);
if (requestContract.$id !== `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${ensCapability.request_contract}`) {
  integrityErrors.push("ENS research request contract id does not match the advertised canonical path");
}
if (responseContract.$id !== `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${ensCapability.response_contract}`) {
  integrityErrors.push("ENS research response contract id does not match the advertised canonical path");
}

const inboundCapability = manifest.capabilities.find((entry) => entry.id === "inbound_ens_research_contract");
if (inboundCapability.request_contract !== ensCapability.request_contract) integrityErrors.push("inbound ENS capability must reuse the canonical ENS research request contract");
if (inboundCapability.response_contract !== ensCapability.response_contract) integrityErrors.push("inbound ENS capability must reuse the canonical ENS research response contract");
if (inboundCapability.local_execution_entrypoint !== ensCapability.local_entrypoint) integrityErrors.push("inbound ENS capability must resolve to the existing ENS research client");
if (inboundCapability.public_request_contract !== `https://vortikregistry.github.io/vortik-open-schema/${inboundCapability.request_contract}`) integrityErrors.push("inbound ENS public request contract does not match the canonical Pages path");
if (inboundCapability.public_response_contract !== `https://vortikregistry.github.io/vortik-open-schema/${inboundCapability.response_contract}`) integrityErrors.push("inbound ENS public response contract does not match the canonical Pages path");
if (inboundCapability.submission_available !== false) integrityErrors.push("inbound ENS research remains contract-only without submission transport");

const contributionCapability = manifest.capabilities.find((entry) => entry.id === "prepare_ens_candidate_contribution");
if (contributionCapability.contract !== contributionContractPath) integrityErrors.push("ENS candidate contribution capability must point to the canonical contribution contract");
if (contributionCapability.public_contract !== `https://vortikregistry.github.io/vortik-open-schema/${contributionCapability.contract}`) integrityErrors.push("ENS candidate contribution public contract does not match the canonical Pages path");
if (contributionSchema.$id !== `https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/${contributionCapability.contract}`) integrityErrors.push("ENS candidate contribution contract id does not match the advertised canonical path");
if (contributionCapability.submission_available !== true) integrityErrors.push("ENS candidate contribution GitHub Issue submission must be advertised available");
if (contributionCapability.submission_transport !== "github_issue") integrityErrors.push("ENS candidate contribution submission transport must be github_issue");
if (contributionCapability.submission_url !== contributionSubmissionUrl) integrityErrors.push("ENS candidate contribution submission URL must point to the canonical Issue template");
if (contributionCapability.automatic_promotion !== false) integrityErrors.push("ENS candidate contribution must never advertise automatic promotion");

const beaconCapability = manifest.capabilities.find((entry) => entry.id === "public_a2a_reception_beacon");
if (!beaconCapability) integrityErrors.push("A2A Reception beacon capability is missing");
else {
  if (beaconCapability.protocol_binding !== "HTTP+JSON" || beaconCapability.protocol_version !== "1.0") integrityErrors.push("A2A beacon must remain on HTTP+JSON protocol version 1.0");
  if (beaconCapability.agent_card_path !== "/.well-known/agent-card.json" || beaconCapability.interface_path !== "/a2a/v1") integrityErrors.push("A2A beacon paths drifted from the versioned discovery contract");
  if (beaconCapability.persistent_tasks !== false || beaconCapability.external_retrieval !== false || beaconCapability.network_required_by_repository_runtime !== false) integrityErrors.push("A2A beacon must remain stateless and repository-network independent");
  if (beaconCapability.router_entrypoint !== "lib/public-reception-router.mjs" || beaconCapability.remote_ens_research_implemented !== true) integrityErrors.push("A2A Reception must bind the reviewed router and implement deterministic remote ENS research");
  if (beaconCapability.runtime_availability_source !== "agent_card") integrityErrors.push("A2A Reception runtime availability must be delegated exclusively to the live Agent Card");
  if (beaconCapability.commercial_signal_mode !== "sanitized_no_handoff" || beaconCapability.private_handoff !== false) integrityErrors.push("A2A Reception commercial signals must remain sanitized with private handoff disabled");
  if (beaconCapability.contribution_transport !== "github_issue_only") integrityErrors.push("A2A Reception contribution routing must remain GitHub-Issue-only");
}

if (manifest.interaction.mode !== "a2a_live" ||
    manifest.interaction.a2a_implementation_available !== true ||
    manifest.interaction.a2a_server !== true ||
    manifest.interaction.live_network_ingress !== true ||
    manifest.interaction.agent_card_published !== true ||
    manifest.interaction.runtime_capabilities_source !== "agent_card" ||
    manifest.interaction.public_base_url !== publicA2ABaseUrl) {
  integrityErrors.push("current agent discovery manifest must match the existing live A2A service while delegating runtime capability truth to its Agent Card");
}

if (manifest.trust_boundary.arbitrary_outbound_network !== false ||
    manifest.trust_boundary.receipt_runtime_dependency !== false ||
    manifest.trust_boundary.dedicated_runtime_identity_required !== true ||
    manifest.trust_boundary.caller_selected_network_destinations !== false) {
  integrityErrors.push("A2A beacon trust-boundary declarations drifted");
}

if (integrityErrors.length > 0) throw new Error(`Agent discovery manifest does not match existing public capabilities:\n${integrityErrors.join("\n")}`);

const preactivationManifest = structuredClone(manifest);
preactivationManifest.interaction.mode = "a2a_preactivation";
preactivationManifest.interaction.a2a_server = false;
preactivationManifest.interaction.live_network_ingress = false;
preactivationManifest.interaction.agent_card_published = false;
preactivationManifest.interaction.public_base_url = null;
assertValid(validate, preactivationManifest, "fully coupled A2A preactivation lifecycle state");

const liveManifest = structuredClone(manifest);
assertValid(validate, liveManifest, "fully coupled A2A live lifecycle state");

for (const [label, mutate] of [
  ["preactivation a2a_server=true", (candidate) => { candidate.interaction.a2a_server = true; }],
  ["preactivation live_network_ingress=true", (candidate) => { candidate.interaction.live_network_ingress = true; }],
  ["preactivation agent_card_published=true", (candidate) => { candidate.interaction.agent_card_published = true; }],
  ["preactivation public_base_url set", (candidate) => { candidate.interaction.public_base_url = "https://beacon.example.test"; }],
  ["live without a2a_server", (candidate) => { candidate.interaction = structuredClone(liveManifest.interaction); candidate.interaction.a2a_server = false; }],
  ["live without ingress", (candidate) => { candidate.interaction = structuredClone(liveManifest.interaction); candidate.interaction.live_network_ingress = false; }],
  ["live without Agent Card", (candidate) => { candidate.interaction = structuredClone(liveManifest.interaction); candidate.interaction.agent_card_published = false; }],
  ["live without public origin", (candidate) => { candidate.interaction = structuredClone(liveManifest.interaction); candidate.interaction.public_base_url = null; }],
  ["runtime capabilities sourced from manifest", (candidate) => { candidate.interaction.runtime_capabilities_source = "manifest"; }],
  ["Reception runtime availability sourced from manifest", (candidate) => { candidate.capabilities.find((entry) => entry.id === "public_a2a_reception_beacon").runtime_availability_source = "manifest"; }],
  ["live_ens_resolution=true", (candidate) => { candidate.trust_boundary.live_ens_resolution = true; }],
  ["external_web_retrieval=true", (candidate) => { candidate.trust_boundary.external_web_retrieval = true; }],
  ["arbitrary_outbound_network=true", (candidate) => { candidate.trust_boundary.arbitrary_outbound_network = true; }],
  ["receipt_runtime_dependency=true", (candidate) => { candidate.trust_boundary.receipt_runtime_dependency = true; }],
  ["caller_selected_network_destinations=true", (candidate) => { candidate.trust_boundary.caller_selected_network_destinations = true; }],
  ["dedicated_runtime_identity_required=false", (candidate) => { candidate.trust_boundary.dedicated_runtime_identity_required = false; }],
  ["commercial_authority=true", (candidate) => { candidate.authority.commercial_authority = true; }],
  ["research submission_available=true", (candidate) => { candidate.capabilities.find((entry) => entry.id === "inbound_ens_research_contract").submission_available = true; }],
  ["contribution submission_available=false", (candidate) => { candidate.capabilities.find((entry) => entry.id === "prepare_ens_candidate_contribution").submission_available = false; }],
  ["contribution submission_transport changed", (candidate) => { candidate.capabilities.find((entry) => entry.id === "prepare_ens_candidate_contribution").submission_transport = "a2a"; }],
  ["contribution submission_url changed", (candidate) => { candidate.capabilities.find((entry) => entry.id === "prepare_ens_candidate_contribution").submission_url = "https://example.com/submit"; }],
  ["contribution automatic_promotion=true", (candidate) => { candidate.capabilities.find((entry) => entry.id === "prepare_ens_candidate_contribution").automatic_promotion = true; }]
]) {
  const candidate = structuredClone(label.startsWith("preactivation ") ? preactivationManifest : liveManifest);
  mutate(candidate);
  assertInvalid(validate, candidate, label);
}

const contribution = {
  $schema: contributionSchema.$id,
  contribution: "vortik-ens-candidate-contribution",
  contribution_version: "1.0.0",
  contribution_id: "agent-example-001",
  contributor: { kind: "agent", claimed_id: "example-agent" },
  candidate: {
    name: "candidate-name.eth",
    rationale: "Example contribution for contract validation only.",
    proposed_term: "candidate term",
    proposed_classification: "premature"
  },
  evidence: [{ kind: "primary_source", reference: "https://eips.ethereum.org/EIPS/eip-7732" }]
};
assertValid(validateContribution, contribution, "closed ENS candidate contribution");

const forgedAuthorityContribution = structuredClone(contribution);
forgedAuthorityContribution.commercial_authority = true;
assertInvalid(validateContribution, forgedAuthorityContribution, "contributor commercial authority field");

const candidatePriceContribution = structuredClone(contribution);
candidatePriceContribution.candidate.price = "10 ETH";
assertInvalid(validateContribution, candidatePriceContribution, "candidate price field");

const insecureEvidenceContribution = structuredClone(contribution);
insecureEvidenceContribution.evidence[0].reference = "http://example.com/evidence";
assertInvalid(validateContribution, insecureEvidenceContribution, "non-HTTPS evidence reference");

await verifyMirrorInventory("agents", "docs/agents", "Agent discovery");
await verifyMirrorInventory("schemas/agents", "docs/schemas/agents", "Agent discovery schema");

const staleMirrorRegression = inventoryDiff(["discovery.json"], ["discovery.json", "obsolete.json"]);
if (staleMirrorRegression.extra.length !== 1 || staleMirrorRegression.extra[0] !== "obsolete.json") throw new Error("Agent discovery inventory validation must detect stale public mirror files");

console.log(`agents/discovery.json conforms to vortik-agent-discovery 1.5.0 with ${manifest.capabilities.length} capability entries`);
console.log(`Historical discovery 1.0.0–1.4.0 contracts preserved byte-identical to ${baseRef}`);
console.log("Existing feed, ENS research, inbound research and GitHub contribution references verified");
console.log("A2A live lifecycle and fully coupled preactivation-state contract verified");
console.log("Agent Card is the exclusive source of runtime A2A capability availability");
console.log("A2A Reception implementation paths, deterministic ENS research and fail-closed trust-boundary declarations verified");
console.log("Closed ENS candidate contribution contract verified with authority, price and insecure-reference regressions");
console.log("Public agent manifest/schema directory inventories verified complete and byte-identical");
console.log("EXPECTED FAIL stale public agent mirror inventory");
console.log("EXPECTED FAIL partial A2A lifecycle, static runtime-capability claims, external retrieval, outbound-network, automatic-promotion and authority claims");
