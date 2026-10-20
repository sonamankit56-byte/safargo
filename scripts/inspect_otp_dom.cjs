const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function inspectOtpModal() {
  const browser = await chromium.launch({ channel: 'chrome', headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://www.mobikwik.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  await page.locator('button:has-text("Login"), a:has-text("Login"), span:has-text("Login")').first().click();
  await page.waitForTimeout(1000);

  const phoneInput = page.locator('input[placeholder*="Mobile"], input[type="tel"]').first();
  await phoneInput.click();
  await phoneInput.pressSequentially('7489674391', { delay: 50 });
  await page.waitForTimeout(500);

  await page.locator('button:has-text("Get OTP")').first().click();
  await page.waitForTimeout(2500);

  // Inspect all inputs and their classes / attributes
  const inputsInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(inp => ({
      tagName: inp.tagName,
      type: inp.type,
      id: inp.id,
      className: inp.className,
      placeholder: inp.placeholder,
      name: inp.name,
      value: inp.value,
      visible: inp.offsetParent !== null
    }));
  });

  console.log('--- ALL INPUTS ON OTP MODAL ---');
  console.log(JSON.stringify(inputsInfo, null, 2));

  // Also inspect buttons
  const buttonsInfo = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(btn => ({
      text: btn.innerText.trim(),
      className: btn.className,
      disabled: btn.disabled,
      visible: btn.offsetParent !== null
    })).filter(b => b.visible);
  });
  console.log('--- ALL BUTTONS ON OTP MODAL ---');
  console.log(JSON.stringify(buttonsInfo, null, 2));

  await browser.close();
}

inspectOtpModal();
