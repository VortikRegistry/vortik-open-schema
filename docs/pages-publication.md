# GitHub Pages publication

The website is published by [Deploy GitHub Pages](../.github/workflows/deploy-pages.yml). Its sole automatic trigger is completion of **Validate Vortik Registry** on `main`. The deployment job proceeds only after successful validation from this repository. The validation workflow already runs on every push to `main`, including documentation-only and workflow-only changes.

An authorized maintainer can still request a publication with `workflow_dispatch`. The publication job checks out `main`, validates the checked-out source again, publishes the `docs` artifact and compares the served files byte for byte. Its concurrency group serializes publication jobs; serialization alone does not deduplicate triggers.

## Incident and correction

For source commit `54586e5bd7dbb88e6d32256c7247f898a2bd7d50`, two automatic events previously started publication:

| Execution | Event | Result |
| --- | --- | --- |
| [Pages #54](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37726385048) | Push to `main` | Published and passed verification. |
| [Pages #55](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37726425255) | Completion of [validation #888](https://github.com/VortikRegistry/vortik-open-schema/actions/runs/37726385047) | Deployment reported success, then the served deployment stamp failed byte comparison. |

Read-only checks after the incident found the expected commit in `pages-deployment.json`, with the run identifier from #54. All 36 checked content files matched the repository, including the two source-review documents. The content was correct, but #55 did not establish publication of its own stamped artifact. This evidence does not distinguish caching from reuse of the earlier deployment.

Removing the direct `push` trigger eliminates the duplicate automatic route observed in this incident. It does not change the deployment stamp, permissions, concurrency, validation commands, retry limits or byte comparisons, and does not convert a failed comparison into success. A maintainer-requested repeat or a repeated upstream validation remains possible; this correction is not a general exactly-once delivery mechanism.

## Validation and acceptance

For this change, compare the parsed workflow before and after: only the `push` entry under `on` should be removed. The deployment job, its success/repository condition and all verification steps must remain identical. Confirm that the upstream validation workflow still handles pushes to `main`, then run the required public-safety and repository validation commands.

After human approval and merge, inspect the normal validation and publication cycle:

1. **Validate Vortik Registry** must succeed for the merged source.
2. One automatic Pages run should follow that validation; there should be no additional Pages run started directly by the push.
3. That Pages run must complete its existing served-file comparisons, including its deployment stamp.

Do not manually dispatch another publication just to verify the trigger change. If verification fails, inspect that run's evidence before deciding whether a retry is warranted. Local configuration checks and PR validation do not establish a successful production publication; the post-merge run supplies that evidence.

GitHub's [workflow event documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run) describes the completion event and the separate success condition used here.
