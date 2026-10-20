const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function inspectWebsite() {
  console.log('Inspecting https://rechargeapp.online/...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();

  // Listen for console and network
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', resp => {
    if (resp.status() >= 300) {
      console.log('HTTP RESP:', resp.status(), resp.url());
    }
  });

  try {
    await page.goto('https://rechargeapp.online/', { waitUntil: 'load', timeout: 45000 });
    
    // Wait for challenge redirect
    console.log('Waiting for challenge redirect...');
    for (let i = 1; i <= 6; i++) {
      await page.waitForTimeout(3000);
      console.log(`Step ${i}: URL is: ${page.url()} | Title: ${await page.title()}`);
      if (!page.url().includes('rechargeapp.online') || (await page.title()) !== 'Checking your browser before accessing. Just a moment...') {
        break;
      }
    }

    const screenshotDir = path.join(__dirname, '..', 'test-results', 'screenshots');
    const screenshotPath = path.join(screenshotDir, 'rechargeapp_step2.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved to:', screenshotPath);

    const html = await page.content();
    console.log('HTML length:', html.length);
    console.log('HTML snippet:', html.slice(0, 1500));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

inspectWebsite();
