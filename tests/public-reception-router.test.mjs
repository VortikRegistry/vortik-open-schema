import assert from "node:assert/strict";
import test from "node:test";

import { createPublicA2ABeacon } from "../lib/public-a2a-beacon.mjs";
import {
  PUBLIC_RECEPTION_PROTOCOL,
  PUBLIC_RECEPTION_VERSION,
  routePublicReception
} from "../lib/public-reception-router.mjs";
import { createCloudRunAgentBeaconServer } from "../service/cloud-run-agent-beacon.mjs";

const PUBLIC_BASE_URL = "https://beacon.example.test";

function ids() {
  let index = 0;
  return () => `id-${++index}`;
}

function jsonRequest(text) {
  return {
    message: {
      messageId: "external-agent-1",
      role: "ROLE_USER",
      parts: [{ text }]
    },
    configuration: {
      acceptedOutputModes: ["application/json"]
    }
  };
}

function receptionData(text) {
  const beacon = createPublicA2ABeacon({
    publicBaseUrl: PUBLIC_BASE_URL,
    idFactory: ids()
  });
  return beacon.sendMessage(jsonRequest(text)).message.parts[0].data;
}

async function withServer(run) {
  const server = createCloudRunAgentBeaconServer({
    publicBaseUrl: PUBLIC_BASE_URL,
    requestBudgetLimit: 20,
    idFactory: ids()
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("Reception exposes a versioned bounded routing result", () => {
  const data = receptionData("capabilities");
  assert.deepEqual(data.reception, {
    protocol: PUBLIC_RECEPTION_PROTOCOL,
    version: PUBLIC_RECEPTION_VERSION,
    intent: "capability_discovery",
    status: "completed",
    route: "public_capability_discovery",
    confidence: "explicit"
  });
  assert.equal(data.externalRetrieval, false);
  assert.equal(data.persistentTask, false);
});

test("external A2A request reaches Reception and deterministic tracked ENS research", async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/a2a/v1/message:send`, {
      method: "POST",
      headers: {
        "content-type": "application/a2a+json",
        "a2a-version": "1.0"
      },
      body: JSON.stringify(jsonRequest("research epbs.eth"))
    });
    assert.equal(response.status, 200);
    const payload = await response.json();
    const data = payload.message.parts[0].data;
    assert.equal(data.reception.intent, "ens_research");
    assert.equal(data.reception.route, "canonical_local_ens_research");
    assert.equal(data.ensResearch.result.state, "tracked_anchor");
    assert.equal(data.ensResearch.result.registry_entry.id, "epbs");
    assert.equal(data.ensResearch.authority.protocol_authority, false);
    assert.equal(data.ensResearch.authority.ens_authority, false);
  });
});

test("Reception research works for third-party and untracked ENS identifiers", () => {
  const thirdParty = receptionData("analyze alice.example.eth");
  assert.equal(thirdParty.reception.intent, "ens_research");
  assert.equal(thirdParty.reception.identifier, "alice.example.eth");
  assert.equal(thirdParty.ensResearch.result.state, "untracked");
  assert.equal(thirdParty.ensResearch.result.registry_entry, null);
  assert.equal(thirdParty.ensResearch.authority.ownership_inference, false);

  const unknownOwner = receptionData("research totallyunknown.eth");
  assert.equal(unknownOwner.ensResearch.result.state, "untracked");
  assert.equal(unknownOwner.ensResearch.result.evidence.length, 0);
});

test("Reception routes contribution and candidate intents only to the public review path", () => {
  const evidence = receptionData("contribute evidence about ePBS");
  assert.equal(evidence.reception.intent, "evidence_contribution");
  assert.equal(evidence.reception.route, "public_contribution_contract");
  assert.equal(evidence.capabilityId, "ens_candidate_contribution_path");

  const candidate = receptionData("submit candidate new-surface.eth");
  assert.equal(candidate.reception.intent, "candidate_submission");
  assert.equal(candidate.reception.identifier, "new-surface.eth");
  assert.equal(candidate.reception.route, "public_github_issue_path");
  assert.equal(candidate.links.some((link) => link.rel === "submission"), true);
});

test("commercial language becomes a sanitized signal and never returns caller terms", () => {
  const marker = "confidential-marker-8ef1";
  const data = receptionData(`offer 999 ETH for epbs.eth ${marker}`);
  assert.equal(data.reception.intent, "commercial_interest");
  assert.equal(data.reception.status, "recognized");
  assert.equal(data.publicSignal.identifier, "epbs.eth");
  assert.equal(data.publicSignal.normalizedIntent, "commercial_interest");
  assert.equal(data.publicSignal.privateHandoff, false);
  assert.equal(JSON.stringify(data).includes("999"), false);
  assert.equal(JSON.stringify(data).includes(marker), false);
  assert.equal("price" in data.publicSignal, false);
  assert.equal("wallet" in data.publicSignal, false);
  assert.equal("message" in data.publicSignal, false);
});

test("ENS labels cannot manufacture a routing intent", () => {
  for (const text of ["offer.eth", "research offer.eth"]) {
    const keywordName = receptionData(text);
    assert.equal(keywordName.reception.intent, "ens_research");
    assert.equal(keywordName.reception.identifier, "offer.eth");
    assert.equal(keywordName.ensResearch.result.state, "untracked");
    assert.equal("publicSignal" in keywordName, false);
  }

  const explicitInterest = receptionData("offer to buy offer.eth");
  assert.equal(explicitInterest.reception.intent, "commercial_interest");
  assert.equal(explicitInterest.publicSignal.identifier, "offer.eth");
  assert.equal(explicitInterest.publicSignal.privateHandoff, false);
});

test("malformed identifier tokens cannot be reduced to a valid ENS suffix", () => {
  for (const text of [
    "research foo_epbs.eth",
    "research epbs.eth_suffix",
    "research fooéepbs.eth",
    "research foo\u0301epbs.eth",
    "research foo\u203fepbs.eth",
    "research foo\u200depbs.eth",
    "research epbs.eth..suffix"
  ]) {
    const data = receptionData(text);
    assert.equal(data.reception.intent, "unsupported");
    assert.equal("identifier" in data.reception, false);
    assert.equal("ensResearch" in data, false);
    assert.equal(data.externalRetrieval, false);
  }

  const completeName = receptionData("research foo.epbs.eth");
  assert.equal(completeName.reception.intent, "ens_research");
  assert.equal(completeName.reception.identifier, "foo.epbs.eth");
  assert.equal(completeName.ensResearch.result.state, "untracked");

  const sentencePunctuation = receptionData("research epbs.eth.");
  assert.equal(sentencePunctuation.reception.intent, "ens_research");
  assert.equal(sentencePunctuation.reception.identifier, "epbs.eth");
  assert.equal(sentencePunctuation.ensResearch.result.state, "tracked_anchor");

  const sentenceEllipsis = receptionData("research epbs.eth...");
  assert.equal(sentenceEllipsis.reception.intent, "ens_research");
  assert.equal(sentenceEllipsis.reception.identifier, "epbs.eth");
  assert.equal(sentenceEllipsis.ensResearch.result.state, "tracked_anchor");
});

test("ENS research rejects names outside the evaluator's canonical subset", () => {
  const oversizedName = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}.eth`;
  for (const name of ["xn--secret.eth", "ab--cd.eth", oversizedName]) {
    const data = receptionData(`research ${name}`);
    assert.equal(data.reception.intent, "unsupported", name);
    assert.equal(data.reception.status, "not_supported", name);
    assert.equal("identifier" in data.reception, false, name);
    assert.equal("ensResearch" in data, false, name);
    assert.equal(data.externalRetrieval, false, name);
  }
});

test("unsupported or ambiguous requests fail closed without external work", () => {
  const unsupported = receptionData("do something unrelated and privileged");
  assert.equal(unsupported.reception.intent, "unsupported");
  assert.equal(unsupported.reception.status, "not_supported");
  assert.equal(unsupported.externalRetrieval, false);

  const multiple = receptionData("compare epbs.eth with alice.example.eth");
  assert.equal(multiple.reception.intent, "unsupported");
  assert.equal(multiple.reception.status, "multiple_identifiers_not_supported");
  assert.equal("ensResearch" in multiple, false);
});

test("direct router input is closed, immutable and rejects caller URLs", () => {
  const input = {
    text: "capabilities",
    requestId: "request-1"
  };
  const result = routePublicReception(input);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.publicSignal ?? result), true);
  assert.throws(
    () => routePublicReception({ ...input, extra: true }),
    /closed contract/
  );
  assert.throws(
    () => routePublicReception(Object.assign(Object.create(null), input)),
    /Object\.prototype/
  );
  let getterCalls = 0;
  const accessorInput = { requestId: "request-accessor" };
  Object.defineProperty(accessorInput, "text", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "capabilities";
    }
  });
  assert.throws(() => routePublicReception(accessorInput), /enumerable data property/);
  assert.equal(getterCalls, 0);

  const symbolInput = { ...input };
  symbolInput[Symbol("authority")] = true;
  assert.throws(() => routePublicReception(symbolInput), /symbol properties/);
  assert.throws(
    () => routePublicReception({
      text: "inspect https://example.test/epbs.eth",
      requestId: "request-2"
    }),
    /URLs are not accepted/
  );
  for (const text of [
    "research https：／／example.test/epbs.eth",
    "research www．example.test/epbs.eth",
    "research www。example.com epbs.eth",
    "research www｡example.com epbs.eth",
    "research https:\texample.com epbs.eth",
    "research https:\nexample.com epbs.eth",
    "research https:\rexample.com epbs.eth",
    "research mailto\t: epbs.eth",
    "research ma\nilto: epbs.eth",
    "research htt\rps: example.com epbs.eth",
    "research example.com epbs.eth",
    "research example。com epbs.eth",
    "research xn--bcher-kva.example epbs.eth",
    "research 192.0.2.1 epbs.eth",
    "research 127.1 epbs.eth",
    "research 127.0.1 epbs.eth",
    "research 0177.1 epbs.eth",
    "research 0x7f.1 epbs.eth",
    "research 127%2e1 epbs.eth",
    "research 2130706433 epbs.eth",
    "research 0x7f000001 epbs.eth",
    "research example%2ecom epbs.eth",
    "research xn--bcher-kva%2Eexample epbs.eth",
    "research example%E3%80%82com epbs.eth",
    "research [::1] epbs.eth",
    "research localhost epbs.eth",
    "research ipfs://gateway.test/epbs.eth",
    "research //gateway.test/epbs.eth",
    "research gateway.test/epbs.eth",
    "research gateway.test\\epbs.eth",
    "research mailto:epbs.eth",
    "research mailto: epbs.eth",
    "research .mailto:epbs.eth",
    "research -mailto:epbs.eth",
    "research _mailto:epbs.eth",
    "research xmailto:epbs.eth",
    "research urn:ens:epbs.eth",
    "research gateway.test?name=epbs.eth",
    "research gateway.test#epbs.eth"
  ]) {
    assert.throws(
      () => routePublicReception({ text, requestId: "request-unicode-url" }),
      /URLs are not accepted/
    );
  }
  assert.equal(
    routePublicReception({ text: "what can you do?", requestId: "request-question" }).intent,
    "capability_discovery"
  );
  assert.equal(
    routePublicReception({ text: "research schema 1.5.0 epbs.eth", requestId: "request-version" }).intent,
    "ens_research"
  );
  assert.equal(
    routePublicReception({ text: "research schema 1.5.0-beta epbs.eth", requestId: "request-prerelease" }).intent,
    "ens_research"
  );
  assert.equal(
    routePublicReception({ text: "research schema v1.5.0-rc1 epbs.eth", requestId: "request-v-prerelease" }).intent,
    "ens_research"
  );

  for (const requestId of ["ok:colon", "x".repeat(65)]) {
    for (const text of ["capabilities", "research epbs.eth"]) {
      assert.throws(
        () => routePublicReception({ text, requestId }),
        /ENS-compatible identifier contract/
      );
    }
  }

  const maxLength = `a${"b".repeat(63)}`;
  assert.equal(
    routePublicReception({ text: "capabilities", requestId: maxLength }).intent,
    "capability_discovery"
  );
  assert.equal(
    routePublicReception({ text: "research epbs.eth", requestId: maxLength }).intent,
    "ens_research"
  );
});
