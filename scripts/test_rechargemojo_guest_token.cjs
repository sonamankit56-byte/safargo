const { chromium } = require('playwright');
const path = require('path');

async function checkGuestTokenAndPlans() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('rechargemojo.com') && (url.includes('auth') || url.includes('token') || url.includes('data') || url.includes('circle') || url.includes('plan') || url.includes('order'))) {
      console.log('API:', resp.status(), url);
      try {
        const json = await resp.json();
        console.log('JSON:', JSON.stringify(json).slice(0, 300));
      } catch(e) {}
    }
  });

  await page.goto('https://rechargemojo.com/mobile-recharge/jio-recharge-online', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Fill mobile
  const phone = page.locator('input[placeholder*="Mobile Number"]').first();
  await phone.fill('7489674391');
  await page.waitForTimeout(1000);

  // Click Circle input
  const circleInput = page.locator('input[placeholder*="Select Circle"]').first();
  await circleInput.click({ force: true });
  await page.waitForTimeout(1000);

  // Look for circle list in DOM
  const circles = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    return els
      .filter(e => e.innerText && (e.innerText.includes('Madhya Pradesh') || e.innerText.includes('Delhi') || e.innerText.includes('Mumbai')))
      .map(e => ({ tag: e.tagName, text: e.innerText.trim(), class: e.className }))
      .slice(0, 10);
  });
  console.log('Detected circle elements:', circles);

  // Click Madhya Pradesh
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('div, li, p, span'));
    const mp = els.find(e => e.textContent && e.textContent.trim() === 'Madhya Pradesh and Chhattisgarh' || e.textContent.trim().startsWith('Madhya Pradesh'));
    if (mp) mp.click();
  });
  await page.waitForTimeout(1000);

  // Fill amount
  const amountInput = page.locator('input[placeholder*="Enter Amount"]').first();
  await amountInput.fill('299');
  await page.waitForTimeout(1000);

  // Check form values now
  const formState = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({ placeholder: i.placeholder, value: i.value }));
  });
  console.log('Form State before Proceed:', formState);

  // Click proceed
  const proceedBtn = page.locator('button:has-text("Proceed")').first();
  await proceedBtn.click();
  await page.waitForTimeout(5000);

  console.log('Final URL after Proceed:', page.url());
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Page content after proceed:\n', text.slice(0, 600));

  await browser.close();
}

checkGuestTokenAndPlans();
