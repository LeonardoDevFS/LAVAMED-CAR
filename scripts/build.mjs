import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "vite";
import { business, comparisonPairs, services } from "../src/config.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const output = path.join(root, "dist");
const domain = (business.domain || "https://lavamed.example").replace(/\/$/, "");

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
await rm(path.join(output, ".vite"), { recursive: true, force: true });

const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

function shell({ title, description, pathName, eyebrow, heading, accent = "", deck, image = "detail", content, bodyClass = "", variant = "offset" }) {
  const canonical = `${domain}${pathName}`;
  const fullHeading = accent ? `${heading}<br><em>${accent}</em>` : heading;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#050b12"><meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:type" content="website"><meta property="og:image" content="${domain}/assets/images/lavamed-${image}.jpg">
  <link rel="canonical" href="${canonical}"><link rel="icon" href="/assets/logo-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="${styleHref}"><script type="module" src="${scriptSrc}"></script>
  <title>${escapeHtml(title)}</title>
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "AutoWash", name: "LavaMed Estética Automotiva", url: domain })}</script>
</head>
<body class="internal ${bodyClass}">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a><div class="noise" aria-hidden="true"></div><div class="transition" aria-hidden="true"><span></span><span></span><span></span></div><div class="cursor" aria-hidden="true"><i></i></div><div class="scroll-progress" aria-hidden="true"><span></span></div>
  ${header(pathName)}${menu(pathName)}
  <main class="internal-main" id="conteudo">
    <section class="page-hero page-hero--${variant}"><div class="page-hero-media" aria-hidden="true"><img src="/assets/images/lavamed-${image}.jpg" width="1536" height="1024" alt=""></div><span class="page-hero-code" aria-hidden="true">LVM / ${variant.toUpperCase()}</span><p class="page-kicker">${eyebrow}</p><h1 class="page-title">${fullHeading}</h1><p class="page-deck">${deck}</p></section>
    ${content}
  </main>
  ${footer()}
</body></html>`;
}

function header(pathName) {
  return `<header class="site-header" data-header><a class="brand" href="/" aria-label="LavaMed — início"><img src="/assets/logo-mark.svg" width="172" height="44" alt="LavaMed"></a><div class="header-actions"><a class="header-cta magnetic" href="/contato/" data-booking>Agendar <span aria-hidden="true">↗</span></a><button class="menu-toggle magnetic" type="button" aria-expanded="false" aria-controls="menu-panel"><span class="menu-label">Menu</span><span class="menu-icon" aria-hidden="true"><i></i><i></i></span></button></div></header>`;
}

function menu(pathName) {
  const links = [["/","Início"],["/servicos/","Serviços"],["/portfolio/","Portfólio"],["/antes-e-depois/","Antes / depois"],["/sobre/","Sobre"],["/contato/","Contato"]];
  return `<div class="menu-panel" id="menu-panel" aria-hidden="true"><div class="menu-glow" aria-hidden="true"></div><nav aria-label="Navegação principal">${links.map(([href,label], index) => `<a href="${href}"${pathName === href ? ' aria-current="page"' : ""}><sup>${String(index + 1).padStart(2,"0")}</sup><span>${label}</span></a>`).join("")}</nav><div class="menu-meta"><span>Estética automotiva</span><span>Precisão em movimento</span></div></div>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-top"><img src="/assets/logo-mark.svg" width="172" height="44" alt="LavaMed"><p>Estética automotiva<br>com método e precisão.</p></div><div class="footer-grid"><nav aria-label="Links do rodapé"><a href="/servicos/">Serviços</a><a href="/portfolio/">Portfólio</a><a href="/sobre/">Sobre</a><a href="/faq/">Perguntas frequentes</a></nav><nav aria-label="Informações legais"><a href="/contato/">Contato</a><a href="/politica-de-privacidade/">Privacidade</a></nav><div class="footer-contact" data-business-meta><span>Dados comerciais em atualização</span></div></div><div class="footer-bottom"><span>© <span data-year></span> LavaMed</span><span>Reflexo em movimento</span><a href="#conteudo">Voltar ao topo ↑</a></div></footer>`;
}

