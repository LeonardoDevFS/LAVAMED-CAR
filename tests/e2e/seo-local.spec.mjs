import { expect, test } from "@playwright/test";
import { services, servicePriceLabel, whatsappUrl } from "../../src/config.js";

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 568 }]) {
  test(`local content and booking work without JavaScript at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport });
    const page = await context.newPage();
    try {
      await page.goto("/");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText("Estética Automotiva e Lava Rápido em Itajubá");
      await expect(page.locator("h1")).toBeVisible();
      const heading = await page.locator("h1").boundingBox();
      expect(heading.x).toBeGreaterThanOrEqual(0);
      expect(heading.x + heading.width).toBeLessThanOrEqual(viewport.width);
      expect(heading.y + heading.height).toBeLessThanOrEqual(viewport.height);
      await expect(page.locator(".hero-slogan")).toContainText("É TRANSFORMAR.");
      await expect(page.locator(".hero-booking")).toHaveAttribute("href", whatsappUrl());
      await expect(page.locator(".local-intro")).toContainText("bairro Medicina, em Itajubá");
      await page.locator('.local-intro a[href="/servicos/lavagem-completa/"]').click();
      await expect(page).toHaveURL(/\/servicos\/lavagem-completa\/$/);
      const service = services.find((item) => item.slug === "lavagem-completa");
      await expect(page.locator(".service-cta")).toHaveAttribute("href", whatsappUrl(service));
      await expect(page.locator(".related-services")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    } finally {
      await context.close();
    }
  });
}

test("all service scopes, prices and WhatsApp messages are delivered without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    for (const service of services) {
      const response = await page.goto(`/servicos/${service.slug}/`);
      expect(response.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText(service.name.toUpperCase());
      await expect(page.locator(".service-lead")).toHaveText(service.detail);
      await expect(page.locator(".service-price-band strong")).toHaveText(servicePriceLabel(service));
      await expect(page.locator(".service-cta")).toHaveAttribute("href", whatsappUrl(service));
      await expect(page.locator(".service-cta")).toHaveAttribute("target", "_blank");
      for (const exclusion of service.exclusions) await expect(page.locator(".service-notes")).toContainText(exclusion);
    }
  } finally {
    await context.close();
  }
});

test("published routes return 200, aliases redirect and unknown routes keep real 404s", async ({ request }) => {
  const routes = ["/", "/servicos/", "/portfolio/", "/antes-e-depois/", "/sobre/", "/contato/", "/faq/", "/politica-de-privacidade/", ...services.map((service) => `/servicos/${service.slug}/`)];
  for (const route of routes) {
    expect((await request.get(route)).status()).toBe(200);
    for (const alias of [`${route}index.html`, ...(route === "/" ? [] : [route.slice(0, -1)])]) {
      const response = await request.get(`${alias}?origem=teste`, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      expect(response.headers().location).toBe(`${route}?origem=teste`);
    }
  }
  for (const route of ["/rota-inexistente/", "/servicos/inexistente/", "/servicos/inexistente/index.html"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('name="robots" content="noindex,follow"');
  }
});
