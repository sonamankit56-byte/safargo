const { chromium } = require('playwright');

const dirs = [
  'admin',
  'login',
  'user',
  'agent',
  'retailer',
  'distributor',
  'member',
  'portal',
  'app',
  'api',
  'web',
  'dashboard',
  'recharge'
];

async function checkSubfolders() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // First hit home to get cookie
  console.log('Validating session...');
  await page.goto('https://rechargeapp.online/', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(6000);

  for (const d of dirs) {
    const url = `https://rechargeapp.online/${d}`;
    try {
      const resp = await page.goto(url, { timeout: 10000 });
      const title = await page.title();
      const content = await page.content();
      console.log(`[${d}] status: ${resp.status()} | len: ${content.length} | title: ${title}`);
      if (content.length > 100 && !title.includes('Checking your browser')) {
        console.log(`FOUND CONTENT at ${url}:`, content.slice(0, 300));
      }
    } catch (e) {
      console.log(`[${d}] error:`, e.message);
    }
  }

  await browser.close();
}

checkSubfolders();
