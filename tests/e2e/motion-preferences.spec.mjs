import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  for (const [system, mode, effective] of [
    ['reduce', 'auto', 'reduced'], ['reduce', 'cinematic', 'cinematic'],
    ['no-preference', 'auto', 'cinematic'], ['no-preference', 'reduced', 'reduced']
  ]) {
    test(`motion ${width} ${system} ${mode}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width === 390, hasTouch: width === 390 });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: system });
      await page.addInitScript(mode => localStorage.setItem('lavamed-motion', mode), mode);
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-motion-effective', effective);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.locator('.water-canvas').evaluate(node => getComputedStyle(node).display === 'none')).toBe(effective === 'reduced');
      await page.waitForTimeout(1800);
      await page.mouse.move(200, 200);
      await expect(page.locator('html')).toHaveClass(effective === 'cinematic' && width === 1440 ? /has-custom-cursor/ : /^(?!.*has-custom-cursor)/);
      if (effective === 'reduced') {
        for (const scene of await page.locator('.camera-copy').all()) await expect(scene).toBeVisible();
        expect(await page.locator('[data-process-preview]').evaluateAll(videos => videos.every(v => v.paused && v.muted))).toBe(true);
      }
      await page.locator('.menu-toggle').click();
      await expect(page.getByLabel('Experiência visual')).toHaveValue(mode);
      expect(errors).toEqual([]);
      await context.close();
    });
  }
}

test('choice persists, follows system only in auto, and works without storage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.menu-toggle').click();
  await page.getByLabel('Experiência visual').selectOption('cinematic');
  await expect(page.locator('html')).toHaveAttribute('data-motion-mode', 'cinematic');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion-effective', 'cinematic');
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } });
  });
  await page.reload();
  await page.locator('.menu-toggle').click();
  await page.getByLabel('Experiência visual').selectOption('cinematic');
  await expect(page).toHaveURL(/lavamed-motion=cinematic/);
  await expect(page.locator('html')).toHaveAttribute('data-motion-effective', 'cinematic');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion-effective', 'cinematic');
  await page.locator('.menu-toggle').click();
  await page.getByLabel('Experiência visual').selectOption('auto');
  await expect(page.locator('html')).toHaveAttribute('data-motion-effective', 'reduced');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveAttribute('data-motion-effective', 'cinematic');
});

test('content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  for (const scene of await page.locator('.camera-copy').all()) await expect(scene).toBeVisible();
  await context.close();
});
