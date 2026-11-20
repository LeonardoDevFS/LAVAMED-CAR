import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { business, services, servicePriceLabel, whatsappUrl } from "../src/config.js";
import { domainConfig } from "../src/site-config.js";

const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const textOf = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attribute = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] || "");

// Inspeciona o artefato publicado, sem executar JavaScript da aplicação.
export async function checkSeo(root, origin) {
  const problems = [];
  const require = (ok, message) => { if (!ok) problems.push(message); };
  const pages = new Map();
  async function collect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await collect(file);
      else if (entry.name.endsWith(".html")) {
        const relative = path.relative(root, file).replaceAll("\\", "/");
        const route = `/${relative.replace(/index\.html$/, "")}`;
        pages.set(route, await readFile(file, "utf8"));
      }
    }
  }
  await collect(root);
  const routes = [...pages.keys()].filter((route) => route !== "/404.html");
  require(!origin || origin === domainConfig.primaryUrl, "SEO: only the primary domain can be indexable");
  const socialPath = "/assets/images/hero/lavamed-social.jpg";
  const social = await sharp(path.join(root, socialPath)).metadata();
  require(social.width === 1200 && social.height === 630 && social.format === "jpeg", "SEO: social image must match its declared dimensions/type");
  const graph = new Map();
  const titles = new Set();
  const descriptions = new Set();
  for (const [route, html] of pages) {
    const indexable = Boolean(origin) && route !== "/404.html";
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || "";
    require(textOf(main).length > 70, `SEO: missing static main content in ${route}`);
    const headings = [...main.matchAll(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/g)];
    require(headings.length === 1 && textOf(headings[0]?.[2] || "").length > 5, `SEO: missing/duplicate semantic h1 in ${route}`);
    require(!/sr-only|aria-hidden="true"|\bhidden\b|display\s*:\s*none/.test(headings[0]?.[1] || ""), `SEO: hidden h1 in ${route}`);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
    require(title.length > 10 && !titles.has(title), `SEO: missing/duplicate title in ${route}`);
    require(description.length >= 35 && description.length <= 190 && !descriptions.has(description), `SEO: missing, duplicate or unsuitable description in ${route}`);
    titles.add(title);
    descriptions.add(description);
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)">/g)];
    require(indexable ? canonicals.length === 1 && canonicals[0][1] === `${origin}${route}` : !canonicals.length, `SEO: canonical mismatch in ${route}`);
    require(html.includes(`name="robots" content="${indexable ? "index,follow,max-image-preview:large" : route === "/404.html" ? "noindex,follow" : "noindex,nofollow"}"`), `SEO: wrong indexability in ${route}`);
    require(html.includes(`property="og:image" content="${origin || ""}${socialPath}"`) && html.includes(`name="twitter:image" content="${origin || ""}${socialPath}"`), `SEO: inconsistent social image in ${route}`);
    for (const img of html.match(/<img\b[^>]*>/g) || []) {
      require(/\balt="/.test(img) && Number(attribute(img, "width")) > 0 && Number(attribute(img, "height")) > 0, `SEO: image missing alt/dimensions in ${route}`);
    }
    const links = [];
    for (const tag of html.match(/<a\b[^>]*>/g) || []) {
      const href = attribute(tag, "href");
      if (!href || /^(mailto|tel):/.test(href)) continue;
      if (/\bdata-booking\b/.test(tag)) {
        const service = services.find((item) => item.slug === attribute(tag, "data-service"));
        require(href === whatsappUrl(service || ""), `SEO: static WhatsApp context missing in ${route}`);
      }
      const url = new URL(href, `${domainConfig.primaryUrl}${route}`);
      if (url.origin !== domainConfig.primaryUrl || url.pathname.startsWith("/assets/")) continue;
      require(pages.has(url.pathname), `SEO: broken page link ${route} -> ${href}`);
      if (pages.has(url.pathname)) {
        links.push(url.pathname);
        if (url.hash) require(pages.get(url.pathname).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `SEO: missing fragment ${route} -> ${href}`);
      }
    }
    graph.set(route, links);
    let schemas = [];
    try {
      schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    } catch { problems.push(`SEO: invalid JSON-LD in ${route}`); }
    const company = schemas.find((item) => item["@type"] === "AutoWash");
    require(company?.name === business.name && company?.telephone === `+${business.whatsapp}`, `SEO: business identity mismatch in ${route}`);
    require(company?.address?.addressLocality === business.city && company?.address?.addressRegion === business.state && company?.address?.addressCountry === "BR", `SEO: confirmed location mismatch in ${route}`);
    require(company?.address?.streetAddress === (business.address || undefined) && company?.openingHours === (business.openingHours || undefined), `SEO: unconfirmed address/hours in ${route}`);
    require(company?.sameAs?.length === 1 && company.sameAs[0] === business.instagram && company?.hasMap === business.mapsUrl, `SEO: official profiles mismatch in ${route}`);
    require(!company?.priceRange, `SEO: unsupported maximum price in ${route}`);
    const rejectInvented = (value) => {
      if (!value || typeof value !== "object") return;
      for (const [key, child] of Object.entries(value)) {
        require(!["aggregateRating", "review", "ratingValue", "geo", "latitude", "longitude", "postalCode", "openingHoursSpecification"].includes(key), `SEO: unconfirmed business field ${key} in ${route}`);
        rejectInvented(child);
      }
    };
    schemas.forEach(rejectInvented);
    if (indexable) {
      const website = schemas.find((item) => item["@type"] === "WebSite");
      const webPage = schemas.find((item) => item["@type"] === "WebPage");
      require(website?.url === `${origin}/` && website?.publisher?.["@id"] === `${origin}/#lavamed`, `SEO: website identity mismatch in ${route}`);
      require(webPage?.url === `${origin}${route}` && company?.["@id"] === `${origin}/#lavamed`, `SEO: webpage identity mismatch in ${route}`);
      if (route !== "/") {
        const items = schemas.find((item) => item["@type"] === "BreadcrumbList")?.itemListElement || [];
        require(items.length >= 2 && items.at(-1).item === `${origin}${route}` && items.every((item, i) => item.position === i + 1 && item.item.startsWith(origin) && pages.has(new URL(item.item).pathname)), `SEO: invalid breadcrumbs in ${route}`);
      }
    }
    const service = services.find((item) => route === `/servicos/${item.slug}/`);
    if (service) {
      require(title.includes(service.seoName) && textOf(headings[0]?.[2] || "").toLocaleLowerCase("pt-BR") === service.name.toLocaleLowerCase("pt-BR"), `SEO: service intent mismatch in ${route}`);
      for (const content of [service.detail, servicePriceLabel(service), ...service.features.flat(), ...service.exclusions, ...(service.modalities || []).flat()]) {
        require(textOf(main).includes(content), `SEO: missing official service content in ${route}: ${content}`);
      }
      require(main.includes(business.city) && main.includes(business.neighborhood), `SEO: missing service location in ${route}`);
      for (const [slug, reason] of service.relatedServices) require(main.includes(`href="/servicos/${slug}/"`) && main.includes(reason), `SEO: missing contextual related service in ${route}`);
      const schema = schemas.find((item) => item["@type"] === "Service");
      require(schema?.name === service.name && schema?.description === service.summary, `SEO: service schema mismatch in ${route}`);
      if (origin) require(schema?.url === `${origin}${route}` && schema?.provider?.["@id"] === `${origin}/#lavamed`, `SEO: service URL/provider mismatch in ${route}`);
      if (service.priceQualifier === "consult") require(!schema?.offers, `SEO: invented price in ${route}`);
      else {
        require(schema?.offers?.description === servicePriceLabel(service) && schema?.offers?.priceCurrency === "BRL", `SEO: offer qualification mismatch in ${route}`);
        require(service.priceQualifier === "fixed" ? schema?.offers?.price === service.price : schema?.offers?.price === undefined && schema?.offers?.priceSpecification?.minPrice === service.price, `SEO: starting/fixed price mismatch in ${route}`);
      }
    }
  }
  const reached = new Set();
  const queue = ["/"];
  while (queue.length) {
    const route = queue.shift();
    if (reached.has(route)) continue;
    reached.add(route);
    queue.push(...(graph.get(route) || []));
  }
  for (const route of routes) require(reached.has(route), `SEO: orphan page ${route}`);
  const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  require(new Set(locations).size === locations.length, "SEO: duplicate sitemap URLs");
  require(origin ? locations.length === routes.length && routes.every((route) => locations.includes(`${origin}${route}`)) : locations.length === 0, "SEO: sitemap does not exactly cover the indexable routes");
  const robots = await readFile(path.join(root, "robots.txt"), "utf8");
  require(robots === `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ""}`, "SEO: incorrect crawl policy");
  const headers = await readFile(path.join(root, "_headers"), "utf8");
  require(headers === (origin ? "/404.html\n  X-Robots-Tag: noindex, follow\n" : "/*\n  X-Robots-Tag: noindex, nofollow\n"), "SEO: incorrect production/preview HTTP indexability");
  const redirects = (await readFile(path.join(root, "_redirects"), "utf8")).trim().split("\n");
  require(redirects.length === routes.length && routes.every((route) => redirects.includes(`${route}index.html ${route} 301!`)), "SEO: missing permanent index.html aliases");
  const home = pages.get("/") || "";
  require(home.includes('id="local-title">Estética Automotiva e Lava Rápido em Itajubá</h1>') && home.includes('class="local-intro"'), "SEO: missing visible local home content");
  require(/<img[^>]*class="hero-backdrop"[^>]*loading="eager"[^>]*fetchpriority="high"/.test(home), "SEO: LCP image must keep eager loading and high priority");
  return problems;
}
