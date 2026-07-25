import fs from "fs";

const OUTPUT_PATH = "market.index.json";
const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));

const anchors = registry.anchors || [];

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

const allowedVisibility = new Set([
  "featured",
  "standard",
  "background",
  "hidden"
]);

const publicInquiryPolicy = {
  inquiry_status: "strategic_inquiries_reviewed",
  pricing_policy: "not_publicly_priced",
  transfer_policy: "case_by_case_private_review",
  public_contact_note: "Strategic acquisition inquiries may be reviewed case by case. No public pricing is provided."
};

function registryLastUpdatedTimestamp() {
  const value = registry.last_updated;

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("registry.json must define a non-empty last_updated value");
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`registry.json last_updated is not a valid date: ${value}`);
  }

  return parsed.toISOString();
}

function withoutLastUpdated(value) {
  const { last_updated: _lastUpdated, ...rest } = value;
  return rest;
}

function stableLastUpdated(outputPath, nextComparable) {
  const fallback = registryLastUpdatedTimestamp();

  if (!fs.existsSync(outputPath)) {
    return fallback;
  }

  try {
    const existing = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    const existingComparable = withoutLastUpdated(existing);

    if (JSON.stringify(existingComparable) === JSON.stringify(nextComparable)) {
      return typeof existing.last_updated === "string" && existing.last_updated
        ? existing.last_updated
        : fallback;
    }
  } catch {
    // Invalid or unreadable generated output is replaced deterministically below.
  }

  return fallback;
}

function normalizeVisibility(value, anchorId) {
  if (allowedVisibility.has(value)) {
    return value;
  }

  console.warn(
    `⚠️  Missing or unknown visibility "${value}" found in "${anchorId}". Defaulted to "standard".`
  );

  return "standard";
}

const grouped = {
  featured: [],
  standard: [],
  background: [],
  hidden: []
};

const sorted = anchors
  .filter((anchor) => anchor.market)
  .sort((a, b) => {
    const aPriority = priorityOrder[a.market?.priority] || 0;
    const bPriority = priorityOrder[b.market?.priority] || 0;

    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }

    return String(a.id).localeCompare(String(b.id));
  });

for (const anchor of sorted) {
  const visibility = normalizeVisibility(anchor.market?.visibility, anchor.id);
  grouped[visibility].push({
    id: anchor.id,
    ens: anchor.ens,
    canonical_term: anchor.canonical_term,
    priority: anchor.market?.priority,
    classification: anchor.classification,
    status: anchor.status,
    status_label: anchor.status_label,
    stage: anchor.stage,
    type: anchor.type
  });
}

const comparableIndex = {
  registry: registry.registry,
  index_version: "1.0.1",
  generated_from: "registry.json",
  public_inquiry_policy: publicInquiryPolicy,
  summary: {
    total: anchors.length,
    featured: grouped.featured.length,
    standard: grouped.standard.length,
    background: grouped.background.length,
    hidden: grouped.hidden.length
  },
  segments: grouped
};

const marketIndex = {
  registry: comparableIndex.registry,
  index_version: comparableIndex.index_version,
  generated_from: comparableIndex.generated_from,
  last_updated: stableLastUpdated(OUTPUT_PATH, comparableIndex),
  public_inquiry_policy: comparableIndex.public_inquiry_policy,
  summary: comparableIndex.summary,
  segments: comparableIndex.segments
};

const output = JSON.stringify(marketIndex, null, 2) + "\n";

fs.writeFileSync(OUTPUT_PATH, output);

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/market.index.json", output);

console.log("✅ market.index.json generated");
console.log("✅ docs/market.index.json generated");
console.log("✅ public_inquiry_policy added for controlled strategic inquiries");
