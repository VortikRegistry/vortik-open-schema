// Render from the canonical entries; the published directory works without JavaScript.
const escape = (s) => String(s).replace(/[&<>"']/g, ch => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[ch]);

export function renderSchemaDirectory({ anchors }) {
  const rows = anchors.map(({ id, canonical_term, anchor_doc, schema }) => {
    const key = escape(encodeURIComponent(id));
    const term = escape(canonical_term);
    return `      <li>
        <h3><a href="../app.html?q=${key}#entry-${key}">${term}</a></h3>
        <div class="schema-files"><a href="../${escape(anchor_doc)}" aria-label="Read the anchor note for ${term}">Anchor note</a><a href="../${escape(schema)}" aria-label="Open the JSON schema for ${term}">JSON schema</a></div>
      </li>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Schema directory · Vortik Registry</title>
  <meta name="description" content="Browse the curated Ethereum coordination terms, read their source notes and open each versioned JSON schema.">
  <link rel="canonical" href="https://vortikregistry.github.io/vortik-open-schema/schemas/">
  <link rel="icon" href="../assets/vortik-mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../assets/registry.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container header-row">
    <a class="brand" href="../" aria-label="Vortik Registry home"><span class="brand-mark" aria-hidden="true">V</span><span>VORTIK<span class="brand-subtitle">Ethereum semantic registry</span></span></a>
    <nav aria-label="Main navigation"><a href="../research.html">Ethereum search</a><a href="../app.html">Registry</a><a href="../#developers">Build with it</a></nav>
  </div></header>
  <main class="container schema-directory" id="main">
    <p class="eyebrow">Vortik Registry / Public data</p>
    <h1>Schema directory</h1>
    <p>Open a term to explore its sources, read the anchor note, or use the versioned JSON schema in your own tool.</p>
    <div class="schema-contract"><strong>Using the whole registry?</strong> <a href="../registry.json">Registry JSON</a> <span aria-hidden="true">·</span> <a href="../registry.schema.json">Schema for registry.json</a></div>
    <h2>Term schemas <span>(${anchors.length})</span></h2>
    <ul class="schema-entries">
${rows}
    </ul>
    <p>For dated evidence about proposals, upgrades and networks, read the <a href="../protocol-context.json">protocol context JSON</a>. Vortik’s schemas describe terminology; they do not define Ethereum protocol rules.</p>
  </main>
</body>
</html>
`;
}
