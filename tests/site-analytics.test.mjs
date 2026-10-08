import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

const source = readFileSync(new URL("../docs/assets/site-analytics.js", import.meta.url), "utf8");
const fixtureToken = "a".repeat(32);

function browser({ token, url = "https://vortikregistry.github.io/vortik-open-schema/", navigator = {}, window = {} } = {}) {
  const scripts = [];
  const document = {
    getElementById: (id) => scripts.find((script) => script.id === id),
    createElement: (tag) => {
      assert.equal(tag, "script");
      return { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
    },
    head: { appendChild(script) { scripts.push(script); } }
  };
  const context = vm.createContext({ document, location: new URL(url), navigator, window, URLSearchParams });
  const code = token === undefined ? source : source.replace('const SITE_TOKEN = "";', `const SITE_TOKEN = ${JSON.stringify(token)};`);
  return { scripts, run: () => vm.runInContext(code, context) };
}

test("checked-in website analytics is inert; an invalid token cannot load a provider", () => {
  assert.match(source, /const SITE_TOKEN = "";/);
  for (const token of [undefined, "", "not-a-token", "a".repeat(31), "a".repeat(33), '<script>bad</script>']) {
    const instance = browser({ token });
    instance.run();
    assert.deepEqual(instance.scripts, []);
  }
});

test("configured production pages install one fixed provider with SPA tracking disabled", () => {
  for (const path of ["", "index.html", "research.html?q=private-marker", "app.html?compare=epbs,inclusionlist#compare"]) {
    const instance = browser({ token: fixtureToken, url: `https://vortikregistry.github.io/vortik-open-schema/${path}` });
    instance.run();
    instance.run();
    assert.equal(instance.scripts.length, 1);
    const script = instance.scripts[0];
    assert.equal(script.type, "module");
    assert.equal(script.src, "https://static.cloudflareinsights.com/beacon.min.js");
    assert.deepEqual(JSON.parse(script.attributes["data-cf-beacon"]), { token: fixtureToken, spa: false });
    assert.equal(JSON.stringify(script).includes("private-marker"), false);
  }
});

test("previews, HTTP, other repositories and unsupported paths cannot load analytics", () => {
  for (const url of ["http://vortikregistry.github.io/vortik-open-schema/", "http://localhost:8080/vortik-open-schema/", "https://example.org/vortik-open-schema/", "https://vortikregistry.github.io/other/", "https://vortikregistry.github.io/vortik-open-schema/market.html"]) {
    const instance = browser({ token: fixtureToken, url });
    instance.run();
    assert.deepEqual(instance.scripts, []);
  }
});

test("browser privacy signals and per-page opt-out prevent provider loading", () => {
  for (const options of [{ navigator: { doNotTrack: "1" } }, { navigator: { globalPrivacyControl: true } }, { window: { doNotTrack: "1" } }, { url: "https://vortikregistry.github.io/vortik-open-schema/research.html?q=ENS&analytics=off" }]) {
    const instance = browser({ token: fixtureToken, ...options });
    instance.run();
    assert.deepEqual(instance.scripts, []);
  }
});

test("all three user entry pages load the inert adapter once and explain measurement", () => {
  for (const page of ["index.html", "research.html", "app.html"]) {
    const html = readFileSync(new URL(`../docs/${page}`, import.meta.url), "utf8");
    assert.equal(html.split('src="./assets/site-analytics.js"').length - 1, 1);
    assert.match(html, /traffic-measurement\.md/);
    assert.match(html, /href="https:\/\/x\.com\/VortikRegistry"/);
    assert.equal(html.includes("static.cloudflareinsights.com"), false);
  }
});
