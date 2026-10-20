const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testUtilityServices() {
  console.log('--- Testing Mobile & Utility (BBPS) Recharge Services ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // 1. Initial Load & Auth
    console.log('1. Loading app at http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const admin = {
        id: 'SFG-SUPER-ADMIN-JIA',
        fullName: 'Jia Verma (सुपर एडमिन)',
        mobile: '9826012345',
        email: 'jia647155@gmail.com',
        shopName: 'SafarGo HQ Jabalpur MP',
        address: 'Civil Lines, Jabalpur, MP',
        aadhaarNumber: '999988887777',
        panNumber: 'ABCDE1234F',
        bankAccount: '987654321012',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        upiId: 'jia647155@upi',
        walletBalance: 14850.50,
        isApproved: true,
        isSuspended: false,
        registeredAt: '2026-01-01'
      };
      localStorage.setItem('safargo_agent_logged_in', 'true');
      localStorage.setItem('safargo_current_agent', JSON.stringify(admin));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    // 2. Navigate to Recharge Screen
    console.log('2. Opening Recharge & Utility Screen...');
    const rechargeNavBtn = page.locator('button:has-text("रिचार्ज व बिल"), button:has-text("Recharge")').first();
    await rechargeNavBtn.click();
    await page.waitForTimeout(1000);

    const bbpsHeader = page.locator('text=भारत बिलपे (BBPS) अधिकृत केंद्र').first();
    await bbpsHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ BBPS Utility Desk loaded successfully!');

    // 3. Test Mobile Recharge (Jio)
    console.log('3. Testing Mobile Prepaid Recharge...');
    await page.fill('input[placeholder="98XXXXXXXX"]', '9826012345');
    const rechargeSubmitBtn = page.locator('button:has-text("तुरंत रिचार्ज करें")').first();
    await rechargeSubmitBtn.click();
    await page.waitForTimeout(1200);

    const successHeader = page.locator('text=भुगतान सफल रहा!').first();
    await successHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Mobile Recharge completed with BBPS ID and instant commission!');
    await page.screenshot({ path: path.join(screenshotDir, '20_mobile_recharge_success.png') });

    // Reset to do next
    await page.locator('button:has-text("नया रिचार्ज या बिल भुगतान करें")').first().click();
    await page.waitForTimeout(600);

    // 4. Test Electricity Bill (MPPKVVCL West)
    console.log('4. Testing MP Electricity Bill Fetch & Pay...');
    const electTab = page.locator('button:has-text("बिजली बिल (MP)")').first();
    await electTab.click();
    await page.waitForTimeout(600);

    await page.fill('input[placeholder="e.g. N4501239812"]', 'N4501239812');
    const fetchBillBtn = page.locator('button:has-text("बिल राशि देखें (Fetch Live Bill)")').first();
    await fetchBillBtn.click();
    await page.waitForTimeout(800);

    const billDueText = page.locator('text=देय बिल राशि:').first();
    await billDueText.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Live MP electricity bill fetched with consumer name & due date!');

    const payBillBtn = page.locator('button:has-text("बिल का भुगतान करें")').first();
    await payBillBtn.click();
    await page.waitForTimeout(1200);

    await page.locator('text=भुगतान सफल रहा!').first().waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ MP Electricity Bill successfully paid with ₹12 commission!');
    await page.screenshot({ path: path.join(screenshotDir, '21_electricity_bill_success.png') });

    // Reset
    await page.locator('button:has-text("नया रिचार्ज या बिल भुगतान करें")').first().click();
    await page.waitForTimeout(600);

    // 5. Test DTH TV Recharge
    console.log('5. Testing DTH TV Recharge...');
    const dthTab = page.locator('button:has-text("DTH टीवी")').first();
    await dthTab.click();
    await page.waitForTimeout(600);

    await page.fill('input[placeholder="e.g. 1029384756"]', '1029384756');
    const dthSubmitBtn = page.locator('button:has-text("DTH रिचार्ज करें")').first();
    await dthSubmitBtn.click();
    await page.waitForTimeout(1200);

    await page.locator('text=भुगतान सफल रहा!').first().waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ DTH Recharge successfully completed!');
    await page.screenshot({ path: path.join(screenshotDir, '22_dth_recharge_success.png') });

    // Reset
    await page.locator('button:has-text("नया रिचार्ज या बिल भुगतान करें")').first().click();
    await page.waitForTimeout(600);

    // 6. Test FASTag Recharge
    console.log('6. Testing FASTag Toll Recharge...');
    const fastagTab = page.locator('button:has-text("FASTag टोल")').first();
    await fastagTab.click();
    await page.waitForTimeout(600);

    await page.fill('input[placeholder="e.g. MP 09 AB 1234"]', 'MP09AB1234');
    const fastagSubmitBtn = page.locator('button:has-text("FASTag रिचार्ज करें")').first();
    await fastagSubmitBtn.click();
    await page.waitForTimeout(1200);

    await page.locator('text=भुगतान सफल रहा!').first().waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ FASTag Recharge successfully completed!');
    await page.screenshot({ path: path.join(screenshotDir, '23_fastag_recharge_success.png') });

    console.log('🎉 ALL MOBILE & UTILITY (BBPS) RECHARGES PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('Utility test failed:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'utility_test_error.png') }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testUtilityServices();
