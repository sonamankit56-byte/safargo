const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function sendMobikwikOtp() {
  console.log('--- Triggering MobiKwik OTP for 7489674391 ---');
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
    if (resp.url().includes('otp') || resp.url().includes('login') || resp.url().includes('auth') || resp.url().includes('user')) {
      console.log('RESP URL:', resp.status(), resp.url());
      try {
        const text = await resp.text();
        console.log('RESP DATA:', text.slice(0, 300));
      } catch {}
    }
  });

  try {
    await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Click Login
    const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first();
    await loginBtn.click();
    await page.waitForTimeout(1500);

    // Focus input and type 7489674391 with delay
    console.log('Typing 7489674391 into phone input...');
    const input = page.locator('input[placeholder*="Mobile"], input[type="tel"]').first();
    await input.click();
    await input.pressSequentially('7489674391', { delay: 100 });
    await page.waitForTimeout(1000);

    // Click Get OTP
    const getOtpBtn = page.locator('button:has-text("Get OTP")').first();
    await getOtpBtn.waitFor({ state: 'visible', timeout: 5000 });
    console.log('Clicking "Get OTP" button...');
    await getOtpBtn.click();
    await page.waitForTimeout(3000);

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const otpSentScreenshot = path.join(screenshotDir, 'mobikwik_otp_screen.png');
    await page.screenshot({ path: otpSentScreenshot });
    console.log('Screenshot saved to:', otpSentScreenshot);

    const pageText = await page.evaluate(() => document.body.innerText);
    console.log('Page text snippet:', pageText.slice(0, 500));

    // Save browser state/cookies if OTP is sent
    const cookies = await context.cookies();
    fs.writeFileSync(path.join(__dirname, 'mobikwik_session.json'), JSON.stringify(cookies, null, 2));
    console.log('✓ Successfully triggered OTP to 7489674391!');

  } catch (err) {
    console.error('Error in sendMobikwikOtp:', err);
  } finally {
    // Keep it open for 5 seconds to ensure network completes
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

sendMobikwikOtp();
