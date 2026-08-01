import {
  ENS_RESEARCH_REQUEST_SCHEMA_ID,
  evaluateEnsResearch
} from "./ens-research-evaluator.mjs";
import { loadImmutableJsonSnapshot } from "./immutable-json-snapshot.mjs";

const canonicalCoordinationSurfacesSnapshot = loadImmutableJsonSnapshot(
  new URL("../maps/coordination-surfaces.json", import.meta.url)
);
const canonicalRegistrySnapshot = loadImmutableJsonSnapshot(
  new URL("../registry.json", import.meta.url)
);

export const DEFAULT_ENS_RESEARCH_REQUEST_ID = "vortik-ens-research";

const OPTION_KEYS = new Set(["requestId"]);

function codePoints(value) {
  return Array.from(value);
}

function assertClosedOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new Error("ENS research client options must be an object");
  }

  const unexpected = Object.keys(options).filter((key) => !OPTION_KEYS.has(key));
  if (unexpected.length > 0) {
    throw new Error("ENS research client options contain unsupported fields");
  }
}

export function createEnsResearchRequest(name, options = {}) {
  assertClosedOptions(options);

  if (typeof name !== "string" || codePoints(name).length > 4096) {
    throw new Error("ENS research name is outside the request contract");
  }

  const requestId = options.requestId ?? DEFAULT_ENS_RESEARCH_REQUEST_ID;
  if (
    typeof requestId !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(requestId)
  ) {
    throw new Error("ENS research requestId is invalid");
  }

  return {
    $schema: ENS_RESEARCH_REQUEST_SCHEMA_ID,
    request: "vortik-ens-research-request",
    request_version: "1.0.0",
    request_id: requestId,
    query: { name }
  };
}

export function researchEnsRequest(request) {
  const response = evaluateEnsResearch(
    structuredClone(request),
    canonicalRegistrySnapshot,
    { coordinationSurfaces: canonicalCoordinationSurfacesSnapshot }
  );

  return structuredClone(response);
}

export function researchEnsName(name, options = {}) {
  return researchEnsRequest(createEnsResearchRequest(name, options));
}
