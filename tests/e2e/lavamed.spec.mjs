import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { servicePriceLabel, services } from "../../src/config.js";

const screenshotDirectory = "test-results/screenshots";

test.beforeAll(async () => {
  await mkdir(screenshotDirectory, { recursive: true });
});

test("hero, menu and internal navigation are functional", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });

  await page.addInitScript(() => localStorage.setItem("lavamed-sound", "enabled"));
  await page.goto("/");
  await page.waitForTimeout(2100);
  await expect(page.locator("h1")).toContainText("NÃO É SÓ");
  await expect(page.locator(".eyebrow")).toContainText("Itajubá");
  await expect(page.locator(".hero-car-layer")).toBeVisible();
  await expect(page.locator(".site-header .brand img")).toHaveAttribute("src", "/assets/images/hero/LavaMed_logo_vetorial_HD.svg");
  await expect(page.locator(".site-header .brand-channels a")).toHaveCount(3);
  await expect(page.locator('.site-header .brand-channels a[aria-label*="WhatsApp"]')).toHaveAttribute("href", /wa\.me\/5535984586615/);
  await expect(page.locator('.site-header .brand-channels a[aria-label*="Instagram"]')).toHaveAttribute("href", "https://www.instagram.com/lavamed.itajuba/");
  await expect(page.locator('.site-header .brand-channels a[aria-label*="Maps"]')).toHaveAttribute("href", "https://share.google/Vm2BAGotXmrrtKJi1");
  await expect(page.locator('picture source[type="image/avif"]')).not.toHaveCount(0);
  await expect(page.locator(".gallery-item")).toHaveCount(7);
  await expect(page.locator("[data-sound-toggle]")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("lavamed-sound"))).toBeNull();
  await expect(page.locator(".hero-backdrop")).toHaveAttribute("src", /conceitual-coupe-escuro/);
  await expect(page.locator("[data-process-preview]")).toHaveCount(2);
  await expect(page.locator("video")).toHaveCount(3);
  await expect(page.locator("[data-process-preview]").first()).toHaveAttribute("preload", "none");
  await expect(page.locator("[data-process-preview]").last()).toHaveAttribute("preload", "none");
  await page.screenshot({ path: `${screenshotDirectory}/desktop.png`, fullPage: false });

  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#menu-panel")).toHaveAttribute("aria-hidden", "false");
  await page.waitForTimeout(350);
  await expect(page.locator("#menu-panel a").first()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#motion-mode")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();

  await menu.click();
  await Promise.all([
    page.waitForURL("**/servicos/"),
    page.locator('#menu-panel a[href="/servicos/"]').click()
  ]);
  await expect(page.locator("h1")).toContainText("CUIDADO EM");
  await expect(page.locator(".catalog-row")).toHaveCount(11);

  await page.goto("/servicos/lavagem-simples/");
  await expect(page.locator("h1")).toContainText("LAVAGEM SIMPLES");
  await expect(page.locator(".service-notes")).toContainText("Não inclui limpeza nem aspiração");
  await expect(page.locator(".service-cta")).toHaveAttribute("href", /wa\.me\/5535984586615/);
  await expect(page.locator(".page-hero-media img")).toBeVisible();
  await expect(page.locator(".media-provenance")).toContainText("Acervo LavaMed");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator(".breadcrumbs li")).toHaveCount(3);
  await page.screenshot({ path: `${screenshotDirectory}/service-detail.png`, fullPage: false });

  await page.goto("/contato/");
  await page.evaluate(() => { window.open = (url) => { window.__whatsappUrl = url; }; });
  await page.locator("#nome").fill("Teste LavaMed");
  await page.locator("#servico").selectOption("Lavagem Simples");
  await page.locator("#mensagem").fill("Veículo para avaliação.");
  await page.locator("[data-contact-form]").evaluate((form) => form.requestSubmit());
  await expect(page.locator(".form-status")).toHaveText("Abrindo o WhatsApp…");
  expect(await page.evaluate(() => window.__whatsappUrl)).toContain("wa.me/5535984586615");
  expect(decodeURIComponent(await page.evaluate(() => window.__whatsappUrl))).toContain("valor inicial de A partir de R$ 40");
  expect(runtimeErrors).toEqual([]);
});

