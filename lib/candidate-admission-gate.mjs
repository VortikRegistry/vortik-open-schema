function assertRegistry(value, label) {
  if (!value || typeof value !== "object" || !Array.isArray(value.anchors)) {
    throw new TypeError(`${label} must contain an anchors array`);
  }
}

export function findCandidateAdmissionSensitiveChanges(baseRegistry, currentRegistry) {
  assertRegistry(baseRegistry, "base registry");
  assertRegistry(currentRegistry, "current registry");

  const baseById = new Map(baseRegistry.anchors.map((anchor) => [anchor.id, anchor]));
  const changes = [];

  for (const anchor of currentRegistry.anchors) {
    const previous = baseById.get(anchor.id);
    if (!previous) {
      changes.push(Object.freeze({
        kind: "new_anchor",
        id: anchor.id,
        ens: anchor.ens
      }));
      continue;
    }

    if (previous.ens !== anchor.ens) {
      changes.push(Object.freeze({
        kind: "ens_rebound",
        id: anchor.id,
        previous_ens: previous.ens,
        ens: anchor.ens
      }));
    }
  }

  return Object.freeze(changes);
}

export function assertTrustedCandidateAdmissionAvailable(baseRegistry, currentRegistry) {
  const changes = findCandidateAdmissionSensitiveChanges(baseRegistry, currentRegistry);
  if (changes.length === 0) return Object.freeze({ blocked: false, changes });

  const summary = changes.map((change) => {
    if (change.kind === "new_anchor") return `new anchor ${change.id}:${change.ens}`;
    return `ENS rebound ${change.id}:${change.previous_ens}->${change.ens}`;
  }).join(", ");

  throw new Error(
    `candidate-derived registry admission is fail-closed until trusted Ethereum/protocol and ENS verification receipts are implemented; blocked changes: ${summary}`
  );
}
