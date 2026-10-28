import { expect, test } from "@playwright/test";
import { services } from "../../src/config.js";

const targetViewports = [
  { width: 1920, height: 1080 },
  { width: 1600, height: 900 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 820, height: 1180 },
  { width: 768, height: 1024 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 375, height: 812 },
  { width: 360, height: 800 },
  { width: 320, height: 568 }
];

const routes = [
  "/",
  "/servicos/",
  ...services.map((service) => `/servicos/${service.slug}/`),
  "/portfolio/",
  "/antes-e-depois/",
  "/sobre/",
  "/contato/",
  "/faq/",
  "/politica-de-privacidade/",
  "/404.html"
];

async function waitForTypography(page, delay = 0) {
  await page.evaluate(() => document.fonts.ready);
  if (delay) await page.waitForTimeout(delay);
}

async function typographyAudit(page) {
  return page.evaluate(() => {
    const visible = (node) => {
      const style = getComputedStyle(node);
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
    };
    return [...document.querySelectorAll("h1,h2,h3")].filter(visible).map((node) => {
      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const fontSize = parseFloat(style.fontSize);
      const lineHeight = parseFloat(style.lineHeight);
      let clippedBy = "";
      const brokenWords = [];
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      let textNode;
      while ((textNode = walker.nextNode())) {
        for (const match of textNode.data.matchAll(/\S+/g)) {
          const rows = new Set();
          for (let index = 0; index < match[0].length; index += 1) {
            const range = document.createRange();
            range.setStart(textNode, match.index + index);
            range.setEnd(textNode, match.index + index + 1);
            const character = range.getBoundingClientRect();
            if (character.width > 0) rows.add(Math.round(character.top));
          }
          if (rows.size > 1) brokenWords.push(match[0]);
        }
      }
      let ancestor = node.parentElement;
      while (ancestor && ancestor !== document.body) {
        const ancestorStyle = getComputedStyle(ancestor);
        if ([ancestorStyle.overflow, ancestorStyle.overflowX, ancestorStyle.overflowY].some((value) => value === "hidden" || value === "clip")) {
          const bounds = ancestor.getBoundingClientRect();
          if (rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1) {
            clippedBy = `${ancestor.className || ancestor.tagName} [heading ${Math.round(rect.left)},${Math.round(rect.top)},${Math.round(rect.right)},${Math.round(rect.bottom)} / bounds ${Math.round(bounds.left)},${Math.round(bounds.top)},${Math.round(bounds.right)},${Math.round(bounds.bottom)}]`;
            break;
          }
        }
        ancestor = ancestor.parentElement;
      }
      return {
        text: node.textContent.trim().replace(/\s+/g, " ").slice(0, 80),
        family: style.fontFamily,
        lineHeightRatio: Number.isFinite(lineHeight) && fontSize ? lineHeight / fontSize : 1,
        clippedBy,
        brokenWords
      };
    });
  });
}

test("hero typography, logo and CTA are safe at every required viewport", async ({ page }) => {
  for (const viewport of targetViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForTypography(page, 2100);
    const audit = await page.evaluate(() => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const lines = [...document.querySelectorAll(".title-mask > span")].map((node) => {
        const style = getComputedStyle(node);
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const measured = context.measureText(node.textContent.trim());
        return node.parentElement.getBoundingClientRect().height - measured.actualBoundingBoxAscent - measured.actualBoundingBoxDescent;
      });
      const logo = document.querySelector(".site-header .brand").getBoundingClientRect();
      const booking = document.querySelector(".hero-booking").getBoundingClientRect();
      return {
        lines,
        logoWidth: logo.width,
        bookingBottom: booking.bottom,
        viewportHeight: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth,
        carSource: document.querySelector(".hero-car-layer img")?.currentSrc || "",
        titleText: document.querySelector(".hero h1").innerText
      };
    });
    expect(Math.min(...audit.lines), `${viewport.width}x${viewport.height}: insufficient glyph clearance`).toBeGreaterThanOrEqual(5);
    expect(audit.scrollWidth, `${viewport.width}x${viewport.height}: horizontal overflow`).toBeLessThanOrEqual(audit.viewportWidth);
    expect(audit.carSource).toContain("conceitual-coupe-escuro");
    expect(audit.titleText).toContain("NÃO É SÓ");
    expect(audit.titleText).toContain("É TRANSFORMAR.");
    if (viewport.width > 900) expect(audit.logoWidth).toBeGreaterThanOrEqual(134);
    else if (viewport.width > 560) expect(audit.logoWidth).toBeGreaterThanOrEqual(104);
    else expect(audit.logoWidth).toBeGreaterThanOrEqual(89);
    if (viewport.height <= 700) expect(audit.bookingBottom, `${viewport.width}x${viewport.height}: CTA below fold`).toBeLessThanOrEqual(viewport.height);
  }
});

