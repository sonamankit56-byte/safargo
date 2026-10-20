const { chromium } = require('playwright');
const path = require('path');

async function testJioPage() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.url().includes('rechargemojo.com/api') || resp.url().includes('checkout') || resp.url().includes('login') || resp.url().includes('auth') || resp.url().includes('order')) {
      console.log('API:', resp.status(), resp.url());
    }
  });

  await page.goto('https://rechargemojo.com/mobile-recharge/jio-recharge-online', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_jio_page.png') });

  // Check inputs on Jio page
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tagName: el.tagName,
      placeholder: el.placeholder,
      value: el.value,
      text: el.innerText
    }));
  });
  console.log('Inputs on Jio page:', inputs);

  // Fill mobile number and circle and amount
  const phone = page.locator('input[placeholder*="Mobile"]').first();
  await phone.fill('7489674391');
  await page.waitForTimeout(1000);

  const amount = page.locator('input[placeholder*="Amount"]').first();
  await amount.fill('299');
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(4000);

  console.log('URL after proceed on Jio page:', page.url());
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_jio_after_proceed.png') });

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Text after proceed snippet:\n', text.slice(0, 800));

  await browser.close();
}

testJioPage();
