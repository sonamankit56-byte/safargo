const { chromium } = require('playwright');
const path = require('path');

async function testClickPayDiv() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com') || url.includes('payment') || url.includes('gateway') || url.includes('cashfree') || url.includes('payu') || url.includes('razorpay') || url.includes('easebuzz')) {
      if (!url.includes('.png') && !url.includes('.svg') && !url.includes('.css')) {
        console.log('HTTP RESP:', resp.status(), url);
        try {
          const body = await resp.text();
          console.log('BODY:', body.slice(0, 300));
        } catch(e) {}
      }
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

  // Click the pay button div
  const payDiv = page.locator('.PaymentStack_proceed_btn__TvLMo').first();
  console.log('Clicking PaymentStack_proceed_btn__TvLMo...');
  await payDiv.click();
  await page.waitForTimeout(5000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shot = path.join(screenshotDir, 'rechargemojo_after_click_pay_div.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Saved screenshot:', shot);
  console.log('Final URL after Pay click:', page.url());

  const screenText = await page.evaluate(() => document.body.innerText.slice(0, 1000));
  console.log('Screen text:\n', screenText);

  await browser.close();
}

testClickPayDiv();
