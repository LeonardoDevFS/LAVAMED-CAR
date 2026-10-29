import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { domainConfig, normalizeSiteUrl } from "../src/site-config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const verificationToken = "lavamed-search-console-test-token";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function runBuild(siteUrl = "", verification = "") {
  const environment = { ...process.env };
  if (siteUrl) environment.SITE_URL = siteUrl;
  else delete environment.SITE_URL;
  if (verification) environment.GOOGLE_SITE_VERIFICATION = verification;
  else delete environment.GOOGLE_SITE_VERIFICATION;

  const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
    cwd: root,
    env: environment,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(`Build failed for ${siteUrl || "local mode"}:\n${result.stdout}\n${result.stderr}`);
  }
}

async function collectHtml(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtml(absolute));
    else if (entry.name.endsWith(".html")) files.push(absolute);
  }
  return files;
}

function routeFor(file) {
  const relative = path.relative(output, file).replaceAll("\\", "/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
}

function valueOf(html, pattern) {
  return html.match(pattern)?.[1] || "";
}

async function validateScenario(name, siteUrl) {
  const indexable = Boolean(siteUrl);
  runBuild(siteUrl, name === "secondary" ? verificationToken : "");
  const files = await collectHtml(output);
  invariant(files.length === 20, `${name}: expected 20 HTML files, found ${files.length}`);

  const titles = new Set();
  const descriptions = new Set();
  for (const file of files) {
    const html = await readFile(file, "utf8");
    const route = routeFor(file);
    const is404 = route === "/404.html";
    const canonical = valueOf(html, /<link rel="canonical" href="([^"]+)">/);
    const ogUrl = valueOf(html, /<meta property="og:url" content="([^"]+)">/);
    const ogImage = valueOf(html, /<meta property="og:image" content="([^"]+)">/);
    const robots = valueOf(html, /<meta name="robots" content="([^"]+)">/);
    const title = valueOf(html, /<title>([^<]+)<\/title>/);
    const description = valueOf(html, /<meta name="description" content="([^"]+)">/);
    const languageAlternate = valueOf(html, /<link rel="alternate" hreflang="pt-BR" href="([^"]+)">/);

    invariant(title, `${name}: missing title in ${route}`);
    invariant(description, `${name}: missing description in ${route}`);
    invariant(!titles.has(title), `${name}: duplicate title: ${title}`);
    invariant(!descriptions.has(description), `${name}: duplicate description: ${description}`);
    titles.add(title);
    descriptions.add(description);

    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));

    if (indexable && !is404) {
      const expected = `${siteUrl}${route}`;
      invariant(canonical === expected, `${name}: canonical mismatch in ${route}`);
      invariant(ogUrl === expected, `${name}: og:url mismatch in ${route}`);
      invariant(ogImage.startsWith(`${siteUrl}/`), `${name}: Open Graph image is not absolute in ${route}`);
      invariant(robots === "index,follow,max-image-preview:large", `${name}: indexability mismatch in ${route}`);
      invariant(languageAlternate === expected, `${name}: pt-BR alternate mismatch in ${route}`);
      invariant(schemas.some((schema) => schema["@type"] === "WebSite"), `${name}: WebSite schema missing in ${route}`);
      invariant(schemas.some((schema) => schema["@type"] === "WebPage"), `${name}: WebPage schema missing in ${route}`);
    } else {
      invariant(!canonical, `${name}: canonical must be absent in ${route}`);
      invariant(!ogUrl, `${name}: og:url must be absent in ${route}`);
      invariant(!languageAlternate, `${name}: hreflang must be absent in ${route}`);
      invariant(robots === (is404 ? "noindex,follow" : "noindex,nofollow"), `${name}: noindex mismatch in ${route}`);
      if (!indexable) invariant(ogImage.startsWith("/"), `${name}: local Open Graph image must stay relative in ${route}`);
    }

    invariant(html.includes('<meta property="og:image:width" content="1200">'), `${name}: Open Graph width missing in ${route}`);
    invariant(html.includes('<meta property="og:image:height" content="630">'), `${name}: Open Graph height missing in ${route}`);
    invariant(schemas.some((schema) => schema["@type"] === "AutoWash"), `${name}: AutoWash schema missing in ${route}`);
    if (!indexable) invariant(!schemas.some((schema) => schema["@type"] === "WebSite" || schema["@type"] === "WebPage"), `${name}: local build leaked absolute website schema in ${route}`);

    const otherDomains = [domainConfig.secondaryUrl, domainConfig.primaryUrl].filter((candidate) => candidate !== siteUrl);
    for (const other of otherDomains) invariant(!html.includes(other), `${name}: inactive domain leaked into ${route}: ${other}`);
  }

  const sitemap = await readFile(path.join(output, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const robots = await readFile(path.join(output, "robots.txt"), "utf8");
  if (indexable) {
    invariant(locations.length === 19, `${name}: expected 19 sitemap URLs, found ${locations.length}`);
    invariant(locations.every((location) => location.startsWith(`${siteUrl}/`)), `${name}: sitemap contains another origin`);
    invariant(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), `${name}: robots.txt sitemap mismatch`);
    invariant(robots.includes("Allow: /"), `${name}: robots.txt must allow crawling`);
  } else {
    invariant(locations.length === 0, `${name}: local sitemap must not publish URLs`);
    invariant(robots === "User-agent: *\nDisallow: /\n", `${name}: local robots.txt must block indexing`);
  }

  const home = await readFile(path.join(output, "index.html"), "utf8");
  if (name === "secondary") {
    invariant(home.includes(`<meta name="google-site-verification" content="${verificationToken}">`), "secondary: Search Console verification tag missing");
  }
  console.log(`✓ ${name}: ${files.length} HTML files, metadata, JSON-LD, sitemap and robots.txt`);
}