test("contact form follows the LavaMed theme and reacts to every field", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  await page.goto("/contato/");
  const form = page.locator("[data-contact-form]");
  const name = page.locator("#nome");
  const service = page.locator("#servico");
  const message = page.locator("#mensagem");

  const nativeColors = await service.locator("option").first().evaluate((option) => ({
    background: getComputedStyle(option).backgroundColor,
    color: getComputedStyle(option).color,
    scheme: getComputedStyle(option.parentElement).colorScheme
  }));
  expect(nativeColors.background).not.toBe("rgb(255, 255, 255)");
  expect(nativeColors.color).not.toBe(nativeColors.background);
  expect(nativeColors.scheme).toContain("dark");

  await form.evaluate((node) => node.requestSubmit());
  await expect(name.locator("xpath=ancestor::*[@data-contact-field]")).toHaveClass(/is-invalid/);
  await expect(page.locator("[data-form-status]")).toContainText("Revise o campo destacado");

  await name.fill("Leonardo");
  await expect(name.locator("xpath=ancestor::*[@data-contact-field]")).toHaveClass(/is-filled/);
  await service.selectOption("Lavagem Detalhada");
  await expect(page.locator("[data-contact-service]")).toHaveText("Lavagem Detalhada");
  await expect(page.locator("[data-contact-price]")).toContainText(servicePriceLabel(services.find((item) => item.name === "Lavagem Detalhada")));
  await message.fill("Volkswagen Up para uma avaliação cuidadosa.");
  await expect(page.locator("[data-message-count]")).toHaveText("43 / 280");
  await expect(page.locator("[data-contact-progress]")).toHaveCSS("transform", /matrix/);

  await page.evaluate(() => { window.open = (url) => { window.__contactWhatsappUrl = url; }; });
  await form.evaluate((node) => node.requestSubmit());
  await expect(page.locator("[data-form-status]")).toHaveAttribute("data-state", "success");
  await expect(page.locator("[data-form-status]")).toHaveText("Abrindo o WhatsApp…");
  expect(decodeURIComponent(await page.evaluate(() => window.__contactWhatsappUrl))).toContain("o serviço Lavagem Detalhada");

  await page.setViewportSize({ width: 390, height: 844 });
  const geometry = await page.evaluate(() => ({ documentWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(runtimeErrors).toEqual([]);
});

test("hero title stays inside the viewport on target desktop sizes", async ({ page }) => {
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.waitForTimeout(2000);
    const geometry = await page.locator(".title-indent > span").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + 1);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
    await page.screenshot({ path: `${screenshotDirectory}/hero-${viewport.width}x${viewport.height}.png`, fullPage: false });
  }
});

