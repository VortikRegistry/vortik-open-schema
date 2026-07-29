export const ENS_RESEARCH_REQUEST_SCHEMA_ID =
  "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/queries/vortik-ens-research-request/1.0.0/schema.json";
export const ENS_RESEARCH_RESPONSE_SCHEMA_ID =
  "https://raw.githubusercontent.com/VortikRegistry/vortik-open-schema/main/schemas/queries/vortik-ens-research-response/1.0.0/schema.json";

const REQUEST_KEYS = new Set([
  "$schema",
  "request",
  "request_version",
  "request_id",
  "query"
]);
const QUERY_KEYS = new Set(["name"]);
const ASCII_NORMALIZED_ENS =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+eth$/u;
const CLASSIFICATIONS = new Set([
  "core",
  "repairable",
  "premature",
  "external",
  "deprecated"
]);
const ANCHOR_TYPES = new Set([
  "primitive",
  "constraint",
  "external_actor",
  "external_mechanism",
  "coordination_surface",
  "misaligned_abstraction"
]);

function codePoints(value) {
  return Array.from(value);
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function assertExactKeys(value, allowedKeys, label) {
  assertObject(value, label);
  const unexpected = Object.keys(value).filter((key) => !allowedKeys.has(key));
  const missing = [...allowedKeys].filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key)
  );

  if (unexpected.length > 0 || missing.length > 0) {
    throw new Error(`${label} fields do not match the closed contract`);
  }
}

function assertBoundedString(value, label, maximumLength) {
  if (
    typeof value !== "string"
    || value.length === 0
    || codePoints(value).length > maximumLength
  ) {
    throw new Error(`${label} must be a non-empty bounded string`);
  }
}

function assertRequest(request) {
  assertExactKeys(request, REQUEST_KEYS, "ENS research request");
  if (
    request.$schema !== ENS_RESEARCH_REQUEST_SCHEMA_ID
    || request.request !== "vortik-ens-research-request"
    || request.request_version !== "1.0.0"
  ) {
    throw new Error("Unsupported ENS research request contract");
  }
  if (
    typeof request.request_id !== "string"
    || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/u.test(request.request_id)
  ) {
    throw new Error("ENS research request_id is invalid");
  }

  assertExactKeys(request.query, QUERY_KEYS, "ENS research query");
  if (
    typeof request.query.name !== "string"
    || codePoints(request.query.name).length > 4096
  ) {
    throw new Error("ENS research query name is outside the request contract");
  }
}

function assertRegistryAnchor(anchor, index) {
  const label = `Registry anchor ${index}`;
  assertObject(anchor, label);

  if (typeof anchor.id !== "string" || !/^[a-z0-9-]+$/u.test(anchor.id)) {
    throw new Error(`${label} id is invalid`);
  }
  if (
    typeof anchor.ens !== "string"
    || normalizeSupportedEnsName(anchor.ens) !== anchor.ens
  ) {
    throw new Error(`${label} ENS name is outside the supported normalized subset`);
  }
  assertBoundedString(anchor.canonical_term, `${label} canonical_term`, 300);
  if (!CLASSIFICATIONS.has(anchor.classification)) {
    throw new Error(`${label} classification is invalid`);
  }
  assertBoundedString(anchor.status, `${label} status`, 100);
  if (!ANCHOR_TYPES.has(anchor.type)) {
    throw new Error(`${label} type is invalid`);
  }
  if (
    typeof anchor.schema !== "string"
    || !/^schemas\/.+\/schema\.json$/u.test(anchor.schema)
  ) {
    throw new Error(`${label} schema path is invalid`);
  }
  if (
    typeof anchor.anchor_doc !== "string"
    || !/^anchors\/.+\.md$/u.test(anchor.anchor_doc)
  ) {
    throw new Error(`${label} document path is invalid`);
  }
}

