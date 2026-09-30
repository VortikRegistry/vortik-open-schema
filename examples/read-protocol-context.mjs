#!/usr/bin/env node
import { readProtocolContext, getAnchorContext } from "../lib/protocol-context.mjs";

// Works offline after dependencies are installed. Optional argument: anchor id or ENS label.
const data = await readProtocolContext();
const result = getAnchorContext(data, process.argv[2] ?? "epbs");
console.log(JSON.stringify(result, null, 2));
