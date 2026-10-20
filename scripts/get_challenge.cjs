const { chromium } = require('playwright');

async function getChallengeHtml() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  page.on('response', async resp => {
    try {
      const text = await resp.text();
      console.log('--- Response from', resp.url(), '---');
      console.log(text.slice(0, 1000));
    } catch {}
  });

  await page.goto('https://rechargeapp.online/', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await browser.close();
}

getChallengeHtml();
