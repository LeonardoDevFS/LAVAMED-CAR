import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "vite";
import {
  business,
  campaignMedia,
  comparisonPairs,
  homeMedia,
  portfolioItems,
  processMedia,
  serviceGroups,
  servicePriceLabel,
  services,
  siteCredits,
  storyActs,
  whatsappUrl
} from "../src/config.js";
import { domainStage, resolveActiveSiteUrl } from "../src/site-config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const output = path.join(root, "dist");
const domain = resolveActiveSiteUrl(process.env);
const activeDomainStage = domainStage(domain);
const googleSiteVerification = String(process.env.GOOGLE_SITE_VERIFICATION || "").trim();
const logoPath = "/assets/images/hero/LavaMed_logo_vetorial_HD.svg";
const socialImagePath = "/assets/images/hero/lavamed-social.jpg";

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await build({
  configFile: false,
  root,
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: output,
    emptyOutDir: false,
    manifest: true,
    sourcemap: false,
    rollupOptions: {
      input: path.join(source, "assets/site.js"),
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/chunk-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  }
});

await mkdir(path.join(output, "assets"), { recursive: true });
await cp(path.join(source, "assets/images"), path.join(output, "assets/images"), { recursive: true });
await cp(path.join(source, "assets/logo-mark.svg"), path.join(output, "assets/logo-mark.svg"));

const manifest = JSON.parse(await readFile(path.join(output, ".vite/manifest.json"), "utf8"));
const bundle = manifest["src/assets/site.js"] || manifest["assets/site.js"];
if (!bundle?.file || !bundle.css?.[0]) throw new Error("Vite manifest did not contain the LavaMed entry bundle");
const scriptSrc = `/${bundle.file}`;
const styleHref = `/${bundle.css[0]}`;
const fontPreloads = (bundle.assets || [])
  .filter((asset) => asset.endsWith(".woff2"))
  .map((asset) => `<link rel="preload" href="/${asset}" as="font" type="font/woff2" crossorigin>`)
  .join("");
await rm(path.join(output, ".vite"), { recursive: true, force: true });

const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
const absoluteUrl = (pathName) => domain ? `${domain}${pathName}` : "";

function localBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AutoWash",
    name: business.name,
    description: "Estética automotiva, lavagem e cuidados técnicos em Itajubá, no bairro Medicina.",
    telephone: `+${business.whatsapp}`,
    priceRange: "R$ 40–R$ 350",
    areaServed: { "@type": "City", name: `${business.city}, ${business.state}` },
    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      addressRegion: business.state,
      addressCountry: "BR"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${business.whatsapp}`,
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese"
    },
    sameAs: [business.instagram],
    hasMap: business.mapsUrl
  };
  if (domain) {
    schema["@id"] = `${domain}/#lavamed`;
    schema.url = `${domain}/`;
    schema.logo = absoluteUrl(logoPath);
    schema.image = absoluteUrl(socialImagePath);
  }
  if (business.address) schema.address.streetAddress = business.address;
  return schema;
}

function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    url: `${domain}/`,
    name: business.name,
    alternateName: "LavaMed",
    inLanguage: "pt-BR",
    publisher: { "@id": `${domain}/#lavamed` }
  };
}

function webPageSchema({ title, description, pathName, image }) {
  const pageUrl = absoluteUrl(pathName);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: title,
    description,
    inLanguage: "pt-BR",
    isPartOf: { "@id": `${domain}/#website` },
    about: { "@id": `${domain}/#lavamed` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(typeof image === "string" ? image : image.src)
    }
  };
}

function serviceSchema(service) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.summary,
    areaServed: `${business.city}, ${business.state}`,
    provider: domain ? { "@id": `${domain}/#lavamed` } : { "@type": "AutoWash", name: business.name }
  };
  if (service.price != null) {
    schema.offers = {
      "@type": "Offer",
      price: service.price,
      priceCurrency: "BRL",
      description: servicePriceLabel(service),
      ...(domain ? { url: absoluteUrl(`/servicos/${service.slug}/`) } : {})
    };
  }
  if (domain) schema.url = absoluteUrl(`/servicos/${service.slug}/`);
  if (domain && service.image?.src) schema.image = absoluteUrl(service.image.src);
  return schema;
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href)
    }))
  };
}

function headMetadata({ title, description, pathName, image = socialImagePath, schemas = [], indexable = true }) {
  const canonical = domain && indexable ? `<link rel="canonical" href="${absoluteUrl(pathName)}">` : "";
  const languageAlternate = domain && indexable ? `<link rel="alternate" hreflang="pt-BR" href="${absoluteUrl(pathName)}">` : "";
  const ogUrl = domain && indexable ? `<meta property="og:url" content="${absoluteUrl(pathName)}">` : "";
  const imagePath = typeof image === "string" ? image : image.src;
  const ogImage = domain ? absoluteUrl(imagePath) : imagePath;
  const robots = domain && indexable ? "index,follow,max-image-preview:large" : indexable ? "noindex,nofollow" : "noindex,follow";
  const verification = googleSiteVerification ? `<meta name="google-site-verification" content="${escapeHtml(googleSiteVerification)}">` : "";
  const pageIdentitySchemas = domain && indexable ? [websiteSchema(), webPageSchema({ title, description, pathName, image })] : [];
  const structuredData = [localBusinessSchema(), ...pageIdentitySchemas, ...schemas]
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join("");
  return `<meta name="theme-color" content="#050b12"><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}">${verification}
  <meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="LavaMed Estética Automotiva"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website">${ogUrl}<meta property="og:image" content="${escapeHtml(ogImage)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:alt" content="LavaMed Estética Automotiva em Itajubá">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(ogImage)}">
  ${canonical}${languageAlternate}<link rel="icon" href="${logoPath}" type="image/svg+xml">${fontPreloads}<link rel="stylesheet" href="${styleHref}"><script type="module" src="${scriptSrc}"></script>
  <title>${escapeHtml(title)}</title>${structuredData}`;
}

