#!/usr/bin/env node
import { access, readFile } from "node:fs/promises";
import { readProtocolContext } from "../lib/protocol-context.mjs";

const data = await readProtocolContext();
const docs = new URL("../docs/", import.meta.url);
const paths = [
  data.review_path,
  ...data.anchors.flatMap((anchor) => [anchor.anchor_path, anchor.sources_path])
];
await Promise.all(paths.map((path) => access(new URL(path, docs))));
const review = await readFile(new URL(data.review_path, docs), "utf8");
if (!review.includes(data.reviewed_at)) throw new Error("Review document does not contain the source review date");
console.log(`Protocol context valid: ${data.anchors.length} anchors, ${data.eips.length} EIPs, ${data.forks.length} forks; reviewed ${data.reviewed_at}`);
console.log(`Registry date remains ${data.registry.last_updated}; no live state was queried.`);