invariant(domainConfig.netlifySiteName === "lavamed", "Unexpected desired Netlify site name");
invariant(domainConfig.secondaryUrl === "https://lavamed.netlify.app", "Unexpected secondary URL");
invariant(domainConfig.primaryUrl === "https://lavamed.com.br", "Unexpected production URL");
invariant(normalizeSiteUrl("https://lavamed.com.br/") === domainConfig.primaryUrl, "URL normalization failed");
const netlifyConfig = await readFile(path.join(root, "netlify.toml"), "utf8");
invariant(netlifyConfig.includes(`[context.production.environment]\n  SITE_URL = "${domainConfig.primaryUrl}"`), "Netlify production must use the primary domain");
for (const context of ["deploy-preview", "branch-deploy", "dev"]) {
  invariant(netlifyConfig.includes(`[context.${context}.environment]\n  SITE_URL = ""`), `${context} must remain noindex`);
}
for (const origin of [domainConfig.secondaryUrl, domainConfig.wwwUrl]) {
  const redirect = netlifyConfig.split("[[redirects]]").find((block) => block.includes(`from = "${origin}/*"`));
  invariant(redirect?.includes(`to = "${domainConfig.primaryUrl}/:splat"`) && redirect.includes("status = 301") && redirect.includes("force = true"), `${origin} must redirect permanently to the primary domain`);
}
for (const invalid of ["http://lavamed.com.br", "https://lavamed.com.br/path", "not-a-url"]) {
  let rejected = false;
  try { normalizeSiteUrl(invalid); } catch { rejected = true; }
  invariant(rejected, `Invalid SITE_URL was accepted: ${invalid}`);
}

let failure;
try {
  await validateScenario("local", "");
  await validateScenario("secondary", domainConfig.secondaryUrl);
  await validateScenario("production", domainConfig.primaryUrl);
} catch (error) {
  failure = error;
} finally {
  try { runBuild(""); } catch (restoreError) { failure ||= restoreError; }
}

if (failure) throw failure;
console.log("Domain scenarios passed; dist restored to local noindex mode.");
