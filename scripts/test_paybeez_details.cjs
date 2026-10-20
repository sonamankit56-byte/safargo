const { chromium } = require('playwright');
const path = require('path');

async function testPaybeezCheckoutDetails() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('checkout') || resp.url().includes('zaakpay') || resp.url().includes('payment') || resp.url().includes('gateway')) {
      console.log('PAYBEEZ API RESP:', resp.status(), resp.url());
      try {
        const body = await resp.text();
        console.log('BODY:', body.slice(0, 500));
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/quick-recharge?n=7489674391', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const searchInput = page.locator('input[placeholder*="Search plans"]').first();
  if (await searchInput.count() > 0) {
    await searchInput.fill('299');
    await page.waitForTimeout(1000);
  }

  const buyBtn = page.locator('button:has-text("Buy")').first();
  await buyBtn.click();
  await page.waitForTimeout(1500);

  const payNowBtn = page.locator('button:has-text("Pay Now")').first();
  await payNowBtn.click();
  await page.waitForTimeout(5000);

  console.log('Final URL after Pay Now:', page.url());
  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shotPath = path.join(screenshotDir, 'paybeez_gateway_screen.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot:', shotPath);

  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      text: document.body.innerText.slice(0, 600),
      forms: Array.from(document.querySelectorAll('form')).map(f => ({ action: f.action, method: f.method }))
    };
  });
  console.log('Page info:', pageInfo);

  await browser.close();
}

testPaybeezCheckoutDetails();
