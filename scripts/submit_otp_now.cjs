const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function submitOtp(otp) {
  console.log(`Submitting OTP ${otp} for 7489674391...`);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('otp') || resp.url().includes('login') || resp.url().includes('validate') || resp.url().includes('user') || resp.url().includes('wallet')) {
      console.log('API RESP:', resp.status(), resp.url());
      try {
        const text = await resp.text();
        console.log('API DATA:', text.slice(0, 300));
      } catch {}
    }
  });

  try {
    await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first();
    await loginBtn.click();
    await page.waitForTimeout(1000);

    const phoneInput = page.locator('input.lfa-mobile__input, input[placeholder*="Mobile"], input[type="tel"]').first();
    await phoneInput.click();
    await phoneInput.pressSequentially('7489674391', { delay: 60 });
    await page.waitForTimeout(500);

    await page.locator('button.lfa-cta, button:has-text("Get OTP"), button:has-text("Get Otp")').first().click();
    console.log('Waiting for OTP modal...');
    await page.waitForSelector('input.lfa-otp-input, text=Enter OTP', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Focus input.lfa-otp-input and type OTP
    console.log(`Entering OTP: ${otp} directly into input.lfa-otp-input...`);
    const otpInput = page.locator('input.lfa-otp-input').first();
    await otpInput.click();
    await otpInput.pressSequentially(otp, { delay: 100 });
    await page.waitForTimeout(1000);

    // Check if Submit button is enabled
    const submitBtn = page.locator('button.lfa-cta--otp, button:has-text("Submit OTP")').first();
    console.log('Submit button isEnabled:', await submitBtn.isEnabled());

    await submitBtn.click();
    console.log('Clicked Submit OTP, waiting 5 seconds...');
    await page.waitForTimeout(5000);

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    const resultPic = path.join(screenshotDir, 'mobikwik_login_result.png');
    await page.screenshot({ path: resultPic });
    console.log('Screenshot saved to:', resultPic);

    // Capture storage and cookies
    const state = await context.storageState();
    fs.writeFileSync(path.join(__dirname, 'mobikwik_logged_in_state.json'), JSON.stringify(state, null, 2));

    const cookies = await context.cookies();
    console.log('Cookies count:', cookies.length);
    const token = cookies.find(c => c.name.toLowerCase().includes('token') || c.name.toLowerCase().includes('auth'));
    if (token) {
      console.log('🎉 FOUND AUTH TOKEN:', token.name, '=', token.value.slice(0, 20) + '...');
    }

  } catch (err) {
    console.error('Error in submitOtp:', err.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

submitOtp(process.argv[2] || '935798');
