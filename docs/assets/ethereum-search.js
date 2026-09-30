/* No search backend: filtering a pinned static metadata catalog runs in the browser. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const CONTRACT = "vortik.ethereum-catalog/1.0.0";
  const PAGE_SIZE = 50;
  const statuses = new Set(["Draft", "Review", "Last Call", "Final", "Stagnant", "Withdrawn", "Living"]);
  const types = new Set(["Standards Track", "Meta", "Informational"]);
  const categories = new Set(["Core", "Networking", "Interface", "ERC", null]);
  const sorts = new Set(["relevance", "number-desc", "number-asc", "title"]);
  const state = { catalog: null, proposals: [], registry: null, page: 1, pages: 1, results: [], typing: false, timer: null };
  const fields = { source: "proposalSource", status: "proposalStatus", type: "proposalType", category: "proposalCategory", sort: "proposalSort" };
  const sourceRules = {
    eips: { repository: "ethereum/EIPs", directory: "EIPS", prefix: "eip", origin: "https://eips.ethereum.org" },
    ercs: { repository: "ethereum/ERCs", directory: "ERCS", prefix: "erc", origin: "https://ercs.ethereum.org" }
  };

  function escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }
  function normalize(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function words(value) { return normalize(value).match(/[\p{L}\p{N}]+/gu) || []; }
  function link(url, label) { return `<a href="${escape(url)}">${escape(label)}</a>`; }
  function integer(value) { return Number.isSafeInteger(value) && value >= 0; }
  function text(value, max = 2000) { return typeof value === "string" && value.length > 0 && value.length <= max; }
  function hasOnlyKeys(value, allowed) {
    return value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).every((key) => allowed.includes(key));
  }
  async function readArtifact(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL(path, document.baseURI), { signal: controller.signal, cache: "no-cache" });
      if (!response.ok) throw new Error("Published artifact unavailable");
      return await response.json();
    } finally { clearTimeout(timeout); }
  }

  function validateCatalog(catalog) {
    if (!hasOnlyKeys(catalog, ["$schema", "contract", "reviewed_at", "scope", "provenance", "coverage", "sources", "proposals"])
      || catalog.contract !== CONTRACT || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.reviewed_at)
      || !text(catalog.scope) || !Array.isArray(catalog.proposals) || !catalog.proposals.length || catalog.proposals.length > 20000
      || !Array.isArray(catalog.sources) || catalog.sources.length !== 2
      || catalog.provenance?.method !== "pinned-git-object-frontmatter" || catalog.provenance?.bodies_indexed !== false
      || !/^[a-f0-9]{64}$/.test(catalog.provenance?.content_sha256)) throw new Error("Incompatible catalog");
    const coverage = catalog.coverage;
    if (!coverage || coverage.repositories !== 2 || coverage.records !== catalog.proposals.length
      || ![coverage.eips, coverage.ercs, coverage.scanned_files, coverage.moved_stubs, coverage.mirrored_documents].every(integer)
      || coverage.eips + coverage.ercs !== coverage.records || !Array.isArray(coverage.excluded_files)
      || !Array.isArray(coverage.duplicate_numbers) || !coverage.duplicate_numbers.every(integer)
      || new Set(coverage.duplicate_numbers).size !== coverage.duplicate_numbers.length) throw new Error("Invalid catalog coverage");
    const sources = new Map();
    for (const source of catalog.sources) {
      const rule = Object.hasOwn(sourceRules, source.id) ? sourceRules[source.id] : null;
      if (!rule || sources.has(source.id) || source.repository !== rule.repository || source.directory !== rule.directory
        || !/^[a-f0-9]{40}$/.test(source.commit) || source.license !== "CC0-1.0"
        || source.source_url !== `https://github.com/${rule.repository}/tree/${source.commit}/${rule.directory}`
        || source.license_url !== `https://github.com/${rule.repository}/blob/${source.commit}/LICENSE.md`
        || ![source.files_seen, source.canonical_records, source.moved_stubs, source.mirrored_documents].every(integer)) throw new Error("Invalid source pin");
      sources.set(source.id, source);
    }
    const ids = new Set(), numbers = new Set(), counts = { eips: 0, ercs: 0 };
    const proposals = catalog.proposals.map((proposal) => {
      const rule = Object.hasOwn(sourceRules, proposal.source_ref) ? sourceRules[proposal.source_ref] : null;
      const source = sources.get(proposal.source_ref);
      if (!hasOnlyKeys(proposal, ["id", "number", "title", "description", "status", "type", "category", "url", "source_ref", "path", "commit"])
        || !rule || !source || !integer(proposal.number) || proposal.number < 1
        || proposal.id !== `${rule.prefix}-${proposal.number}` || ids.has(proposal.id) || numbers.has(proposal.number)
        || !text(proposal.title) || (proposal.description !== null && !text(proposal.description))
        || !statuses.has(proposal.status) || !types.has(proposal.type) || !categories.has(proposal.category)
        || proposal.commit !== source.commit || proposal.path !== `${rule.directory}/${rule.prefix}-${proposal.number}.md`
        || proposal.url !== `${rule.origin}/${rule.directory}/${rule.prefix}-${proposal.number}`) throw new Error("Invalid proposal metadata");
      ids.add(proposal.id); numbers.add(proposal.number); counts[proposal.source_ref]++;
      const titleWords = words(proposal.title);
      const searchWords = new Set([...titleWords, ...words(proposal.description), rule.prefix]);
      const initialism = titleWords.filter((word) => !["a", "an", "and", "for", "in", "of", "the", "to", "with"].includes(word)).map((word) => word[0]).join("");
      if (initialism.length >= 3 && initialism.length <= 8) searchWords.add(initialism);
      // ENS is a conventional abbreviation of the named service in ERC-137's title.
      if (/ethereum (domain )?name service/.test(normalize(proposal.title))) searchWords.add("ens");
      return { ...proposal, searchWords: [...searchWords], titleWords, normalizedTitle: normalize(proposal.title) };
    });
    if (counts.eips !== coverage.eips || counts.ercs !== coverage.ercs
      || catalog.sources.some((source) => counts[source.id] !== source.canonical_records)
      || catalog.sources.reduce((sum, source) => sum + source.files_seen, 0) !== coverage.scanned_files
      || catalog.sources.reduce((sum, source) => sum + source.moved_stubs, 0) !== coverage.moved_stubs
      || catalog.sources.reduce((sum, source) => sum + source.mirrored_documents, 0) !== coverage.mirrored_documents) throw new Error("Catalog counts disagree");
    return proposals;
  }

  function validateRegistry(registry) {
    if (!Array.isArray(registry?.anchors)) return null;
    const entries = registry.anchors.filter((entry) => /^[a-z][a-z0-9-]*$/.test(entry.id)
      && text(entry.ens, 255) && text(entry.canonical_term, 1000));
    return entries.length === registry.anchors.length ? entries : null;
  }
  function addOptions(id, values, emptyLabel) {
    $(id).innerHTML = `<option value="all">${escape(emptyLabel)}</option>` + values.map((value) => `<option value="${escape(value === null ? "none" : value)}">${escape(value === null ? "No category" : value)}</option>`).join("");
  }
  function populateFilters() {
    addOptions("proposalStatus", [...new Set(state.proposals.map((proposal) => proposal.status))].sort(), "All statuses");
    addOptions("proposalType", [...new Set(state.proposals.map((proposal) => proposal.type))].sort(), "All types");
    const values = [...new Set(state.proposals.map((proposal) => proposal.category))].filter(Boolean).sort();
    if (state.proposals.some((proposal) => proposal.category === null)) values.push(null);
    addOptions("proposalCategory", values, "All categories");
  }
  function validField(id, value) {
    return [...$(id).options].some((option) => option.value === value) ? value : (id === "proposalSort" ? "relevance" : "all");
  }
  function restoreUrl() {
    clearTimeout(state.timer); state.typing = false;
    const params = new URLSearchParams(location.search);
    $("proposalQuery").value = (params.get("q") || "").slice(0, 160);
    for (const [name, id] of Object.entries(fields)) $(id).value = validField(id, params.get(name));
    const page = params.get("page") || "1";
    state.page = /^\d{1,6}$/.test(page) ? Math.max(1, Number(page)) : 1;
  }
  function readFilters() {
    const filter = { q: $("proposalQuery").value.trim().slice(0, 160) };
    for (const [name, id] of Object.entries(fields)) filter[name] = validField(id, $(id).value);
    return filter;
  }
  function queryTokens(query) {
    // Both historic EIP-N and canonical ERC-N resolve to proposal number N.
    return words(query.replace(/\b(?:eip|erc)\s*[-:#]?\s*(\d+)\b/gi, "$1"));
  }
  function relevance(proposal, tokens, query) {
    let score = proposal.normalizedTitle === normalize(query) ? 100 : 0;
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        if (proposal.number !== Number(token)) return -1;
        score += 1000;
        continue;
      }
      const match = (word) => token.length <= 3 ? word === token : word.startsWith(token);
      if (!proposal.searchWords.some(match)) return -1;
      score += proposal.titleWords.some(match) ? 10 : 1;
    }
    return score;
  }
  function findResults(filter) {
    const tokens = queryTokens(filter.q);
    return state.proposals.filter((proposal) => (filter.source === "all" || proposal.source_ref === filter.source)
      && (filter.status === "all" || proposal.status === filter.status)
      && (filter.type === "all" || proposal.type === filter.type)
      && (filter.category === "all" || (filter.category === "none" ? proposal.category === null : proposal.category === filter.category)))
      .map((proposal) => ({ proposal, score: relevance(proposal, tokens, filter.q) }))
      .filter((result) => result.score >= 0)
      .sort((a, b) => {
        if (filter.sort === "title") return a.proposal.title.localeCompare(b.proposal.title, "en") || a.proposal.number - b.proposal.number;
        if (filter.sort === "number-asc") return a.proposal.number - b.proposal.number;
        if (filter.sort === "number-desc") return b.proposal.number - a.proposal.number;
        return b.score - a.score || b.proposal.number - a.proposal.number;
      }).map((result) => result.proposal);
  }
  function pinUrl(proposal) {
    const source = state.catalog.sources.find((record) => record.id === proposal.source_ref);
    return `https://github.com/${source.repository}/blob/${source.commit}/${proposal.path}`;
  }
  function isEnsQuery(query) {
    return /\bens(?:ip)?\b/.test(normalize(query)) || /\bethereum (?:domain )?name service\b/.test(normalize(query)) || /(?:^|\s)[^\s]+\.eth(?:$|\s)/i.test(query);
  }
  function renderEns(query) {
    $("ensContext").hidden = !isEnsQuery(query);
    if ($("ensContext").hidden) return;
    const names = query.match(/(?:^|\s)([^\s]+\.eth)(?=$|\s)/gi)?.map((value) => value.trim().toLowerCase()) || [];
    const entries = (state.registry || []).filter((entry) => names.includes(entry.ens.toLowerCase()));
    $("ensMessage").textContent = names.length
      ? (entries.length ? "This name has a curated Vortik reference. Proposal metadata and primary ENS documentation are separate resources below." : (state.registry ? "This name has no entry in the curated Vortik registry. Explore the naming specifications and official ENS documentation." : "The optional curated-name reference could not load. Official proposal metadata and ENS documentation remain available."))
      : "Explore ENS-related proposal metadata, the original naming specification, and current ENS documentation.";
    $("ensRegistryMatches").innerHTML = entries.map((entry) => link(`./app.html?q=${encodeURIComponent(entry.id)}#entry-${entry.id}`, `${entry.ens} · ${entry.canonical_term}`)).join("<br>")
      + `<p class="ens-spec-link">${link("./research.html?q=137", "Original naming specification · ERC-137")} · <button type="button" class="inline-button" data-query="ENS">Search ENS proposals</button></p>`;
  }

  function render() {
    const filter = readFilters();
    state.results = findResults(filter);
    state.pages = Math.max(1, Math.ceil(state.results.length / PAGE_SIZE));
    state.page = Math.min(state.page, state.pages);
    const start = (state.page - 1) * PAGE_SIZE;
    const page = state.results.slice(start, start + PAGE_SIZE);
    $("proposalResultCount").textContent = state.results.length
      ? `${state.results.length.toLocaleString("en")} matching proposal${state.results.length === 1 ? "" : "s"} · showing ${start + 1}–${start + page.length}`
      : "No proposal metadata matches these filters.";
    $("proposalResults").innerHTML = page.length ? page.map((proposal) => `<article class="proposal-result" id="proposal-${escape(proposal.id)}">
      <div class="proposal-identity"><span class="source-label">${proposal.source_ref === "eips" ? "EIP repository" : "ERC repository"}</span>${link(proposal.url, proposal.id.toUpperCase())}</div>
      <div class="proposal-description"><h2>${link(proposal.url, proposal.title)}</h2>${proposal.description ? `<p>${escape(proposal.description)}</p>` : ""}<div class="proposal-links">${link(proposal.url, "Official document ↗")}${link(pinUrl(proposal), "Pinned source ↗")}</div></div>
      <dl class="proposal-metadata"><div><dt>Document status</dt><dd>${escape(proposal.status)}</dd></div><div><dt>Type</dt><dd>${escape(proposal.type)}</dd></div><div><dt>Category</dt><dd>${escape(proposal.category || "Not specified")}</dd></div></dl>
    </article>`).join("") : `<div class="empty-state"><h2>No matching proposal metadata.</h2><p>Try a proposal number, fewer keywords, or broader filters. The catalog searches titles and supplied descriptions, not full document text.</p><div class="empty-actions"><button class="button" type="button" data-reset-search>Reset search and filters</button><button class="button" type="button" data-clear-metadata>Keep query, clear filters</button>${isEnsQuery(filter.q) ? '<button class="button" type="button" data-query="ENS">Search ENS proposals</button>' : ""}</div><p class="section-note">For material outside this snapshot, open the <a href="https://eips.ethereum.org/all">official EIP index</a> or <a href="https://ercs.ethereum.org/">official ERC index</a>.</p></div>`;
    $("previousProposals").disabled = state.page <= 1;
    $("nextProposals").disabled = state.page >= state.pages;
    $("proposalPageLabel").textContent = `Page ${state.page} of ${state.pages} · ${PAGE_SIZE} results per page`;
    $("proposalPagination").hidden = state.results.length <= PAGE_SIZE;
    renderEns(filter.q);
    $("proposalShareLabel").hidden = true;
  }
  function writeUrl(mode, preserveHash = false) {
    const filter = readFilters();
    const url = new URL(location.href);
    url.search = "";
    if (!preserveHash || url.hash !== "#provenance") url.hash = "";
    if (filter.q) url.searchParams.set("q", filter.q);
    for (const name of Object.keys(fields)) if (filter[name] !== (name === "sort" ? "relevance" : "all")) url.searchParams.set(name, filter[name]);
    if (state.page > 1) url.searchParams.set("page", String(state.page));
    if (url.href === location.href) return;
    try { history[mode === "push" ? "pushState" : "replaceState"]({ vortikSearch: true }, "", url); } catch { /* File previews can disable history. */ }
  }
  function apply(mode = "push", resetPage = true) {
    clearTimeout(state.timer);
    if (resetPage) state.page = 1;
    render(); writeUrl(mode);
  }
  function clearFilters(keepQuery = false) {
    if (!keepQuery) $("proposalQuery").value = "";
    for (const [name, id] of Object.entries(fields)) $(id).value = name === "sort" ? "relevance" : "all";
    state.typing = false; apply(); $("proposalQuery").focus();
  }
  function announce(message) { $("proposalActionStatus").textContent = message; }
  async function copyView() {
    apply("replace", false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(location.href);
      announce("Search link copied with the query, filters, sort and page.");
    } catch {
      $("proposalShareLabel").hidden = false;
      $("proposalShareFallback").value = location.href;
      $("proposalShareFallback").focus(); $("proposalShareFallback").select();
      announce("Copy the selected URL to share this search.");
    }
  }
  function renderProvenance() {
    const catalog = state.catalog, coverage = catalog.coverage;
    $("catalogDate").textContent = catalog.reviewed_at;
    $("catalogCount").textContent = `${coverage.records.toLocaleString("en")} canonical records · ${coverage.eips} EIPs + ${coverage.ercs} ERCs`;
    $("catalogProvenance").innerHTML = `<p>${escape(catalog.scope)}</p><div class="catalog-source-grid">${catalog.sources.map((source) => `<article class="catalog-source"><h3>${link(source.source_url, source.repository)}</h3><p>${source.canonical_records.toLocaleString("en")} canonical records · ${source.files_seen.toLocaleString("en")} files inspected</p><p class="source-pin">Commit ${link(source.source_url, source.commit)}</p><p>${link(source.license_url, source.license + " metadata license")}</p></article>`).join("")}</div><p class="section-note">${coverage.scanned_files.toLocaleString("en")} numbered Markdown files inspected. ${coverage.moved_stubs} moved stubs and ${coverage.mirrored_documents} mirrored document${coverage.mirrored_documents === 1 ? "" : "s"} are represented by their canonical record, not duplicated. ${coverage.excluded_files.length} files excluded. Full proposal bodies and unmerged proposals are outside this catalog. The snapshot date describes the import, not a manual technical review of every proposal.</p>`;
  }
  function bindControls() {
    $("proposalForm").addEventListener("submit", (event) => { event.preventDefault(); apply(state.typing ? "replace" : "push"); state.typing = false; });
    $("proposalQuery").addEventListener("input", () => {
      clearTimeout(state.timer);
      state.timer = setTimeout(() => { apply(state.typing ? "replace" : "push"); state.typing = true; }, 120);
    });
    $("proposalQuery").addEventListener("blur", () => { state.typing = false; });
    for (const id of Object.values(fields)) $(id).addEventListener("change", () => { state.typing = false; apply(); });
    $("resetProposalFilters").addEventListener("click", () => clearFilters());
    $("copyProposalView").addEventListener("click", copyView);
    for (const [id, direction] of [["previousProposals", -1], ["nextProposals", 1]]) $(id).addEventListener("click", () => {
      state.page = Math.max(1, Math.min(state.pages, state.page + direction)); state.typing = false; apply("push", false);
      $("proposalResultCount").focus(); $("proposalResultCount").scrollIntoView({ block: "start" });
    });
    $("researchSearch").addEventListener("click", (event) => {
      if (event.target.closest("[data-reset-search]")) clearFilters();
      if (event.target.closest("[data-clear-metadata]")) clearFilters(true);
      const suggested = event.target.closest("[data-query]");
      if (suggested) { $("proposalQuery").value = suggested.dataset.query; clearFilters(true); }
    });
    window.addEventListener("popstate", () => { restoreUrl(); render(); writeUrl("replace", true); });
  }
  async function init() {
    const [catalogResult, registryResult] = await Promise.allSettled([readArtifact("./ethereum-catalog.json"), readArtifact("./registry.json")]);
    try {
      if (catalogResult.status !== "fulfilled") throw new Error("Catalog unavailable");
      state.proposals = validateCatalog(catalogResult.value);
      state.catalog = catalogResult.value;
      state.registry = registryResult.status === "fulfilled" ? validateRegistry(registryResult.value) : null;
      populateFilters(); restoreUrl(); bindControls(); render(); renderProvenance(); writeUrl("replace", true);
      $("researchSearch").hidden = false; $("catalogStatus").hidden = true; $("researchFallback").hidden = true;
      if (location.hash === "#provenance") requestAnimationFrame(() => $("provenance").scrollIntoView());
    } catch {
      $("catalogStatus").classList.add("warning");
      $("catalogStatus").textContent = "The published catalog could not load or its metadata failed consistency checks. Use the official indexes below, or reload to try again.";
      $("catalogDate").textContent = "unavailable";
      $("researchSearch").hidden = true; $("researchFallback").hidden = false;
    }
  }
  init();
})();