function imageMarkup(media, { className = "", alt = media?.alt || "", loading = "lazy", fetchpriority = "", sizes = media?.sizes || "100vw" } = {}) {
  if (!media?.src) return "";
  const attributes = [
    className ? `class="${escapeHtml(className)}"` : "",
    `src="${escapeHtml(media.src)}"`,
    media.webpSrcSet ? `srcset="${escapeHtml(media.webpSrcSet)}"` : "",
    `sizes="${escapeHtml(sizes)}"`,
    media.width ? `width="${media.width}"` : "",
    media.height ? `height="${media.height}"` : "",
    `alt="${escapeHtml(alt)}"`,
    loading ? `loading="${loading}"` : "",
    fetchpriority ? `fetchpriority="${fetchpriority}"` : ""
  ].filter(Boolean).join(" ");
  return `<img ${attributes}>`;
}

function pictureMarkup(media, options = {}) {
  if (!media?.src) return "";
  const avif = media.avifSrcSet ? `<source type="image/avif" srcset="${escapeHtml(media.avifSrcSet)}" sizes="${escapeHtml(options.sizes || media.sizes || "100vw")}">` : "";
  const webp = media.webpSrcSet ? `<source type="image/webp" srcset="${escapeHtml(media.webpSrcSet)}" sizes="${escapeHtml(options.sizes || media.sizes || "100vw")}">` : "";
  return `<picture>${avif}${webp}${imageMarkup(media, options)}</picture>`;
}

function mediaLabel(media) {
  if (!media) return "Mídia em preparação";
  if (media.illustrative) return "Composição conceitual — não representa atendimento real";
  if (media.classification.startsWith("Exterior finalizado")) return "Acervo LavaMed / exterior finalizado";
  if (media.classification.startsWith("Interior finalizado")) return "Acervo LavaMed / interior finalizado";
  return `Acervo LavaMed / ${media.classification.split("—")[0].trim()}`;
}

function heroMedia(media, placeholderSlug = "") {
  if (media) {
    return `<div class="page-hero-media" aria-hidden="true">${pictureMarkup(media, { alt: "", loading: "eager", fetchpriority: "high", sizes: "100vw" })}<span class="media-provenance">${escapeHtml(mediaLabel(media))}</span></div>`;
  }
  return `<div class="page-hero-media page-hero-media--placeholder" aria-label="Fotografia do serviço ainda não fornecida" role="img"><div class="service-placeholder is-${escapeHtml(placeholderSlug)}"><div class="placeholder-rings"><i></i><i></i><i></i></div><span>FOTO</span><small>Imagem real aguardando acervo</small></div></div>`;
}

function shell({ title, description, pathName, eyebrow, heading, accent = "", deck, media = campaignMedia.detail, placeholderSlug = "", content, bodyClass = "", variant = "offset", schemas = [], breadcrumbs = [], indexable = true }) {
  const fullHeading = accent ? `${heading}<br><em>${accent}</em>` : heading;
  const breadcrumbItems = breadcrumbs.length ? [{ href: "/", label: "Início" }, ...breadcrumbs] : [];
  const pageSchemas = domain && breadcrumbItems.length ? [...schemas, breadcrumbSchema(breadcrumbItems)] : schemas;
  const breadcrumbMarkup = breadcrumbItems.length ? `<nav class="breadcrumbs" aria-label="Navegação estrutural"><ol>${breadcrumbItems.map((item, index) => `<li>${index === breadcrumbItems.length - 1 ? `<span aria-current="page">${escapeHtml(item.label)}</span>` : `<a href="${item.href}">${escapeHtml(item.label)}</a>`}</li>`).join("")}</ol></nav>` : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  ${headMetadata({ title, description, pathName, image: media || socialImagePath, schemas: pageSchemas, indexable })}
</head>
<body class="internal ${bodyClass}">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a><div class="noise" aria-hidden="true"></div><div class="transition" aria-hidden="true"><span></span><span></span><span></span></div><div class="cursor" aria-hidden="true"><i></i></div><div class="scroll-progress" aria-hidden="true"><span></span></div>
  ${header()}${menu(pathName)}
  <main class="internal-main" id="conteudo">
    <section class="page-hero page-hero--${variant}">${heroMedia(media, placeholderSlug)}<span class="page-hero-code" aria-hidden="true">LVM / ${variant.toUpperCase()}</span>${breadcrumbMarkup}<p class="page-kicker">${eyebrow}</p><h1 class="page-title">${fullHeading}</h1><p class="page-deck">${deck}</p></section>
    ${content}
  </main>
  ${footer()}
</body></html>`;
}

function header() {
  return `<header class="site-header" data-header>${brandBlock()}<div class="header-actions"><a class="header-cta magnetic" href="/contato/" data-booking>Agendar <span aria-hidden="true">↗</span></a><button class="menu-toggle magnetic" type="button" aria-expanded="false" aria-controls="menu-panel"><span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"><i></i><i></i></span></button></div></header>`;
}

