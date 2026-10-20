const { chromium } = require('playwright');
const path = require('path');

async function testConfirmAndPay() {
  console.log('Testing Paybeez Confirm & Pay...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('paybeez') || url.includes('payment') || url.includes('razorpay') || url.includes('cashfree') || url.includes('phonepe') || url.includes('gateway') || url.includes('order')) {
      if (!url.includes('.png') && !url.includes('.jpg') && !url.includes('.css')) {
        console.log('PAYBEEZ RESP:', resp.status(), url);
        try {
          const body = await resp.text();
          console.log('BODY:', body.slice(0, 200));
        } catch(e) {}
      }
    }
  });

  await page.goto('https://paybeez.in/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // 1. Enter phone
  const phone = page.locator('input[type="tel"]').first();
  await phone.fill('7489674391');
  await page.waitForTimeout(1000);

  // 2. Click Show plans
  const showPlans = page.locator('button:has-text("Show plans")').first();
  await showPlans.click();
  await page.waitForTimeout(3000);

  // 3. Find a lower value plan like ₹299 or whatever first "Buy" button is
  const buyBtn = page.locator('button:has-text("Buy")').first();
  console.log('Clicking Buy button...');
  await buyBtn.click();
  await page.waitForTimeout(2000);

  console.log('URL on quick recharge:', page.url());

  // 4. Look for "Confirm & Pay" button
  const confirmBtn = page.locator('button:has-text("Confirm & Pay")').first();
  console.log('Found Confirm & Pay button. Clicking now...');
  await confirmBtn.click();
  await page.waitForTimeout(5000);

  console.log('URL after Confirm & Pay:', page.url());
  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shotPath = path.join(screenshotDir, 'paybeez_after_confirm_pay.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot to:', shotPath);

  const screenText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Page Text after Confirm & Pay:\n', screenText);

  await browser.close();
}

testConfirmAndPay();
