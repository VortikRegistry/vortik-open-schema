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
    status: "routed",
    route: "public_capability_catalog",
    externalRetrieval: false,
    privateHandoff: false,
    authoritative: false,
    requestId: "external-agent-1"
  });
});

test("external A2A request reaches Reception and deterministic tracked ENS research", () => {
  const data = receptionData("research epbs.eth");
  assert.equal(data.reception.intent, "ens_research");
  assert.equal(data.reception.identifier, "epbs.eth");
  assert.equal(data.reception.route, "deterministic_ens_research");
  assert.equal(data.reception.status, "completed");
  assert.equal(data.ensResearch.request.identifier, "epbs.eth");
  assert.equal(data.ensResearch.result.state, "tracked_anchor");
  assert.equal(data.ensResearch.result.tracked, true);
  assert.equal(data.externalRetrieval, false);
});

test("Reception research works for third-party and untracked ENS identifiers", () => {
  const data = receptionData("research alice.example.eth");
  assert.equal(data.reception.intent, "ens_research");
  assert.equal(data.reception.identifier, "alice.example.eth");
  assert.equal(data.ensResearch.result.state, "untracked");
  assert.equal(data.ensResearch.result.tracked, false);
  assert.equal(data.externalRetrieval, false);
});

test("Reception routes contribution and candidate intents only to the public review path", () => {
  for (const text of [
    "contribute evidence for epbs.eth",
    "submit candidate alice.example.eth"
  ]) {
    const data = receptionData(text);
    assert.equal(data.reception.intent, "contribution");
    assert.equal(data.reception.route, "github_issue_review_path");
    assert.equal(data.reception.status, "routed");
    assert.equal(data.reception.privateHandoff, false);
    assert.equal(data.externalRetrieval, false);
  }
});

test("commercial language becomes a sanitized signal and never returns caller terms", () => {
  for (const text of [
    "offer 10 ETH for epbs.eth",
    "buy epbs.eth",
    "price epbs.eth"
  ]) {
    const data = receptionData(text);
    assert.equal(data.reception.intent, "commercial_interest");
    assert.equal(data.reception.route, "sanitized_public_signal");
    assert.equal(data.publicSignal.identifier, "epbs.eth");
    assert.equal(data.publicSignal.privateHandoff, false);
    assert.equal(data.publicSignal.authoritative, false);
    assert.equal(data.externalRetrieval, false);
    assert.equal(JSON.stringify(data).includes("10 ETH"), false);
  }
});

test("ENS labels cannot manufacture a routing intent", () => {
  for (const name of [
    "offer.eth",
    "buy.eth",
    "price.eth",
    "sell.eth",
    "candidate.eth",
    "submit.eth",
    "contribute.eth"
  ]) {
    const data = receptionData(`research ${name}`);
    assert.equal(data.reception.intent, "ens_research", name);
    assert.equal(data.reception.identifier, name, name);
    assert.equal(data.ensResearch.request.identifier, name, name);
    assert.equal(data.ensResearch.result.state, "untracked", name);
    assert.equal("publicSignal" in data, false, name);
  }

  const keywordName = receptionData("research offer.eth");
  assert.equal(keywordName.reception.intent, "ens_research");
  assert.equal(keywordName.reception.identifier, "offer.eth");
  assert.equal(keywordName.ensResearch.result.state, "untracked");
  assert.equal("publicSignal" in keywordName, false);

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
    "research 💩_epbs.eth",
    "research ⒜epbs.eth",
    "research ⁺epbs.eth",
    "research \u0080epbs.eth"
  ]) {
    const data = receptionData(text);
    assert.equal(data.reception.intent, "unsupported");
    assert.equal("identifier" in data.reception, false);
    assert.equal("ensResearch" in data, false);
    assert.equal(data.externalRetrieval, false);
  }

  // Complete caller identities accepted by WHATWG as hosts are URL syntax, not
  // malformed ENS presentation. They fail before any suffix can be researched.
  for (const text of [
    "research epbs.eth..suffix",
    "research epbs.eth..."
  ]) {
    assert.throws(() => receptionData(text), /URLs are not accepted/);
    assert.throws(
      () => routePublicReception({ text, requestId: "host-identity-regression" }),
      /URLs are not accepted/
    );
  }

  const completeName = receptionData("research foo.epbs.eth");
  assert.equal(completeName.reception.intent, "ens_research");
  assert.equal(completeName.reception.identifier, "foo.epbs.eth");
  assert.equal(completeName.ensResearch.result.state, "untracked");

  const nfkcCompleteName = receptionData("research ｅｐｂｓ.eth");
  assert.equal(nfkcCompleteName.reception.intent, "ens_research");
  assert.equal(nfkcCompleteName.reception.identifier, "epbs.eth");

  const sentencePunctuation = receptionData("research epbs.eth.");
  assert.equal(sentencePunctuation.reception.intent, "ens_research");
  assert.equal(sentencePunctuation.reception.identifier, "epbs.eth");
  assert.equal(sentencePunctuation.ensResearch.result.state, "tracked_anchor");
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
  assert.throws(
    () => routePublicReception({ text: "https://example.com", requestId: "request-url" }),
    /URLs are not accepted/
  );
});

test("Cloud Run HTTP surface preserves bounded Reception behavior", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/a2a/v1/message:send`, {
      method: "POST",
      headers: {
        "content-type": "application/a2a+json",
        "a2a-version": "1.0"
      },
      body: JSON.stringify(jsonRequest("research epbs.eth"))
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message.parts[0].data.reception.intent, "ens_research");
    assert.equal(body.message.parts[0].data.ensResearch.result.state, "tracked_anchor");
  });
});
