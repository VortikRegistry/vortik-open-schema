import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const configUrl = new URL(
  "../service/cloudbuild-agent-beacon.json",
  import.meta.url,
);

const EXPECTED_REPOSITORY =
  "southamerica-east1-docker.pkg.dev/${PROJECT_ID}/vortik-agent-beacon/vortik-agent-beacon";
const STAGE_IMAGE = `${EXPECTED_REPOSITORY}:pack-\${COMMIT_SHA}-\${BUILD_ID}`;
const APPROVED_IMAGE = `${EXPECTED_REPOSITORY}:approved-\${COMMIT_SHA}-\${BUILD_ID}`;
const BEACON_ENTRYPOINT = "node service/cloud-run-agent-beacon.mjs";
const runFile = promisify(execFile);

async function loadConfig() {
  return JSON.parse(await readFile(configUrl, "utf8"));
}

test("beacon build verifies the checked-out Git revision before publication", async () => {
  const config = await loadConfig();
  const [verifySourceStep] = config.steps;
  const directory = await mkdtemp(join(tmpdir(), "vortik-beacon-source-"));

  try {
    await writeFile(join(directory, ".gitignore"), "ignored-input.txt\n");
    await writeFile(join(directory, "tracked-input.txt"), "reviewed\n");
    await runFile("git", ["init", "--quiet"], { cwd: directory });
    await runFile("git", ["add", ".gitignore", "tracked-input.txt"], {
      cwd: directory,
    });
    await runFile(
      "git",
      [
        "-c",
        "user.name=Vortik Test",
        "-c",
        "user.email=vortik-test@example.invalid",
        "commit",
        "--quiet",
        "-m",
        "reviewed source",
      ],
      { cwd: directory },
    );
    const { stdout } = await runFile("git", ["rev-parse", "HEAD"], {
      cwd: directory,
    });
    const expected = stdout.trim();

    assert.match(
      verifySourceStep.name,
      /^gcr\.io\/cloud-builders\/git@sha256:[a-f0-9]{64}$/u,
    );
    assert.equal(verifySourceStep.entrypoint, "/bin/sh");
    assert.deepEqual(verifySourceStep.args.slice(-2), [
      "verify-source",
      "$COMMIT_SHA",
    ]);
    assert.match(verifySourceStep.args[1], /git rev-parse --verify HEAD/u);
    assert.match(verifySourceStep.args[1], /git diff --quiet --exit-code/u);
    assert.match(verifySourceStep.args[1], /git diff --cached --quiet/u);
    assert.match(verifySourceStep.args[1], /git ls-files --others/u);

    const renderedScript = verifySourceStep.args[1].replaceAll("$$", "$");
    await runFile("/bin/sh", [
      "-ceu",
      renderedScript,
      "verify-source",
      expected,
    ], { cwd: directory });

    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        "fedcba9876543210fedcba9876543210fedcba98",
      ], { cwd: directory }),
      /Cloud Build source revision does not match COMMIT_SHA/u,
    );

    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected.toUpperCase(),
      ], { cwd: directory }),
      /COMMIT_SHA must be lowercase hexadecimal/u,
    );

    await writeFile(join(directory, "tracked-input.txt"), "modified\n");
    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected,
      ], { cwd: directory }),
      /Git source worktree and index must be clean/u,
    );
    await runFile("git", ["restore", "tracked-input.txt"], { cwd: directory });

    await writeFile(join(directory, "staged-input.txt"), "staged\n");
    await runFile("git", ["add", "staged-input.txt"], { cwd: directory });
    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected,
      ], { cwd: directory }),
      /Git source worktree and index must be clean/u,
    );
    await runFile("git", ["reset", "--hard", "--quiet", "HEAD"], {
      cwd: directory,
    });

    await writeFile(join(directory, "untracked-input.txt"), "untracked\n");
    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected,
      ], { cwd: directory }),
      /Git source contains additional build inputs/u,
    );
    await rm(join(directory, "untracked-input.txt"));

    await writeFile(join(directory, "ignored-input.txt"), "ignored\n");
    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected,
      ], { cwd: directory }),
      /Git source contains additional build inputs/u,
    );
    await rm(join(directory, "ignored-input.txt"));

    await rm(join(directory, ".git"), { recursive: true });
    await assert.rejects(
      runFile("/bin/sh", [
        "-ceu",
        renderedScript,
        "verify-source",
        expected,
      ], { cwd: directory }),
      /Git source metadata is required/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("beacon image has an explicit public runtime entrypoint", async () => {
  const config = await loadConfig();
  const [, packStep] = config.steps;

  assert.match(packStep.name, /^gcr\.io\/k8s-skaffold\/pack@sha256:[a-f0-9]{64}$/u);
  assert.equal(packStep.entrypoint, "pack");
  assert.deepEqual(packStep.args, [
    "build",
    STAGE_IMAGE,
    "--builder",
    "gcr.io/buildpacks/builder@sha256:0ab20f18ca3f835f4c26ae32bafd1a55cda2adf025528356b80491cb3cf72e3c",
    "--env",
    `GOOGLE_ENTRYPOINT=${BEACON_ENTRYPOINT}`,
    "--network",
    "cloudbuild",
    "--publish",
  ]);
});

test("beacon build publishes each immutable tag only once", async () => {
  const config = await loadConfig();
  const [, , pullStep, tagStep] = config.steps;

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
  assert.equal(config.steps.length, 4);
  assert.doesNotMatch(serialized, /_SOURCE_SHA/u);
  assert.doesNotMatch(
    serialized,
    /kms|secret|vortik-runtime|receipt-runtime|ens-sales/iu,
  );
  assert.equal(
    serialized.match(/southamerica-east1-docker\.pkg\.dev/g)?.length,
    5,
  );
});
