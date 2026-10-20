const { chromium } = require('playwright');
const path = require('path');

async function testPayClick() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com') || url.includes('pay') || url.includes('cashfree') || url.includes('razorpay') || url.includes('payu') || url.includes('easebuzz')) {
      console.log('PAY RESP:', resp.status(), url);
      try {
        const text = await resp.text();
        console.log('BODY:', text.slice(0, 250));
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

  // Click first plan select
  const selectPlanBtn = page.locator('button:has-text("Select"), div:has-text("Select")').first();
  if (await selectPlanBtn.count() > 0) {
    await selectPlanBtn.click({ force: true });
  }
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(2000);

  // Click Pay button
  const payBtn = page.locator('button:has-text("Pay"), div:has-text("Pay")').last();
  console.log('Clicking Pay button:', await payBtn.innerText());
  await payBtn.click();
  await page.waitForTimeout(4000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shot = path.join(screenshotDir, 'rechargemojo_after_pay_click.png');
  await page.screenshot({ path: shot, fullPage: true });
  console.log('Current URL after Pay:', page.url());

  const dialogText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, button, p, h2, h3, h4'))
      .map(e => e.innerText || e.placeholder || '')
      .filter(t => t.length > 0 && t.length < 80);
  });
  console.log('Elements after Pay click:');
  console.log(dialogText.slice(0, 30));

  await browser.close();
}

testPayClick();