function brandChannels() {
  return `<nav class="brand-channels" aria-label="Canais da LavaMed"><a href="${escapeHtml(business.mapsUrl)}" target="_blank" rel="noopener" aria-label="Abrir localização da LavaMed no Google Maps"><span data-short="MAP">Maps</span><i aria-hidden="true">↗</i></a><a href="${escapeHtml(business.instagram)}" target="_blank" rel="noopener" aria-label="Abrir Instagram da LavaMed"><span data-short="IG">Instagram</span><i aria-hidden="true">↗</i></a><a href="${escapeHtml(whatsappUrl())}" target="_blank" rel="noopener" aria-label="Conversar com a LavaMed pelo WhatsApp"><span data-short="WA">WhatsApp</span><i aria-hidden="true">↗</i></a></nav>`;
}

function brandBlock() {
  return `<div class="brand-cluster"><a class="brand" href="/" aria-label="LavaMed — início"><img src="${logoPath}" width="112" height="99" alt="LavaMed Estética Automotiva"></a>${brandChannels()}</div>`;
}

function menu(pathName) {
  const links = [["/","Início"],["/servicos/","Serviços"],["/portfolio/","Portfólio"],["/antes-e-depois/","Antes / depois"],["/sobre/","Sobre"],["/contato/","Contato"]];
  return `<div class="menu-panel" id="menu-panel" aria-hidden="true"><div class="menu-glow" aria-hidden="true"></div><nav aria-label="Navegação principal">${links.map(([href,label], index) => `<a href="${href}"${pathName === href ? ' aria-current="page"' : ""}><sup>${String(index + 1).padStart(2,"0")}</sup><span>${label}</span></a>`).join("")}</nav><div class="menu-meta"><span>Itajubá / bairro Medicina</span><span>Precisão em movimento</span></div></div>`;
}

function footerServiceLinks() {
  const prioritySlugs = [
    "lavagem-detalhada",
    "higienizacao-avancada",
    "polimento-comercial",
    "polimento-farol",
    "lavagem-moto-detalhada",
    "lavagem-motor"
  ];
  return prioritySlugs.map((slug) => {
    const service = services.find((item) => item.slug === slug);
    return `<a href="/servicos/${service.slug}/">${escapeHtml(service.name)}</a>`;
  }).join("");
}

function footer() {
  return `<footer class="site-footer">
    <div class="footer-top"><div class="footer-brand">${brandBlock()}</div><div class="footer-intro"><span>Estética automotiva em Itajubá / bairro Medicina</span><p>Seu carro merece<br><em>esse cuidado.</em></p><a class="footer-booking" href="${escapeHtml(whatsappUrl())}" target="_blank" rel="noopener" data-booking>Agendar pelo WhatsApp <i aria-hidden="true">↗</i></a></div></div>
    <div class="footer-grid">
      <section class="footer-column"><p class="footer-heading">Explorar</p><nav aria-label="Navegação do rodapé"><a href="/servicos/">Todos os serviços</a><a href="/portfolio/">Portfólio</a><a href="/antes-e-depois/">Antes e depois</a><a href="/sobre/">Sobre a LavaMed</a><a href="/faq/">Perguntas frequentes</a></nav></section>
      <section class="footer-column footer-services"><p class="footer-heading">Serviços em Itajubá</p><nav aria-label="Serviços em destaque">${footerServiceLinks()}</nav></section>
      <section class="footer-column footer-contact"><p class="footer-heading">Contato e localização</p><a href="${escapeHtml(whatsappUrl())}" target="_blank" rel="noopener">WhatsApp da LavaMed<br><strong>${escapeHtml(business.phoneDisplay)}</strong></a><a href="${escapeHtml(business.mapsUrl)}" target="_blank" rel="noopener">Bairro Medicina<br><strong>Itajubá, Minas Gerais</strong></a><a href="${escapeHtml(business.instagram)}" target="_blank" rel="noopener">Instagram<br><strong>@lavamed.itajuba</strong></a><a href="/contato/">Formulário de contato</a></section>
    </div>
    <div class="footer-bottom"><div class="footer-legal"><p>© <span data-year></span> LavaMed Estética Automotiva. Todos os direitos reservados.</p><p class="footer-credit">Desenvolvimento: <strong>${escapeHtml(siteCredits.developer)}</strong> · <a href="tel:${escapeHtml(siteCredits.phone)}" aria-label="Telefone de Leonardo Jonathan do Carmo: ${escapeHtml(siteCredits.phoneDisplay)}">${escapeHtml(siteCredits.phoneDisplay)}</a></p></div><a class="footer-to-top" href="#conteudo">Voltar ao topo <span aria-hidden="true">↑</span></a></div>
  </footer>`;
}

