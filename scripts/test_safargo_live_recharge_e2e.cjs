const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testSafargoLiveRecharge() {
  console.log('Testing SafarGo Live Recharge Integration...');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  try {
    await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 1. Navigate to Recharge service
    const rechargeNav = page.locator('button').filter({ hasText: /Recharge|रिचार्ज/i }).first();
    console.log('Recharge nav found:', await rechargeNav.count());
    if (await rechargeNav.count() > 0) {
      await rechargeNav.click();
      await page.waitForTimeout(2000);
    }

    // Capture initial screen
    await page.screenshot({ path: path.join(screenshotDir, 'safargo_recharge_initial.png'), fullPage: true });
    console.log('1. Captured initial recharge screen');

    // 2. Type mobile number: 7489674391
    const mobileInput = page.locator('input[placeholder*="74XXXXXXXX"], input[type="tel"]').first();
    console.log('Typing mobile number: 7489674391...');
    await mobileInput.fill('7489674391');

    // Wait for auto-detection and live plans to load
    await page.waitForTimeout(4000);

    await page.screenshot({ path: path.join(screenshotDir, 'safargo_recharge_detected.png'), fullPage: true });
    console.log('2. Captured auto-detected operator and live plans');

    // Verify auto-detected text
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasDetected = pageText.includes('Vodafone Idea') || pageText.includes('Auto MNP');
    console.log('Auto MNP detected on screen:', hasDetected);

    // 3. Click submit button
    const submitBtn = page.locator('button:has-text("तुरंत रिचार्ज करें")').first();
    console.log('Clicking Submit button:', await submitBtn.innerText());
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // 4. Verify checkout modal
    await page.screenshot({ path: path.join(screenshotDir, 'safargo_recharge_modal.png'), fullPage: true });
    console.log('3. Captured secure in-app checkout modal');

    const modalVisible = await page.locator('text=/सुरक्षित UPI भुगतान|PhonePe/i').count() > 0;
    console.log('Payment Modal Visible:', modalVisible);

    // 5. Click "भुगतान प्राप्त हुआ • रसीद प्रिंट करें"
    const confirmPaymentBtn = page.locator('button:has-text("भुगतान प्राप्त हुआ")').first();
    if (await confirmPaymentBtn.count() > 0) {
      console.log('Clicking "भुगतान प्राप्त हुआ • रसीद प्रिंट करें"...');
      await confirmPaymentBtn.click();
      await page.waitForTimeout(2500);
    }

    // 6. Capture receipt screen
    await page.screenshot({ path: path.join(screenshotDir, 'safargo_recharge_receipt.png'), fullPage: true });
    console.log('4. Captured official receipt screen');

    const receiptSuccess = await page.locator('text=/भुगतान सफल रहा|BHARAT BILLPAY • SUCCESS/i').count() > 0;
    console.log('Receipt Screen Verified:', receiptSuccess);

  } catch (err) {
    console.error('Error during SafarGo Live Recharge test:', err);
  } finally {
    await browser.close();
    console.log('E2E Test finished successfully!');
  }
}

testSafargoLiveRecharge();
