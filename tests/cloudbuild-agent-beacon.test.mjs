import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configUrl = new URL(
  "../service/cloudbuild-agent-beacon.json",
  import.meta.url,
);

const EXPECTED_REPOSITORY =
  "southamerica-east1-docker.pkg.dev/${PROJECT_ID}/vortik-agent-beacon/vortik-agent-beacon";
const STAGE_IMAGE = `${EXPECTED_REPOSITORY}:pack-\${_SOURCE_SHA}-\${BUILD_ID}`;
const APPROVED_IMAGE = `${EXPECTED_REPOSITORY}:approved-\${_SOURCE_SHA}-\${BUILD_ID}`;

async function loadConfig() {
  return JSON.parse(await readFile(configUrl, "utf8"));
}

test("beacon build uses pinned builders and a source-bound unique staging image", async () => {
  const config = await loadConfig();
  const [packStep] = config.steps;

  assert.match(packStep.name, /^gcr\.io\/k8s-skaffold\/pack@sha256:[a-f0-9]{64}$/u);
  assert.equal(packStep.entrypoint, "pack");
  assert.deepEqual(packStep.args, [
    "build",
    STAGE_IMAGE,
    "--builder",
    "gcr.io/buildpacks/builder@sha256:0ab20f18ca3f835f4c26ae32bafd1a55cda2adf025528356b80491cb3cf72e3c",
    "--network",
    "cloudbuild",
    "--publish",
  ]);
});

test("beacon build publishes each immutable tag only once", async () => {
  const config = await loadConfig();
  const [, pullStep, tagStep] = config.steps;

  assert.deepEqual(pullStep.args, ["pull", STAGE_IMAGE]);
  assert.deepEqual(tagStep.args, ["tag", STAGE_IMAGE, APPROVED_IMAGE]);
  assert.deepEqual(config.images, [APPROVED_IMAGE]);
  assert.notEqual(STAGE_IMAGE, APPROVED_IMAGE);

  for (const step of [pullStep, tagStep]) {
    assert.match(
      step.name,
      /^gcr\.io\/cloud-builders\/docker@sha256:[a-f0-9]{64}$/u,
    );
  }
});

test("beacon build remains bounded and outside protected capabilities", async () => {
  const config = await loadConfig();
  const serialized = JSON.stringify(config);

  assert.equal(config.timeout, "600s");
  assert.equal(config.steps.length, 3);
  assert.doesNotMatch(
    serialized,
    /kms|secret|vortik-runtime|receipt-runtime|ens-sales/iu,
  );
  assert.equal(
    serialized.match(/southamerica-east1-docker\.pkg\.dev/g)?.length,
    5,
  );
});
