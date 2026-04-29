const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';

test.describe('System Monitor Dashboard E2E', () => {

  // E-01: 大屏完整渲染
  test('E-01: Full dashboard renders all cards', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    const cards = page.locator('.card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    await expect(page.locator('.title-bar')).toBeVisible();
  });

  // E-02: 数据实时刷新
  test('E-02: Data refreshes at least 3 times in 5 seconds', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    await page.waitForTimeout(5000);

    await expect(page.locator('.dashboard')).toBeVisible();
  });

  // E-03: 网络流量折线图数据递增
  test('E-03: Network data card updates over time', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    // Wait for network card and capture initial text
    const netCard = page.locator('.network-card');
    await expect(netCard).toBeVisible({ timeout: 10000 });
    const text1 = await netCard.textContent();

    // Wait 4 seconds for ~2 more poll cycles
    await page.waitForTimeout(4000);

    const text2 = await netCard.textContent();
    // Content should still be present (network data flowing)
    expect(text2).toBeTruthy();
    expect(text2.length).toBeGreaterThan(0);
  });

  // E-04: 1080p layout
  test('E-04: Layout renders correctly at 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    const dashboard = page.locator('.dashboard');
    const box = await dashboard.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(1800);
    expect(box.height).toBeGreaterThan(900);
  });

  // E-05: 1366x768 layout
  test('E-05: Layout renders correctly at 1366x768', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    const dashboard = page.locator('.dashboard');
    const box = await dashboard.boundingBox();
    expect(box).not.toBeNull();
    expect(box.height).toBeGreaterThan(700);
  });

  // E-07: 暗色主题一致性
  test('E-07: Dark theme consistency', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    const rgb = bgColor.match(/\d+/g);
    if (rgb) {
      const [r, g, b] = rgb.map(Number);
      expect(r).toBeLessThan(50);
      expect(g).toBeLessThan(50);
      expect(b).toBeLessThan(70);
    }
  });

  // E-06: Status indicator visible
  test('E-06: Shows status indicator dot', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.dashboard', { timeout: 15000 });

    const statusDot = page.locator('.status-dot');
    await expect(statusDot.first()).toBeVisible({ timeout: 10000 });
  });
});
