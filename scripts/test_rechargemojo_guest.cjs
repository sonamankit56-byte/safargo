const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testRechargeMojoGuest() {
  console.log('Testing RechargeMojo guest recharge without login...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.url().includes('rechargemojo') || resp.url().includes('pay') || resp.url().includes('checkout') || resp.url().includes('order') || resp.url().includes('gateway')) {
      console.log('RESP:', resp.status(), resp.url());
    }
  });

  try {
    await page.goto('https://rechargemojo.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const phoneInput = page.locator('input[placeholder*="Mobile Number"]').first();
    await phoneInput.click();
    await phoneInput.pressSequentially('7489674391', { delay: 80 });
    await page.waitForTimeout(2000);

    // Operator and circle may auto-detect, or select
    const amountInput = page.locator('input[placeholder*="Amount"]').first();
    await amountInput.click();
    await amountInput.pressSequentially('19', { delay: 50 });
    await page.waitForTimeout(1000);

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    const filledPic = path.join(screenshotDir, 'rechargemojo_filled.png');
    await page.screenshot({ path: filledPic });
    console.log('Saved filled form screenshot to:', filledPic);

    // Click Proceed
    const proceedBtn = page.locator('button:has-text("Proceed")').first();
    console.log('Clicking Proceed button...');
    await proceedBtn.click();
    await page.waitForTimeout(4000);

    console.log('URL after proceed:', page.url());
    const nextPic = path.join(screenshotDir, 'rechargemojo_after_proceed.png');
    await page.screenshot({ path: nextPic });
    console.log('Saved next step screenshot to:', nextPic);

    const text = await page.evaluate(() => document.body.innerText);
    console.log('Page text after proceed (snippet):', text.slice(0, 500));

  } catch (err) {
    console.error('Error on RechargeMojo:', err);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testRechargeMojoGuest();
