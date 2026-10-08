(() => {
  "use strict";

  // Empty until the maintainer supplies the public Web Analytics site token.
  // This is an ingestion identifier, never an account API credential.
  const SITE_TOKEN = "";
  const ORIGIN = "https://vortikregistry.github.io";
  const PATHS = new Set([
    "/vortik-open-schema/",
    "/vortik-open-schema/index.html",
    "/vortik-open-schema/research.html",
    "/vortik-open-schema/app.html"
  ]);

  if (!/^[a-f0-9]{32}$/i.test(SITE_TOKEN)) return;
  if (location.origin !== ORIGIN || !PATHS.has(location.pathname)) return;
  if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
  if (new URLSearchParams(location.search).get("analytics") === "off") return;
  if (document.getElementById("vortik-web-analytics")) return;

  const script = document.createElement("script");
  script.id = "vortik-web-analytics";
  script.type = "module";
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute("data-cf-beacon", JSON.stringify({ token: SITE_TOKEN, spa: false }));
  document.head.appendChild(script);
})();