const directory = `<section class="content-section dark"><div class="content-grid"><div class="content-index">Processos / 01—06</div><div class="content-copy"><h2>Cada material pede uma abordagem.</h2><p>Os serviços abaixo formam a estrutura inicial do site. Disponibilidade, escopo e indicação devem ser confirmados na avaliação do veículo.</p></div></div><div class="service-directory">${services.map((service) => `<a class="directory-row" href="/servicos/${service.slug}/"><span>${service.number}</span><h2>${service.name}</h2><i>↗</i></a>`).join("")}</div></section>`;

const pages = [
  {
    pathName: "/servicos/", title: "Serviços | LavaMed Estética Automotiva", description: "Conheça os processos de cuidado automotivo da LavaMed.", eyebrow: "Serviços / método", heading: "CUIDADO EM", accent: "CAMADAS.", deck: "Da leitura inicial ao acabamento, cada processo é orientado pelo material e pelo estado real do veículo.", variant: "split", content: directory
  },
  {
    pathName: "/portfolio/", title: "Portfólio | LavaMed Estética Automotiva", description: "Portfólio e direção visual da LavaMed.", eyebrow: "Portfólio / reflexos", heading: "CADA REFLEXO", accent: "CONTA.", deck: "Uma galeria para documentar processos, superfícies e resultados reais com consistência visual.", image: "hero", variant: "wide", content: `<section class="content-section dark"><div class="content-grid"><div class="content-index">Acervo / em preparação</div><div class="content-copy"><h2>Trabalhos reais, sem atalhos.</h2><p>O portfólio será preenchido somente com fotografias confirmadas de serviços executados pela LavaMed. As imagens atuais definem a direção de arte e não são apresentadas como trabalhos de clientes.</p><div class="empty-state"><strong>Acervo real em atualização.</strong><p>Substitua os arquivos de campanha por fotografias autorizadas em <code>src/assets/images</code> e cadastre cada trabalho com serviço, veículo e contexto.</p></div></div></div></section>`
  },
  {
    pathName: "/antes-e-depois/", title: "Antes e Depois | LavaMed", description: "Comparações de antes e depois da LavaMed com pares fotográficos reais e correspondentes.", eyebrow: "Comparação / transparência", heading: "ANTES. DEPOIS.", accent: "MESMO ÂNGULO.", deck: "Resultados só fazem sentido quando a comparação é honesta: mesmo veículo, mesmo enquadramento e contexto confirmado.", variant: "aperture", content: comparisonContent()
  },
  {
    pathName: "/sobre/", title: "Sobre a LavaMed | Estética Automotiva", description: "Conheça o conceito, o método e a atenção ao detalhe da LavaMed.", eyebrow: "Sobre / manifesto", heading: "PRECISÃO QUE", accent: "APARECE.", deck: "A LavaMed organiza o cuidado automotivo em torno de três elementos: água, luz e matéria.", image: "hero", variant: "vertical", content: `<section class="content-section"><div class="content-grid"><div class="content-index">Manifesto / 01</div><div class="content-copy"><h2>Olhar antes de agir.</h2><p>Superfícies diferentes pedem decisões diferentes. Por isso, a proposta da LavaMed começa pela leitura do veículo e continua em uma sequência de cuidado coerente com cada material.</p><p>A água conduz o processo. A luz revela o acabamento. A matéria determina a técnica.</p><p class="small">História, equipe e credenciais devem ser adicionadas quando as informações oficiais forem fornecidas.</p></div></div></section><section class="content-section dark"><div class="content-grid"><div class="content-index">Princípios / 02</div><div class="content-copy"><div class="process-list"><div class="process-item"><span>01</span><h3>Observação</h3><p>A condição real orienta a indicação.</p></div><div class="process-item"><span>02</span><h3>Precisão</h3><p>Cada produto e ferramenta tem uma função.</p></div><div class="process-item"><span>03</span><h3>Transparência</h3><p>Sem promessas universais ou resultados fabricados.</p></div></div></div></div></section>`
  },
  {
    pathName: "/contato/", title: "Contato e agendamento | LavaMed", description: "Entre em contato com a LavaMed para avaliar seu veículo.", eyebrow: "Contato / avaliação", heading: "COMECE PELO", accent: "DETALHE.", deck: "Conte o que o seu carro precisa. A indicação correta começa com contexto e avaliação.", variant: "split", content: contactContent()
  },
  {
    pathName: "/faq/", title: "Perguntas frequentes | LavaMed", description: "Dúvidas frequentes sobre os processos de estética automotiva da LavaMed.", eyebrow: "FAQ / informação", heading: "PERGUNTAS", accent: "FREQUENTES.", deck: "Respostas diretas para entender o processo antes de agendar uma avaliação.", variant: "quiet", content: faqContent()
  },
  {
    pathName: "/politica-de-privacidade/", title: "Política de Privacidade | LavaMed", description: "Política de privacidade do site LavaMed.", eyebrow: "Legal / privacidade", heading: "PRIVACIDADE", accent: "COM CLAREZA.", deck: "Como este site trata as informações enviadas pelo visitante.", variant: "vertical", content: privacyContent()
  }
];

