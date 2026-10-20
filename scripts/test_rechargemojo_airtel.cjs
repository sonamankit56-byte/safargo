const { chromium } = require('playwright');

async function checkOperator() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  // Test with Airtel
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

  page.on('response', async resp => {
    if (resp.url().includes('validation') || resp.url().includes('order') || resp.url().includes('checkout')) {
      console.log('VALIDATION RESP:', resp.status(), resp.url());
      try {
        console.log('BODY:', await resp.text());
      } catch(e) {}
    }
  });

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(5000);

  console.log('URL after proceed:', page.url());
  await browser.close();
}

checkOperator();
