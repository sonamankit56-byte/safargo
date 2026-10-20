const { chromium } = require('playwright');
const path = require('path');

async function testBuyModal() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('api.paybeez.in') || url.includes('zaakpay') || url.includes('payment') || url.includes('checkout')) {
      console.log('RESP:', resp.status(), url);
      try {
        const body = await resp.text();
        console.log('BODY:', body.slice(0, 250));
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/quick-recharge?n=7489674391', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Click the first "Buy" button
  const buyBtn = page.locator('button:has-text("Buy")').first();
  console.log('Clicking first Buy button...');
  await buyBtn.click();
  await page.waitForTimeout(2000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shotPath = path.join(screenshotDir, 'paybeez_buy_modal.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved buy modal screenshot:', shotPath);

  // Look for elements in the modal
  const modalInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a, input, h2, h3, p, span'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.includes('Pay') || t.includes('Confirm') || t.includes('₹') || t.includes('Login') || t.includes('OTP') || t.includes('Fee'));
    return all.slice(0, 30);
  });
  console.log('Elements in modal:', modalInfo);

  // Find Confirm & Pay or Pay button
  const confirmBtn = page.locator('button').filter({ hasText: /Confirm & Pay|Pay/i }).first();
  if (await confirmBtn.count() > 0) {
    console.log('Confirm/Pay button found. Text:', await confirmBtn.innerText());
    console.log('Clicking Confirm & Pay...');
    await confirmBtn.click();
    await page.waitForTimeout(6000);

    console.log('URL after Confirm & Pay click:', page.url());
    const afterPayShot = path.join(screenshotDir, 'paybeez_after_confirm_click.png');
    await page.screenshot({ path: afterPayShot, fullPage: true });

    const postClickInfo = await page.evaluate(() => {
      const iframes = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
      const text = document.body.innerText.slice(0, 800);
      return { iframes, text };
    });
    console.log('Post click info:', postClickInfo);
  }

  await browser.close();
}

testBuyModal();
