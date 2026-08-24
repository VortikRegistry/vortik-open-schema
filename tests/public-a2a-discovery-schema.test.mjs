import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { assertPublicBaseUrl } from "../lib/public-a2a-beacon.mjs";

const schemaUrl = new URL("../schemas/agents/vortik-agent-discovery/1.4.0/schema.json", import.meta.url);
const publicSchemaUrl = new URL("../docs/schemas/agents/vortik-agent-discovery/1.4.0/schema.json", import.meta.url);
const manifestUrl = new URL("../agents/discovery.json", import.meta.url);

async function loadFixture() {
  const [schemaText, publicSchemaText, manifestText] = await Promise.all([
    readFile(schemaUrl, "utf8"),
    readFile(publicSchemaUrl, "utf8"),
    readFile(manifestUrl, "utf8")
  ]);
  assert.equal(publicSchemaText, schemaText, "source and public 1.4.0 schemas must be byte-identical");
  const schema = JSON.parse(schemaText);
  const manifest = JSON.parse(manifestText);
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return { validate: ajv.compile(schema), manifest };
}

function liveCandidate(manifest, publicBaseUrl) {
  const candidate = structuredClone(manifest);
  candidate.interaction.mode = "a2a_live";
  candidate.interaction.a2a_server = true;
  candidate.interaction.live_network_ingress = true;
  candidate.interaction.agent_card_published = true;
  candidate.interaction.public_base_url = publicBaseUrl;
  return candidate;
}

test("A2A live schema accepts canonical public DNS HTTPS origins also accepted by runtime", async () => {
  const { validate, manifest } = await loadFixture();
  for (const origin of [
    "https://beacon.example.test",
    "https://beacon.example.test:443",
    "https://vortik-beacon-abc123.sa-east1.run.app"
  ]) {
    assert.equal(validate(liveCandidate(manifest, origin)), true, JSON.stringify(validate.errors));
    assert.equal(assertPublicBaseUrl(origin), new URL(origin).origin);
  }
});

test("A2A live schema rejects non-public-host shapes and every origin the runtime cannot parse", async () => {
  const { validate, manifest } = await loadFixture();
  for (const invalidOrigin of [
    "http://beacon.example.test",
    "https://user@example.test",
    "https://user:secret@example.test",
    "https://beacon.example.test/path",
    "https://beacon.example.test/",
    "https://beacon.example.test?mode=live",
    "https://beacon.example.test#card",
    "https://beacon.example.test:0",
    "https://beacon.example.test:65536",
    "https://999.999.999.999",
    "https://127.0.0.1:8443"
  ]) {
    assert.equal(validate(liveCandidate(manifest, invalidOrigin)), false, invalidOrigin);
  }

  assert.throws(() => assertPublicBaseUrl("https://999.999.999.999"), /valid HTTPS URL/);
});