for (const service of services) {
  const serviceVariants = ["split", "aperture", "wide", "vertical", "offset", "quiet"];
  pages.push({
    pathName: `/servicos/${service.slug}/`,
    title: `${service.name} | LavaMed`, description: `${service.summary} Consulte a LavaMed para avaliação.`, eyebrow: `${service.number} / ${service.eyebrow}`, heading: service.name.toUpperCase(), deck: service.summary, variant: serviceVariants[Number(service.number) - 1],
    content: `<section class="content-section"><div class="content-grid"><div class="content-index">${service.number} / Processo</div><div class="content-copy"><h2>Indicação começa pela avaliação.</h2><p>${service.detail}</p><p class="small">Etapas, prazo, produtos e valores dependem da avaliação do veículo. Nenhuma condição comercial foi presumida nesta página.</p><div class="process-list"><div class="process-item"><span>01</span><h3>Leitura</h3><p>Condição, material e objetivo.</p></div><div class="process-item"><span>02</span><h3>Processo</h3><p>Sequência definida para o veículo.</p></div><div class="process-item"><span>03</span><h3>Entrega</h3><p>Orientação de cuidado e manutenção.</p></div></div><a class="cta-pill" href="/contato/" data-booking data-service="${service.name}"><span>Solicitar avaliação</span><i>↗</i></a></div></div></section>${directory}`
  });
}

function contactContent() {
  return `<section class="content-section dark"><div class="contact-panel"><form class="contact-form" data-contact-form><div class="field"><label for="nome">Seu nome</label><input id="nome" name="nome" autocomplete="name" required></div><div class="field"><label for="servico">Serviço de interesse</label><select id="servico" name="servico"><option value="uma avaliação">Quero uma avaliação</option>${services.map((s) => `<option value="${s.name}">${s.name}</option>`).join("")}</select></div><div class="field"><label for="mensagem">Conte um pouco sobre o veículo</label><textarea id="mensagem" name="mensagem"></textarea></div><button class="submit-button" type="submit">Continuar agendamento ↗</button><p class="form-status" aria-live="polite"></p></form><aside class="contact-aside"><h2>A conversa começa aqui.</h2><p>O número oficial do WhatsApp, endereço, cidade e horário ainda não foram fornecidos. Assim que forem preenchidos em <code>src/config.js</code>, os botões de todo o site serão atualizados automaticamente.</p><div data-business-meta><span>Dados comerciais em atualização</span></div></aside></div></section>`;
}

function comparisonContent() {
  if (!comparisonPairs.length) {
    return `<section class="content-section dark"><div class="content-grid"><div class="content-index">Componente / pronto</div><div class="content-copy"><h2>O comparador está pronto para o acervo real.</h2><p>O controle aceita mouse, toque e teclado. Até a inclusão de pares correspondentes e autorizados, nenhum resultado de cliente é simulado.</p><div class="empty-state"><strong>Fotografias aguardando confirmação.</strong><p>Inclua pares reais com alinhamento equivalente em <code>comparisonPairs</code>, dentro de <code>src/config.js</code>. A página passará a exibir os trabalhos assim que esses materiais forem fornecidos.</p></div></div></div></section>`;
  }
  return `<section class="content-section dark"><div class="content-grid"><div class="content-index">Resultados / 01—${String(comparisonPairs.length).padStart(2,"0")}</div><div class="content-copy"><h2>Pares reais e correspondentes.</h2><p>Arraste a linha ou use as setas do teclado para comparar cada trabalho.</p></div></div>${comparisonPairs.map((pair) => `<article class="result-pair"><h2>${escapeHtml(pair.title)}</h2><div class="compare" data-compare data-before="${escapeHtml(pair.before)}" data-after="${escapeHtml(pair.after)}" style="--position:50%"><img class="compare-base" src="${escapeHtml(pair.after)}" alt="${escapeHtml(pair.altAfter)}"><div class="compare-overlay"><img src="${escapeHtml(pair.before)}" alt="${escapeHtml(pair.altBefore)}"></div><div class="compare-refraction" aria-hidden="true"></div><span class="compare-label before">Antes</span><span class="compare-label after">Depois</span><button class="compare-handle" type="button" role="slider" aria-label="Comparar antes e depois: ${escapeHtml(pair.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><i>↔</i></button></div></article>`).join("")}</section>`;
}

