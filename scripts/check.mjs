import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { comparisonPairs, servicePriceLabel, services } from "../src/config.js";
import { mediaCatalog } from "../src/media-manifest.js";
import { resolveActiveSiteUrl } from "../src/site-config.js";

const root = path.resolve("dist");
const activeSiteUrl = resolveActiveSiteUrl(process.env);
const serviceRoutes = services.map((service) => `servicos/${service.slug}/index.html`);
const routes = ["index.html","servicos/index.html",...serviceRoutes,"portfolio/index.html","antes-e-depois/index.html","sobre/index.html","contato/index.html","faq/index.html","politica-de-privacidade/index.html","sitemap.xml","robots.txt","404.html"];
const problems = [];
for (const route of routes) {
  try { await access(path.join(root, route)); } catch { problems.push(`Missing: ${route}`); }
}
const home = await readFile(path.join(root, "index.html"), "utf8");
for (const required of ["<h1", "canonical", "og:title", "data-compare", "menu-toggle", "data-process-video-slot", "data-process-preview=\"before\"", "data-process-preview=\"after\"", "data-dual-select", "data-video-dialog", "data-service-quote", "lang=\"pt-BR\""]) {
  if (required === "canonical") continue;
  if (!home.includes(required)) problems.push(`Home missing marker: ${required}`);
}
if (!/\/assets\/site-[\w-]+\.js/.test(home)) problems.push("Home is not using a fingerprinted JavaScript bundle");
if (!/\/assets\/site-[\w-]+\.css/.test(home)) problems.push("Home is not using a fingerprinted CSS bundle");
if (home.includes('/assets/site.js') || home.includes('/assets/site.css')) problems.push("Home still references unhashed source assets");
if (home.includes("{{") || home.includes("HOME_SERVICE_ROWS")) problems.push("Home contains unresolved build tokens");
if (/�|Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â€/.test(home)) problems.push("Home contains damaged UTF-8 text");
if (!home.includes("Itajubá") || !home.includes("bairro Medicina")) problems.push("Home is missing the confirmed local context");
if (home.includes("lavamed.example")) problems.push("Home contains the retired .example domain");
if (!home.includes("/assets/images/hero/LavaMed_logo_vetorial_HD.svg")) problems.push("Home is not using the official LavaMed logo");
if (!home.includes('type="image/avif"') || !home.includes("srcset=")) problems.push("Home is missing responsive AVIF/WebP media");
if ((home.match(/class="gallery-item/g) || []).length !== 7) problems.push("Home gallery does not contain the seven classified portfolio items");
if ((home.match(/data-process-preview=/g) || []).length !== 2) problems.push("Home must contain exactly two independent real process previews");
if ((home.match(/class="service-row/g) || []).length !== 8) problems.push("Home does not prioritize the eight requested commercial services");
if ((home.match(/class="results-feature/g) || []).length !== 2) problems.push("Home does not contain the two featured real comparisons");
if (!home.includes("conceitual-coupe-escuro")) problems.push("Home is not using the original black campaign car");
if (home.includes("data-sound-toggle") || home.includes("experiência sonora")) problems.push("Home still contains removed sound controls");
const processVideos = [mediaCatalog["volkswagen-up-antes"], mediaCatalog["volkswagen-up-depois"]];
if (processVideos.some((video) => !video || video.type !== "video")) problems.push("One or both Volkswagen Up state videos are missing from the generated media manifest");
for (const video of processVideos) {
  if (!video) continue;
  if (!home.includes(video.poster) || !home.includes(video.fullSrc) || !home.includes(video.mp4) || !home.includes(video.webm)) problems.push(`Home is missing dual-motion sources for ${video.id}`);
  if (video.hasAudio !== false) problems.push(`Public video manifest must guarantee a silent derivative: ${video.id}`);
  if (!video.plateStatus?.includes("nenhuma placa legível")) problems.push(`Video privacy review is not documented: ${video.id}`);
}
if ((home.match(/muted playsinline loop preload="none"/g) || []).length !== 2 || (home.match(/<source data-src=/g) || []).length !== 4) problems.push("Dual previews are missing the silent lazy-loading policy");
if (!home.includes("Os movimentos e as durações são independentes") || !home.includes("Procedimento específico não confirmado")) problems.push("Dual-video truthfulness disclosure is missing");
if (home.includes("volkswagen-up-antes-depois-preview") || home.includes("volkswagen-up-antes-depois-completo")) problems.push("Home still uses the retired combined video as its primary experience");
for (const videoId of ["volkswagen-up-antes", "volkswagen-up-depois"]) {
  try {
    const videoAudit = JSON.parse(await readFile(path.resolve(`docs/video-audit/dual-motion/${videoId}-metadata.json`), "utf8"));
    if (videoAudit.derivatives.some((derivative) => derivative.streams.some((stream) => stream.codecType === "audio"))) problems.push(`A public derivative still contains audio: ${videoId}`);
    if (videoAudit.derivatives.length !== 3) problems.push(`Video audit must document full MP4 and both preview formats: ${videoId}`);
    if (!Array.isArray(videoAudit.privacyMasks)) problems.push(`Video privacy mask audit is malformed: ${videoId}`);
    const contactSheet = await stat(path.resolve(`docs/video-audit/dual-motion/${videoId}-contact-sheet.jpg`));
    if (contactSheet.size < 80_000) problems.push(`Video contact sheet is missing or unexpectedly small: ${videoId}`);
  } catch { problems.push(`Video FFprobe audit metadata or contact sheet is missing: ${videoId}`); }
}
if (!activeSiteUrl && (home.includes('rel="canonical"') || home.includes('property="og:url"'))) problems.push("Local home must not publish canonical or og:url");
if (!activeSiteUrl && !home.includes('name="robots" content="noindex,nofollow"')) problems.push("Local home is missing noindex");
if ((home.match(/rel="preload" href="[^"]+\.woff2"/g) || []).length !== 2) problems.push("Home must preload both local brand fonts");
if (!home.includes("Leonardo Jonathan do Carmo") || !home.includes('href="tel:+5535988267259"')) problems.push("Footer is missing the developer credit or telephone link");
for (const servicePath of ["lavagem-detalhada", "higienizacao-avancada", "polimento-comercial", "polimento-farol", "lavagem-moto-detalhada", "lavagem-motor"]) {
  if (!home.includes(`/servicos/${servicePath}/`)) problems.push(`Footer is missing priority service link: ${servicePath}`);
}
for (const channel of ["https://share.google/Vm2BAGotXmrrtKJi1", "https://www.instagram.com/lavamed.itajuba/", "https://wa.me/5535984586615"]) {
  if (!home.includes(channel)) problems.push(`Home is missing official channel: ${channel}`);
}
const assetNames = await readdir(path.join(root, "assets"));
const scriptBundle = assetNames.find((name) => /^site-[\w-]+\.js$/.test(name));
if (!scriptBundle) problems.push("Missing bundled site JavaScript");
else if ((await stat(path.join(root, "assets", scriptBundle))).size < 50_000) problems.push("JavaScript bundle is unexpectedly small");
else {
  const script = await readFile(path.join(root, "assets", scriptBundle), "utf8");
  for (const removedAudioApi of ["AudioContext", "createOscillator", "createBufferSource", "data-sound-toggle"]) {
    if (script.includes(removedAudioApi)) problems.push(`Bundled JavaScript still contains removed audio system: ${removedAudioApi}`);
  }
}
const sourceCss = await readFile(path.resolve("src/assets/site.css"), "utf8");
if (sourceCss.includes(".camera-copy:first-of-type")) problems.push("Reduced-motion camera selector regression detected");
if (sourceCss.includes(".compare>img") || !sourceCss.includes(".compare img")) problems.push("Comparison picture images are not receiving the complete frame styles");
for (const unsafeTypography of ["/ .8 var(--display)", "/.8 var(--display)", "line-height:.82", "line-height: .82"]) {
  if (sourceCss.includes(unsafeTypography)) problems.push(`Unsafe display-font line-height detected: ${unsafeTypography}`);
}
if (!sourceCss.includes(".title-mask { display: block; overflow:hidden")) problems.push("Hero title masks are missing glyph-safe overflow padding");
for (const logoWidth of ["width:135px", "width:105px", "width:90px"]) {
  if (!sourceCss.includes(logoWidth)) problems.push(`Responsive header logo size missing: ${logoWidth}`);
}
if (!sourceCss.includes("html.has-custom-cursor") || !sourceCss.includes("cursor:none!important")) problems.push("Native cursor is not safely controlled by the custom-cursor state class");
const sourceJs = await readFile(path.resolve("src/assets/site.js"), "utf8");
if (sourceJs.includes("event.clientX - 19") || sourceJs.includes("event.clientY - 19")) problems.push("Custom pointer still contains the obsolete double offset");
if (sourceJs.includes('gsap.set(titleLines, { yPercent: 115, clipPath')) problems.push("Hero still clips glyphs directly during its reveal");
if (!sourceJs.includes('(min-width: 901px)') || !sourceJs.includes('(max-width: 900px)')) problems.push("GSAP and CSS tablet breakpoints are not aligned");
if (!sourceJs.includes("document.fonts?.ready")) problems.push("ScrollTrigger is not refreshed after local fonts load");
if (sourceJs.includes('gsap.quickTo(cursor, "x"') || !sourceJs.includes("gsap.quickSetter(cursor")) problems.push("Custom cursor is not using immediate low-latency setters");
if (!sourceJs.includes('root.classList.add("has-custom-cursor")') || !sourceJs.includes('event.pointerType !== "mouse"')) problems.push("Custom cursor is missing safe mouse-only activation");
if (!sourceJs.includes("IntersectionObserver") || !sourceJs.includes("connection?.saveData") || !sourceJs.includes("video.pause()")) problems.push("Process previews are missing viewport/data-saver lifecycle handling");
if (!sourceJs.includes('dialog?.addEventListener("close", resetDialog)') || !sourceJs.includes("fullVideo?.pause()")) problems.push("Full video dialog is missing accessible pause/focus cleanup");
for (const media of Object.values(mediaCatalog)) {
  if (media.type === "video") {
    const references = [media.mp4, media.webm, media.fullSrc, media.poster, media.posterAvif, media.thumbnail].filter(Boolean);
    for (const reference of references) {
      try {
        const info = await stat(path.join(root, reference));
        if (info.size < 5_000) problems.push(`Video derivative unexpectedly small: ${reference}`);
        if (reference === media.fullSrc && info.size > 12_000_000) problems.push(`Full video exceeds 12 MB: ${reference}`);
        if (reference !== media.fullSrc && /\.(mp4|webm)$/.test(reference) && info.size > 5_000_000) problems.push(`Video preview exceeds 5 MB: ${reference}`);
        if (/\.(webp|avif)$/.test(reference) && info.size > 500_000) problems.push(`Video poster/thumbnail exceeds 500 KB: ${reference}`);
      } catch { problems.push(`Missing video derivative: ${reference}`); }
    }
    continue;
  }
  const derivatives = [
    media.src,
    ...(media.webpSrcSet || "").split(",").map((item) => item.trim().split(" ")[0]),
    ...(media.avifSrcSet || "").split(",").map((item) => item.trim().split(" ")[0])
  ].filter(Boolean);
  for (const reference of derivatives) {
    try {
      const info = await stat(path.join(root, reference));
      if (info.size < 1_000) problems.push(`Media derivative unexpectedly small: ${reference}`);
      if (info.size > 500_000) problems.push(`Media derivative exceeds 500 KB: ${reference}`);
    } catch { problems.push(`Missing media derivative: ${reference}`); }
  }
}
const socialImage = await stat(path.join(root, "assets/images/hero/lavamed-social.jpg"));
if (socialImage.size < 40_000 || socialImage.size > 500_000) problems.push("Social sharing image has an unexpected size");
const logo = await stat(path.join(root, "assets", "images", "hero", "LavaMed_logo_vetorial_HD.svg"));
if (logo.size < 10_000) problems.push("Official logo asset is unexpectedly small");
for (const service of services) {
  const html = await readFile(path.join(root, "servicos", service.slug, "index.html"), "utf8");
  const expectedPrice = servicePriceLabel(service);
  if (!html.includes(expectedPrice)) problems.push(`Missing price label for ${service.slug}: ${expectedPrice}`);
  if (!html.includes(service.name)) problems.push(`Missing service name: ${service.slug}`);
  if (service.image && !html.includes(service.image.src)) problems.push(`Missing classified service media: ${service.slug}`);
  if (service.image?.illustrative && !html.includes("Composição conceitual")) problems.push(`Missing illustrative-media disclosure: ${service.slug}`);
}
const catalog = await readFile(path.join(root, "servicos", "index.html"), "utf8");
if ((catalog.match(/class="catalog-row"/g) || []).length !== 11) problems.push("Catalog does not contain exactly 11 service groups");
if (!catalog.includes("Não inclui limpeza ou aspiração interna")) problems.push("Package comparison is missing the Lavagem Simples interior exclusion");
if (catalog.includes("A partir de R$ 40 o par") || !catalog.includes("A partir de R$ 80 o par")) problems.push("Headlight pricing unit is incorrect");
const portfolio = await readFile(path.join(root, "portfolio", "index.html"), "utf8");
if ((portfolio.match(/class="portfolio-card/g) || []).length !== 7) problems.push("Portfolio does not contain seven classified items");
const comparisons = await readFile(path.join(root, "antes-e-depois", "index.html"), "utf8");
if ((comparisons.match(/class="result-pair"/g) || []).length !== 3) problems.push("Before/after page does not contain the three confirmed pairs");
const cabinPair = comparisonPairs.find((pair) => pair.title === "Cabine desmontada");
if (cabinPair?.before?.id !== "cabine-desmontada-antes" || cabinPair?.after?.id !== "cabine-desmontada-depois") problems.push("Cabin comparison is not using the confirmed same-angle source pair");
const headlightPair = comparisonPairs.find((pair) => pair.title === "Polimento de farol");
if (headlightPair?.before?.id !== "farol-antes" || headlightPair?.after?.id !== "farol-depois") problems.push("Headlight comparison is not using the complete confirmed source pair");
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
if (sitemap.includes(".example")) problems.push("Sitemap contains a .example domain");
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (activeSiteUrl && (sitemapLocations.length !== 19 || sitemapLocations.some((location) => !location.startsWith(`${activeSiteUrl}/`)))) problems.push("Sitemap does not match active SITE_URL");
if (!activeSiteUrl && sitemapLocations.length) problems.push("Local sitemap must not publish URLs");
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
if (activeSiteUrl && !robots.includes(`Sitemap: ${activeSiteUrl}/sitemap.xml`)) problems.push("robots.txt does not match active SITE_URL");
if (!activeSiteUrl && robots !== "User-agent: *\nDisallow: /\n") problems.push("Local robots.txt must block indexing");
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
const titles = new Set();
const descriptions = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || "";
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
  if (!html.includes("<title>")) problems.push(`Missing title: ${path.relative(root,file)}`);
  if (!description) problems.push(`Missing description: ${path.relative(root,file)}`);
  if (/�|Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â€/.test(html)) problems.push(`Damaged UTF-8 text: ${path.relative(root,file)}`);
  if (titles.has(title)) problems.push(`Duplicate title: ${title}`); else titles.add(title);
  if (descriptions.has(description)) problems.push(`Duplicate description: ${description}`); else descriptions.add(description);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) problems.push(`Expected exactly one h1: ${path.relative(root,file)}`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); } catch { problems.push(`Invalid JSON-LD: ${path.relative(root,file)}`); }
  }
  if (html.includes("lavamed.example")) problems.push(`Retired .example domain in ${path.relative(root,file)}`);
  if (html.includes('src="/assets/logo-mark.svg"')) problems.push(`Provisional logo still rendered in ${path.relative(root,file)}`);
  if (html.includes("/assets/images/lavamed-hero.jpg") || html.includes("/assets/images/lavamed-detail.jpg")) problems.push(`Stale conceptual media reference: ${path.relative(root,file)}`);
  const references = [
    ...[...html.matchAll(/(?:href|src)="(\/[^"]+)"/g)].map((match) => match[1].split(/[?#]/)[0]),
    ...[...html.matchAll(/data-src="(\/[^"]+)"/g)].map((match) => match[1].split(/[?#]/)[0]),
    ...[...html.matchAll(/srcset="([^"]+)"/g)].flatMap((match) => match[1].split(",").map((item) => item.trim().split(" ")[0]))
  ];
  for (const reference of references) {
    if (reference === "/" || reference.startsWith("//")) continue;
    const candidate = reference.endsWith("/") ? path.join(root, reference, "index.html") : path.join(root, reference);
    try { await access(candidate); } catch { problems.push(`Broken local reference in ${path.relative(root,file)}: ${reference}`); }
  }
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`Checks passed: ${htmlFiles.length} HTML pages, routes, metadata, local links, interactions, and visual assets.`);