test("loads the brand fonts, tracks the pointer and publishes a readable footer", async ({ page }) => {
  const failedRequests = [];
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  const typography = await page.evaluate(() => ({
    archivo: [...document.fonts].some((font) => font.family.includes("Archivo Black") && font.status === "loaded"),
    spaceGrotesk: [...document.fonts].some((font) => font.family.includes("Space Grotesk") && font.status === "loaded"),
    displayFamily: getComputedStyle(document.querySelector("h1")).fontFamily,
    bodyFamily: getComputedStyle(document.body).fontFamily,
    damagedEncoding: /�|Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â€/.test(document.body.innerText),
    loadedFontFiles: performance.getEntriesByType("resource").filter((entry) => entry.name.includes(".woff2")).length
  }));
  expect(typography.archivo).toBe(true);
  expect(typography.spaceGrotesk).toBe(true);
  expect(typography.displayFamily).toContain("Archivo Black");
  expect(typography.bodyFamily).toContain("Space Grotesk");
  expect(typography.damagedEncoding).toBe(false);
  expect(typography.loadedFontFiles).toBeGreaterThanOrEqual(2);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);

  await page.mouse.move(620, 410);
  await page.waitForTimeout(260);
  const cursor = await page.locator(".cursor").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, opacity: getComputedStyle(node).opacity };
  });
  expect(Math.abs(cursor.x - 620)).toBeLessThanOrEqual(2);
  expect(Math.abs(cursor.y - 410)).toBeLessThanOrEqual(2);
  expect(Number(cursor.opacity)).toBe(1);

  const footer = page.locator(".site-footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toContainText("Todos os direitos reservados");
  await expect(footer).toContainText("Leonardo Jonathan do Carmo");
  await expect(footer.locator('a[href="tel:+5535988267259"]')).toHaveText("(35) 98826-7259");
  await expect(footer.locator(".footer-services a")).toHaveCount(6);
  const footerSizes = await footer.evaluate((node) => ({
    link: parseFloat(getComputedStyle(node.querySelector(".footer-grid a")).fontSize),
    legal: parseFloat(getComputedStyle(node.querySelector(".footer-bottom")).fontSize)
  }));
  expect(footerSizes.link).toBeGreaterThanOrEqual(13);
  expect(footerSizes.legal).toBeGreaterThanOrEqual(13);
  expect(failedRequests.filter((url) => url.includes(".woff2"))).toEqual([]);
  await page.screenshot({ path: `${screenshotDirectory}/footer-desktop.png`, fullPage: false });
  await footer.locator(".footer-bottom").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${screenshotDirectory}/footer-legal-desktop.png`, fullPage: false });
});

test("scroll story changes acts and reverses consistently", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2100);
  const cameraTop = await page.locator("[data-camera]").evaluate((node) => node.getBoundingClientRect().top + scrollY);
  const viewport = await page.evaluate(() => innerHeight);

  await page.evaluate(([top, height]) => scrollTo(0, top + height * 3.25), [cameraTop, viewport]);
  await page.waitForTimeout(900);
  await expect(page.locator("[data-camera-count]")).toHaveText("04");
  await expect(page.locator('[data-scene="3"]')).toHaveClass(/is-active/);
  await page.screenshot({ path: `${screenshotDirectory}/story-finish.png`, fullPage: false });

  await page.evaluate((top) => scrollTo(0, top + 20), cameraTop);
  await page.waitForTimeout(900);
  await expect(page.locator("[data-camera-count]")).toHaveText("01");
  await expect(page.locator('[data-scene="0"]')).toHaveClass(/is-active/);

  await page.locator(".final-scene").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await expect(page.locator(".final-scene .cta-pill")).toContainText("Agendar pelo WhatsApp");
  await page.screenshot({ path: `${screenshotDirectory}/final-scene.png`, fullPage: false });
});

test("service transitions, comparison and gallery input modes work", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2100);

  await page.locator("[data-process-cinema]").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${screenshotDirectory}/process-cinema.png`, fullPage: false });

  const comparison = page.locator(".results-feature--headlight .compare");
  const handle = comparison.locator(".compare-handle");
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  const initialValue = Number(await handle.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", String(initialValue + 4));
  expect(await comparison.locator(".compare-base").getAttribute("src")).not.toBe(await comparison.locator(".compare-overlay img").getAttribute("src"));
  const headlightFrame = await comparison.evaluate((node) => {
    const frame = node.getBoundingClientRect();
    const after = node.querySelector(".compare-base").getBoundingClientRect();
    return { frameWidth: frame.width, frameHeight: frame.height, afterWidth: after.width, afterHeight: after.height };
  });
  expect(Math.abs(headlightFrame.frameWidth - headlightFrame.afterWidth)).toBeLessThanOrEqual(1);
  expect(Math.abs(headlightFrame.frameHeight - headlightFrame.afterHeight)).toBeLessThanOrEqual(1);
  const cabinComparison = page.locator(".results-feature--cabin .compare");
  await expect(cabinComparison.locator(".compare-base")).toHaveAttribute("src", /cabine-desmontada-depois-higienizacao/);
  await expect(cabinComparison.locator(".compare-overlay img")).toHaveAttribute("src", /cabine-desmontada-antes-higienizacao/);
  await page.screenshot({ path: `${screenshotDirectory}/home-comparison.png`, fullPage: false });
  await cabinComparison.scrollIntoViewIfNeeded();
  await cabinComparison.locator(".compare-base").evaluate((image) => image.complete || new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
  await page.waitForTimeout(950);
  await page.screenshot({ path: `${screenshotDirectory}/home-cabin-comparison.png`, fullPage: false });

  const simple = page.locator('.service-row[data-service="lavagem-simples"]');
  const complete = page.locator('.service-row[data-service="lavagem-completa"]');
  await complete.scrollIntoViewIfNeeded();
  for (let index = 0; index < 4; index += 1) {
    await complete.focus();
    await simple.focus();
  }
  await complete.focus();
  await page.waitForTimeout(850);
  await expect(page.locator("[data-service-caption]")).toHaveText("Lavagem Completa");
  await expect(page.locator("[data-service-price]")).toHaveText("A partir de R$ 80");
  await expect(page.locator("[data-service-placeholder]")).toHaveClass(/is-lavagem-completa/);
  await expect(page.locator("[data-service-placeholder]")).toBeHidden();
  await expect(page.locator("[data-service-image]")).toBeVisible();
  await expect(page.locator("[data-service-image]")).toHaveAttribute("src", /jeep-compass-interior-finalizado/);
  await expect(page.locator("[data-service-media-label]")).toContainText("Acervo LavaMed");
  const serviceQuote = page.locator("[data-service-quote]");
  await expect(serviceQuote).toHaveAttribute("href", /wa\.me\/5535984586615/);
  expect(decodeURIComponent(await serviceQuote.getAttribute("href"))).toContain("valor inicial de A partir de R$ 80");
  await page.screenshot({ path: `${screenshotDirectory}/services.png`, fullPage: false });

  const gallery = page.locator("[data-gallery]");
  await gallery.scrollIntoViewIfNeeded();
  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  expect(await gallery.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  await page.screenshot({ path: `${screenshotDirectory}/home-portfolio.png`, fullPage: false });

  const firstItem = gallery.locator(".gallery-item").first();
  const box = await firstItem.boundingBox();
  await page.mouse.move(box.x + box.width * .72, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(180);
  expect(new URL(page.url()).pathname).toBe("/");

  await firstItem.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/portfolio/");
});

test("catalog publishes all prices, service routes and responsible copy", async ({ page, request }) => {
  await page.goto("/servicos/");
  await expect(page.locator(".catalog-row")).toHaveCount(11);
  await expect(page.locator("#comparar")).toContainText("Não inclui limpeza ou aspiração interna");
  await expect(page.locator("body")).toContainText("A partir de R$ 80 o par");
  await expect(page.locator("body")).toContainText("Sob consulta");
  await page.screenshot({ path: `${screenshotDirectory}/catalog-desktop.png`, fullPage: false });

  for (const service of services) {
    const response = await request.get(`/servicos/${service.slug}/`);
    expect(response.status(), service.slug).toBe(200);
    const html = await response.text();
    expect(html).toContain(service.name);
    expect(html).toContain(servicePriceLabel(service));
    expect(html).not.toContain("lavamed.example");
  }

  await page.goto("/servicos/lavagem-motor/");
  await expect(page.locator(".service-modalities")).toContainText("Com verniz de motor");
  await expect(page.locator(".service-modalities")).toContainText("Valor a confirmar");
  await page.goto("/servicos/polimento-farol/");
  await expect(page.locator("main")).toContainText("Grafeno + SiO₂");
  await expect(page.locator(".service-notes")).toContainText("dependem do estado da lente");
  await page.goto("/servicos/adicionais/");
  await expect(page.locator(".scope-list article")).toHaveCount(10);

  await page.goto("/portfolio/");
  await expect(page.locator(".portfolio-card")).toHaveCount(7);
  await expect(page.locator(".archive-note")).toContainText("procedimento que ela não confirme");
  for (const card of await page.locator(".portfolio-card").all()) await card.scrollIntoViewIfNeeded();
  await page.locator(".portfolio-card img").evaluateAll((images) => Promise.all(images.map((image) => image.complete ? true : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })))));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${screenshotDirectory}/portfolio-page.png`, fullPage: true });
  await page.goto("/antes-e-depois/");
  await expect(page.locator(".result-pair")).toHaveCount(3);
  await expect(page.locator(".result-pair").first()).toContainText("Cabine desmontada");
  for (const pair of await page.locator(".result-pair").all()) await pair.scrollIntoViewIfNeeded();
  await page.locator(".result-pair img").evaluateAll((images) => Promise.all(images.map((image) => image.complete ? true : new Promise((resolve) => image.addEventListener("load", resolve, { once: true })))));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${screenshotDirectory}/comparison-page.png`, fullPage: true });
});

