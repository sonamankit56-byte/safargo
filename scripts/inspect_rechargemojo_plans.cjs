const { chromium } = require('playwright');

async function testPlans() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  page.on('response', async resp => {
    if (resp.url().includes('mnp_detect') || resp.url().includes('plans') || resp.url().includes('plan')) {
      console.log('API RESP:', resp.status(), resp.url());
      try {
        const body = await resp.text();
        console.log('Body:', body.slice(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://rechargemojo.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check form inputs
  const formHtml = await page.evaluate(() => {
    const form = document.querySelector('form') || document.querySelector('.recharge-form') || document.querySelector('.card') || document.body;
    const inputs = Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tagName: el.tagName,
      id: el.id,
      name: el.name,
      className: el.className,
      placeholder: el.placeholder,
      value: el.value,
      type: el.type,
      text: el.innerText
    }));
    return inputs;
  });

  console.log('All inputs/selects/buttons:');
  console.log(JSON.stringify(formHtml, null, 2));

  // Enter mobile number
  const phoneInput = page.locator('input[placeholder*="Mobile Number"]').first();
  await phoneInput.fill('7489674391');
  await page.waitForTimeout(3000);

  // Check state after MNP
  const operatorVal = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select, input')).map(s => ({
      id: s.id,
      name: s.name,
      value: s.value,
      placeholder: s.placeholder
    }));
    return selects;
  });
  console.log('Inputs after entering phone:', JSON.stringify(operatorVal, null, 2));

  await browser.close();
}

testPlans();
