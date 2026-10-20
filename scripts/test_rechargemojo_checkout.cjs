const { chromium } = require('playwright');
const path = require('path');

async function testCheckoutScreen() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  await page.goto('https://rechargemojo.com/mobile-recharge/airtel-recharge-online');
  await page.waitForTimeout(2000);

  const phone = page.locator('input[placeholder*="Mobile Number"]').first();
  await phone.fill('7489674391');

  const circle = page.locator('input[placeholder*="Select Circle"]').first();
  await circle.click();
  await page.waitForTimeout(500);

  const mpItem = page.locator('text="Madhya Pradesh Chhattisgarh"').last();
  await mpItem.click({ force: true });
  await page.waitForTimeout(1500);

  // Click first plan select
  const selectPlanBtn = page.locator('button:has-text("Select"), div:has-text("Select")').first();
  if (await selectPlanBtn.count() > 0) {
    await selectPlanBtn.click({ force: true });
  }
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(3000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shot = path.join(screenshotDir, 'rechargemojo_checkout_modal.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved screenshot:', shot);

  const html = await page.evaluate(() => {
    // find buttons or text currently visible
    return Array.from(document.querySelectorAll('button, a, input, h1, h2, h3, h4, h5, p'))
      .map(el => el.innerText ? el.innerText.trim() : '')
      .filter(t => t.includes('Pay') || t.includes('UPI') || t.includes('Card') || t.includes('Summary') || t.includes('Proceed') || t.includes('₹'));
  });
  console.log('Visible elements related to payment:');
  console.log(html.slice(0, 30));

  await browser.close();
}

testCheckoutScreen();
