const { chromium } = require('playwright');

async function checkPayTag() {
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

  const selectPlanBtn = page.locator('button:has-text("Select"), div:has-text("Select")').first();
  await selectPlanBtn.click({ force: true });
  await page.waitForTimeout(1000);

  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(2000);

  const payElement = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    const target = els.find(e => e.innerText && e.innerText.trim().startsWith('Pay ₹'));
    if (!target) return null;
    return {
      tagName: target.tagName,
      className: target.className,
      outerHTML: target.outerHTML.slice(0, 300)
    };
  });
  console.log('Pay Element:', payElement);

  await browser.close();
}

checkPayTag();
