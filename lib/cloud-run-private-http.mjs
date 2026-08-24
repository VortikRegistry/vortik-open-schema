const JSON_HEADERS = Object.freeze({
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
});

function writeJson(response, statusCode, payload) {
  const body = `${JSON.stringify(payload)}\n`;
  response.writeHead(statusCode, {
    ...JSON_HEADERS,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

function assertRuntimeIdentity(runtimeIdentity) {
  if (!runtimeIdentity || typeof runtimeIdentity !== "object" || Array.isArray(runtimeIdentity)) {
    throw new TypeError("Cloud Run private HTTP surface requires a runtime identity object");
  }
  if (runtimeIdentity.trusted_receipt_issuance !== false) {
    throw new Error("preactivation HTTP surface requires trusted_receipt_issuance=false");
  }
  if (runtimeIdentity.admission_enabled !== false) {
    throw new Error("preactivation HTTP surface requires admission_enabled=false");
  }
  return Object.freeze(structuredClone(runtimeIdentity));
}

export function createCloudRunPreactivationHttpHandler({ runtimeIdentity }) {
  const identity = assertRuntimeIdentity(runtimeIdentity);

  return function handleCloudRunPreactivationRequest(request, response) {
    if (request.method !== "GET") {
      writeJson(response, 405, { error: "method_not_allowed" });
      return;
    }

    let url;
    try {
      url = new URL(request.url ?? "/", "http://cloud-run.internal");
    } catch {
      writeJson(response, 400, { error: "invalid_request_target" });
      return;
    }

    if (url.search || url.hash) {
      writeJson(response, 400, { error: "query_or_fragment_not_allowed" });
      return;
    }

    if (url.pathname === "/health") {
      writeJson(response, 200, {
        status: "ready",
        trusted_receipt_issuance: false,
        admission_enabled: false
      });
      return;
    }

    if (url.pathname === "/v1/runtime-identity") {
      writeJson(response, 200, identity);
      return;
    }

    writeJson(response, 404, { error: "not_found" });
  };
}
