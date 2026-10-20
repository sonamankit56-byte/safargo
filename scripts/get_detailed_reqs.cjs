const { chromium } = require('playwright');

async function getDetailedReqs() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('request', req => {
    const url = req.url();
    if (url.includes('v1.pro.rechargemojo.com')) {
      console.log('REQ METHOD & URL:', req.method(), url);
      console.log('REQ HEADERS:', JSON.stringify(req.headers()));
      console.log('REQ POST DATA:', req.postData());
    }
  });

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

  const selectPlanBtn = page.locator('button:has-text("Select"), div:has-text("Select")').first();
  await selectPlanBtn.click({ force: true });
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(2000);

  const payDiv = page.locator('.PaymentStack_proceed_btn__TvLMo').first();
  await payDiv.click();
  await page.waitForTimeout(4000);

  await browser.close();
}

getDetailedReqs();
