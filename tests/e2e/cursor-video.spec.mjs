import { expect, test } from "@playwright/test";

const cursorRoutes = [
  "/",
  "/servicos/",
  "/servicos/higienizacao-avancada/",
  "/portfolio/",
  "/antes-e-depois/",
  "/contato/"
];

async function cursorGeometry(page) {
  return page.locator(".cursor").evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      opacity: Number(style.opacity),
      state: node.dataset.state,
      classes: node.className
    };
  });
}

test("custom cursor replaces the native pointer without latency on every primary route", async ({ page }) => {
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  for (const route of cursorRoutes) {
    await page.goto(route);
    await page.mouse.move(233, 177);
    await expect(page.locator("html")).toHaveClass(/has-custom-cursor/);
    await expect(page.locator("body")).toHaveCSS("cursor", "none");
    await expect(page.locator(".cursor")).toHaveCSS("opacity", "1");
    let cursor = await cursorGeometry(page);
    expect(Math.abs(cursor.x - 233), `${route}: horizontal cursor offset`).toBeLessThanOrEqual(1);
    expect(Math.abs(cursor.y - 177), `${route}: vertical cursor offset`).toBeLessThanOrEqual(1);
    expect(cursor.opacity, `${route}: custom cursor hidden`).toBe(1);

    for (const [x, y] of [[1, 1], [1438, 1], [1438, 898], [1, 898], [720, 450]]) {
      await page.mouse.move(x, y);
      cursor = await cursorGeometry(page);
      expect(Math.abs(cursor.x - x), `${route}: fast horizontal cursor offset`).toBeLessThanOrEqual(1);
      expect(Math.abs(cursor.y - y), `${route}: fast vertical cursor offset`).toBeLessThanOrEqual(1);
    }

    const link = page.locator(".site-header a:visible").first();
    await link.hover();
    await expect(page.locator(".cursor")).toHaveClass(/is-link/);
    await page.mouse.move(720, 450);
    await expect(page.locator(".cursor")).not.toHaveClass(/is-link/);

    await page.evaluate(() => window.dispatchEvent(new MouseEvent("mouseout", { relatedTarget: null })));
    await expect(page.locator(".cursor")).not.toHaveClass(/is-visible/);
    await page.mouse.move(410, 330);
    await expect(page.locator(".cursor")).toHaveCSS("opacity", "1");
    cursor = await cursorGeometry(page);
    expect(cursor.x).toBe(410);
    expect(cursor.y).toBe(330);
    expect(cursor.opacity).toBe(1);
  }
  expect(consoleErrors).toEqual([]);
});

