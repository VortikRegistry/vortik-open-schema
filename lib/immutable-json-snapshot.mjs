import { readFileSync } from "node:fs";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

export function immutableJsonSnapshot(value) {
  return deepFreeze(structuredClone(value));
}

export function loadImmutableJsonSnapshot(url) {
  return deepFreeze(JSON.parse(readFileSync(url, "utf8")));
}
