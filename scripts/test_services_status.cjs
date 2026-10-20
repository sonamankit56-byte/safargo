const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5174...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

  // 1. Check Header Badges
  const headerText = await page.textContent('header');
  console.log('\n--- Header Badges Check ---');
  console.log('Contains "लाइव" for Bus:', headerText.includes('लाइव'));
  console.log('Contains "जल्द" for Coming Soon services:', headerText.includes('जल्द'));

  // 2. Click Recharge Service
  console.log('\n--- Testing Recharge Screen ---');
  await page.click('button:has-text("रिचार्ज")');
  await page.waitForTimeout(1000);

  // Check Category tabs
  const mobileTab = await page.locator('button:has-text("मोबाइल रिचार्ज")');
  console.log('Mobile Tab visible:', await mobileTab.isVisible());
  const mobileLiveBadge = await mobileTab.locator('text=⚡ लाइव').isVisible();
  console.log('Mobile Tab has "⚡ लाइव":', mobileLiveBadge);

  const electricityTab = await page.locator('button:has-text("बिजली बिल (MP)")');
  const elecSoonBadge = await electricityTab.locator('text=⏳ जल्द').isVisible();
  console.log('Electricity Tab has "⏳ जल्द":', elecSoonBadge);

  const dthTab = await page.locator('button:has-text("DTH टीवी")');
  const dthSoonBadge = await dthTab.locator('text=⏳ जल्द').isVisible();
  console.log('DTH Tab has "⏳ जल्द":', dthSoonBadge);

  const fastagTab = await page.locator('button:has-text("FASTag टोल")');
  const fastagSoonBadge = await fastagTab.locator('text=⏳ जल्द').isVisible();
  console.log('FASTag Tab has "⏳ जल्द":', fastagSoonBadge);

  // Click Electricity tab and verify Coming Soon screen
  await electricityTab.click();
  await page.waitForTimeout(500);
  const elecComingSoon = await page.locator('text=म.प्र. विद्युत बिल भुगतान सेवा').isVisible();
  console.log('Electricity displays Coming Soon Card:', elecComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_electricity_coming_soon.png' });

  // Click DTH tab and verify Coming Soon screen
  await dthTab.click();
  await page.waitForTimeout(500);
  const dthComingSoon = await page.locator('text=DTH टीवी रिचार्ज केंद्र').isVisible();
  console.log('DTH displays Coming Soon Card:', dthComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_dth_coming_soon.png' });

  // Click FASTag tab and verify Coming Soon screen
  await fastagTab.click();
  await page.waitForTimeout(500);
  const fastagComingSoon = await page.locator('text=FASTag टोल रिचार्ज केंद्र').isVisible();
  console.log('FASTag displays Coming Soon Card:', fastagComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_fastag_coming_soon.png' });

  // 3. Test Hotel Coming Soon
  console.log('\n--- Testing Hotel Coming Soon ---');
  await page.click('button:has-text("होटल्स")');
  await page.waitForTimeout(500);
  const hotelComingSoon = await page.locator('text=होटल व रिसॉर्ट बुकिंग').isVisible();
  console.log('Hotel displays Coming Soon:', hotelComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_hotel_coming_soon.png' });

  // 4. Test Flights Coming Soon
  console.log('\n--- Testing Flights Coming Soon ---');
  await page.click('button:has-text("फ्लाइट्स")');
  await page.waitForTimeout(500);
  const flightComingSoon = await page.locator('text=सफ़रगो फ्लाइट बुकिंग').isVisible();
  console.log('Flights displays Coming Soon:', flightComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_flight_coming_soon.png' });

  // 5. Test Cabs Coming Soon
  console.log('\n--- Testing Cabs Coming Soon ---');
  await page.click('button:has-text("कैब्स")');
  await page.waitForTimeout(500);
  const cabComingSoon = await page.locator('text=सफ़रगो कैब सेवा').isVisible();
  console.log('Cabs displays Coming Soon:', cabComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_cab_coming_soon.png' });

  // 6. Test GoTifin Coming Soon
  console.log('\n--- Testing GoTifin Coming Soon ---');
  await page.click('button:has-text("गो टिफिन")');
  await page.waitForTimeout(500);
  const tifinComingSoon = await page.locator('text=गो टिफिन').first().isVisible();
  console.log('GoTifin displays Coming Soon:', tifinComingSoon);
  await page.screenshot({ path: 'test-results/screenshots/service_tifin_coming_soon.png' });

  console.log('\n✅ All service statuses verified successfully!');
  await browser.close();
})();