test("cursor interaction states do not interfere with menu, dragging, comparison or text input", async ({ page }) => {
  await page.goto("/");
  await page.mouse.move(400, 300);

  await page.locator(".menu-toggle").hover();
  await expect(page.locator(".cursor")).toHaveClass(/is-link/);
  await page.locator(".menu-toggle").click();
  await expect(page.locator("#menu-panel")).toHaveAttribute("aria-hidden", "false");
  await page.locator(".menu-toggle").click();

  const comparison = page.locator("[data-compare]").first();
  await comparison.scrollIntoViewIfNeeded();
  await comparison.hover({ position: { x: 80, y: 80 } });
  await expect(page.locator(".cursor")).toHaveClass(/is-compare/);
  const handle = comparison.locator(".compare-handle");
  const before = Number(await handle.getAttribute("aria-valuenow"));
  const comparisonBox = await comparison.boundingBox();
  await page.mouse.click(comparisonBox.x + comparisonBox.width * .72, comparisonBox.y + comparisonBox.height * .5);
  expect(Number(await handle.getAttribute("aria-valuenow"))).toBeGreaterThan(before);

  const gallery = page.locator("[data-gallery]");
  await gallery.scrollIntoViewIfNeeded();
  await gallery.hover({ position: { x: 120, y: 120 } });
  await expect(page.locator(".cursor")).toHaveClass(/is-drag/);
  const galleryBox = await gallery.boundingBox();
  await gallery.hover({ position: { x: Math.min(900, galleryBox.width - 80), y: 180 } });
  await page.mouse.down();
  await expect(gallery).toHaveClass(/is-dragging/);
  await page.mouse.move(galleryBox.x + 220, galleryBox.y + 180, { steps: 8 });
  expect(await gallery.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  await page.mouse.up();

  await page.goto("/contato/");
  const input = page.locator('input[name="nome"]');
  await input.hover();
  await expect(input).toHaveCSS("cursor", "text");
  await expect(page.locator(".cursor")).not.toHaveClass(/is-visible/);
  await input.fill("Leonardo");
  await expect(input).toHaveValue("Leonardo");
  await page.keyboard.press("Control+A");
  await page.keyboard.type("Teste por teclado");
  await expect(input).toHaveValue("Teste por teclado");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});

test("dual previews load independently, stay silent and pause outside the viewport", async ({ page, request }) => {
  const mediaRequests = [];
  const runtimeErrors = [];
  page.on("request", (resource) => { if (/volkswagen-up-(antes|depois)-(preview|completo)\.(mp4|webm)/.test(resource.url())) mediaRequests.push(resource.url()); });
  page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(message.text()); });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/");
  await page.waitForTimeout(500);
  expect(mediaRequests).toEqual([]);

  for (const state of ["antes", "depois"]) {
    for (const file of [`volkswagen-up-${state}-preview.mp4`, `volkswagen-up-${state}-preview.webm`, `volkswagen-up-${state}-completo.mp4`, `volkswagen-up-${state}-poster.webp`]) {
      const asset = `/assets/images/videos/volkswagen-up/${state}/${file}`;
      const response = await request.get(asset);
      expect(response.status(), asset).toBe(200);
      expect((await response.body()).byteLength, asset).toBeGreaterThan(5_000);
    }
  }

  const slot = page.locator("[data-process-video-slot]");
  const stage = page.locator("[data-dual-stage]");
  const before = page.locator('[data-process-preview="before"]');
  const after = page.locator('[data-process-preview="after"]');
  const stageBefore = await stage.boundingBox();
  await slot.scrollIntoViewIfNeeded();
  await expect(slot).toHaveAttribute("data-video-state", "playing", { timeout: 12_000 });
  await expect.poll(() => before.evaluate((video) => video.currentTime)).toBeGreaterThan(.05);
  const stageAfter = await stage.boundingBox();
  expect(Math.abs(stageBefore.width - stageAfter.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(stageBefore.height - stageAfter.height)).toBeLessThanOrEqual(1);
  expect(await after.evaluate((video) => video.dataset.loaded || "")).toBe("");
  expect(await before.evaluate((video) => ({ muted: video.muted, loop: video.loop, playsInline: video.playsInline, preload: video.preload }))).toEqual({ muted: true, loop: true, playsInline: true, preload: "none" });

  await page.locator('[data-dual-select="after"]').click();
  await expect(slot).toHaveAttribute("data-active-state", "after");
  await expect.poll(() => after.evaluate((video) => video.currentTime)).toBeGreaterThan(.05);
  await expect.poll(() => before.evaluate((video) => video.paused)).toBe(true);
  expect(mediaRequests.some((url) => url.includes("volkswagen-up-antes-preview"))).toBe(true);
  expect(mediaRequests.some((url) => url.includes("volkswagen-up-depois-preview"))).toBe(true);

  const pause = page.locator('[data-dual-play="after"]');
  await pause.click();
  await expect.poll(() => after.evaluate((video) => video.paused)).toBe(true);
  const seek = page.locator('[data-dual-seek="after"]');
  await seek.fill("500");
  await seek.dispatchEvent("input");
  await expect.poll(() => after.evaluate((video) => video.currentTime)).toBeGreaterThan(2);

  await page.evaluate(() => scrollTo(0, 0));
  await expect.poll(() => after.evaluate((video) => video.paused)).toBe(true);
  await expect(slot).toHaveAttribute("data-video-state", "paused");
  expect(runtimeErrors).toEqual([]);
});

test("each full film loads on demand, remains silent and restores focus", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const slot = page.locator("[data-process-video-slot]");
  await slot.scrollIntoViewIfNeeded();
  const dialog = page.locator("[data-video-dialog]");
  const full = page.locator("[data-process-full]");
  await expect(full).not.toHaveAttribute("src", /.+/);

  const beforeTrigger = page.locator('[data-video-open="before"]');
  await beforeTrigger.click();
  await expect(dialog).toHaveAttribute("open", "");
  await expect(full).toHaveAttribute("src", /volkswagen-up-antes-completo\.mp4/);
  await expect(page.locator("[data-video-dialog-title]")).toContainText("ANTES");
  await expect.poll(() => full.evaluate((video) => video.readyState)).toBeGreaterThanOrEqual(2);
  expect(await full.evaluate((video) => ({ muted: video.muted, volume: video.volume }))).toEqual({ muted: true, volume: 0 });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveAttribute("open", "");
  await expect(beforeTrigger).toBeFocused();
  await expect(full).not.toHaveAttribute("src", /.+/);

  await page.locator('[data-dual-select="after"]').click();
  const afterTrigger = page.locator('[data-video-open="after"]');
  await afterTrigger.click();
  await expect(full).toHaveAttribute("src", /volkswagen-up-depois-completo\.mp4/);
  await expect(page.locator("[data-video-dialog-title]")).toContainText("DEPOIS");
  await page.locator("[data-video-close]").click();
  await expect(afterTrigger).toBeFocused();
  expect(errors).toEqual([]);
});