test("keeps the home within the local Core Web Vitals budget", async ({ page }) => {
  await page.addInitScript(() => {
    window.__lavamedVitals = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__lavamedVitals.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lavamedVitals.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/");
  await page.waitForTimeout(2500);
  const performance = await page.evaluate(() => ({
    ...window.__lavamedVitals,
    transferSize: window.performance.getEntriesByType("resource").reduce((total, entry) => total + (entry.transferSize || 0), 0),
    heroSource: document.querySelector(".hero-backdrop")?.currentSrc || ""
  }));
  expect(performance.lcp).toBeLessThan(2500);
  expect(performance.cls).toBeLessThan(.1);
  expect(performance.transferSize).toBeLessThan(1_500_000);
  expect(performance.heroSource).toMatch(/\.(avif|webp)$/);
});

test.describe("mobile and reduced motion", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("keeps the narrative and catalog legible without motion", async ({ page }) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 800 }]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(".menu-toggle")).toBeVisible();
      await expect(page.locator(".site-header .brand-channels")).toBeVisible();
      await expect(page.locator(".title-indent > span")).toBeInViewport();
      await expect(page.locator(".hero-booking")).toBeInViewport();
      const layout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewport);
      await page.screenshot({ path: `${screenshotDirectory}/mobile-${viewport.width}.png`, fullPage: false });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator("[data-camera]").scrollIntoViewIfNeeded();
    await expect(page.locator('[data-scene="0"]')).toBeVisible();
    await expect(page.locator('[data-scene="1"]')).toBeVisible();
    await page.locator("[data-process-cinema]").scrollIntoViewIfNeeded();
    await expect(page.locator('[data-process-preview="before"]')).toBeVisible();
    await expect(page.locator('[data-dual-panel="after"]')).toBeHidden();
    await expect(page.locator("[data-process-video-slot]")).toHaveAttribute("data-video-state", "reduced-motion");
    await page.screenshot({ path: `${screenshotDirectory}/mobile-process.png`, fullPage: false });
    await page.locator(".results-feature--headlight").scrollIntoViewIfNeeded();
    await expect(page.getByRole("slider", { name: /Polimento de farol/ })).toBeVisible();
    await page.locator(".results-feature--headlight .compare-base").evaluate((image) => image.complete || new Promise((resolve) => image.addEventListener("load", resolve, { once: true })));
    await page.screenshot({ path: `${screenshotDirectory}/mobile-comparison.png`, fullPage: false });
    await page.locator("[data-service-visual]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-service-quote]")).toBeVisible();
    await page.screenshot({ path: `${screenshotDirectory}/mobile-services.png`, fullPage: false });

    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    await expect(page.locator(".footer-credit")).toContainText("Leonardo Jonathan do Carmo");
    const footerLayout = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(footerLayout.scrollWidth).toBeLessThanOrEqual(footerLayout.viewport);
    await page.screenshot({ path: `${screenshotDirectory}/footer-mobile.png`, fullPage: false });
    await page.locator(".footer-bottom").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${screenshotDirectory}/footer-legal-mobile.png`, fullPage: false });

    await page.goto("/servicos/");
    await expect(page.locator(".catalog-row")).toHaveCount(11);
    await expect(page.locator(".catalog-row").first()).toBeVisible();
    await page.screenshot({ path: `${screenshotDirectory}/catalog-mobile.png`, fullPage: false });
  });
});
