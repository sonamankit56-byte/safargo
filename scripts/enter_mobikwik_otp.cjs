const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function enterOtp(otp) {
  console.log(`Entering OTP ${otp}...`);
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('otp') || resp.url().includes('login') || resp.url().includes('validate') || resp.url().includes('auth')) {
      console.log('NETWORK RESP:', resp.status(), resp.url());
      try {
        const text = await resp.text();
        console.log('BODY:', text.slice(0, 300));
      } catch {}
    }
  });

  await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first().click();
  await page.waitForTimeout(1000);

  const phoneInput = page.locator('input[placeholder*="Mobile"], input[type="tel"]').first();
  await phoneInput.click();
  await phoneInput.pressSequentially('7489674391', { delay: 60 });
  await page.waitForTimeout(500);

  // Click Get Otp
  await page.locator('.lfa-cta, button:has-text("Get OTP"), button:has-text("Get Otp")').first().click();
  console.log('Waiting for OTP screen to appear...');

  // Wait for "Enter OTP" text to be visible
  await page.waitForSelector('text=Enter OTP', { timeout: 10000 });
  console.log('✓ On Enter OTP screen!');

  await page.waitForTimeout(1000);

  // Look for OTP container / inputs
  const otpFields = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('input, [contenteditable="true"], .otp-input, ng-otp-input input'));
    return els.map(e => ({ tag: e.tagName, className: e.className, id: e.id, placeholder: e.placeholder }));
  });
  console.log('OTP fields found:', otpFields);

  // Focus and type OTP using keyboard
  console.log('Clicking center of OTP area and typing keys...');
  const otpArea = page.locator('text=Enter OTP').locator('xpath=..');
  await otpArea.click();
  await page.keyboard.type(otp, { delay: 150 });
  await page.waitForTimeout(1000);

  // Click Submit OTP
  const submitBtn = page.locator('button:has-text("Submit OTP"), button:has-text("Submit"), .lfa-cta').last();
  console.log('Clicking Submit button...');
  await submitBtn.click();
  await page.waitForTimeout(5000);

  const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
  const loggedInPic = path.join(screenshotDir, 'mobikwik_after_otp_submit.png');
  await page.screenshot({ path: loggedInPic });
  console.log('Screenshot saved to:', loggedInPic);

  // Check if logged in: check localStorage, cookies, user profile
  const cookies = await page.context().cookies();
  const tokenCookie = cookies.find(c => c.name.toLowerCase().includes('token') || c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('session'));
  console.log('Token cookie:', tokenCookie ? tokenCookie.name : 'No explicit token cookie yet');

  const storageState = await page.context().storageState();
  fs.writeFileSync(path.join(__dirname, 'mobikwik_logged_in_state.json'), JSON.stringify(storageState, null, 2));
  console.log('Saved storage state to mobikwik_logged_in_state.json!');

  await page.waitForTimeout(2000);
  await browser.close();
}

const otp = process.argv[2] || '946994';
enterOtp(otp);
