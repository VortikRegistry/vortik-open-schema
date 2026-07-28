import fs from "fs";

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"));
const anchors = registry.anchors || [];

const priorityOrder = {
  high: 3,
  medium: 2,
  low: 1
};

const displayNameOverrides = {
  ssf: "fastfinality.eth"
};

const copyOverrides = {
  epbs: {
    canonical: "enshrined proposer-builder separation (ePBS)",
    role: "protocol-aligned naming surface for implementation-facing ePBS coordination"
  },
  inclusionlist: {
    canonical: "fork-choice enforced inclusion lists (FOCIL)",
    role: "protocol-aligned constraint surface for inclusion-list coordination"
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
    role: "finality-aligned naming surface connected to fast-finality research"
  },
  orderflowauction: {
    canonical: "order flow auctions (OFA)",
    role: "external coordination surface tied to routing, auction flow and execution access"
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
    role: "blockspace-oriented naming surface tied to earlier execution-market framing"
  }
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function getDisplayName(anchor) {
  return displayNameOverrides[anchor.id] || anchor.ens || anchor.id;
}

function getCanonical(anchor) {
  return copyOverrides[anchor.id]?.canonical || anchor.canonical_term || anchor.id;
}

function getRole(anchor) {
  return copyOverrides[anchor.id]?.role || anchor.role || "";
}

function sortAnchors(items) {
  return [...items].sort((a, b) => {
    const aPriority = priorityOrder[a.market?.priority] || 0;
    const bPriority = priorityOrder[b.market?.priority] || 0;

    if (bPriority !== aPriority) {
      return bPriority - aPriority;
    }

    return String(a.id).localeCompare(String(b.id));
  });
}

const featured = sortAnchors(anchors.filter((anchor) => anchor.market?.visibility === "featured"));
const standard = sortAnchors(anchors.filter((anchor) => anchor.market?.visibility === "standard"));
const background = sortAnchors(anchors.filter((anchor) => anchor.market?.visibility === "background"));

function renderCard(anchor) {
  const classification = escapeHtml(anchor.classification);
  const status = escapeHtml(anchor.status_label || anchor.status);
  const priority = escapeHtml(anchor.market?.priority || "unspecified");
  const stage = escapeHtml(anchor.stage || "unspecified");

  return `
      <article class="card">
        <div class="card-name">${escapeHtml(getDisplayName(anchor))}</div>
        <div class="card-term">
          <strong>${escapeHtml(getCanonical(anchor))}</strong>
          <span>${escapeHtml(getRole(anchor))}</span>
        </div>
        <div class="card-meta">
          <span>${classification}</span>
          <span>${status}</span>
          <span>priority:${priority}</span>
          <span>stage:${stage}</span>
        </div>
      </article>`;
}

function renderSection(id, title, description, items, gridClass) {
  if (items.length === 0) return "";

  return `
    <section class="section" id="${id}">
      <div class="section-head">
        <div>
          <div class="section-kicker">${escapeHtml(title)}</div>
          <h2>${escapeHtml(description)}</h2>
        </div>
        <div class="section-count">${items.length} anchors</div>
      </div>
      <div class="${gridClass}">${items.map(renderCard).join("\n")}
      </div>
    </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vortik — Strategic Anchors</title>
  <meta name="description" content="Technical semantic prioritization of ENS-linked Ethereum coordination anchors indexed by Vortik." />
  <style>
    :root {
      --bg:#04060a;
      --surface:#0a1018;
      --surface-2:#0e1622;
      --line:rgba(255,255,255,.08);
      --text:#e7eef9;
      --muted:#93a4b9;
      --blue:#68a8ff;
      --green:#45d39b;
      --mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace;
      --sans:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{
      margin:0;
      min-height:100vh;
      color:var(--text);
      font-family:var(--sans);
      background:
        radial-gradient(900px 480px at 80% -5%,rgba(104,168,255,.11),transparent 62%),
        radial-gradient(700px 420px at 10% 0%,rgba(69,211,155,.07),transparent 60%),
        var(--bg);
    }
    a{color:inherit;text-decoration:none}
    .wrap{width:min(1120px,calc(100% - 36px));margin:0 auto}
    .topbar{
      position:sticky;top:0;z-index:20;
      background:rgba(4,6,10,.82);
      backdrop-filter:blur(16px);
      border-bottom:1px solid var(--line);
    }
    .topbar-inner{min-height:66px;display:flex;align-items:center;justify-content:space-between;gap:18px}
    .brand{font-weight:800;letter-spacing:-.02em}
    .brand small{display:block;margin-top:3px;color:var(--muted);font:11px var(--mono);letter-spacing:.06em;text-transform:uppercase}
    .nav{display:flex;gap:8px;flex-wrap:wrap}
    .nav a,.button{
      display:inline-flex;align-items:center;justify-content:center;
      padding:10px 14px;border:1px solid var(--line);border-radius:12px;
      color:#dce8f8;background:rgba(255,255,255,.025);font:12px var(--mono)
    }
    .nav a:hover,.button:hover{border-color:rgba(104,168,255,.35);background:rgba(104,168,255,.08)}
    .hero{padding:82px 0 48px}
    .eyebrow{color:var(--blue);font:11px var(--mono);letter-spacing:.14em;text-transform:uppercase}
    h1{max-width:900px;margin:18px 0 18px;font-size:clamp(38px,6vw,70px);line-height:1;letter-spacing:-.055em}
    .lead{max-width:820px;color:var(--muted);font-size:17px;line-height:1.7}
    .hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}
    .button.primary{background:linear-gradient(135deg,rgba(104,168,255,.18),rgba(69,211,155,.1));border-color:rgba(104,168,255,.3)}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:44px}
    .stat{padding:18px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.025)}
    .stat strong{display:block;font-size:25px}
    .stat span{display:block;margin-top:5px;color:var(--muted);font:11px var(--mono);text-transform:uppercase;letter-spacing:.06em}
    .section{padding:38px 0}
    .section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}
    .section-kicker{color:var(--green);font:11px var(--mono);letter-spacing:.12em;text-transform:uppercase}
    h2{margin:8px 0 0;font-size:clamp(23px,3vw,34px);letter-spacing:-.035em}
    .section-count{color:var(--muted);font:12px var(--mono)}
    .grid-2,.grid-3{display:grid;gap:14px}
    .grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}
    .grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}
    .card{padding:19px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.01)),var(--surface)}
    .card-name{font:700 15px var(--mono);color:#dce9ff;word-break:break-word}
    .card-term{margin-top:14px;color:var(--muted);font-size:14px;line-height:1.55}
    .card-term strong{display:block;margin-bottom:6px;color:var(--text);font-size:16px}
    .card-term span{display:block}
    .card-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:16px}
    .card-meta span{padding:6px 8px;border:1px solid var(--line);border-radius:999px;background:var(--surface-2);color:#c8d6e8;font:10px var(--mono)}
    .notice{margin:42px 0 20px;padding:22px;border:1px solid var(--line);border-radius:18px;background:rgba(104,168,255,.045);color:var(--muted);line-height:1.65}
    .notice strong{color:var(--text)}
    footer{padding:34px 0 58px;color:var(--muted);font:12px var(--mono);border-top:1px solid var(--line);margin-top:42px}
    @media(max-width:850px){.stats,.grid-3{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.nav{display:none}.hero{padding-top:52px}.stats,.grid-2,.grid-3{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column}}
  </style>
</head>
<body>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a class="brand" href="./index.html">Vortik Semantic Registry<small>technical strategic anchors</small></a>
      <nav class="nav">
        <a href="./index.html">Registry</a>
        <a href="./app.html">App</a>
        <a href="./market.index.json">Strategic index</a>
        <a href="https://github.com/VortikRegistry/vortik-open-schema" target="_blank" rel="noopener noreferrer">GitHub</a>
      </nav>
    </div>
  </header>

  <main class="wrap">
    <section class="hero">
      <div class="eyebrow">Independent semantic infrastructure</div>
      <h1>Ethereum coordination anchors mapped through technical registry context.</h1>
      <p class="lead">Selected ENS-linked naming surfaces indexed against Ethereum protocol primitives, roles, constraints and external coordination mechanisms. This view reports technical semantic alignment and provenance only.</p>
      <div class="hero-actions">
        <a class="button primary" href="./index.html">View registry</a>
        <a class="button" href="./market.index.json">Open machine-readable index</a>
        <a class="button" href="https://github.com/VortikRegistry/vortik-open-schema" target="_blank" rel="noopener noreferrer">View public repository</a>
      </div>
      <div class="stats">
        <div class="stat"><strong>${anchors.length}</strong><span>Indexed anchors</span></div>
        <div class="stat"><strong>${featured.length}</strong><span>Featured</span></div>
        <div class="stat"><strong>${standard.length}</strong><span>Standard</span></div>
        <div class="stat"><strong>${background.length}</strong><span>Background</span></div>
      </div>
    </section>

${renderSection("featured", "Featured", "Protocol-aligned technical context", featured, "grid-2")}
${renderSection("standard", "Standard", "Monitored semantic and coordination context", standard, "grid-3")}
${renderSection("background", "Background", "Legacy and comparison context", background, "grid-3")}

    <section class="notice">
      <strong>Registry boundary.</strong> Vortik is an independent research artifact. Priority and visibility are technical editorial signals and do not confer protocol authority.
    </section>
  </main>

  <footer>
    <div class="wrap">© 2026 Vortik Semantic Registry · Independent research artifact · Not affiliated with the Ethereum Foundation</div>
  </footer>
</body>
</html>
`;

fs.writeFileSync("docs/market.html", html);

console.log("✅ docs/market.html generated");
console.log(`Total anchors: ${anchors.length}`);
console.log(`Featured: ${featured.length}`);
console.log(`Standard: ${standard.length}`);
console.log(`Background: ${background.length}`);