test("all generated pages keep visible Archivo headings unclipped", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await waitForTypography(page);
      const headings = await typographyAudit(page);
      expect(headings.length, `${route} has no visible heading`).toBeGreaterThan(0);
      for (const heading of headings) {
        if (heading.family.includes("Archivo Black")) {
          expect(heading.lineHeightRatio, `${route}: tight line-height in “${heading.text}”`).toBeGreaterThanOrEqual(.94);
        }
        expect(heading.clippedBy, `${route}: “${heading.text}” clipped by ${heading.clippedBy}`).toBe("");
        expect(heading.brokenWords, `${route}: word split across lines in “${heading.text}”`).toEqual([]);
      }
      const width = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
      expect(width.document, `${route}: horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(width.viewport);
    }
  }
});

test("Volkswagen film composition stays balanced and uncropped at every required viewport", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of targetViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForTypography(page);
    const composition = page.locator(".process-video-composition");
    await composition.scrollIntoViewIfNeeded();
    const layout = await composition.evaluate((node) => {
      const bounds = (selector) => node.querySelector(selector).getBoundingClientRect();
      const compositionBox = node.getBoundingClientRect();
      const stage = bounds(".process-video-stage");
      const frame = bounds(".process-video-frame");
      const preview = node.querySelector("[data-process-preview]");
      const previewBox = preview.getBoundingClientRect();
      const play = bounds("[data-video-open]");
      const marque = node.querySelector(".process-video-marque");
      const marqueRange = document.createRange();
      marqueRange.selectNodeContents(marque);
      const marqueLines = [...marqueRange.getClientRects()].filter((rect) => rect.width > 0).length;
      const overlaps = !(play.right <= frame.left || play.left >= frame.right || play.bottom <= frame.top || play.top >= frame.bottom);
      return {
        title: marque.textContent.trim(),
        marqueLines,
        marqueFits: marque.scrollWidth <= marque.clientWidth + 1,
        stageShare: stage.width / compositionBox.width,
        stageViewportShare: stage.height / innerHeight,
        videoRatio: previewBox.width / previewBox.height,
        objectFit: getComputedStyle(preview).objectFit,
        playWidth: play.width,
        playHeight: play.height,
        overlaps,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth
      };
    });
    expect(layout.title).toBe("VOLKSWAGEN");
    expect(layout.marqueLines, `${viewport.width}x${viewport.height}: VOLKSWAGEN wrapped`).toBe(1);
    expect(layout.marqueFits, `${viewport.width}x${viewport.height}: VOLKSWAGEN overflows its container`).toBe(true);
    expect(layout.objectFit).toBe("contain");
    expect(Math.abs(layout.videoRatio - 9 / 16), `${viewport.width}x${viewport.height}: video distorted`).toBeLessThan(.02);
    expect(layout.playWidth).toBeGreaterThan(200);
    expect(layout.playHeight).toBeGreaterThanOrEqual(44);
    expect(layout.overlaps, `${viewport.width}x${viewport.height}: CTA overlaps the film`).toBe(false);
    expect(layout.scrollWidth, `${viewport.width}x${viewport.height}: horizontal overflow`).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.stageViewportShare, `${viewport.width}x${viewport.height}: stage unnecessarily taller than viewport`).toBeLessThanOrEqual(.92);
    if (viewport.width > 900) {
      expect(layout.stageShare, `${viewport.width}x${viewport.height}: film stage is not dominant`).toBeGreaterThanOrEqual(.55);
      expect(layout.stageShare, `${viewport.width}x${viewport.height}: film stage crowds out the editorial copy`).toBeLessThanOrEqual(.66);
    }
  }
});

test("Volkswagen film reveal reverses when scrolling back", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("[data-process-cinema]");
  await page.locator(".process-video-composition").scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-motion-state", "revealed", { timeout: 5_000 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(section).toHaveAttribute("data-motion-state", "reset", { timeout: 5_000 });
});

test("approved hero compositions remain visually stable", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
    { width: 320, height: 568 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForTypography(page, 2100);
    await page.addStyleTag({ content: ".water-canvas,.noise,.cursor,.scroll-progress{display:none!important}" });
    await expect(page.locator(".hero")).toHaveScreenshot(`hero-${viewport.width}x${viewport.height}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: .008
    });
  }
});

