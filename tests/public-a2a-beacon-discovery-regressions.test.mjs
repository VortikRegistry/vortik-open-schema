import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPublicA2AAgentCard,
  createPublicA2ABeacon
} from "../lib/public-a2a-beacon.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function ids() {
  let index = 0;
  return () => `id-${++index}`;
}

function jsonDiscovery(beacon, text) {
  return beacon.sendMessage({
    message: {
      messageId: "client-1",
      role: "ROLE_USER",
      parts: [{ text }]
    },
    configuration: {
      acceptedOutputModes: ["application/json"]
    }
  }).message.parts[0].data;
}

test("short discovery terms match on closed token boundaries", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: ids() });
  const consensus = beacon.sendMessage({
    message: {
      messageId: "client-1",
      role: "ROLE_USER",
      parts: [{ text: "Ethereum consensus terminology" }]
    }
  });
  assert.match(consensus.message.parts[0].text, /Vortik Registry public discovery/);
  assert.doesNotMatch(consensus.message.parts[0].text, /ENS semantic research discovery/);

  const ens = beacon.sendMessage({
    message: {
      messageId: "client-2",
      role: "ROLE_USER",
      parts: [{ text: "ENS semantic research" }]
    }
  });
  assert.match(ens.message.parts[0].text, /ENS semantic research discovery/);
});

test("explicit contribution intent takes precedence over the semantic subject", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: ids() });
  for (const query of [
    "contribute an ENS semantic candidate",
    "contribution for ePBS",
    "submit semantic candidate for FOCIL inclusion list"
  ]) {
    const result = jsonDiscovery(beacon, query);
    assert.equal(result.capabilityId, "ens_candidate_contribution_path", query);
  }
});

test("discovery and Agent Card documentation links target published artifacts", () => {
  const beacon = createPublicA2ABeacon({ publicBaseUrl: PUBLIC_BASE_URL, idFactory: ids() });
  const inclusion = jsonDiscovery(beacon, "FOCIL inclusion list");
  assert.ok(inclusion.links.some((link) => link.href === "https://vortikregistry.github.io/vortik-open-schema/schemas/inclusionlist/0.1-draft/schema.json"));
  assert.equal(inclusion.links.some((link) => link.href.endsWith("/registry.schema.json")), false);

  const ens = jsonDiscovery(beacon, "ENS semantic research");
  const ensDocumentation = ens.links.find((link) => link.rel === "documentation");
  assert.equal(ensDocumentation.href, "https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/ens-research-client.md");

  const contribution = jsonDiscovery(beacon, "candidate contribution");
  const contributionDocumentation = contribution.links.find((link) => link.rel === "documentation");
  assert.equal(contributionDocumentation.href, "https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/ens-candidate-contributions.md");

  const card = buildPublicA2AAgentCard({ publicBaseUrl: PUBLIC_BASE_URL });
  assert.equal(card.documentationUrl, "https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/public-a2a-beacon.md");
  assert.equal(JSON.stringify({ inclusion, ens, contribution, card }).includes(".html"), false);
});
