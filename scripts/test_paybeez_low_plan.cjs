const { chromium } = require('playwright');

async function testLowPlan() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('checkout') || resp.url().includes('payments/quote')) {
      console.log('PAYBEEZ API:', resp.status(), resp.url());
      try {
        const body = await resp.text();
        console.log('BODY:', body);
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/quick-recharge?n=7489674391', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Search or click a lower plan
  const searchInput = page.locator('input[placeholder*="Search plans"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('299');
    await page.waitForTimeout(1000);
  }

  // Click the first Buy button visible
  const buyBtn = page.locator('button:has-text("Buy")').first();
  if (await buyBtn.count() > 0) {
    console.log('Clicking Buy for searched plan...');
    await buyBtn.click();
    await page.waitForTimeout(1500);

    const payNowBtn = page.locator('button:has-text("Pay Now")').first();
    if (await payNowBtn.count() > 0) {
      console.log('Clicking Pay Now...');
      await payNowBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  await browser.close();
}

testLowPlan();
