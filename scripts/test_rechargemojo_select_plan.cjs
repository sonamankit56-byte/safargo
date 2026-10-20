const { chromium } = require('playwright');
const path = require('path');

async function testSelectPlanAndProceed() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com') && (url.includes('order') || url.includes('checkout') || url.includes('payment') || url.includes('bill') || url.includes('auth') || url.includes('cart'))) {
      console.log('API:', resp.status(), url);
      try {
        const txt = await resp.text();
        console.log('RES:', txt.slice(0, 150));
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
  await page.waitForTimeout(2000);

  // 4. Click "Select" button on the first plan in list
  const selectPlanBtn = page.locator('button:has-text("Select"), div:has-text("Select")').first();
  if (await selectPlanBtn.count() > 0) {
    console.log('Clicking plan Select button...');
    await selectPlanBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // 5. Check what is in the amount box now
  const amountVal = await page.locator('input[placeholder*="Enter Amount"]').first().inputValue();
  console.log('Amount in input after selecting plan:', amountVal);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_plan_selected.png') });

  // 6. Click Proceed
  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  console.log('Proceed button disabled?', await proceedBtn.isDisabled());
  await proceedBtn.click();
  await page.waitForTimeout(5000);

  console.log('URL after proceed:', page.url());
  await page.screenshot({ path: path.join(screenshotDir, 'rechargemojo_after_plan_proceed.png') });

  // Check if any popup or modal or new page appeared
  const modalText = await page.evaluate(() => {
    const modals = Array.from(document.querySelectorAll('.modal, .popup, [role="dialog"], form, [class*="login"], [class*="auth"]'))
      .map(m => m.innerText ? m.innerText.trim() : '')
      .filter(t => t.length > 0);
    return modals;
  });
  console.log('Modals/dialogs found on screen:', modalText);

  const bodySnippet = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Body snippet:\n', bodySnippet);

  await browser.close();
}

testSelectPlanAndProceed();
