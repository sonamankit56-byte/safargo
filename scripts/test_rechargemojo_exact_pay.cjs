const { chromium } = require('playwright');
const path = require('path');

async function testPayButton() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com/order') || url.includes('payment') || url.includes('gateway') || url.includes('cashfree') || url.includes('payu') || url.includes('razorpay')) {
      console.log('PAY_API:', resp.status(), url);
      try {
        const text = await resp.text();
        console.log('DATA:', text.slice(0, 200));
      } catch(e) {}
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
  if (await selectPlanBtn.count() > 0) {
    await selectPlanBtn.click({ force: true });
  }
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(2000);

  // Exact button: "Pay ₹1729"
  const actualPayBtn = page.locator('button:has-text("Pay ₹")').first();
  console.log('Actual Pay button text:', await actualPayBtn.innerText());
  await actualPayBtn.click();
  await page.waitForTimeout(5000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shot = path.join(screenshotDir, 'rechargemojo_final_gateway.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Current URL after clicking exact Pay button:', page.url());

  const postPayElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button, p, h1, h2, h3, h4, iframe'))
      .map(e => ({ tag: e.tagName, text: e.innerText || e.placeholder || e.src || '' }))
      .filter(e => e.text.length > 0 && e.text.length < 100);
  });
  console.log('Elements after Pay button click:');
  console.log(postPayElements.slice(0, 25));

  await browser.close();
}

testPayButton();
