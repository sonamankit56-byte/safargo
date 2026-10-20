const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  });
  const page = await context.newPage();
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'test-results/screenshots/mobile_view_home.png' });

  // Click Recharge
  const rechargeBtn = page.locator('button').filter({ hasText: /Recharge|रिचार्ज/i }).first();
  await rechargeBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'test-results/screenshots/mobile_view_recharge.png' });

  console.log('Mobile screenshots captured successfully!');
  await browser.close();
})();
