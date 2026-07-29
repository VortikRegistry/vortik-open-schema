#!/usr/bin/env node
import { researchEnsName } from "../lib/ens-research-client.mjs";

const name = process.env.VORTIK_ENS_NAME || "epbs.eth";
const requestId = process.env.VORTIK_ENS_REQUEST_ID || "example-ens-research";
const response = researchEnsName(name, { requestId });

console.log(JSON.stringify({
  submitted_name: name,
  request_id: response.request_id,
  normalized_name: response.query.normalized_name,
  state: response.result.state,
  registry_entry: response.result.registry_entry,
  related_terms: response.result.related_terms,
  evidence: response.result.evidence,
  limitations: response.result.limitations,
  authority: response.authority
}, null, 2));
