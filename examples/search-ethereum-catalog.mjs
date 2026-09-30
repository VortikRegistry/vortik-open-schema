#!/usr/bin/env node
import { readFile } from "node:fs/promises";

// Search only the committed metadata snapshot. No remote calls or inferred answers.
const data = JSON.parse(await readFile(new URL("../docs/ethereum-catalog.json", import.meta.url), "utf8"));
const query = (process.argv.slice(2).join(" ") || "account abstraction").trim().toLowerCase();
const numeric = /^(?:eip|erc)?[\s-]*(\d+)$/.exec(query);
const tokens = query.split(/\s+/).filter(Boolean);
const matches = data.proposals.filter((proposal) => {
  if (numeric) return proposal.number === Number(numeric[1]);
  const text = `${proposal.title} ${proposal.description ?? ""}`.toLowerCase();
  return tokens.every((token) => text.includes(token));
});
console.log(JSON.stringify({
  reviewed_at: data.reviewed_at, query, total_matches: matches.length,
  shown: Math.min(matches.length, 20), proposals: matches.slice(0, 20),
  note: "Metadata search only. Zero matches does not prove that the topic lacks a proposal."
}, null, 2));