test("one failed state preserves its own poster fallback without breaking the other", async ({ page }) => {
  await page.route(/volkswagen-up-antes-preview\.(mp4|webm)/, (route) => route.abort("failed"));
  await page.goto("/");
  const slot = page.locator("[data-process-video-slot]");
  const beforePanel = page.locator('[data-dual-panel="before"]');
  await slot.scrollIntoViewIfNeeded();
  await expect(beforePanel).toHaveAttribute("data-video-state", "fallback", { timeout: 10_000 });
  await expect(page.locator('[data-process-preview="before"]')).toHaveAttribute("poster", /volkswagen-up-antes-poster\.webp/);
  await page.locator('[data-dual-select="after"]').click();
  await expect.poll(() => page.locator('[data-process-preview="after"]').evaluate((video) => video.currentTime)).toBeGreaterThan(.05);
  await expect(page.locator('[data-video-open="before"]')).toBeVisible();
});

test("reduced motion keeps both previews on their posters until explicit playback", async ({ page }) => {
  const mediaRequests = [];
  page.on("request", (resource) => { if (/volkswagen-up-(antes|depois)-preview\.(mp4|webm)/.test(resource.url())) mediaRequests.push(resource.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const slot = page.locator("[data-process-video-slot]");
  await slot.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(slot).toHaveAttribute("data-video-state", "reduced-motion");
  expect(mediaRequests).toEqual([]);
  await expect(page.locator('[data-process-preview="before"] source').first()).not.toHaveAttribute("src", /.+/);
  await page.locator('[data-dual-play="before"]').click();
  await expect.poll(() => page.locator('[data-process-preview="before"]').evaluate((video) => video.currentTime)).toBeGreaterThan(.05);
});

test("dual-state tabs support arrow keys and keep only one preview playing", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-process-video-slot]").scrollIntoViewIfNeeded();
  const beforeTab = page.locator('[data-dual-select="before"]');
  await expect(beforeTab).toBeVisible();
  await page.waitForTimeout(1_200);
  await beforeTab.press("ArrowRight");
  const afterTab = page.locator('[data-dual-select="after"]');
  await expect(afterTab).toBeFocused();
  await expect(afterTab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-dual-panel="after"]')).toHaveClass(/is-active/);
  await expect.poll(() => page.locator('[data-process-preview="before"]').evaluate((video) => video.paused)).toBe(true);
  await afterTab.press("Home");
  await expect(beforeTab).toBeFocused();
  await expect(beforeTab).toHaveAttribute("aria-selected", "true");
});

test.describe("touch input", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("uses one large uncropped film at a time and switches by touch", async ({ page }) => {
    await page.goto("/");
    await page.touchscreen.tap(180, 300);
    await expect(page.locator("html")).not.toHaveClass(/has-custom-cursor/);
    await expect(page.locator(".cursor")).toHaveCSS("display", "none");
    const stage = page.locator(".dual-motion-stage");
    await stage.scrollIntoViewIfNeeded();
    await expect(page.locator('[data-dual-panel="before"]')).toBeVisible();
    await expect(page.locator('[data-dual-panel="after"]')).toBeHidden();
    const presentation = await page.locator('[data-process-preview="before"]').evaluate((video) => ({
      objectFit: getComputedStyle(video).objectFit,
      ratio: video.getBoundingClientRect().width / video.getBoundingClientRect().height,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: innerWidth
    }));
    expect(presentation.objectFit).toBe("contain");
    expect(Math.abs(presentation.ratio - 9 / 16)).toBeLessThan(.02);
    expect(presentation.scrollWidth).toBeLessThanOrEqual(presentation.viewport);
    await page.locator('[data-dual-select="after"]').tap();
    await expect(page.locator('[data-dual-panel="after"]')).toBeVisible();
    await expect(page.locator('[data-dual-panel="before"]')).toBeHidden();
    await page.locator('[data-video-open="after"]').tap();
    await expect(page.locator("[data-video-dialog]")).toHaveAttribute("open", "");
    await expect(page.locator("[data-process-full]")).toHaveAttribute("src", /volkswagen-up-depois-completo\.mp4/);
    expect(await page.locator("[data-process-full]").evaluate((video) => video.muted && video.playsInline)).toBe(true);
    await page.locator("[data-video-close]").tap();
    await expect(page.locator("[data-video-dialog]")).not.toHaveAttribute("open", "");
  });
});