function assertRegistry(registry) {
  assertObject(registry, "Vortik registry");
  if (
    registry.registry !== "vortik-semantic-registry"
    || registry.source_of_truth !== "schemas"
    || typeof registry.version !== "string"
    || !/^[0-9]+\.[0-9]+\.[0-9]+$/u.test(registry.version)
    || typeof registry.last_updated !== "string"
    || !/^\d{4}-\d{2}-\d{2}$/u.test(registry.last_updated)
    || !Array.isArray(registry.anchors)
  ) {
    throw new Error("Vortik registry metadata is invalid");
  }

  registry.anchors.forEach(assertRegistryAnchor);
  const ids = registry.anchors.map((anchor) => anchor.id);
  const names = registry.anchors.map((anchor) => anchor.ens);
  if (new Set(ids).size !== ids.length || new Set(names).size !== names.length) {
    throw new Error("Vortik registry anchors must have unique ids and ENS names");
  }
}

export function normalizeSupportedEnsName(value) {
  if (typeof value !== "string") return null;

  const candidate = value.normalize("NFC").toLowerCase();
  if (codePoints(candidate).length > 255 || !ASCII_NORMALIZED_ENS.test(candidate)) {
    return null;
  }

  const labels = candidate.split(".").slice(0, -1);
  const hasReservedExtension = labels.some(
    (label) => label.length >= 4 && label[2] === "-" && label[3] === "-"
  );
  return hasReservedExtension ? null : candidate;
}

function responseBase(request, rawName, normalizedName) {
  const rawPoints = codePoints(rawName);
  return {
    $schema: ENS_RESEARCH_RESPONSE_SCHEMA_ID,
    response: "vortik-ens-research-response",
    response_version: "1.0.0",
    request_id: request.request_id,
    query: {
      submitted_name: rawPoints.slice(0, 255).join(""),
      submitted_name_truncated: rawPoints.length > 255,
      normalized_name: normalizedName
    },
    authority: {
      registry_scope: "independent semantic registry",
      protocol_authority: false,
      ens_authority: false,
      ownership_inference: false
    }
  };
}

function invalidResponse(request, rawName) {
  return {
    ...responseBase(request, rawName, null),
    result: {
      state: "invalid_input",
      registry_entry: null,
      related_terms: [],
      evidence: [],
      limitations: [],
      errors: [
        {
          code: "invalid_input",
          message:
            "The submitted value is outside the currently supported fail-closed ASCII ENS subset."
        }
      ]
    }
  };
}

function trackedResponse(request, rawName, normalizedName, anchor, anchorIndex) {
  return {
    ...responseBase(request, rawName, normalizedName),
    result: {
      state: "tracked_anchor",
      registry_entry: {
        id: anchor.id,
        ens: anchor.ens,
        canonical_term: anchor.canonical_term,
        classification: anchor.classification,
        status: anchor.status,
        type: anchor.type,
        schema_path: anchor.schema,
        anchor_doc: anchor.anchor_doc
      },
      related_terms: [],
      evidence: [
        {
          kind: "registry",
          reference: `registry.json#/anchors/${anchorIndex}`,
          claim: "The normalized name exactly matches a validated registry anchor."
        }
      ],
      limitations: [
        "Registry inclusion is not protocol authority or endorsement."
      ],
      errors: []
    }
  };
}

function untrackedResponse(request, rawName, normalizedName) {
  return {
    ...responseBase(request, rawName, normalizedName),
    result: {
      state: "untracked",
      registry_entry: null,
      related_terms: [],
      evidence: [],
      limitations: [
        "Absence from Vortik means only that the current curated registry has no source-grounded assessment for this name."
      ],
      errors: []
    }
  };
}

export function evaluateEnsResearch(request, registry) {
  assertRequest(request);
  assertRegistry(registry);

  const rawName = request.query.name;
  const normalizedName = normalizeSupportedEnsName(rawName);
  if (normalizedName === null) {
    return invalidResponse(request, rawName);
  }

  const anchorIndex = registry.anchors.findIndex(
    (anchor) => anchor.ens === normalizedName
  );
  if (anchorIndex === -1) {
    return untrackedResponse(request, rawName, normalizedName);
  }

  return trackedResponse(
    request,
    rawName,
    normalizedName,
    registry.anchors[anchorIndex],
    anchorIndex
  );
}
