import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const routes = ["index.html","servicos/index.html","portfolio/index.html","antes-e-depois/index.html","sobre/index.html","contato/index.html","faq/index.html","politica-de-privacidade/index.html","sitemap.xml","robots.txt","404.html"];
const problems = [];
for (const route of routes) {
  try { await access(path.join(root, route)); } catch { problems.push(`Missing: ${route}`); }
}
const home = await readFile(path.join(root, "index.html"), "utf8");
for (const required of ["<h1", "canonical", "og:title", "data-compare", "menu-toggle", "lang=\"pt-BR\""]) {
  if (!home.includes(required)) problems.push(`Home missing marker: ${required}`);
}
for (const image of ["lavamed-hero.jpg","lavamed-detail.jpg"]) {
  const info = await stat(path.join(root, "assets/images", image));
  if (info.size < 100_000) problems.push(`Image unexpectedly small: ${image}`);
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