function catalogContent() {
  const groups = serviceGroups.map((group) => {
    const groupServices = services.filter((service) => service.group === group.key);
    return `<section class="catalog-group" aria-labelledby="group-${group.key}"><header class="catalog-group-head"><span>${group.number}</span><div><h2 id="group-${group.key}">${group.name}</h2><p>${group.note}</p></div></header><div class="catalog-list">${groupServices.map((service) => `<a class="catalog-row" href="/servicos/${service.slug}/"><span class="catalog-number">${service.number}</span><div class="catalog-name"><small>${service.label}</small><h3>${service.name}</h3><p>${service.summary}</p></div><strong>${servicePriceLabel(service)}</strong><i aria-hidden="true">↗</i></a>`).join("")}</div></section>`;
  }).join("");
  return `<div class="catalog-shell"><section class="catalog-intro"><p>Todos os valores informados ficam visíveis. O porte, o material e a condição do veículo podem exigir avaliação antes da confirmação.</p><a class="text-link" href="#comparar">Comparar lavagens <span>↓</span></a></section>${groups}</div>${packageComparison()}`;
}

function packageComparison() {
  const packages = services.filter((service) => ["lavagem-simples", "lavagem-completa", "lavagem-detalhada", "higienizacao-avancada"].includes(service.slug));
  const rows = [
    ["Exterior", ["Incluído", "Incluído", "Detalhado", "Detalhado"]],
    ["Interior", ["Não inclui", "Limpeza", "Limpeza dedicada", "Limpeza intensiva"]],
    ["Aspiração", ["Não inclui", "Total", "Profunda", "Profunda"]],
    ["Cantos e frestas", ["—", "—", "Incluído", "Incluído"]],
    ["Chassi", ["—", "—", "Quando apropriado", "Quando aplicável"]],
    ["Bancos e teto", ["—", "Limpeza superficial", "Higienização dedicada", "Lavagem / extração"]],
    ["Motor", ["—", "—", "—", "Limpeza técnica"]]
  ];
  return `<section class="package-compare content-section" id="comparar" aria-labelledby="compare-packages-title"><div class="content-grid"><div class="content-index">Comparador / 04 pacotes</div><div class="content-copy"><h2 id="compare-packages-title">Qual cuidado combina com o momento?</h2><p>Compare o escopo antes de escolher. A Lavagem Simples é exclusivamente externa. <strong>Não inclui limpeza ou aspiração interna.</strong></p></div></div><div class="package-table-wrap"><table class="package-table"><thead><tr><th scope="col">Escopo</th>${packages.map((service) => `<th scope="col"><a href="/servicos/${service.slug}/">${service.name}<small>${servicePriceLabel(service)}</small></a></th>`).join("")}</tr></thead><tbody>${rows.map(([label, values]) => `<tr><th scope="row">${label}</th>${values.map((value, index) => `<td class="${index === 0 && value === "Não inclui" ? "is-no" : ""}">${value}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
}

function numberedList(items, className = "scope-list") {
  return `<div class="${className}">${items.map(([title, text], index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><h3>${title}</h3><p>${text}</p></article>`).join("")}</div>`;
}

function serviceContent(service) {
  const group = serviceGroups.find((item) => item.key === service.group);
  const modalities = service.modalities?.length ? `<section class="content-section dark service-modalities"><div class="content-grid"><div class="content-index">Modalidades / 02</div><div class="content-copy"><h2>Escolha com clareza.</h2>${numberedList(service.modalities, "modality-list")}</div></div></section>` : "";
  const warnings = service.exclusions.length ? `<div class="service-notes"><strong>Antes de agendar</strong><ul>${service.exclusions.map((item) => `<li>${item}</li>`).join("")}</ul></div>` : "";
  const currentIndex = services.indexOf(service);
  const previous = services.at(currentIndex - 1);
  const next = services[(currentIndex + 1) % services.length];
  return `<section class="service-overview content-section"><div class="service-price-band"><span>${group.name} / ${service.label}</span><strong>${servicePriceLabel(service)}</strong></div><div class="content-grid"><div class="content-index">Escopo / ${service.number}</div><div class="content-copy"><h2>O que está incluído.</h2><p class="service-lead">${service.detail}</p>${numberedList(service.features)}${warnings}<a class="cta-pill service-cta" href="/contato/" data-booking data-service="${escapeHtml(service.slug)}"><span>${service.priceQualifier === "consult" ? "Solicitar orçamento" : "Agendar uma avaliação"}</span><i>↗</i></a></div></div></section>${modalities}<section class="service-benefits"><div><span>Por que considerar</span><h2>RESULTADO COM<br><em>CONTEXTO.</em></h2></div><ol>${service.benefits.map((benefit) => `<li>${benefit}</li>`).join("")}</ol></section><section class="service-faq content-section"><div class="content-grid"><div class="content-index">Informação / antes</div><div class="content-copy"><h2>Perguntas para uma boa escolha.</h2><div class="faq-list"><div class="faq-item"><button type="button" aria-expanded="false"><span>01</span><strong>O valor está confirmado?</strong><i>+</i></button><div class="faq-answer"><p>${service.priceQualifier === "fixed" ? `${servicePriceLabel(service)} é o valor informado atualmente; confirme se há variação conforme o porte.` : `${servicePriceLabel(service)}. O valor final depende da avaliação, do porte e da condição do veículo.`}</p></div></div><div class="faq-item"><button type="button" aria-expanded="false"><span>02</span><strong>Quanto tempo leva?</strong><i>+</i></button><div class="faq-answer"><p>O prazo é confirmado após avaliar o veículo e o escopo necessário. Horários ainda não foram informados pela LavaMed.</p></div></div><div class="faq-item"><button type="button" aria-expanded="false"><span>03</span><strong>Como agendar?</strong><i>+</i></button><div class="faq-answer"><p>Use o botão de agendamento para abrir uma conversa no WhatsApp oficial da LavaMed, já com o serviço selecionado na mensagem.</p></div></div></div></div></div></section><nav class="service-pagination" aria-label="Outros serviços"><a href="/servicos/${previous.slug}/"><small>Anterior</small><span>← ${previous.name}</span></a><a href="/servicos/">Todos os serviços</a><a href="/servicos/${next.slug}/"><small>Próximo</small><span>${next.name} →</span></a></nav>`;
}

function contactContent() {
  return `<section class="content-section dark"><div class="contact-panel"><form class="contact-form" data-contact-form><div class="field"><label for="nome">Seu nome</label><input id="nome" name="nome" autocomplete="name" required></div><div class="field"><label for="servico">Serviço de interesse</label><select id="servico" name="servico"><option value="uma avaliação">Quero uma avaliação</option>${services.map((service) => `<option value="${service.name}">${service.name} — ${servicePriceLabel(service)}</option>`).join("")}</select></div><div class="field"><label for="mensagem">Conte um pouco sobre o veículo</label><textarea id="mensagem" name="mensagem"></textarea></div><button class="submit-button" type="submit">Continuar no WhatsApp ↗</button><p class="form-status" aria-live="polite"></p></form><aside class="contact-aside"><h2>A conversa começa aqui.</h2><p>A LavaMed está em Itajubá, no bairro Medicina. WhatsApp, Instagram e localização no Maps já estão disponíveis; rua, número e horários ainda aguardam confirmação.</p><a class="cta-pill contact-direct" href="${escapeHtml(whatsappUrl())}" target="_blank" rel="noopener"><span>Chamar no WhatsApp</span><i>↗</i></a><div data-business-meta><span>Itajubá, MG</span><span>Bairro Medicina</span></div></aside></div></section>`;
}

function comparisonContent() {
  if (!comparisonPairs.length) {
    return `<section class="content-section dark"><div class="content-grid"><div class="content-index">Componente / pronto</div><div class="content-copy"><h2>O comparador está pronto para o acervo real.</h2><p>O controle aceita mouse, toque e teclado. Até a inclusão de pares correspondentes e autorizados, nenhum resultado de cliente é simulado.</p><div class="empty-state"><strong>Fotografias aguardando confirmação.</strong><p>Inclua pares reais com alinhamento equivalente em <code>comparisonPairs</code>, dentro de <code>src/config.js</code>. A página passará a exibir os trabalhos assim que esses materiais forem fornecidos.</p></div></div></div></section>`;
  }
  return `<section class="content-section dark"><div class="content-grid"><div class="content-index">Resultados / 01—${String(comparisonPairs.length).padStart(2,"0")}</div><div class="content-copy"><h2>Pares reais e correspondentes.</h2><p>Arraste a linha ou use as setas do teclado para comparar cada trabalho. Os pares foram aceitos somente quando veículo, detalhe e enquadramento são compatíveis.</p></div></div>${comparisonPairs.map((pair) => `<article class="result-pair"><header><span>${escapeHtml(pair.service)}</span><h2>${escapeHtml(pair.title)}</h2></header><div class="compare" data-compare style="--position:50%">${imageMarkup(pair.after, { className: "compare-base", alt: pair.after.alt, sizes: "100vw" })}<div class="compare-overlay">${imageMarkup(pair.before, { alt: pair.before.alt, sizes: "100vw" })}</div><div class="compare-refraction" aria-hidden="true"></div><span class="compare-label before">Antes</span><span class="compare-label after">Depois</span><button class="compare-handle" type="button" role="slider" aria-label="Comparar antes e depois: ${escapeHtml(pair.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i>↔</i></button></div></article>`).join("")}</section>`;
}

function portfolioContent() {
  const items = portfolioItems.map((item) => `<figure class="portfolio-card portfolio-card--${item.shape}">${pictureMarkup(item.media, { alt: item.media.alt, sizes: item.shape === "tall" ? "(max-width: 760px) 92vw, 34vw" : "(max-width: 760px) 92vw, 56vw" })}<figcaption><span>${item.number}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.note)}</small></div></figcaption></figure>`).join("");
  return `<section class="content-section dark portfolio-archive"><div class="content-grid"><div class="content-index">Acervo / 01—${String(portfolioItems.length).padStart(2, "0")}</div><div class="content-copy"><h2>Trabalhos documentados, sem atalhos.</h2><p>O acervo reúne mídias fornecidas pela LavaMed. Quando o procedimento não pode ser comprovado pela fotografia, a legenda informa somente o estado visível: exterior ou interior finalizado.</p></div></div><div class="portfolio-grid">${items}</div><p class="archive-note">As placas visíveis já estavam cobertas pela marca no material recebido. Nenhuma imagem é apresentada como prova de polimento, vitrificação ou outro procedimento que ela não confirme.</p></section>`;
}

const faqQuestions = [
  ["Como escolher o serviço?","A condição do veículo, o material e o objetivo definem a indicação. O catálogo permite comparar os pacotes, e uma avaliação confirma o escopo."],
  ["Os preços são fixos?","A Lavagem Simples de Moto está anunciada por R$ 40 conforme informado. Os demais preços numéricos são valores a partir de; serviços adicionais e verniz de motor dependem de orçamento."],
  ["Quanto tempo leva?","O prazo varia conforme o serviço e o estado do veículo. A LavaMed confirma a estimativa depois da avaliação."],
  ["O polimento remove todo risco?","Não. A possibilidade de correção depende da profundidade da marca e do estado do verniz. Nenhum resultado universal é prometido."],
  ["É preciso agendar?","Use o WhatsApp oficial para solicitar uma avaliação e confirmar a disponibilidade antes de levar o veículo."],
  ["Onde fica a LavaMed?","Em Itajubá, no bairro Medicina. A rua e o número ainda não foram informados e não são inventados no site."]
];

function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqQuestions.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };
}

function faqContent() {
  return `<section class="content-section"><div class="content-grid"><div class="content-index">Dúvidas / 01—06</div><div class="content-copy"><div class="faq-list">${faqQuestions.map(([question,answer], index) => `<div class="faq-item"><button type="button" aria-expanded="false"><span>${String(index+1).padStart(2,"0")}</span><strong>${question}</strong><i>+</i></button><div class="faq-answer"><p>${answer}</p></div></div>`).join("")}</div></div></div></section>`;
}

function privacyContent() {
  return `<section class="content-section"><div class="content-grid"><div class="content-index">Versão / 24.10.2026</div><div class="content-copy"><h2>Informação essencial.</h2><p>Este site não utiliza contas de usuário e não armazena os dados do formulário em banco de dados. Ao continuar, as informações preenchidas são usadas somente para compor uma mensagem que o visitante decide enviar pelo próprio WhatsApp.</p><p>O provedor de hospedagem pode processar registros técnicos essenciais, como endereço IP, data, navegador e rota acessada, para segurança e operação do serviço.</p><p>Links para WhatsApp, Instagram e Google Maps seguem as políticas desses serviços. Solicitações relacionadas ao atendimento podem ser enviadas pelo canal oficial de WhatsApp.</p><p class="small">Este texto descreve a implementação técnica atual e deve ser revisado caso sejam adicionados analytics, pixels, formulários persistentes ou outras integrações.</p></div></div></section>`;
}

const pages = [
  {
    pathName: "/servicos/", title: "Lava Rápido e Estética Automotiva em Itajubá | LavaMed", description: "Lavagem de carro, higienização automotiva, polimento e serviços para motos na LavaMed, no bairro Medicina em Itajubá.", eyebrow: "11 serviços / preços visíveis", heading: "CUIDADO EM", accent: "CAMADAS.", deck: "De R$ 40 aos cuidados personalizados: compare escopos e encontre o processo certo para o seu veículo.", media: homeMedia, variant: "split", breadcrumbs: [{ href: "/servicos/", label: "Serviços" }], content: catalogContent()
  },
  {
    pathName: "/portfolio/", title: "Portfólio | LavaMed Estética Automotiva", description: "Portfólio de veículos, interiores, motor e acabamentos documentados pela LavaMed em Itajubá.", eyebrow: "Portfólio / reflexos", heading: "CADA REFLEXO", accent: "CONTA.", deck: "Veículos, superfícies e detalhes apresentados com contexto e sem atribuir procedimentos não confirmados.", media: homeMedia, variant: "wide", breadcrumbs: [{ href: "/portfolio/", label: "Portfólio" }], content: portfolioContent()
  },
  {
    pathName: "/antes-e-depois/", title: "Antes e Depois | LavaMed", description: "Comparações de antes e depois da LavaMed com pares fotográficos reais e correspondentes.", eyebrow: "Comparação / transparência", heading: "ANTES. DEPOIS.", accent: "MESMO ÂNGULO.", deck: "Resultados só fazem sentido quando a comparação é honesta: mesmo veículo, enquadramento equivalente e contexto confirmado.", media: comparisonPairs[0].after, variant: "aperture", breadcrumbs: [{ href: "/antes-e-depois/", label: "Antes e depois" }], content: comparisonContent()
  },
  {
    pathName: "/sobre/", title: "Sobre a LavaMed | Estética Automotiva em Itajubá", description: "Conheça a LavaMed, estética automotiva no bairro Medicina, em Itajubá.", eyebrow: "Sobre / Itajubá", heading: "CONFIANÇA QUE", accent: "SE PERCEBE.", deck: "Cuidado profissional, produtos adequados e atendimento humanizado no coração do bairro Medicina.", media: services.find((service) => service.slug === "lavagem-detalhada").image, variant: "vertical", breadcrumbs: [{ href: "/sobre/", label: "Sobre" }], content: `<section class="content-section"><div class="content-grid"><div class="content-index">Manifesto / 01</div><div class="content-copy"><h2>O veículo como investimento e paixão.</h2><p>A LavaMed é uma estética automotiva de Itajubá, localizada no bairro Medicina. Sua missão é cuidar de cada veículo com excelência, unindo técnica profissional, produtos adequados e atendimento humanizado.</p><p>Mais do que um meio de transporte, o carro também representa investimento, rotina e paixão. Por isso, a LavaMed oferece soluções de limpeza, proteção e embelezamento, do cuidado minucioso da cabine à conservação visual da pintura.</p><p>O objetivo é valorizar a apresentação do veículo e buscar um aspecto renovado dentro dos limites de cada material e condição — sem transformar linguagem estética em promessa de restauração.</p><p>Quem mora ou trabalha em Itajubá pode conhecer a LavaMed no bairro Medicina e solicitar uma avaliação para escolher o cuidado adequado.</p></div></div></section><section class="content-section dark"><div class="content-grid"><div class="content-index">Princípios / 02</div><div class="content-copy"><div class="process-list"><div class="process-item"><span>01</span><h3>Observação</h3><p>A condição real orienta a indicação.</p></div><div class="process-item"><span>02</span><h3>Precisão</h3><p>Cada produto e ferramenta tem uma função.</p></div><div class="process-item"><span>03</span><h3>Atendimento</h3><p>Contexto, clareza e cuidado humanizado.</p></div></div></div></div></section>`
  },
  {
    pathName: "/contato/", title: "Contato e agendamento | LavaMed Itajubá", description: "Solicite uma avaliação na LavaMed, estética automotiva em Itajubá, bairro Medicina.", eyebrow: "Contato / bairro Medicina", heading: "COMECE PELO", accent: "DETALHE.", deck: "Conte o que o veículo precisa e continue o agendamento pelo WhatsApp oficial.", variant: "split", breadcrumbs: [{ href: "/contato/", label: "Contato" }], content: contactContent()
  },
  {
    pathName: "/faq/", title: "Perguntas frequentes | LavaMed", description: "Dúvidas sobre serviços, preços e avaliação da LavaMed em Itajubá.", eyebrow: "FAQ / informação", heading: "PERGUNTAS", accent: "FREQUENTES.", deck: "Respostas diretas para entender os serviços antes de solicitar uma avaliação.", variant: "quiet", breadcrumbs: [{ href: "/faq/", label: "Perguntas frequentes" }], schemas: [faqSchema()], content: faqContent()
  },
  {
    pathName: "/politica-de-privacidade/", title: "Política de Privacidade | LavaMed", description: "Política de privacidade do site LavaMed.", eyebrow: "Legal / privacidade", heading: "PRIVACIDADE", accent: "COM CLAREZA.", deck: "Como este site trata as informações enviadas pelo visitante.", variant: "vertical", breadcrumbs: [{ href: "/politica-de-privacidade/", label: "Privacidade" }], content: privacyContent()
  }
];

for (const service of services) {
  const variants = ["split", "aperture", "wide", "vertical", "offset", "quiet"];
  pages.push({
    pathName: `/servicos/${service.slug}/`,
    title: `${service.seoName || service.name} em Itajubá | LavaMed`,
    description: `${service.summary} ${servicePriceLabel(service)} na LavaMed, bairro Medicina, Itajubá.`,
    eyebrow: `${service.number} / ${service.label}`,
    heading: service.name.toUpperCase(),
    deck: `${service.summary} ${servicePriceLabel(service)}.`,
    media: service.image,
    placeholderSlug: service.slug,
    variant: variants[(Number(service.number) - 1) % variants.length],
    bodyClass: "service-page",
    schemas: [serviceSchema(service)],
    breadcrumbs: [{ href: "/servicos/", label: "Serviços" }, { href: `/servicos/${service.slug}/`, label: service.name }],
    content: serviceContent(service)
  });
}

for (const page of pages) {
  const destination = path.join(output, page.pathName.replace(/^\//, ""));
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "index.html"), shell(page), "utf8");
}

const routes = ["/", ...pages.map((page) => page.pathName)];
const sitemapEntries = domain ? routes.map((route) => `<url><loc>${absoluteUrl(route)}</loc></url>`).join("") : "";
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}</urlset>`, "utf8");
await writeFile(path.join(output, "robots.txt"), domain ? `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n` : "User-agent: *\nDisallow: /\n", "utf8");
await writeFile(path.join(output, "404.html"), shell({ title: "Página não encontrada | LavaMed", description: "A página solicitada não foi encontrada.", pathName: "/404.html", eyebrow: "Erro / 404", heading: "FORA DA", accent: "ROTA.", deck: "Este endereço não existe ou mudou.", indexable: false, content: `<section class="content-section dark"><div class="content-copy"><h2>Volte ao início da experiência.</h2><a class="cta-pill" href="/"><span>Ir para o início</span><i>↗</i></a></div></section>` }), "utf8");

const featuredServices = services.filter((service) => service.featured);
const firstFeatured = featuredServices[0];
const homeRows = featuredServices.map((service, index) => `<a class="service-row${index === 0 ? " is-active" : ""}" href="/servicos/${service.slug}/" data-service="${service.slug}" role="listitem"><span>${service.number}</span><div><h3>${service.name}</h3><small>${service.label}<b>${servicePriceLabel(service)}</b></small></div><i>↗</i></a>`).join("");
const homePortfolio = portfolioItems.map((item) => `<a class="gallery-item gallery-${item.shape}" href="/portfolio/" aria-label="Ver no portfólio — ${escapeHtml(item.title)}">${pictureMarkup(item.media, { alt: item.media.alt, sizes: item.shape === "tall" ? "(max-width: 760px) 65vw, 34vw" : "(max-width: 760px) 84vw, 70vw" })}<span><b>${item.number}</b>${escapeHtml(item.note)} / ${escapeHtml(item.title)}</span></a>`).join("");
const homeProcessFrames = processMedia.map((item, index) => `<figure class="process-frame process-frame--${index + 1}">${pictureMarkup(item.media, { alt: item.media.alt, sizes: index === 0 ? "(max-width: 760px) 88vw, 52vw" : "(max-width: 760px) 72vw, 28vw" })}<figcaption><span>${item.number}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.note)}</small></div></figcaption></figure>`).join("");
const compareMarkup = (pair, label) => `<div class="compare" data-compare style="--position:50%">${pictureMarkup(pair.after, { className: "compare-base", alt: pair.after.alt, sizes: "(max-width: 760px) 94vw, 64vw" })}<div class="compare-overlay">${pictureMarkup(pair.before, { alt: pair.before.alt, sizes: "(max-width: 760px) 94vw, 64vw" })}</div><div class="compare-refraction" aria-hidden="true"></div><span class="compare-label before">Antes</span><span class="compare-label after">Depois</span><button class="compare-handle" type="button" role="slider" aria-label="Comparar antes e depois: ${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i>↔</i></button></div>`;
const headlightPair = comparisonPairs.find((pair) => pair.title === "Polimento de farol");
const cabinPair = comparisonPairs.find((pair) => pair.title === "Cabine desmontada");
const homePreloadUrl = homeMedia.avifSrcSet.split(",")[0].trim().split(" ")[0] || homeMedia.src;
const homeHead = headMetadata({
  title: "Estética Automotiva em Itajubá | LavaMed",
  description: "Lava rápido, lavagem de carro, higienização e estética automotiva em Itajubá, no bairro Medicina. Conheça os serviços e preços da LavaMed.",
  pathName: "/",
  image: socialImagePath
});
const homeSource = await readFile(path.join(source, "index.html"), "utf8");
let home = homeSource
  .replace("<!-- HOME_HEAD -->", homeHead)
  .replace("<!-- HOME_PRELOAD -->", `<link rel="preload" href="${escapeHtml(homePreloadUrl)}" as="image" imagesrcset="${escapeHtml(homeMedia.avifSrcSet)}" imagesizes="100vw" type="image/avif" fetchpriority="high">`)
  .replace('href="/assets/site.css"', `href="${styleHref}"`)
  .replace('src="/assets/site.js"', `src="${scriptSrc}"`)
  .replaceAll("{{LOGO_PATH}}", logoPath)
  .replaceAll("<!-- BRAND_CHANNELS -->", brandChannels())
  .replace("<!-- SITE_FOOTER -->", footer())
  .replace("<!-- HOME_HERO_BACKDROP -->", pictureMarkup(homeMedia, { className: "hero-backdrop", alt: "", loading: "eager", fetchpriority: "high", sizes: "100vw" }))
  .replace("<!-- HOME_HERO_CAR -->", pictureMarkup(homeMedia, { alt: "", loading: "eager", fetchpriority: "high", sizes: "100vw" }))
  .replace("<!-- HOME_HERO_SPECULAR -->", pictureMarkup(homeMedia, { alt: "", loading: "eager", sizes: "100vw" }))
  .replace("<!-- HOME_SERVICE_ROWS -->", homeRows)
  .replace("<!-- HOME_PORTFOLIO_ITEMS -->", homePortfolio)
  .replace("<!-- HOME_PROCESS_FRAMES -->", homeProcessFrames)
  .replace("<!-- HOME_RESULT_HEADLIGHT -->", compareMarkup(headlightPair, "Polimento de farol"))
  .replace("<!-- HOME_RESULT_CABIN -->", compareMarkup(cabinPair, "Higienização interna"))
  .replace("<!-- HOME_FINAL_MEDIA -->", pictureMarkup(homeMedia, { alt: "", sizes: "100vw" }))
  .replaceAll("{{HOME_SERVICE_SLUG}}", firstFeatured.slug)
  .replaceAll("{{HOME_SERVICE_NUMBER}}", firstFeatured.number)
  .replaceAll("{{HOME_SERVICE_NAME}}", firstFeatured.name)
  .replaceAll("{{HOME_SERVICE_PRICE}}", servicePriceLabel(firstFeatured))
  .replaceAll("{{HOME_SERVICE_IMAGE}}", firstFeatured.image.src)
  .replaceAll("{{HOME_SERVICE_SRCSET}}", firstFeatured.image.webpSrcSet)
  .replaceAll("{{HOME_SERVICE_SIZES}}", "(max-width: 900px) 100vw, 50vw")
  .replaceAll("{{HOME_SERVICE_WIDTH}}", String(firstFeatured.image.width))
  .replaceAll("{{HOME_SERVICE_HEIGHT}}", String(firstFeatured.image.height))
  .replaceAll("{{HOME_SERVICE_ALT}}", firstFeatured.image.alt)
  .replaceAll("{{HOME_SERVICE_MEDIA_LABEL}}", mediaLabel(firstFeatured.image));
storyActs.forEach((act, index) => {
  home = home.replace(`<!-- STORY_ACT_${index + 1} -->`, pictureMarkup(act.image, { alt: "", sizes: "100vw" }));
});
await writeFile(path.join(output, "index.html"), home, "utf8");

console.log(`Built ${routes.length} routes${domain ? ` for ${domain} (${activeDomainStage})` : " in local noindex mode (set SITE_URL for production)"} with ${path.basename(scriptSrc)} and ${path.basename(styleHref)}`);
