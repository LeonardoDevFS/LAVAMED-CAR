import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const label = String(process.env.AUDIT_LABEL || "after").replace(/[^a-z0-9_-]/gi, "-");
const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:4173";
const output = path.resolve("docs", "screenshots", "visual-audit", label);
const viewports = [
  { width: 1920, height: 1080, group: "desktop" },
  { width: 1600, height: 900, group: "desktop" },
  { width: 1440, height: 900, group: "desktop" },
  { width: 1366, height: 768, group: "desktop" },
  { width: 1280, height: 720, group: "desktop" },
  { width: 820, height: 1180, group: "tablet" },
  { width: 768, height: 1024, group: "tablet" },
  { width: 430, height: 932, group: "mobile" },
  { width: 390, height: 844, group: "mobile" },
  { width: 375, height: 812, group: "mobile" },
  { width: 360, height: 800, group: "mobile" },
  { width: 320, height: 568, group: "mobile" }
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];

async function settle(page, delay = 2100) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await settle(page);
  const metrics = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const titleLines = [...document.querySelectorAll(".title-mask > span")].map((node) => {
      const style = getComputedStyle(node);
      const mask = node.parentElement.getBoundingClientRect();
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const measured = context.measureText(node.textContent.trim());
      const glyphHeight = measured.actualBoundingBoxAscent + measured.actualBoundingBoxDescent;
      return {
        text: node.textContent.trim(),
        maskHeight: Math.round(mask.height * 100) / 100,
        glyphHeight: Math.round(glyphHeight * 100) / 100,
        verticalSlack: Math.round((mask.height - glyphHeight) * 100) / 100,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        clipPath: style.clipPath
      };
    });
    const logo = document.querySelector(".site-header .brand img").getBoundingClientRect();
    const heading = document.querySelector(".hero h1").getBoundingClientRect();
    const booking = document.querySelector(".hero-booking").getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentWidth: document.documentElement.scrollWidth,
      pageHeight: document.documentElement.scrollHeight,
      fonts: [...document.fonts].map((font) => ({ family: font.family, status: font.status, weight: font.weight })),
      titleLines,
      logo: { width: Math.round(logo.width), height: Math.round(logo.height) },
      heading: { top: Math.round(heading.top), bottom: Math.round(heading.bottom), height: Math.round(heading.height) },
      booking: { top: Math.round(booking.top), bottom: Math.round(booking.bottom), width: Math.round(booking.width), height: Math.round(booking.height) },
      heroCarSource: document.querySelector(".hero-car-layer img")?.currentSrc || ""
    };
  });
  report.push({ ...viewport, ...metrics, errors });
  await page.screenshot({ path: path.join(output, `home-${viewport.width}x${viewport.height}.png`), fullPage: false });
  await page.close();
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(output, `hero-start-${viewport.width}x${viewport.height}.png`), fullPage: false });
  await page.waitForTimeout(650);
  await page.screenshot({ path: path.join(output, `hero-mid-${viewport.width}x${viewport.height}.png`), fullPage: false });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(output, `hero-end-${viewport.width}x${viewport.height}.png`), fullPage: false });
  await page.close();
}

await browser.close();
await writeFile(path.join(output, "metrics.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

const failures = report.flatMap((entry) => {
  const messages = [];
  if (entry.documentWidth > entry.viewport.width) messages.push(`${entry.width}x${entry.height}: horizontal overflow (${entry.documentWidth}px)`);
  if (!entry.fonts.some((font) => font.family.includes("Archivo Black") && font.status === "loaded")) messages.push(`${entry.width}x${entry.height}: Archivo Black not loaded`);
  if (!entry.fonts.some((font) => font.family.includes("Space Grotesk") && font.status === "loaded")) messages.push(`${entry.width}x${entry.height}: Space Grotesk not loaded`);
  if (entry.titleLines.some((line) => line.verticalSlack < 0)) messages.push(`${entry.width}x${entry.height}: title glyph exceeds its mask`);
  if (entry.height <= 700 && entry.booking.bottom > entry.height) messages.push(`${entry.width}x${entry.height}: primary CTA is below the initial viewport`);
  if (entry.errors.length) messages.push(`${entry.width}x${entry.height}: ${entry.errors.join(" | ")}`);
  return messages;
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Visual audit passed for ${viewports.length} viewports. Captures: ${output}`);
}
