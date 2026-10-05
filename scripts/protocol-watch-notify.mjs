import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const REPOSITORY = "VortikRegistry/vortik-open-schema";
const TITLE = "Protocol watch alert — upstream change detected";
const ISSUE_LIMIT = 1000;
const REPORT_PATH = "protocol-watch/report.md";

function runGitHub(args) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    timeout: 30_000,
    maxBuffer: 2_000_000,
    env: { ...process.env, GH_HOST: "github.com" }
  });
}

function trustedAuthor(author) {
  if (author?.login === "VortikRegistry") return true;
  return author?.is_bot === true && ["github-actions", "github-actions[bot]", "app/github-actions"].includes(author.login);
}

export function notifyProtocolWatch({ repository = process.env.GITHUB_REPOSITORY, runGh = runGitHub } = {}) {
  if (repository !== REPOSITORY) throw new Error("Protocol watch delivery requires the canonical repository");

  let issues;
  try {
    issues = JSON.parse(runGh(["issue", "list", "--repo", REPOSITORY, "--state", "open", "--limit", String(ISSUE_LIMIT), "--json", "number,title,author"]));
  } catch {
    throw new Error("Protocol watch issue inventory failed; no alert was created");
  }
  if (!Array.isArray(issues) || issues.length > ISSUE_LIMIT || issues.some((issue) => !issue || !Number.isSafeInteger(issue.number) || issue.number < 1 || typeof issue.title !== "string" || !Object.hasOwn(issue, "author") || (issue.author != null && (typeof issue.author !== "object" || typeof issue.author.login !== "string")))) {
    throw new Error("Invalid protocol watch issue inventory; no alert was created");
  }

  const existing = issues.find((issue) => issue.title === TITLE && trustedAuthor(issue.author));
  if (existing) return { delivery: "existing", issue_number: existing.number, issue_url: `https://github.com/${REPOSITORY}/issues/${existing.number}` };
  if (issues.length === ISSUE_LIMIT) throw new Error("Protocol watch issue inventory reached its limit; no alert was created");

  let url;
  try {
    url = runGh(["issue", "create", "--repo", REPOSITORY, "--title", TITLE, "--body-file", REPORT_PATH]).trim();
  } catch {
    throw new Error("Protocol watch alert creation failed; check existing alerts before retrying");
  }
  const match = /^https:\/\/github\.com\/VortikRegistry\/vortik-open-schema\/issues\/([1-9]\d*)$/.exec(url);
  if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error("Protocol watch alert response was not verified; check existing alerts before retrying");
  return { delivery: "created", issue_number: Number(match[1]), issue_url: url };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(notifyProtocolWatch()));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
