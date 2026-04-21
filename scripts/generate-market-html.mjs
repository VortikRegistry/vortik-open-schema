import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const anchors = registry.anchors || [];

const featured = anchors.filter(a => a.market?.visibility === "featured");
const standard = anchors.filter(a => a.market?.visibility === "standard");
const background = anchors.filter(a => a.market?.visibility === "background");

const displayNameOverrides = {
  ssf: "fastfinality.eth"
};

const copyOverrides = {
  epbs: {
    canonical: "enshrined proposer-builder separation (ePBS)",
    role: "canonical protocol-aligned naming surface for commitment-based block production"
  },
  inclusionlist: {
    canonical: "fork-choice enforced inclusion lists (FOCIL)",
    role: "protocol-native constraint surface tied directly to inclusion enforcement"
  },
  commitmentlayer: {
    canonical: "commitment",
    role: "commitment-aligned naming surface with protocol relevance and naming mismatch"
  },
  preconflayer: {
    canonical: "preconfirmation (emergent)",
    role: "early guarantee surface connected to preconfirmation research and execution timing"
  },
  ssf: {
    canonical: "single-slot finality (SSF)",
    role: "finality-aligned naming surface connected to fast finality research"
  },
  orderflowauction: {
    canonical: "order flow auctions (OFA)",
    role: "external coordination surface tied to routing, auction flow, and execution access"
  },
  provingmarket: {
    canonical: "proving markets",
    role: "external coordination surface aligned with proof generation and zk infrastructure"
  },
  sequencingmarket: {
    canonical: "sequencing markets",
    role: "external coordination surface aligned with rollup and shared sequencing narratives"
  },
  buildermarket: {
    canonical: "builder",
    role: "builder-aligned naming surface with legacy market framing"
  },
  solverlayer: {
    canonical: "solver (external)",
    role: "external actor-aligned naming surface tied to intent routing and solver coordination"
  },
  executionmarket: {
    canonical: "execution (ambiguous)",
    role: "broad execution-aligned naming surface with non-canonical protocol mapping"
  },
  blockspacemarket: {
    canonical: "blockspace markets",
    role: "blockspace-oriented naming surface tied to earlier execution market framing"
  }
};

function getDisplayName(anchor) {
  return displayNameOverrides[anchor.id] || anchor.ens || anchor.id;
}

function getCanonical(anchor) {
  return copyOverrides[anchor.id]?.canonical || anchor.canonical_term || anchor.id;
}

function getRole(anchor) {
  return copyOverrides[anchor.id]?.role || anchor.role || "";
}

function renderCard(anchor, tier) {
  const isFeatured = tier === "featured";
  const isStandard = tier === "standard";

  const badge = isFeatured
    ? `<span class="badge badge-core">strategic transfer only</span>`
    : isStandard
    ? `<span class="badge badge-selective">selective discussion</span>`
    : `<span class="badge badge-available">available</span>`;

  const pricing = isFeatured
    ? `<span class="card-pricing">price on request</span>`
    : "";

  return `
      <div class="card ${isFeatured ? "card-core" : isStandard ? "card-selective" : ""}">
        <div class="card-top">
          <div class="card-name">${getDisplayName(anchor)}</div>
        </div>
        <div class="card-term">
          ${getCanonical(anchor)}<br>
          ${getRole(anchor)}
        </div>
        <div class="card-footer">
          ${badge}
          ${pricing}
        </div>
      </div>`;
}

