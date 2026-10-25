import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const url = "http://127.0.0.1:4173/";
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"]
});

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk; });
server.stderr.on("data", (chunk) => { serverLog += chunk; });

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Preview did not become ready.\n${serverLog}`);
}

let browser;
try {
  await waitForPreview();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.__lavamedAudit = { lcp: 0, cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__lavamedAudit.lcp = entry.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lavamedAudit.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const result = await page.evaluate(() => {
    const resources = performance.getEntriesByType("resource");
    const navigation = performance.getEntriesByType("navigation")[0];
    return {
      lcpMs: Math.round(window.__lavamedAudit.lcp),
      cls: Number(window.__lavamedAudit.cls.toFixed(4)),
      initialTransferKb: Math.round(resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0) / 1024),
      domContentLoadedMs: Math.round(navigation.domContentLoadedEventEnd),
      resourceCount: resources.length,
      heroSource: document.querySelector(".hero-backdrop")?.currentSrc || ""
    };
  });

  const problems = [];
  if (result.lcpMs >= 2500) problems.push(`LCP ${result.lcpMs} ms exceeds 2500 ms`);
  if (result.cls >= .1) problems.push(`CLS ${result.cls} exceeds 0.1`);
  if (result.initialTransferKb >= 1500) problems.push(`Initial transfer ${result.initialTransferKb} KB exceeds 1500 KB`);
  if (!/\.(avif|webp)$/.test(result.heroSource)) problems.push("Hero is not using AVIF/WebP");
  if (problems.length) throw new Error(problems.join("\n"));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser?.close();
  server.kill();
}
