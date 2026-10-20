const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('request', req => {
    if (req.url().includes('api')) {
      console.log('API REQ:', req.method(), req.url());
      if (req.postData()) console.log('POST DATA:', req.postData().slice(0, 300));
    }
  });

  page.on('response', async res => {
    if (res.url().includes('api')) {
      try {
        const text = await res.text();
        console.log('API RES:', res.url(), text.slice(0, 300));
      } catch(e) {}
    }
  });

  console.log('Navigating to https://paybeez.in/ ...');
  await page.goto('https://paybeez.in/', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Title:', await page.title());

  const telInput = await page.$('input[type="tel"]') || await page.$('input');
  if (telInput) {
    await telInput.fill('7489674391');
    console.log('Filled mobile number 7489674391');
    await page.waitForTimeout(1000);

    const showPlansBtn = page.locator('button:has-text("Show plans")');
    if (await showPlansBtn.count() > 0) {
      console.log('Clicking Show plans...');
      await showPlansBtn.click();
      await page.waitForTimeout(4000);
    }

    console.log('Current URL after Show plans:', page.url());

    // Look for a plan card
    const selectPlanBtn = page.locator('button:has-text("₹"), button:has-text("Select"), div[role="button"]:has-text("₹")').first();
    if (await selectPlanBtn.count() > 0) {
      console.log('Found plan, clicking plan...');
      await selectPlanBtn.click();
      await page.waitForTimeout(3000);

      const confirmPayBtn = page.locator('button:has-text("Confirm & Pay")');
      if (await confirmPayBtn.count() > 0) {
        console.log('Clicking Confirm & Pay...');
        await confirmPayBtn.click();
        await page.waitForTimeout(3000);

        const payNowBtn = page.locator('button:has-text("Pay Now")');
        if (await payNowBtn.count() > 0) {
          console.log('Clicking Pay Now...');
          await payNowBtn.click();
          await page.waitForTimeout(6000);
        }
      }
      console.log('Final URL after Pay Now:', page.url());
    }
  }

  await page.screenshot({ path: 'test-results/paybeez_live.png' });
  await browser.close();
  console.log('Inspection finished');
})();
