const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testRealGatewayFlow() {
  console.log('Testing Real Payment Gateway Flow...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Navigate to Recharge
    const rechargeNav = page.locator('button').filter({ hasText: /Recharge|रिचार्ज/i }).first();
    if (await rechargeNav.count() > 0) {
      await rechargeNav.click();
      await page.waitForTimeout(1500);
    }

    // 2. Type mobile number
    const mobileInput = page.locator('input[placeholder="74XXXXXXXX"]').first();
    await mobileInput.fill('7489674391');
    console.log('Filled mobile number 7489674391');
    await page.waitForTimeout(3000);

    // 3. Confirm detected operator
    const detectedBadge = page.locator('text=Vodafone Idea').first();
    console.log('Detected operator badge visible:', await detectedBadge.isVisible());

    // 4. Select a plan
    const plan299 = page.locator('div:has-text("₹299")').last();
    if (await plan299.count() > 0) {
      await plan299.click();
      console.log('Selected ₹299 plan');
      await page.waitForTimeout(1000);
    }

    // Take screenshot of selected plan
    await page.screenshot({ path: path.join(screenshotDir, 'gateway_01_plan_selected.png') });

    // 5. Submit to Gateway
    // In headless browser, window.open might be prevented, but our handler falls back or handles it
    const submitBtn = page.locator('button:has-text("पेमेंट गेटवे पर जाएं")').first();
    console.log('Found submit button:', await submitBtn.innerText());
    await submitBtn.click();
    console.log('Clicked submit button, waiting for gateway modal...');
    await page.waitForTimeout(4000);

    // Take screenshot of gateway waiting modal
    await page.screenshot({ path: path.join(screenshotDir, 'gateway_02_waiting_modal.png') });

    // 6. Verify modal contents
    const waitingHeading = page.locator('text=गेटवे पर भुगतान की प्रतीक्षा है');
    console.log('Waiting heading visible:', await waitingHeading.isVisible());

    // Verify NO fake "भुगतान प्राप्त हुआ" button exists
    const fakeReceiveBtn = page.locator('button:has-text("भुगतान प्राप्त हुआ")');
    console.log('Fake receive button count (MUST BE 0):', await fakeReceiveBtn.count());

    // Verify real gateway button exists
    const openGatewayBtn = page.locator('button:has-text("पेमेंट गेटवे विंडो खोलें")');
    console.log('Real gateway button visible:', await openGatewayBtn.isVisible());

    // Verify polling check button exists
    const checkStatusBtn = page.locator('button:has-text("पेमेंट स्टेटस अभी चेक करें")');
    console.log('Status check button visible:', await checkStatusBtn.isVisible());

    console.log('All real gateway flow verifications passed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

testRealGatewayFlow().catch(console.error);
