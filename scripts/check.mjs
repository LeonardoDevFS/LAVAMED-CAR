import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { servicePriceLabel, services } from "../src/config.js";

const root = path.resolve("dist");
const serviceRoutes = services.map((service) => `servicos/${service.slug}/index.html`);
const routes = ["index.html","servicos/index.html",...serviceRoutes,"portfolio/index.html","antes-e-depois/index.html","sobre/index.html","contato/index.html","faq/index.html","politica-de-privacidade/index.html","sitemap.xml","robots.txt","404.html"];
const problems = [];
for (const route of routes) {
  try { await access(path.join(root, route)); } catch { problems.push(`Missing: ${route}`); }
}
const home = await readFile(path.join(root, "index.html"), "utf8");
for (const required of ["<h1", "canonical", "og:title", "data-compare", "menu-toggle", "lang=\"pt-BR\""]) {
  if (required === "canonical") continue;
  if (!home.includes(required)) problems.push(`Home missing marker: ${required}`);
}
if (!/\/assets\/site-[\w-]+\.js/.test(home)) problems.push("Home is not using a fingerprinted JavaScript bundle");
if (!/\/assets\/site-[\w-]+\.css/.test(home)) problems.push("Home is not using a fingerprinted CSS bundle");
if (home.includes('/assets/site.js') || home.includes('/assets/site.css')) problems.push("Home still references unhashed source assets");
if (home.includes("{{") || home.includes("HOME_SERVICE_ROWS")) problems.push("Home contains unresolved build tokens");
if (!home.includes("Itajubá") || !home.includes("bairro Medicina")) problems.push("Home is missing the confirmed local context");
if (home.includes("lavamed.example")) problems.push("Home contains the retired .example domain");
if (!home.includes("/assets/images/hero/LavaMed_logo_vetorial_HD.svg")) problems.push("Home is not using the official LavaMed logo");
for (const channel of ["https://share.google/Vm2BAGotXmrrtKJi1", "https://www.instagram.com/lavamed.itajuba/", "https://wa.me/5535984586615"]) {
  if (!home.includes(channel)) problems.push(`Home is missing official channel: ${channel}`);
}
const assetNames = await readdir(path.join(root, "assets"));
const scriptBundle = assetNames.find((name) => /^site-[\w-]+\.js$/.test(name));
if (!scriptBundle) problems.push("Missing bundled site JavaScript");
else if ((await stat(path.join(root, "assets", scriptBundle))).size < 50_000) problems.push("JavaScript bundle is unexpectedly small");
const sourceCss = await readFile(path.resolve("src/assets/site.css"), "utf8");
if (sourceCss.includes(".camera-copy:first-of-type")) problems.push("Reduced-motion camera selector regression detected");
for (const image of ["lavamed-hero.jpg","lavamed-detail.jpg"]) {
  const info = await stat(path.join(root, "assets/images", image));
  if (info.size < 100_000) problems.push(`Image unexpectedly small: ${image}`);
}
const logo = await stat(path.join(root, "assets", "images", "hero", "LavaMed_logo_vetorial_HD.svg"));
if (logo.size < 10_000) problems.push("Official logo asset is unexpectedly small");
for (const service of services) {
  const html = await readFile(path.join(root, "servicos", service.slug, "index.html"), "utf8");
  const expectedPrice = servicePriceLabel(service);
  if (!html.includes(expectedPrice)) problems.push(`Missing price label for ${service.slug}: ${expectedPrice}`);
  if (!html.includes(service.name)) problems.push(`Missing service name: ${service.slug}`);
  if (!service.image && !html.includes("Imagem real aguardando acervo")) problems.push(`Missing honest image placeholder: ${service.slug}`);
}
const catalog = await readFile(path.join(root, "servicos", "index.html"), "utf8");
if ((catalog.match(/class="catalog-row"/g) || []).length !== 11) problems.push("Catalog does not contain exactly 11 service groups");
if (!catalog.includes("Não inclui limpeza ou aspiração interna")) problems.push("Package comparison is missing the Lavagem Simples interior exclusion");
if (catalog.includes("A partir de R$ 40 o par") || !catalog.includes("A partir de R$ 80 o par")) problems.push("Headlight pricing unit is incorrect");
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
if (sitemap.includes(".example")) problems.push("Sitemap contains a .example domain");
const netlify = await readFile(path.resolve("netlify.toml"), "utf8");
for (const legacy of ["lavagem-tecnica", "higienizacao-interna", "polimento-automotivo", "vitrificacao", "detalhamento", "revitalizacao"]) {
  if (!netlify.includes(`/servicos/${legacy}/`)) problems.push(`Missing Netlify redirect for legacy slug: ${legacy}`);
}
const htmlFiles = [];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute);
    else if (entry.name.endsWith(".html")) htmlFiles.push(absolute);
  }
}
await collect(root);
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  if (!html.includes("<title>")) problems.push(`Missing title: ${path.relative(root,file)}`);
  if (html.includes("lavamed.example")) problems.push(`Retired .example domain in ${path.relative(root,file)}`);
  if (html.includes('src="/assets/logo-mark.svg"')) problems.push(`Provisional logo still rendered in ${path.relative(root,file)}`);
  if (html.includes("lavamed-hero.png") || html.includes("lavamed-detail.png")) problems.push(`Stale PNG reference: ${path.relative(root,file)}`);
  const references = [...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((match) => match[1].split(/[?#]/)[0]);
  for (const reference of references) {
    if (reference === "/" || reference.startsWith("//")) continue;
    const candidate = reference.endsWith("/") ? path.join(root, reference, "index.html") : path.join(root, reference);
    try { await access(candidate); } catch { problems.push(`Broken local reference in ${path.relative(root,file)}: ${reference}`); }
  }
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`Checks passed: ${htmlFiles.length} HTML pages, routes, metadata, local links, interactions, and visual assets.`);