const featuredHtml = featured.map(a => renderCard(a, "featured")).join("\n");
const standardHtml = standard.map(a => renderCard(a, "standard")).join("\n");
const backgroundHtml = background.map(a => renderCard(a, "background")).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vortik — Strategic Anchors</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #04060a;
      --surface-1: #080d14;
      --surface-2: #0c1320;
      --border: rgba(255,255,255,0.06);
      --border-bright: rgba(255,255,255,0.12);
      --text: #dce8f8;
      --muted: #7a90aa;
      --dim: #4a5a6e;
      --green: #2ecc8a;
      --green-glow: rgba(46,204,138,0.15);
      --blue: #4d9eff;
      --blue-glow: rgba(77,158,255,0.12);
      --white-dim: rgba(220,232,248,0.55);
      --mono: 'DM Mono', ui-monospace, monospace;
      --display: 'Syne', ui-sans-serif, sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      font-family: var(--display);
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 900px 500px at 75% -5%, rgba(77,158,255,0.09) 0%, transparent 65%),
        radial-gradient(ellipse 700px 400px at 15% 5%, rgba(46,204,138,0.06) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .wrap {
      position: relative;
      z-index: 1;
      width: min(1100px, calc(100% - 40px));
      margin: 0 auto;
    }

    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(20px);
      background: rgba(4,6,10,0.78);
      border-bottom: 1px solid var(--border);
    }

    .topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0e1f38, #081424);
      border: 1px solid rgba(77,158,255,0.25);
      display: grid;
      place-items: center;
      font-family: var(--mono);
      font-size: 10px;
      color: var(--blue);
    }

    .brand-text {
      font-size: 15px;
      font-weight: 700;
      color: var(--text);
    }

    .brand-sub {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--muted);
      margin-top: 1px;
      font-weight: 300;
    }

    .nav-links {
      display: flex;
      gap: 6px;
    }

    .nav-links a {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--muted);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid transparent;
    }

    .nav-links a:hover {
      color: var(--text);
      border-color: var(--border);
    }

    .hero {
      padding: 72px 0 48px;
    }

    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: var(--mono);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--blue);
      margin-bottom: 24px;
      padding: 6px 12px;
      border: 1px solid rgba(77,158,255,0.2);
      border-radius: 999px;
      background: rgba(77,158,255,0.06);
    }

    .hero-title {
      font-size: clamp(36px, 5.5vw, 64px);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.0;
      color: var(--text);
      max-width: 820px;
      margin-bottom: 20px;
    }

    .hero-title em {
      font-style: normal;
      background: linear-gradient(135deg, #4d9eff, #2ecc8a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-lead {
      font-size: 17px;
      color: var(--muted);
      max-width: 720px;
      line-height: 1.7;
      font-family: var(--mono);
      font-weight: 300;
      margin-bottom: 32px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 13px 22px;
      border-radius: 12px;
      font-family: var(--mono);
      font-size: 13px;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, rgba(77,158,255,0.18), rgba(46,204,138,0.12));
      border: 1px solid rgba(77,158,255,0.3);
      color: var(--text);
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--muted);
    }

    .hero-stat-row {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }

    .hero-stat-value {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.04em;
      color: var(--text);
    }

    .hero-stat-label {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--dim);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .section {
      margin: 56px 0;
    }

    .section-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .section-title {
      font-size: 13px;
      font-family: var(--mono);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title::before {
      content: '';
      display: block;
      width: 24px;
      height: 1px;
      background: var(--border-bright);
    }

    .section-count {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--dim);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .card {
      position: relative;
      padding: 22px 22px 20px;
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
    }

    .card-core::after {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--green-glow), transparent 70%);
      pointer-events: none;
    }

    .card-selective::after {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--blue-glow), transparent 70%);
      pointer-events: none;
    }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    .card-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text);
    }

    .card-term {
      font-family: var(--mono);
      font-size: 12px;
      font-weight: 300;
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 18px;
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      font-family: var(--mono);
      font-size: 11px;
      border: 1px solid;
    }

    .badge::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
    }

    .badge-core {
      color: var(--green);
      border-color: rgba(46,204,138,0.25);
      background: rgba(46,204,138,0.06);
    }

    .badge-selective {
      color: var(--blue);
      border-color: rgba(77,158,255,0.25);
      background: rgba(77,158,255,0.06);
    }

    .badge-available {
      color: var(--white-dim);
      border-color: rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
    }

    .card-pricing {
      font-family: var(--mono);
      font-size: 11px;
      color: var(--dim);
    }

    .contact-section {
      margin: 56px 0 80px;
      padding: 36px;
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 32px;
      flex-wrap: wrap;
    }

    .contact-left h3 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 10px;
    }

    .contact-left p {
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 300;
      color: var(--muted);
      line-height: 1.65;
      max-width: 520px;
    }

    .contact-right {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }

    footer {
      border-top: 1px solid var(--border);
      padding: 24px 0 48px;
    }

    .footer-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .footer-copy {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--dim);
    }

    .footer-links {
      display: flex;
      gap: 20px;
    }

    .footer-links a {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--dim);
      text-decoration: none;
    }

    @media (max-width: 860px) {
      .grid-3 { grid-template-columns: 1fr 1fr; }
      .nav-links { display: none; }
    }

    @media (max-width: 580px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .hero { padding: 48px 0 32px; }
      .hero-title { font-size: 34px; }
      .hero-stat-row { gap: 20px; }
      .contact-section { padding: 24px; flex-direction: column; }
      .contact-right { width: 100%; }
      .btn-primary, .btn-secondary { width: 100%; }
      .section { margin: 48px 0; }
    }
  </style>
