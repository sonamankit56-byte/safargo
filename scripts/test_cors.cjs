const { chromium } = require('playwright');

async function testCors() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  // Navigate to dev server
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(2000);

  // Attempt fetch to api.paybeez.in from page context
  const result = await page.evaluate(async () => {
    try {
      const res = await fetch('https://api.paybeez.in/v1/recharge/prepaid/plans-auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: '7489674391' })
      });
      const data = await res.json();
      return { success: true, data: data.data.detected };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  console.log('CORS Test Result from localhost:5174:', result);
  await browser.close();
}

testCors();
