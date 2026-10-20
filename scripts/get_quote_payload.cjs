const { chromium } = require('playwright');

async function getQuoteCheckoutPayload() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('request', req => {
    const url = req.url();
    if (url.includes('payments/quote') || url.includes('recharge/checkout')) {
      console.log('ENDPOINT:', url);
      console.log('PAYLOAD:', req.postData());
    }
  });

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('payments/quote') || url.includes('recharge/checkout')) {
      console.log('RESP ENDPOINT:', url);
      try {
        console.log('RESP BODY:', await resp.text());
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/quick-recharge?n=7489674391', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const buyBtn = page.locator('button:has-text("Buy")').first();
  await buyBtn.click();
  await page.waitForTimeout(1500);

  const payNow = page.locator('button:has-text("Pay Now")').first();
  await payNow.click();
  await page.waitForTimeout(4000);

  await browser.close();
}

getQuoteCheckoutPayload();