</head>
<body>

<header class="topbar">
  <div class="wrap topbar-inner">
    <a class="brand" href="./index.html">
      <div class="brand-mark">VSR</div>
      <div>
        <div class="brand-text">Vortik</div>
        <div class="brand-sub">Semantic Registry</div>
      </div>
    </a>
    <nav class="nav-links">
      <a href="./index.html">Registry</a>
      <a href="./app.html">App</a>
      <a href="https://github.com/VortikRegistry" target="_blank" rel="noopener noreferrer">GitHub</a>
    </nav>
  </div>
</header>

<div class="wrap">
  <section class="hero">
    <div class="hero-eyebrow">Strategic Availability</div>
    <h1 class="hero-title">
      Strategic ENS anchors<br>
      aligned with Ethereum’s<br>
      <em>coordination architecture</em>.
    </h1>
    <p class="hero-lead">
      Selected ENS anchors indexed by Vortik against Ethereum protocol primitives, roles, and coordination mechanisms. Availability is selective. Transfers depend on strategic alignment, timing, and fit.
    </p>
    <div class="hero-actions">
      <a class="btn-primary" href="https://x.com/VortikRegistry" target="_blank" rel="noopener noreferrer">
        ↗ Request discussion via X
      </a>
      <a class="btn-secondary" href="./index.html">
        View registry
      </a>
    </div>
    <div class="hero-stat-row">
      <div class="hero-stat">
        <div class="hero-stat-value">${anchors.length}</div>
        <div class="hero-stat-label">Surfaced anchors</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">${featured.length}</div>
        <div class="hero-stat-label">Core protocol</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">EIP-7732</div>
        <div class="hero-stat-label">Primary reference</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">EIP-7805</div>
        <div class="hero-stat-label">Inclusion mechanism</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <div class="section-title">Strategic Anchors</div>
      <div class="section-count">${featured.length} assets — not publicly priced</div>
    </div>
    <div class="grid-2">
${featuredHtml}
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <div class="section-title">Monitored / Selective</div>
      <div class="section-count">${standard.length} assets — open to aligned inquiry</div>
    </div>
    <div class="grid-3">
${standardHtml}
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <div class="section-title">Available for Transfer</div>
      <div class="section-count">${background.length} assets — open</div>
    </div>
    <div class="grid-3">
${backgroundHtml}
    </div>
  </section>

  <section class="contact-section">
    <div class="contact-left">
      <h3>Acquire or discuss an anchor</h3>
      <p>
        Vortik does not operate as an open marketplace.
        Transfers are evaluated based on protocol alignment, timing, and strategic fit.
      </p>
    </div>
    <div class="contact-right">
      <a class="btn-primary" href="https://x.com/VortikRegistry" target="_blank" rel="noopener noreferrer">
        ↗ Request discussion via X
      </a>
      <a class="btn-secondary" href="./index.html">
        View registry context
      </a>
    </div>
  </section>
</div>

<footer>
  <div class="wrap footer-inner">
    <div class="footer-copy">
      © 2026 Vortik — Semantic Registry
    </div>
    <div class="footer-links">
      <a href="./index.html">Registry</a>
      <a href="https://github.com/VortikRegistry" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://x.com/VortikRegistry" target="_blank" rel="noopener noreferrer">X</a>
    </div>
  </div>
</footer>

</body>
</html>
`;

fs.writeFileSync("docs/market.html", html);

console.log("✅ market.html generated");
console.log(\`Total anchors: \${anchors.length}\`);
console.log(\`Featured: \${featured.length}\`);
console.log(\`Standard: \${standard.length}\`);
console.log(\`Background: \${background.length}\`);
