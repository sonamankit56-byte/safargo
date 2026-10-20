const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyOtp(otp) {
  if (!otp || otp.length < 4) {
    console.error('Please provide valid OTP');
    process.exit(1);
  }

  console.log(`Verifying MobiKwik OTP: ${otp} for 7489674391...`);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const sessionFile = path.join(__dirname, 'mobikwik_session.json');
  let cookies = [];
  if (fs.existsSync(sessionFile)) {
    try {
      cookies = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
    } catch {}
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  if (cookies.length > 0) {
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('otp') || resp.url().includes('login') || resp.url().includes('auth') || resp.url().includes('user') || resp.url().includes('wallet')) {
      console.log('RESP:', resp.status(), resp.url());
      try {
        const text = await resp.text();
        console.log('RESP DATA:', text.slice(0, 300));
      } catch {}
    }
  });

  try {
    await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);

    // If login modal is not already open, open it and type phone
    const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForTimeout(1000);
      const phoneInput = page.locator('input[placeholder*="Mobile"], input[type="tel"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.click();
        await phoneInput.pressSequentially('7489674391', { delay: 80 });
        await page.waitForTimeout(600);
        const getOtpBtn = page.locator('button:has-text("Get OTP")').first();
        if (await getOtpBtn.isVisible()) {
          await getOtpBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // Now on OTP input screen
    console.log('Entering OTP digits...');
    const otpInputs = page.locator('input[type="tel"], input[type="number"], input[type="text"]').all();
    const resolvedInputs = await otpInputs;

    if (resolvedInputs.length >= 6) {
      for (let i = 0; i < otp.length; i++) {
        await resolvedInputs[i].fill(otp[i]);
      }
    } else {
      const singleInput = page.locator('input[placeholder*="OTP"], input').first();
      await singleInput.fill(otp);
    }

    await page.waitForTimeout(800);
    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(4000);

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    const successPath = path.join(screenshotDir, 'mobikwik_logged_in.png');
    await page.screenshot({ path: successPath });
    console.log('Screenshot saved to:', successPath);

    // Save final authenticated session state
    const finalCookies = await context.cookies();
    const finalState = await context.storageState();
    fs.writeFileSync(path.join(__dirname, 'mobikwik_auth_state.json'), JSON.stringify(finalState, null, 2));
    console.log('✓ Successfully saved MobiKwik authenticated session! It will stay permanently logged in.');

  } catch (err) {
    console.error('Error during OTP verification:', err);
  } finally {
    await browser.close();
  }
}

const otpArg = process.argv[2];
verifyOtp(otpArg);
