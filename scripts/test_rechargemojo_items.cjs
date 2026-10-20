const { chromium } = require('playwright');
const path = require('path');

async function testGuestFlow() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.url().includes('rechargemojo.com') && !resp.url().includes('.png') && !resp.url().includes('.svg')) {
      console.log('HTTP:', resp.status(), resp.url());
    }
  });

  await page.goto('https://rechargemojo.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Enter mobile number
  const phoneInput = page.locator('input[placeholder*="Mobile Number"]').first();
  await phoneInput.fill('7489674391');
  await page.waitForTimeout(1000);

  // Click Operator dropdown and pick Jio using page.evaluate or force
  await page.evaluate(() => {
    // find Jio element in DOM
    const all = Array.from(document.querySelectorAll('*'));
    const jioEl = all.find(el => el.textContent && el.textContent.trim() === 'Jio');
    if (jioEl) {
      jioEl.click();
      console.log('Clicked Jio via evaluate');
    }
  });
  await page.waitForTimeout(1000);

  // Check circle selection
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const mpEl = all.find(el => el.textContent && el.textContent.trim().includes('Madhya Pradesh'));
    if (mpEl) {
      mpEl.click();
      console.log('Clicked MP via evaluate');
    }
  });
  await page.waitForTimeout(1000);

  // Check form values
  const currentForm = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({ placeholder: i.placeholder, value: i.value }));
  });
  console.log('Current form state:', currentForm);

  // If operator not set, let's see how operator is selected:
  const operatorTrigger = page.locator('input[placeholder*="Select Operator"]').first();
  await operatorTrigger.click({ force: true });
  await page.waitForTimeout(1000);

  const listItems = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.InputGroup_operator_selection__VuMDc *'))
      .map(e => ({ tag: e.tagName, text: e.innerText, class: e.className }))
      .filter(e => e.text && e.text.length < 50);
  });
  console.log('Items in operator selection:', listItems.slice(0, 10));

  await browser.close();
}

testGuestFlow();