function faqContent() {
  const questions = [
    ["Como escolher o serviço?","A condição do veículo, o material e o objetivo definem a indicação. Uma avaliação evita escolher um processo maior ou menor do que o necessário."],
    ["Quanto tempo leva?","O prazo varia conforme o serviço e o estado do veículo. A LavaMed deve confirmar a estimativa depois da avaliação."],
    ["A vitrificação remove riscos?","Proteção e correção de pintura são etapas diferentes. A necessidade de polimento e o nível de correção dependem da inspeção do verniz."],
    ["É preciso agendar?","O fluxo de atendimento ainda precisa ser confirmado pela empresa. Use a página de contato para solicitar uma avaliação."],
    ["Como conservar o acabamento?","A orientação depende da proteção aplicada, do uso do veículo e da rotina de lavagem. A equipe informa os cuidados adequados na entrega."]
  ];
  return `<section class="content-section"><div class="content-grid"><div class="content-index">Dúvidas / 01—05</div><div class="content-copy"><div class="faq-list">${questions.map(([q,a], index) => `<div class="faq-item"><button type="button" aria-expanded="false"><span>${String(index+1).padStart(2,"0")}</span><strong>${q}</strong><i>+</i></button><div class="faq-answer"><p>${a}</p></div></div>`).join("")}</div></div></div></section>`;
}

function privacyContent() {
  return `<section class="content-section"><div class="content-grid"><div class="content-index">Versão / 24.10.2026</div><div class="content-copy"><h2>Informação essencial.</h2><p>Este site não utiliza contas de usuário e não armazena dados do formulário em banco de dados. Quando um número oficial de WhatsApp for configurado, os dados preenchidos serão usados para compor uma mensagem que o visitante poderá enviar pelo próprio WhatsApp.</p><p>O provedor de hospedagem pode processar registros técnicos essenciais, como endereço IP, data, navegador e rota acessada, para segurança e operação do serviço.</p><p>Links para serviços externos seguem as políticas desses serviços. A LavaMed deverá incluir um canal oficial para solicitações de privacidade assim que seus dados de contato forem confirmados.</p><p class="small">Este texto descreve a implementação técnica atual e deve ser revisado caso sejam adicionados analytics, pixels, formulários persistentes ou outras integrações.</p></div></div></section>`;
}

for (const page of pages) {
  const destination = path.join(output, page.pathName.replace(/^\//, ""));
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "index.html"), shell(page), "utf8");
}

const routes = ["/", ...pages.map((page) => page.pathName)];
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((route) => `<url><loc>${domain}${route}</loc></url>`).join("")}</urlset>`, "utf8");
await writeFile(path.join(output, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`, "utf8");
await writeFile(path.join(output, "404.html"), shell({ title: "Página não encontrada | LavaMed", description: "A página solicitada não foi encontrada.", pathName: "/404.html", eyebrow: "Erro / 404", heading: "FORA DA", accent: "ROTA.", deck: "Este endereço não existe ou mudou.", content: `<section class="content-section dark"><div class="content-copy"><h2>Volte ao início da experiência.</h2><a class="cta-pill" href="/"><span>Ir para o início</span><i>↗</i></a></div></section>` }), "utf8");

const homeSource = await readFile(path.join(source, "index.html"), "utf8");
const home = homeSource
  .replace('href="/assets/site.css"', `href="${styleHref}"`)
  .replace('src="/assets/site.js"', `src="${scriptSrc}"`)
  .replaceAll("https://lavamed.example", domain);
await writeFile(path.join(output, "index.html"), home, "utf8");
console.log(`Built ${routes.length} routes with ${path.basename(scriptSrc)} and ${path.basename(styleHref)}`);
