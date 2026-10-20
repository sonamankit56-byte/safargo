const { chromium } = require('playwright');
const path = require('path');

async function testPaybeezFlow() {
  console.log('Testing Paybeez recharge flow with 7489674391...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('api.paybeez.in') || url.includes('paybeez.in/recharge') || url.includes('payment') || url.includes('order') || url.includes('checkout') || url.includes('auth')) {
      console.log('PAYBEEZ API:', resp.status(), url);
      try {
        const txt = await resp.text();
        console.log('DATA:', txt.slice(0, 200));
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Enter mobile number
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.fill('7489674391');
  await page.waitForTimeout(1000);

  // Click Show plans
  const showPlansBtn = page.locator('button:has-text("Show plans")').first();
  console.log('Clicking Show plans...');
  await showPlansBtn.click();
  await page.waitForTimeout(4000);

  console.log('Current URL after Show plans:', page.url());

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shotPath = path.join(screenshotDir, 'paybeez_plans_page.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot:', shotPath);

  // Check plans or elements on screen
  const plans = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('button, div, p, span, h2, h3, a'))
      .map(e => e.innerText ? e.innerText.trim() : '')
      .filter(t => t.includes('₹') || t.includes('GB') || t.includes('Validity') || t.includes('Pay') || t.includes('Recharge'));
    return cards.slice(0, 30);
  });
  console.log('Detected plan elements:', plans);

  // Look for a plan to select or recharge button
  const rechargeBtn = page.locator('button:has-text("₹"), button:has-text("Recharge"), button:has-text("Select")').first();
  if (await rechargeBtn.count() > 0) {
    console.log('Found recharge/select button:', await rechargeBtn.innerText());
    await rechargeBtn.click();
    await page.waitForTimeout(3000);

    console.log('URL after clicking plan:', page.url());
    const checkoutShot = path.join(screenshotDir, 'paybeez_after_plan_click.png');
    await page.screenshot({ path: checkoutShot, fullPage: true });

    const postClickText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
    console.log('Page text after plan click:\n', postClickText);
  }

  await browser.close();
}

testPaybeezFlow();
