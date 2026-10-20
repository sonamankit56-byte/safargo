const { chromium } = require('playwright');
const path = require('path');

async function inspectQuickRechargePage() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('paybeez') || resp.url().includes('zaakpay') || resp.url().includes('payment')) {
      console.log('HTTP:', resp.status(), resp.url());
      try {
        const body = await resp.text();
        if (!resp.url().includes('.js') && !resp.url().includes('.woff2') && !resp.url().includes('_rsc')) {
          console.log('BODY:', body.slice(0, 300));
        }
      } catch(e) {}
    }
  });

  await page.goto('https://paybeez.in/quick-recharge?n=7489674391', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const shotPath = path.join(screenshotDir, 'paybeez_quick_recharge.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Saved screenshot:', shotPath);

  // List all buttons and inputs
  const elements = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText.trim(), class: b.className, disabled: b.disabled }));
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ type: i.type, placeholder: i.placeholder, value: i.value }));
    const textSnippet = document.body.innerText.slice(0, 1000);
    return { btns, inputs, textSnippet };
  });

  console.log('Buttons on quick-recharge:', elements.btns);
  console.log('Inputs on quick-recharge:', elements.inputs);
  console.log('Text on quick-recharge snippet:\n', elements.textSnippet);

  // If there's a button, let's click it
  const payBtn = page.locator('button').filter({ hasText: /Pay|Confirm|Proceed|Continue/i }).first();
  if (await payBtn.count() > 0) {
    console.log('Clicking button:', await payBtn.innerText());
    await payBtn.click();
    await page.waitForTimeout(5000);

    const postClickShot = path.join(screenshotDir, 'paybeez_after_pay_click.png');
    await page.screenshot({ path: postClickShot, fullPage: true });
    console.log('Post click URL:', page.url());
    console.log('Post click snippet:\n', await page.evaluate(() => document.body.innerText.slice(0, 1000)));
  }

  await browser.close();
}

inspectQuickRechargePage();
