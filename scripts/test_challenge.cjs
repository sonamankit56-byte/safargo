const { chromium } = require('playwright');

async function testChallenge() {
  console.log('Testing Hostinger JS challenge on https://rechargeapp.online/...');
  const browser = await chromium.launch({ 
    channel: 'chrome', 
    headless: false 
  });
  
  const page = await browser.newPage();

  page.on('response', resp => {
    if (resp.url().includes('validate')) {
      console.log('Validate status:', resp.status());
    }
  });

  await page.goto('https://rechargeapp.online/', { timeout: 30000 });
  
  // Wait 10 seconds for the challenge-validate and reload
  console.log('Waiting 10 seconds...');
  await page.waitForTimeout(10000);

  console.log('Final URL:', page.url());
  console.log('Final Title:', await page.title());
  
  const content = await page.content();
  console.log('Content length:', content.length);
  console.log('Snippet:', content.slice(0, 1000));

  await browser.close();
}

testChallenge();
