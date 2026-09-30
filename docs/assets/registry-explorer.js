/* Static, dependency-free explorer. Only these two same-origin JSON files are fetched. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CONTRACT = "vortik.protocol-context/1.0.0";
  const DOC_ROOT = "https://github.com/VortikRegistry/vortik-open-schema/blob/main/docs/";
  const state = { registry: null, context: null, entries: [], selected: new Set() };
  const kinds = new Set(["all", "protocol", "research", "application", "editorial"]);
  const classifications = new Set(["all", "core", "repairable", "premature", "external", "deprecated"]);
  const documentStatuses = new Set(["Draft", "Review", "Last Call", "Final", "Stagnant", "Withdrawn", "Living"]);

  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/eip[\s-]*(\d+)/g, "eip$1");
  }

  function matches(text, query) {
    const tokens = normalize(query).trim().split(/\s+/).filter(Boolean);
    const normalizedText = normalize(text);
    return tokens.every((token) => normalizedText.includes(token));
  }

  function sourceUrl(value) {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Unsafe source URL");
    return url.href;
  }

  function localPath(value) {
    if (typeof value !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(value)
      || value.split("/").some((part) => !part || part === "." || part === "..")) {
      throw new Error("Unsafe documentation path");
    }
    return value;
  }

  function link(url, label) {
    return `<a href="${escape(url)}">${escape(label)}</a>`;
  }

  function docLink(path, label) {
    return link(DOC_ROOT + localPath(path), label);
  }

  async function fetchJson(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(new URL(path, document.baseURI), { signal: controller.signal, cache: "no-cache" });
      if (!response.ok) throw new Error("Static artifact unavailable");
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function validateInputs(registry, context) {
    if (context?.contract !== CONTRACT || !Array.isArray(registry?.anchors)
      || ![context.anchors, context.eips, context.sources, context.forks].every(Array.isArray)
      || context.registry?.version !== registry.version
      || context.registry?.last_updated !== registry.last_updated
      || !/^\d{4}-\d{2}-\d{2}$/.test(context.reviewed_at)) throw new Error("Incompatible static artifacts");
    const sourceIds = new Set();
    for (const source of context.sources) {
      if (sourceIds.has(source.id) || typeof source.title !== "string") throw new Error("Invalid source record");
      sourceIds.add(source.id);
      sourceUrl(source.url);
    }
    const forkNames = new Set(context.forks.map((fork) => fork.name));
    for (const fork of context.forks) {
      if (!Array.isArray(fork.activations) || !Array.isArray(fork.source_refs)
        || fork.source_refs.some((ref) => !sourceIds.has(ref))) throw new Error("Invalid fork record");
      for (const activation of fork.activations) {
        const hasTiming = ["scheduled", "active"].includes(activation.status);
        if (!["scheduled", "not_scheduled", "unverified", "active"].includes(activation.status)
          || (hasTiming && (typeof activation.activation_at !== "string" || !activation.activation_at.endsWith("Z") || !Number.isFinite(Date.parse(activation.activation_at))))
          || (!hasTiming && [activation.activation_at, activation.epoch, activation.slot].some((value) => value !== null))) {
          throw new Error("Invalid activation record");
        }
      }
    }
    const eipNumbers = new Set();
    for (const eip of context.eips) {
      if (!Number.isInteger(eip.number) || eipNumbers.has(eip.number) || !sourceIds.has(eip.source_ref) || !documentStatuses.has(eip.document_status)
        || (eip.fork && (!forkNames.has(eip.fork.name) || !sourceIds.has(eip.fork.source_ref)
          || !["scheduled", "proposed", "considered", "declined"].includes(eip.fork.assignment)))) {
        throw new Error("Invalid EIP record");
      }
      eipNumbers.add(eip.number);
    }
    const canonical = new Map(registry.anchors.map((entry) => [entry.id, entry]));
    const ids = new Set();
    for (const entry of context.anchors) {
      if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || ids.has(entry.id)
        || !canonical.has(entry.id) || canonical.get(entry.id).ens !== entry.ens
        || !kinds.has(entry.context_kind) || entry.context_kind === "all"
        || !Array.isArray(entry.eip_refs) || !Array.isArray(entry.source_refs)
        || entry.eip_refs.some((number) => !eipNumbers.has(number))
        || entry.source_refs.some((ref) => !sourceIds.has(ref))) throw new Error("Invalid context entry");
      ids.add(entry.id);
      localPath(entry.anchor_path);
      localPath(entry.sources_path);
      localPath(canonical.get(entry.id).schema);
    }
    if (ids.size !== canonical.size) throw new Error("Incomplete context");
    return context.anchors.map((entry) => ({ ...entry, canonical: canonical.get(entry.id) }));
  }

  function getSource(id) { return state.context.sources.find((source) => source.id === id); }
  function getEips(entry) { return entry.eip_refs.map((number) => state.context.eips.find((eip) => eip.number === number)); }
  function getForks(entry) {
    const names = new Set(getEips(entry).map((eip) => eip.fork?.name).filter(Boolean));
    return state.context.forks.filter((fork) => names.has(fork.name));
  }
  function eipLink(eip) { return link(sourceUrl(getSource(eip.source_ref).url), `EIP-${eip.number}`); }
  function sourceLinks(ids) {
    return ids.map((id) => getSource(id)).map((source) => `<li>${link(sourceUrl(source.url), source.title)}</li>`).join("");
  }
  function assignmentLabel(assignment) {
    return ({ scheduled: "Scheduled for inclusion", proposed: "Proposed for inclusion", considered: "Considered for inclusion", declined: "Declined for inclusion" })[assignment];
  }
  function forkAssignment(eip) {
    if (!eip.fork) return "Fork history not reviewed here";
    const source = getSource(eip.fork.source_ref);
    return `${escape(assignmentLabel(eip.fork.assignment))} · ${link(sourceUrl(source.url), eip.fork.name)}`;
  }
  function dateTime(iso) {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC", hourCycle: "h23" }).format(new Date(iso)) + " UTC";
  }
  function activationLabel(activation) {
    // A clock passing the scheduled time never changes recorded activation status.
    if (activation.status === "scheduled") return activation.activation_at ? `Scheduled · ${dateTime(activation.activation_at)}` : "Scheduled · date not recorded";
    if (activation.status === "active") return activation.activation_at ? `Reported active · ${dateTime(activation.activation_at)}` : "Reported active in snapshot";
    return activation.status === "not_scheduled" ? "No date recorded" : "Unverified in this review";
  }

  function readFilters() {
    return { query: $("searchInput").value.slice(0, 160), kind: $("kindFilter").value, classification: $("classificationFilter").value };
  }
  function entrySearchText(entry) {
    return [entry.id, entry.ens, entry.display_term, entry.canonical.canonical_term, entry.summary, entry.boundary,
      ...getEips(entry).map((eip) => `${eip.number} EIP-${eip.number} ${eip.title} ${eip.fork?.name || ""}`)].join(" ");
  }
  function filteredEntries() {
    const { query, kind, classification } = readFilters();
    return state.entries.filter((entry) => matches(entrySearchText(entry), query)
      && (kind === "all" || entry.context_kind === kind)
      && (classification === "all" || entry.canonical.classification === classification));
  }
  function filteredEips() {
    const { query } = readFilters();
    return state.context.eips.filter((eip) => {
      const anchorTerms = state.entries.filter((entry) => entry.eip_refs.includes(eip.number))
        .map((entry) => `${entry.id} ${entry.ens} ${entry.display_term} ${entry.canonical.canonical_term}`).join(" ");
      return matches(`${eip.number} EIP-${eip.number} ${eip.title} ${eip.fork?.name || ""} ${anchorTerms}`, query);
    });
  }

  function renderEntries() {
    const entries = filteredEntries();
    const eips = filteredEips();
    $("resultCount").textContent = `${entries.length} of ${state.entries.length} registry entries · ${eips.length} related EIPs match the search`;
    $("anchorGrid").innerHTML = entries.length ? entries.map((entry) => {
      const eipStates = getEips(entry).map((eip) => `${eipLink(eip)} · ${escape(eip.document_status)}`).join("<br>");
      const assignments = getEips(entry).map((eip) => `${eipLink(eip)} · ${forkAssignment(eip)}`).join("<br>");
      return `<article class="entry-card${state.selected.has(entry.id) ? " selected" : ""}" id="entry-${escape(entry.id)}">
        <div class="entry-top"><p class="entry-kind">${escape(entry.context_kind)} source context</p><label class="compare-toggle"><input type="checkbox" data-compare="${escape(entry.id)}" ${state.selected.has(entry.id) ? "checked" : ""}><span>Compare<span class="sr-only"> ${escape(entry.display_term)}</span></span></label></div>
        <h2>${escape(entry.display_term)}</h2><p class="entry-handle">Naming handle · ${escape(entry.ens)}</p>
        <p class="entry-summary">${escape(entry.summary)}</p>
        <div class="entry-classification"><span>Vortik editorial classification</span><span class="classification">${escape(entry.canonical.classification)}</span></div>
        <dl class="entry-context"><div><dt>Related EIP document status</dt><dd>${eipStates || "No EIP mapped in this review"}</dd></div><div><dt>Related EIP fork assignment</dt><dd>${assignments || "No fork assignment mapped here"}</dd></div></dl>
        <p class="entry-boundary">${escape(entry.boundary)}</p>
        <div class="entry-links">${docLink(entry.anchor_path, "Source note")}${docLink(entry.sources_path, "Curated references")}${link("./" + localPath(entry.canonical.schema), "Schema JSON")}${link(entryPermalink(entry.id), "Entry link")}</div>
        <details class="source-details"><summary>${entry.source_refs.length} primary source${entry.source_refs.length === 1 ? "" : "s"} · reviewed ${escape(state.context.reviewed_at)}</summary><ul>${sourceLinks(entry.source_refs)}</ul></details>
      </article>`;
    }).join("") : `<div class="empty-state"><h2>No registry entries match.</h2><p>Try a term, an ENS handle or an EIP number. Related EIP results may still appear below.</p><div class="empty-actions"><button type="button" class="button" data-reset>Reset filters</button>${link(`./research.html?q=${encodeURIComponent(readFilters().query)}`, "Search the full proposal catalog →")}</div></div>`;
    renderEips(eips);
  }

  function entryPermalink(id) {
    const url = new URL("app.html", document.baseURI);
    url.searchParams.set("q", id);
    url.hash = `entry-${id}`;
    return url.href;
  }
  function renderEips(eips) {
    if (!eips.length) {
      $("eipTable").innerHTML = '<p class="status-notice">No related EIPs match this search. Reset the search to inspect the full proposal list.</p>';
      return;
    }
    $("eipTable").innerHTML = `<div class="table-scroll" tabindex="0" role="region" aria-label="Related EIP comparison"><table class="eip-table"><caption>${eips.length} related EIPs · reviewed ${escape(state.context.reviewed_at)} · context and classification filters apply to registry cards only</caption><thead><tr><th scope="col">Proposal</th><th scope="col">EIP document status</th><th scope="col">Fork assignment</th></tr></thead><tbody>${eips.map((eip) => `<tr><td>${eipLink(eip)}<br>${escape(eip.title)}</td><td>${escape(eip.document_status)}</td><td>${forkAssignment(eip)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function renderNetworks() {
    $("networkSummary").innerHTML = state.context.forks.map((fork) => `<article class="network-card"><h3>${escape(fork.name)} · network schedule</h3><dl>${fork.activations.map((activation) => `<div><dt>${escape(activation.network)}</dt><dd>${escape(activationLabel(activation))}</dd></div>`).join("")}</dl><p>As reviewed ${escape(state.context.reviewed_at)}. ${fork.source_refs.map((ref) => { const source = getSource(ref); return link(sourceUrl(source.url), source.title); }).join(" · ")}</p></article>`).join("");
  }

  function renderComparison() {
    const selected = state.entries.filter((entry) => state.selected.has(entry.id));
    $("comparisonJump").textContent = `Compare entries · ${selected.length} / 3`;
    $("downloadComparison").disabled = selected.length === 0;
    $("clearComparison").disabled = selected.length === 0;
    if (!selected.length) {
      $("comparisonContent").innerHTML = '<p class="comparison-empty">Use the “Compare” checkbox on an entry to add it here. Or <a href="./app.html?compare=epbs,inclusionlist#compare">start with ePBS and FOCIL</a>.</p>';
      return;
    }
    const rows = [
      ["Recorded term", (entry) => escape(entry.canonical.canonical_term)],
      ["Naming handle", (entry) => escape(entry.ens)],
      ["Vortik classification", (entry) => `${escape(entry.canonical.classification)}<small>Editorial classification of the registry entry.</small>`],
      ["Source context", (entry) => `${escape(entry.context_kind)}<small>${escape(entry.summary)}</small>`],
      ["EIP document status", (entry) => getEips(entry).map((eip) => `${eipLink(eip)} · ${escape(eip.document_status)}`).join("<br>") || "No EIP mapped in this review"],
      ["EIP fork assignment", (entry) => getEips(entry).map((eip) => `${eipLink(eip)} · ${forkAssignment(eip)}`).join("<br>") || "No fork assignment mapped here"],
      ["Related fork schedule", (entry) => getForks(entry).map((fork) => `<strong>${escape(fork.name)}</strong><ul>${fork.activations.map((activation) => `<li>${escape(activation.network)}: ${escape(activationLabel(activation))}</li>`).join("")}</ul>`).join("<br>") || "No related fork schedule reviewed here"],
      ["Interpretation boundary", (entry) => escape(entry.boundary)],
      ["Primary sources", (entry) => `<ul>${sourceLinks(entry.source_refs)}</ul>`]
    ];
    $("comparisonContent").innerHTML = `<div class="table-scroll" tabindex="0" role="region" aria-label="Selected entry comparison"><table><caption>Reviewed ${escape(state.context.reviewed_at)}. Related fork schedules do not imply that every referenced proposal will activate.</caption><thead><tr><th scope="col">Separate dimensions</th>${selected.map((entry) => `<th scope="col">${escape(entry.display_term)}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, render]) => `<tr><th scope="row">${escape(label)}</th>${selected.map((entry) => `<td>${render(entry)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function syncSelection() {
    document.querySelectorAll("input[data-compare]").forEach((input) => {
      input.checked = state.selected.has(input.dataset.compare);
      input.closest(".entry-card").classList.toggle("selected", input.checked);
    });
    renderComparison();
    writeUrl();
  }
  function writeUrl() {
    const { query, kind, classification } = readFilters();
    const url = new URL(location.href);
    url.search = "";
    if (query.trim()) url.searchParams.set("q", query.trim());
    if (kind !== "all") url.searchParams.set("kind", kind);
    if (classification !== "all") url.searchParams.set("classification", classification);
    if (state.selected.size) url.searchParams.set("compare", [...state.selected].join(","));
    try { history.replaceState(null, "", url); } catch { /* Static file previews can disable history. */ }
    $("shareLabel").hidden = true;
  }
  function applyFilters() { renderEntries(); writeUrl(); }
  function resetFilters() {
    $("searchInput").value = "";
    $("kindFilter").value = "all";
    $("classificationFilter").value = "all";
    applyFilters();
    $("searchInput").focus();
  }
  function announce(message) { $("actionStatus").textContent = message; }
  async function copyView() {
    writeUrl();
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(location.href);
      announce("View link copied. It includes the search, filters and comparison selection.");
    } catch {
      $("shareLabel").hidden = false;
      $("shareFallback").value = location.href;
      $("shareFallback").focus();
      $("shareFallback").select();
      announce("Copy the selected URL to share this view.");
    }
  }
  function downloadComparison() {
    if (!state.selected.size) return;
    const selected = state.entries.filter((entry) => state.selected.has(entry.id));
    const eipNumbers = new Set(selected.flatMap((entry) => entry.eip_refs));
    const eips = state.context.eips.filter((eip) => eipNumbers.has(eip.number));
    const forkNames = new Set(eips.map((eip) => eip.fork?.name).filter(Boolean));
    const forks = state.context.forks.filter((fork) => forkNames.has(fork.name));
    const sourceIds = new Set([...selected.flatMap((entry) => entry.source_refs), ...eips.flatMap((eip) => [eip.source_ref, eip.fork?.source_ref].filter(Boolean)), ...forks.flatMap((fork) => fork.source_refs)]);
    const payload = {
      export: "vortik.context-comparison/1.0.0", source_contract: state.context.contract,
      reviewed_at: state.context.reviewed_at, scope: state.context.scope, registry: state.context.registry,
      entries: selected.map(({ canonical, ...entry }) => ({ ...entry, registry_entry: canonical })),
      eips, forks, sources: state.context.sources.filter((source) => sourceIds.has(source.id))
    };
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `vortik-comparison-${state.context.reviewed_at}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    announce("Comparison JSON downloaded with review date, registry fields and primary sources.");
  }

  function bindControls() {
    $("filterForm").addEventListener("submit", (event) => { event.preventDefault(); applyFilters(); });
    $("searchInput").addEventListener("input", applyFilters);
    $("kindFilter").addEventListener("change", applyFilters);
    $("classificationFilter").addEventListener("change", applyFilters);
    $("resetFilters").addEventListener("click", resetFilters);
    $("copyView").addEventListener("click", copyView);
    $("downloadComparison").addEventListener("click", downloadComparison);
    $("clearComparison").addEventListener("click", () => { state.selected.clear(); syncSelection(); announce("Comparison cleared."); });
    $("anchorGrid").addEventListener("click", (event) => { if (event.target.closest("[data-reset]")) resetFilters(); });
    $("anchorGrid").addEventListener("change", (event) => {
      const input = event.target.closest("input[data-compare]");
      if (!input) return;
      const id = input.dataset.compare;
      if (input.checked && state.selected.size >= 3) {
        input.checked = false;
        announce("Three entries are already selected. Remove one to compare another.");
        return;
      }
      if (input.checked) state.selected.add(id); else state.selected.delete(id);
      syncSelection();
      announce(`${state.selected.size} of 3 comparison entries selected.`);
    });
  }

  async function init() {
    try {
      const [registry, context] = await Promise.all([fetchJson("./registry.json"), fetchJson("./protocol-context.json")]);
      state.entries = validateInputs(registry, context);
      state.registry = registry;
      state.context = context;
      const params = new URLSearchParams(location.search);
      $("searchInput").value = (params.get("q") || "").slice(0, 160);
      $("kindFilter").value = kinds.has(params.get("kind")) ? params.get("kind") : "all";
      $("classificationFilter").value = classifications.has(params.get("classification")) ? params.get("classification") : "all";
      const available = new Set(state.entries.map((entry) => entry.id));
      state.selected = new Set((params.get("compare") || "").split(",").filter((id) => available.has(id)).slice(0, 3));
      $("reviewedDate").textContent = context.reviewed_at;
      $("registryVersion").textContent = `v${registry.version}`;
      $("registryDate").textContent = registry.last_updated;
      bindControls();
      renderEntries();
      renderComparison();
      renderNetworks();
      $("staticFallback").hidden = true;
      $("enhancedExplorer").hidden = false;
      $("loadStatus").hidden = true;
      const hash = location.hash.slice(1);
      if (hash === "compare" || hash === "eips" || (hash.startsWith("entry-") && available.has(hash.slice(6)))) {
        requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
      }
    } catch {
      $("loadStatus").classList.add("warning");
      $("loadStatus").textContent = "Search and comparison could not load compatible published data. The complete source-note reference below remains available. Reload to try again.";
      $("enhancedExplorer").hidden = true;
      $("staticFallback").hidden = false;
    }
  }
  init();
})();
