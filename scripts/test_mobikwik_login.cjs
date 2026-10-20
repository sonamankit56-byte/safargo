const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testMobikwik() {
  console.log('Testing MobiKwik login for 7489674391...');
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

  page.on('request', req => {
    if (req.url().includes('otp') || req.url().includes('login') || req.url().includes('auth') || req.url().includes('user')) {
      console.log('REQ:', req.method(), req.url());
    }
  });

  page.on('response', async resp => {
    if (resp.url().includes('otp') || resp.url().includes('login') || resp.url().includes('auth')) {
      console.log('RESP:', resp.status(), resp.url());
      try {
        const text = await resp.text();
        console.log('RESP BODY:', text.slice(0, 300));
      } catch {}
    }
  });

  try {
    console.log('Navigating to MobiKwik...');
    await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Look for Login
    const loginBtn = page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first();
    if (await loginBtn.isVisible()) {
      console.log('Clicking login button...');
      await loginBtn.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('No visible login button on navbar, checking page content...');
    }

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, 'mobikwik_home_or_modal.png') });

    // Look for phone input
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="Mobile"], input[placeholder*="Phone"], input[name*="mobile"], input[id*="mobile"]').first();
    if (await phoneInput.isVisible()) {
      console.log('Filling phone number 7489674391...');
      await phoneInput.fill('7489674391');
      await page.waitForTimeout(1000);

      const getOtpBtn = page.locator('button:has-text("OTP"), button:has-text("Continue"), button:has-text("Send"), button[type="submit"]').first();
      if (await getOtpBtn.isVisible()) {
        console.log('Clicking Send OTP button...');
        await getOtpBtn.click();
        await page.waitForTimeout(4000);
        console.log('✓ Clicked Send OTP!');
        await page.screenshot({ path: path.join(screenshotDir, 'mobikwik_otp_sent.png') });
      }
    } else {
      console.log('Phone input not visible directly. Let us check what inputs exist:');
      const allInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, button, a')).map(el => ({
          tag: el.tagName,
          text: el.innerText ? el.innerText.trim().slice(0, 50) : '',
          placeholder: el.getAttribute('placeholder') || '',
          href: el.getAttribute('href') || ''
        })).filter(x => x.text || x.placeholder || x.href.includes('login'));
      });
      console.log('Interactive elements:', JSON.stringify(allInputs.slice(0, 20), null, 2));
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testMobikwik();
