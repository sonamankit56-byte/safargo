const { chromium } = require('playwright');
const path = require('path');

async function testFull() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com') && (url.includes('auth') || url.includes('token') || url.includes('plan') || url.includes('order') || url.includes('bill') || url.includes('checkout') || url.includes('payment'))) {
      console.log('API:', resp.status(), url);
      try {
        const txt = await resp.text();
        console.log('RES:', txt.slice(0, 200));
      } catch(e) {}
    }
  });

  await page.goto('https://rechargemojo.com/mobile-recharge/jio-recharge-online', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Mobile number
  const phone = page.locator('input[placeholder*="Mobile Number"]').first();
  await phone.fill('7489674391');
  await page.waitForTimeout(1000);

  // 2. Click Circle input
  const circleInput = page.locator('input[placeholder*="Select Circle"]').first();
  await circleInput.click();
  await page.waitForTimeout(1000);

  // 3. Click "Madhya Pradesh Chhattisgarh"
  const mpItem = page.locator('p:has-text("Madhya Pradesh Chhattisgarh"), li:has-text("Madhya Pradesh Chhattisgarh"), span:has-text("Madhya Pradesh Chhattisgarh"), div:has-text("Madhya Pradesh Chhattisgarh")').last();
  await mpItem.click({ force: true });
  await page.waitForTimeout(1000);

  // 4. Enter Amount
  const amountInput = page.locator('input[placeholder*="Enter Amount"]').first();
  await amountInput.fill('299');
  await page.waitForTimeout(1000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_jio_filled_mp.png') });

  // 5. Click Proceed
  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  console.log('Proceed button state before click:', await proceedBtn.isEnabled());
  await proceedBtn.click();
  await page.waitForTimeout(5000);

  console.log('URL after proceed:', page.url());
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_jio_after_proceed_success.png') });

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Snippet of page after proceed:\n', text.slice(0, 800));

  await browser.close();
}

testFull();
