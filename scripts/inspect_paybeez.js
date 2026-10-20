const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
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
    await page.waitForTimeout(4000);

    // Look for a plan card or button to click
    const planButtons = await page.$$('button');
    console.log(`Found ${planButtons.length} buttons on page`);
    for (const b of planButtons) {
      const text = await b.innerText();
      if (text.includes('₹') || text.includes('Select') || text.includes('Recharge')) {
        console.log('Clicking button with text:', text.trim().slice(0, 50));
        await b.click().catch(() => {});
        await page.waitForTimeout(2000);
        break;
      }
    }
  }

  await page.screenshot({ path: 'test-results/paybeez_live.png' });
  await browser.close();
  console.log('Inspection finished');
})();
