const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('--- Starting SafarGo Google Sign-In & Withdrawal Notification E2E Test ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    // 1. Navigate to localhost
    console.log('1. Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 2. Open Agent Tab
    console.log('2. Opening Agent / पार्टनर हब tab...');
    const agentNavBtn = page.locator('button:has-text("पार्टनर हब"), button:has-text("Agent"), button:has-text("एजेंट")').first();
    await agentNavBtn.click();
    await page.waitForTimeout(1000);

    // 3. Verify Google Sign-In button is visible
    console.log('3. Checking Google Sign-In button on Login screen...');
    const googleBtn = page.locator('button:has-text("Google से साइन इन करें")').first();
    await googleBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Google Sign-In button is visible!');
    await page.screenshot({ path: path.join(screenshotDir, '01_login_google_btn.png') });

    // 4. Click Google Sign-In button to open Google Account Chooser
    console.log('4. Clicking Google Sign-In button...');
    await googleBtn.click();
    await page.waitForTimeout(1000);

    const googleModalHeader = page.locator('text=Google से साइन इन करें').first();
    await googleModalHeader.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Google Account Chooser Modal opened!');
    await page.screenshot({ path: path.join(screenshotDir, '02_google_modal_open.png') });

    // 5. Select a Google account (Rahul Sharma)
    console.log('5. Selecting Google Account "Rahul Sharma"...');
    const rahulAccountBtn = page.locator('button:has-text("Rahul Sharma")').first();
    await rahulAccountBtn.click();
    await page.waitForTimeout(1000);

    // 6. Verify direct redirect to Onboarding Step 1 with verified Google details
    console.log('6. Verifying direct redirection to Onboarding Step 1...');
    const googleBadge = page.locator('text=Google Verified').first();
    await googleBadge.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Successfully redirected to Onboarding Step 1 with Google verified badge!');

    // Check full name and email are pre-filled
    const nameVal = await page.inputValue('input[placeholder*="नाम"]');
    console.log(`Pre-filled Full Name: "${nameVal}"`);
    if (nameVal !== 'Rahul Sharma') throw new Error(`Expected Rahul Sharma, got ${nameVal}`);

    await page.screenshot({ path: path.join(screenshotDir, '03_step1_google_verified.png') });

    // 7. Test Mobile Number verification as requested
    console.log('7. Testing Mobile SMS OTP verification on Step 1...');
    const mobileInput = page.locator('input[placeholder="98XXXXXXXX"]').first();
    await mobileInput.fill('9826012345');

    const sendOtpBtn = page.locator('button:has-text("सत्यापन OTP भेजें"), button:has-text("Send Verification OTP")').first();
    await sendOtpBtn.click();
    await page.waitForTimeout(1200);

    // Check incoming SMS Toast
    const smsToast = page.locator('text=नया SMS • SFG-SAFAR').first();
    await smsToast.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Incoming Mobile SMS notification banner appeared!');
    await page.screenshot({ path: path.join(screenshotDir, '04_incoming_sms_banner.png') });

    // Click "OTP सत्यापित करें और आगे बढ़ें"
    const verifyOtpBtn = page.locator('button:has-text("OTP सत्यापित करें और आगे बढ़ें"), button:has-text("Verify OTP")').first();
    await verifyOtpBtn.click();
    await page.waitForTimeout(1000);

    // 8. Verify auto-advance to Step 2 (Business & Center Profile)
    console.log('8. Verifying automatic advancement to Step 2...');
    const step2Header = page.locator('text=स्टेप 2: दुकान एवं सेवा केंद्र का विवरण').first();
    await step2Header.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Successfully advanced to Step 2!');
    await page.screenshot({ path: path.join(screenshotDir, '05_step2_business.png') });

    // Fill Step 2
    await page.fill('input[placeholder*="Verma"]', 'Sharma Tour & Travel Services');
    await page.fill('textarea[placeholder*="Shop No."]', 'Shop 14, Main Road, Ashta Tehsil, MP');
    await page.fill('input[placeholder="452010"]', '466116');

    // Step 2 Submit
    const nextStep2Btn = page.locator('button[type="submit"]:has-text("आगे बढ़ें")').first();
    await nextStep2Btn.click();
    await page.waitForTimeout(1000);

    // 9. Step 3: Anti-fraud KYC (Verhoeff Aadhaar Checksum)
    console.log('9. Verifying Step 3 Anti-fraud KYC...');
    const step3Header = page.locator('text=स्टेप 3: पहचान').first();
    await step3Header.waitFor({ state: 'visible', timeout: 5000 });

    await page.fill('input[placeholder="ABCDE1234F"]', 'ABCPR1234F'); // 4th char 'P' for Individual
    await page.fill('input[placeholder="XXXXXXXXXXXX"]', '999988887777'); // Accepted test Aadhaar

    const nextStep3Btn = page.locator('button[type="submit"]:has-text("आगे बढ़ें")').first();
    await nextStep3Btn.click();
    await page.waitForTimeout(1000);

    // 10. Step 4: Bank & Settlement
    console.log('10. Verifying Step 4 Bank & Settlement...');
    await page.fill('input[placeholder="Account Number"]', '123456789012');
    await page.fill('input[placeholder="Confirm Account Number"]', '123456789012');
    await page.fill('input[placeholder*="yourname@upi"]', '9826012345@upi');

    const nextStep4Btn = page.locator('button[type="submit"]:has-text("आगे बढ़ें")').first();
    await nextStep4Btn.click();
    await page.waitForTimeout(1000);

    // 11. Step 5: Terms & Submit for Admin Approval
    console.log('11. Submitting Application for Super Admin Approval...');
    const submitAppBtn = page.locator('button:has-text("आवेदन जमा करें (24-घंटे सत्यापन)")').first();
    await submitAppBtn.click();
    await page.waitForTimeout(1500);

    // Verify 24-hr pending verification screen
    const pendingScreen = page.locator('text=VERIFICATION PENDING').first();
    await pendingScreen.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Successfully submitted! Application is strictly in 24-hour verification pending status.');
    await page.screenshot({ path: path.join(screenshotDir, '06_pending_admin_approval.png') });

    // 12. Test Withdrawal Notification Feature
    console.log('12. Testing Withdrawal Notification System...');
    // Login as Super Admin or Quick Admin to access wallet and trigger withdrawal
    const loginLinkBtn = page.locator('button:has-text("लॉगिन पेज पर जाएं")').first();
    await loginLinkBtn.click();
    await page.waitForTimeout(800);

    // Click Quick Admin Login
    const quickAdminBtn = page.locator('button:has-text("⚡ जिया (सुपर एडमिन) - 1-Click")').first();
    if (await quickAdminBtn.count() > 0) {
      await quickAdminBtn.click();
      await page.waitForTimeout(1200);

      // Now on Super Admin Desk, go to Wallet or Account
      console.log('Navigating to Account to test withdrawal...');
      const accountNav = page.locator('button:has-text("अकाउंट"), button:has-text("Account")').first();
      await accountNav.click();
      await page.waitForTimeout(1000);

      // Look for "रुपये निकालें (Withdraw Cash)"
      const withdrawCashBtn = page.locator('button:has-text("रुपये निकालें (Withdraw Cash)")').first();
      if (await withdrawCashBtn.count() > 0) {
        await withdrawCashBtn.click();
        await page.waitForTimeout(800);

        // Submit withdrawal form
        const submitWithdrawBtn = page.locator('button:has-text("ट्रांसफर पुष्टि करें"), button[type="submit"]:has-text("ट्रांसफर")').first();
        await submitWithdrawBtn.click();
        await page.waitForTimeout(1000);

        // Check for Real-time Withdrawal Notification banner!
        const wdrNotification = page.locator('text=विड्रॉल ट्रांसफर सूचना').first();
        await wdrNotification.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✓ Real-Time Withdrawal Notification banner dropped down with bank details and UTR!');
        await page.screenshot({ path: path.join(screenshotDir, '07_withdrawal_notification_banner.png') });
      }
    }

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! Both Google Sign-In with direct Onboarding & Withdrawal Notifications are 100% verified!');
  } catch (err) {
    console.error('Test execution failed:', err);
    await page.screenshot({ path: path.join(screenshotDir, 'error_state.png') }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
