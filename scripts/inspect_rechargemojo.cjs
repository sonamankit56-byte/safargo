const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function inspectRechargeMojo() {
  console.log('Inspecting https://www.rechargemojo.com/...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.url().includes('recharge') || resp.url().includes('plan') || resp.url().includes('pay') || resp.url().includes('order')) {
      console.log('URL:', resp.status(), resp.url());
    }
  });

  try {
    const res = await page.goto('https://www.rechargemojo.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Status:', res ? res.status() : 'none');
    console.log('Title:', await page.title());
    await page.waitForTimeout(3000);

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const shotPath = path.join(screenshotDir, 'rechargemojo_home.png');
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log('Screenshot saved to:', shotPath);

    // Look for form fields on homepage
    const fields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, button, a')).map(el => ({
        tag: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        text: el.innerText ? el.innerText.trim().slice(0, 40) : '',
        id: el.id
      }));
      return inputs.filter(i => i.placeholder || i.name || (i.text && i.tag === 'BUTTON'));
    });
    console.log('Form inputs & buttons on RechargeMojo:');
    console.log(JSON.stringify(fields.slice(0, 25), null, 2));

    // Test filling a sample number and see if it asks for login or directly opens payment
    const phoneInput = page.locator('input[placeholder*="Mobile"], input[type="tel"], input[name*="mobile"]').first();
    if (await phoneInput.count() > 0) {
      console.log('Found phone input, testing typing 7489674391...');
      await phoneInput.fill('7489674391');
      await page.waitForTimeout(1000);

      // Look for amount or continue
      const amountInput = page.locator('input[placeholder*="Amount"], input[name*="amount"]').first();
      if (await amountInput.count() > 0) {
        await amountInput.fill('299');
        await page.waitForTimeout(500);
      }

      const proceedBtn = page.locator('button:has-text("Proceed"), button:has-text("Recharge"), input[type="submit"]').first();
      if (await proceedBtn.count() > 0) {
        console.log('Proceed button found:', await proceedBtn.innerText());
      }
    }

  } catch (err) {
    console.error('Error on RechargeMojo:', err);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

inspectRechargeMojo();
