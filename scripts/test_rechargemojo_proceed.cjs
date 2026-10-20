const { chromium } = require('playwright');
const path = require('path');

async function testSelectOperatorAndProceed() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('rechargemojo') || resp.url().includes('auth') || resp.url().includes('order') || resp.url().includes('payment')) {
      console.log('RESP:', resp.status(), resp.url());
    }
  });

  await page.goto('https://rechargemojo.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Enter mobile number
  const phoneInput = page.locator('input[placeholder*="Mobile Number"]').first();
  await phoneInput.fill('7489674391');
  await page.waitForTimeout(1000);

  // Click Select Operator
  const operatorInput = page.locator('input[placeholder*="Select Operator"]').first();
  await operatorInput.click();
  await page.waitForTimeout(1000);

  // Check what appeared (dropdown / modal / list)
  const operatorOptions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('li, div, span, button'))
      .map(el => el.innerText ? el.innerText.trim() : '')
      .filter(t => t.includes('Jio') || t.includes('Airtel') || t.includes('Vodafone') || t.includes('VI'));
  });
  console.log('Operator options detected:', operatorOptions.slice(0, 10));

  // Click Jio
  const jioOption = page.locator('text="Jio"').first();
  if (await jioOption.count() > 0) {
    await jioOption.click();
    console.log('Clicked Jio');
  }
  await page.waitForTimeout(1000);

  // Click Select Circle
  const circleInput = page.locator('input[placeholder*="Select Circle"]').first();
  await circleInput.click();
  await page.waitForTimeout(1000);

  // Click Madhya Pradesh
  const mpOption = page.locator('text=/Madhya Pradesh/i').first();
  if (await mpOption.count() > 0) {
    await mpOption.click();
    console.log('Clicked Madhya Pradesh');
  }
  await page.waitForTimeout(1000);

  // Enter Amount
  const amountInput = page.locator('input[placeholder*="Enter Amount"]').first();
  await amountInput.fill('299');
  await page.waitForTimeout(1000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_ready_proceed.png') });

  // Click Proceed
  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  console.log('Proceed button class:', await proceedBtn.getAttribute('class'));
  await proceedBtn.click();
  await page.waitForTimeout(5000);

  console.log('Current URL after Proceed:', page.url());
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_checkout_result.png') });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page content after proceed:\n', bodyText.slice(0, 1000));

  await browser.close();
}

testSelectOperatorAndProceed();
