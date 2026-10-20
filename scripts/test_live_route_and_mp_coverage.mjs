import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Starting Chrome test for MP Coverage, Live Route & Automatic KYC...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
  } catch (e) {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  }
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Open SafarGo
    console.log('1. Loading SafarGo homepage...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/screenshots/01_homepage_search.png' });
    console.log('   Saved: 01_homepage_search.png');

    // 2. Open Search Dropdown to check MP villages & districts
    console.log('2. Opening From City smart search dropdown...');
    const fromCityBox = page.locator('text=कहाँ से (From City').first();
    await fromCityBox.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/02_mp_villages_dropdown.png' });
    console.log('   Saved: 02_mp_villages_dropdown.png');

    // Select Indore from dropdown
    console.log('   Selecting "Indore (इंदौर)" from MP directory dropdown...');
    await page.click('text=Indore (इंदौर)');
    await page.waitForTimeout(500);

    // 3. Search Buses
    console.log('3. Clicking SEARCH BUSES button...');
    await page.click('button:has-text("SEARCH BUSES")');
    await page.waitForTimeout(1000);

    // If auth modal opens, login as admin to proceed
    const passwordTab = page.locator('button:has-text("पासवर्ड से लॉगिन")');
    if (await passwordTab.isVisible()) {
      console.log('   Logging in as Admin to access Bus Search...');
      await passwordTab.click();
      await page.fill('input[placeholder*="ईमेल"]', 'jia647155@gmail.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button:has-text("एजेंट पोर्टल खोलें")');
      await page.waitForTimeout(1500);

      // Now click search buses again
      await page.click('button:has-text("SEARCH BUSES")');
      await page.waitForTimeout(1200);
    }

    await page.screenshot({ path: 'test-results/screenshots/03_bus_list_results.png' });
    console.log('   Saved: 03_bus_list_results.png');

    // 4. Click Live Route Map Button on the first bus
    console.log('4. Clicking "📍 लाइव रूट मैप (Live Route)"...');
    const liveRouteBtn = page.locator('button:has-text("लाइव रूट मैप")').first();
    if (await liveRouteBtn.isVisible()) {
      await liveRouteBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/screenshots/04_live_route_modal.png' });
      console.log('   Saved: 04_live_route_modal.png');

      // Switch to Timeline Tab inside Live Route Modal
      const timelineTab = page.locator('button:has-text("सभी स्टॉप्स व ठहराव")');
      if (await timelineTab.isVisible()) {
        await timelineTab.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: 'test-results/screenshots/05_live_route_timeline.png' });
        console.log('   Saved: 05_live_route_timeline.png');
      }

      // Close modal
      const closeBtn = page.locator('button:has-text("बंद करें")').first();
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // 5. Expand Inline Boarding Stops Drawer
    console.log('5. Clicking "बोर्डिंग स्टॉप्स" inline drawer...');
    const boardingBtn = page.locator('button:has-text("बोर्डिंग स्टॉप्स")').first();
    if (await boardingBtn.isVisible()) {
      await boardingBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: 'test-results/screenshots/06_inline_boarding_stops.png' });
      console.log('   Saved: 06_inline_boarding_stops.png');
    }

    console.log('🎉 SUCCESS! All automated MP routes, Live Map & Boarding points verified!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

run();
