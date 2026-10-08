# Reception beacon source freshness — 2026-10-08

## Result and boundary

**SOURCE_COMPARISON_PASS / CURRENT_RUNTIME_IDENTITY_UNVERIFIED.**

The eleven modules reachable from the public `web` entry point and both JSON
snapshots they read are byte-identical between the source merged in
[PR #138](https://github.com/VortikRegistry/vortik-open-schema/pull/138)
(`ff114be8c88b52f07552cd5bfd5999edceba7fbb`) and the main commit published after
[PR #153](https://github.com/VortikRegistry/vortik-open-schema/pull/153)
(`1af02be5af4a3f047f15ec5099203fc5e8bb721d`).

No beacon application or snapshot update is indicated by this comparison.
This does **not** attest that either source is currently running. A revision
name containing a short commit, a previous successful request, and a successful
Pages publication do not establish a current source-to-image-to-traffic chain.
No Cloud Run request, build, deployment or outbound-denial probe was performed
for this review. Authenticated Cloud Run metadata was unavailable in this
execution environment.

## Reproducible scope

The adjacent [comparison inventory](beacon-source-freshness-2026-10-08.json)
records the two exact commits and the Git blob identities of twenty unchanged
files. The entry point is selected by the unchanged `Procfile`:

```text
web: node service/cloud-run-agent-beacon.mjs
```

Its local import closure was inspected recursively. There are eleven modules;
their other imports are Node built-ins and there are no dynamic imports in
that closure. The only filesystem reads in that closure are the immutable
JSON loader calls for `registry.json` and `maps/coordination-surfaces.json`.
The registry still contains twelve curated terms.

| Compared surface | Result |
| --- | --- |
| HTTP server, A2A implementation, Reception routing and input classifier | Identical source blobs |
| ENS evaluator, client and immutable JSON loader | Identical source blobs |
| Observation, sanitized signal and fixed public follow-up presentation | Identical source blobs |
| Registry and coordination-surface snapshots | Identical source blobs |
| Canonical and public discovery manifests | Identical source blobs and mirrors |
| Procfile, dependency lock, build configuration, materializer and probe source | Identical source blobs |
| Package metadata excluding `scripts` | Structurally identical |
| Package `scripts` | Validation, examples and generation commands were added for the web datasets |

The complete repository differs at 110 paths between these two commits. The
reviewed-source materializer includes the whole tracked tree, so **the full
build context is different**. This report does not claim image equality,
reproducible build output, or the current state of installed runtime packages.

To reproduce the bounded comparison from a clone containing both commits:

```bash
python3 - <<'PY'
import json
import subprocess
from pathlib import Path

evidence = json.loads(Path(
    'docs/research/beacon-source-freshness-2026-10-08.json'
).read_text())
for item in evidence['files']:
    contents = []
    for key in ('baseline_commit', 'compared_commit'):
        ref = evidence[key] + ':' + item['path']
        data = subprocess.check_output(['git', 'show', ref])
        actual = subprocess.check_output(
            ['git', 'hash-object', '--stdin'], input=data
        ).decode().strip()
        assert actual == item['git_blob_sha'], ref
        contents.append(data)
    assert contents[0] == contents[1], item['path']
packages = [json.loads(subprocess.check_output([
    'git', 'show', evidence[key] + ':package.json'
])) for key in ('baseline_commit', 'compared_commit')]
for package in packages:
    package.pop('scripts')
assert packages[0] == packages[1]
print('PASS: 20 source files and package fields excluding scripts match')
PY
```

This fixed inventory is evidence for these two commits, not an automatic
future dependency-closure detector. A later code change requires reinspection
of imports and filesystem reads before reusing the inventory.

## Web data and beacon responses are separate

`docs/ethereum-catalog.json` (1,209 proposals) and
`docs/protocol-context.json` were added after the baseline. Neither dataset,
nor its new library module, is loaded by the public `web` process. The beacon
continues to provide bounded discovery pointers and deterministic research
over the twelve-term registry. It does not implement the web catalog's search.

The allowlisted discovery URLs target the current Pages artifacts or repository
documentation. The beacon returns these URLs without fetching their content.
Publishing corrected notes and the catalog therefore makes the linked web
content current without replacing the container. Rebuilding the same beacon
implementation would not add catalog search to its A2A capabilities.

Adding that capability would be a separate implementation and review decision.
It is not a missing deployment step established by this freshness review.

## Remaining authenticated read

Use an already authorized Google Cloud session. These commands describe
existing resources; they do not call the public application endpoint. If an
API enablement, permission change or resource creation is requested, stop.
Do not treat an access error or missing field as a successful check.

First inspect the service's **actual traffic**, not only its newest revision:

```bash
gcloud run services describe vortik-agent-beacon \
  --project=vortik-registry-production \
  --region=southamerica-east1 \
  --format='json(metadata.name,metadata.generation,status.observedGeneration,status.traffic,status.latestReadyRevisionName,status.conditions)'
```

Then set `BEACON_REVISION` to the `revisionName` receiving 100 percent in
`status.traffic`, and inspect that revision once. If traffic is split, retain
all targets and inspect each serving revision before making a freshness claim.
Tagged targets without a traffic percentage do not mean split default traffic;
they remain separately addressable and are outside this default-URL check.

```bash
BEACON_REVISION='COPY_THE_REVISION_FROM_STATUS_TRAFFIC'
gcloud run revisions describe "$BEACON_REVISION" \
  --project=vortik-registry-production \
  --region=southamerica-east1 \
  --format='json(metadata.name,metadata.generation,status.observedGeneration,status.serviceName,status.imageDigest,status.conditions,spec.containers.image)'
```

Keep the read timestamp, traffic assignment and resolved image digest together.
After obtaining the exact immutable image reference, use the existing image's
build/provenance metadata to bind that digest to its reviewed source and build.
For example, `gcloud artifacts docker images describe` supports immutable
`IMAGE@sha256:DIGEST` references with `--show-build-details` and
`--show-provenance`. Inspect only the identified image; do not start a new build
to manufacture missing evidence. A tag or a commit embedded in a revision name
is insufficient. Missing historical provenance leaves this gate unresolved.

Acceptance requires a ready, reconciled service/revision, identified serving
digest and evidence binding that digest to the source compared above (or a
separately reviewed equivalent source). It does not establish application
health, traffic volume, image vulnerability status or a new network/IAM audit.
If the serving source differs, compare it before deciding whether any change
is necessary. A future runtime change retains the existing resource, identity,
deny-egress, cost and human-approval boundaries.

Official command and field references:

- [Describe a Cloud Run service](https://docs.cloud.google.com/sdk/gcloud/reference/run/services/describe)
- [Describe a revision](https://docs.cloud.google.com/sdk/gcloud/reference/run/revisions/describe)
- [Revision status and image digest](https://docs.cloud.google.com/run/docs/reference/rest/v1/namespaces.revisions#RevisionStatus)
- [Describe an Artifact Registry image](https://docs.cloud.google.com/sdk/gcloud/reference/artifacts/docker/images/describe)

## Main publication at the comparison cutoff

- [Validation #894](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37819775886): success.
- [Pages #58](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37819844953): one automatic publication for the compared commit; the existing 35-resource byte comparison passed.
- [Protocol Watch #101](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37819845184): success; zero changed sources in that observation.
- [Issue #152](https://github.com/VortikRegistry/vortik-open-schema/issues/152): closed after the approved merge.

These results attest their stated repository/publication scopes, not the Cloud
Run image. The independent analytics proposal remains outside this review.
