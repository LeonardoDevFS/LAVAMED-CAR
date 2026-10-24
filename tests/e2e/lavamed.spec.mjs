import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const screenshotDirectory = "test-results/screenshots";

test.beforeAll(async () => {
  await mkdir(screenshotDirectory, { recursive: true });
});

test("hero, menu and internal navigation are functional", async ({ page }) => {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });

  await page.goto("/");
  await page.waitForTimeout(2300);
  await expect(page.locator("h1")).toContainText("NÃO É SÓ");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".hero-car-layer")).toBeVisible();
  await page.screenshot({ path: `${screenshotDirectory}/desktop.png`, fullPage: false });

  const menu = page.locator(".menu-toggle");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#menu-panel")).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator("#menu-panel a").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();

  await menu.click();
  await Promise.all([
    page.waitForURL("**/servicos/"),
    page.locator('#menu-panel a[href="/servicos/"]').click()
  ]);
  await expect(page.locator("h1")).toContainText("CUIDADO EM");

  await page.goto("/servicos/polimento-automotivo/");
  await expect(page.locator("h1")).toContainText("POLIMENTO AUTOMOTIVO");
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", /polimento-automotivo/);
  expect(runtimeErrors).toEqual([]);
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
});

test("comparison, gallery keyboard and drag interactions work", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2100);

  const handle = page.locator(".compare-handle");
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  const initialValue = Number(await handle.getAttribute("aria-valuenow"));
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", String(initialValue + 4));
  const beforeSource = await page.locator(".compare-base").getAttribute("src");
  const afterSource = await page.locator(".compare-overlay img").getAttribute("src");
  expect(beforeSource).not.toBe(afterSource);

  const secondService = page.locator('[data-service="higienizacao-interna"]');
  await secondService.scrollIntoViewIfNeeded();
  await secondService.focus();
  await expect(page.locator("[data-service-caption]")).toHaveText("Higienização interna");
  await expect(page.locator("[data-service-placeholder]")).toHaveClass(/is-higienizacao-interna/);
  await expect(page.locator("[data-service-image]")).toBeHidden();
  await page.screenshot({ path: `${screenshotDirectory}/services.png`, fullPage: false });

  const gallery = page.locator("[data-gallery]");
  await gallery.scrollIntoViewIfNeeded();
  await gallery.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  expect(await gallery.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);

  const firstItem = gallery.locator(".gallery-item").first();
  const box = await firstItem.boundingBox();
  await page.mouse.move(box.x + box.width * .72, box.y + box.height * .5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .3, box.y + box.height * .5, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  expect(new URL(page.url()).pathname).toBe("/");
});

test.describe("mobile and reduced motion", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("keeps the narrative legible without motion", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".menu-toggle")).toBeVisible();
    await page.screenshot({ path: `${screenshotDirectory}/mobile.png`, fullPage: false });
    await page.locator("[data-camera]").scrollIntoViewIfNeeded();
    await expect(page.locator('[data-scene="0"]')).toBeVisible();
    await expect(page.locator('[data-scene="1"]')).toBeHidden();
  });
});
