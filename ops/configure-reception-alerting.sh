#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_ID:?PROJECT_ID is required}"
: "${ALERT_EMAIL:?ALERT_EMAIL is required and is never stored in the repository}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

CHANNEL_TEMPLATE="$ROOT_DIR/ops/reception-email-channel.template.json"
POLICY_TEMPLATE="$ROOT_DIR/ops/reception-alert-policy.template.json"
CHANNEL_JSON="$TMP_DIR/channel.json"
POLICY_JSON="$TMP_DIR/policy.json"

python3 - "$CHANNEL_TEMPLATE" "$CHANNEL_JSON" <<'PY'
import json, os, sys
src, dst = sys.argv[1:]
with open(src, encoding="utf-8") as handle:
    doc = json.load(handle)
doc["labels"]["email_address"] = os.environ["ALERT_EMAIL"]
with open(dst, "w", encoding="utf-8") as handle:
    json.dump(doc, handle, indent=2)
    handle.write("\n")
PY

gcloud config set project "$PROJECT_ID" >/dev/null
CHANNEL_NAME="$(gcloud beta monitoring channels create \
  --channel-content-from-file="$CHANNEL_JSON" \
  --format='value(name)')"

if [[ -z "$CHANNEL_NAME" || "$CHANNEL_NAME" != projects/*/notificationChannels/* ]]; then
  echo "Notification channel creation did not return a valid resource name" >&2
  exit 1
fi

export CHANNEL_NAME
python3 - "$POLICY_TEMPLATE" "$POLICY_JSON" <<'PY'
import json, os, sys
src, dst = sys.argv[1:]
with open(src, encoding="utf-8") as handle:
    doc = json.load(handle)
doc["notificationChannels"] = [os.environ["CHANNEL_NAME"]]
with open(dst, "w", encoding="utf-8") as handle:
    json.dump(doc, handle, indent=2)
    handle.write("\n")
PY

gcloud monitoring policies create --policy-from-file="$POLICY_JSON"

echo "Vortik Reception high-priority alerting configured."
echo "Notification channel: $CHANNEL_NAME"