test("approved menu compositions remain visually stable", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForTypography(page, 2100);
    await page.locator(".menu-toggle").click();
    await expect(page.locator("#menu-panel")).toHaveAttribute("aria-hidden", "false");
    await page.waitForTimeout(900);
    await page.addStyleTag({ content: ".water-canvas,.noise,.cursor,.scroll-progress{display:none!important}" });
    await expect(page).toHaveScreenshot(`menu-${viewport.width}x${viewport.height}.png`, {
      animations: "disabled",
      fullPage: false,
      maxDiffPixelRatio: .008
    });
  }
});

test("approved editorial sections and internal hero remain visually stable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await waitForTypography(page);
  await page.addStyleTag({ content: ".site-header,.skip-link,.noise,.cursor,.scroll-progress,.water-canvas,.liquid-canvas{display:none!important}" });
  await expect(page.locator("#manifesto")).toHaveScreenshot("manifesto-1440.png", { animations: "disabled", maxDiffPixelRatio: .008 });
  await expect(page.locator("[data-process-cinema]")).toHaveScreenshot("process-1440.png", { animations: "disabled", maxDiffPixelRatio: .008 });
  await page.locator("[data-video-open]").click();
  await page.locator("[data-process-full]").evaluate((video) => { video.pause(); video.currentTime = 0; });
  await expect(page.locator("[data-video-dialog]")).toHaveScreenshot("video-dialog-1440.png", { animations: "disabled", maxDiffPixelRatio: .008 });
  await page.locator("[data-video-close]").click();
  await expect(page.locator(".site-footer")).toHaveScreenshot("footer-1440.png", { animations: "disabled", maxDiffPixelRatio: .008 });

  for (const viewport of [
    { width: 820, height: 1180 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 360, height: 800 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await waitForTypography(page);
    await page.addStyleTag({ content: ".site-header,.skip-link,.noise,.cursor,.scroll-progress,.water-canvas,.liquid-canvas{display:none!important}" });
    await expect(page.locator("[data-process-cinema]")).toHaveScreenshot(`process-${viewport.width}.png`, { animations: "disabled", maxDiffPixelRatio: .008 });
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/servicos/higienizacao-avancada/");
  await waitForTypography(page);
  await page.addStyleTag({ content: ".skip-link,.noise,.cursor,.scroll-progress{display:none!important}" });
  await expect(page).toHaveScreenshot("service-hero-1440.png", { animations: "disabled", fullPage: false, maxDiffPixelRatio: .008 });
});

test.describe("touch comparison", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("moves the before-and-after slider without blocking vertical touch", async ({ page }) => {
    await page.goto("/antes-e-depois/");
    await waitForTypography(page);
    const comparison = page.locator("[data-compare]").first();
    await comparison.scrollIntoViewIfNeeded();
    const box = await comparison.boundingBox();
    await page.touchscreen.tap(box.x + box.width * .78, box.y + box.height * .5);
    await expect(comparison.locator(".compare-handle")).toHaveAttribute("aria-valuenow", /7[5-9]|8\d|9[0-8]/);
    await expect(comparison).toHaveCSS("touch-action", "pan-y");
  });
});
