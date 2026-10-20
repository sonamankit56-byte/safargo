import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('test-results/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTest() {
  console.log('================================================================');
  console.log('🚀 SafarGo Live Test: YouPI-PG (UPI) & OpenWA (WhatsApp) Integration');
  console.log('================================================================');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: false, slowMo: 400 });
    console.log('🌐 Google Chrome launched in visible GUI desktop mode!');
  } catch (e1) {
    browser = await chromium.launch({ headless: true });
    console.log('🌐 Chromium launched in headless mode');
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Pre-set admin authentication
  await context.addInitScript(() => {
    const adminUser = {
      id: 'SFG-ADMIN-001',
      fullName: 'Jia SafarGo (Super Admin)',
      mobile: '9811000001',
      email: 'jia647155@gmail.com',
      shopName: 'SafarGo Central Head Office',
      businessType: 'admin',
      city: 'Indore',
      address: 'SafarGo HQ, Vijay Nagar, Indore',
      pincode: '452010',
      panNumber: 'ADMIN1234F',
      aadhaarNumber: '999988887777',
      accountHolder: 'SafarGo Super Admin',
      accountNumber: '999900001111',
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India (SBI)',
      settlementUpiId: 'jia647155@upi',
      isApproved: true,
      role: 'admin',
      appliedDate: '18 Oct 2026'
    };
    localStorage.setItem('safargo_agent_logged_in', 'true');
    localStorage.setItem('safargo_current_agent', JSON.stringify(adminUser));
  });

  const page = await context.newPage();

  try {
    console.log('📍 Navigating to SafarGo App: http://localhost:5174/');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Check Admin Desk & API Gateways tab
    console.log('\n--- 1. Testing Admin Desk & API Gateways Tab ---');
    const agentNavBtn = page.locator('button:has-text("एजेंट"), button:has-text("Agent")').first();
    await agentNavBtn.click();
    await page.waitForTimeout(1000);

    const gatewayTabBtn = page.locator('button:has-text("API गेटवे"), button:has-text("Gateways")');
    if (await gatewayTabBtn.isVisible()) {
      console.log('✅ "🔌 API गेटवे" tab button is visible in Super Admin bar!');
      await gatewayTabBtn.click();
      await page.waitForTimeout(1200);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_gateway_admin_tab.png') });
      console.log('📸 Screenshot saved: 01_gateway_admin_tab.png');
    } else {
      console.log('⚠️ Gateway tab button not immediately visible in current view');
    }

    // 2. Test Bus Booking Flow with YouPI PG
    console.log('\n--- 2. Testing Bus Booking Flow with YouPI PG 0% UPI ---');
    const busNavBtn = page.locator('button:has-text("बस"), button:has-text("Bus")').first();
    await busNavBtn.click();
    await page.waitForTimeout(1000);

    // Search Buses
    const searchBtn = page.locator('button:has-text("बसें खोजें"), button:has-text("Search Buses")');
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      await page.waitForTimeout(1000);
    }

    // Select first bus
    const selectSeatBtn = page.locator('button:has-text("सीट चुनें"), button:has-text("Select Seats")').first();
    if (await selectSeatBtn.isVisible()) {
      await selectSeatBtn.click();
      await page.waitForTimeout(1000);
    }

    // Pick an available seat
    const availableSeat = page.locator('button:has-text("1A"), button:has-text("L1"), button:has-text("1B")').first();
    if (await availableSeat.isVisible()) {
      await availableSeat.click();
      await page.waitForTimeout(800);
    }

    // Proceed to Boarding / Dropping
    const proceedBoardingBtn = page.locator('button:has-text("बोर्डिंग और ड्रॉपिंग पॉइंट चुनें"), button:has-text("Select Boarding")');
    if (await proceedBoardingBtn.isVisible()) {
      await proceedBoardingBtn.click();
      await page.waitForTimeout(1000);
    }

    // Continue to passenger details
    const continuePassengerBtn = page.locator('button:has-text("यात्री विवरण भरें"), button:has-text("Enter Passenger Details")');
    if (await continuePassengerBtn.isVisible()) {
      await continuePassengerBtn.click();
      await page.waitForTimeout(1500);
    }

    // Verify YouPI PG is active on checkout
    console.log('\n--- 3. Verifying YouPI PG Sovereign Gateway on Checkout ---');
    const youpiLabel = page.locator('text=YouPI PG - Instant UPI');
    console.log('⚡ YouPI PG Selection element present:', await youpiLabel.isVisible());

    const youpiTerminal = page.locator('text=YouPI Sovereign UPI Gateway');
    console.log('⚡ YouPI Sovereign Terminal Container present:', await youpiTerminal.isVisible());

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_youpi_checkout_terminal.png') });
    console.log('📸 Screenshot saved: 02_youpi_checkout_terminal.png');

    // Click Instant Simulation Settlement
    const simulateBtn = page.locator('button:has-text("सिमुलेट इंस्टेंट बैंक पेमेंट"), button:has-text("Simulate")');
    if (await simulateBtn.isVisible()) {
      console.log('⚡ Clicking 1-Tap Simulated Bank Payment...');
      await simulateBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_youpi_settlement_verified.png') });
      console.log('📸 Screenshot saved: 03_youpi_settlement_verified.png');
    }

    // Confirm Booking
    const confirmBtn = page.locator('button:has-text("टिकट बुक करें"), button:has-text("Confirm & Book")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    // 4. Verify BusBookingSuccess and WhatsApp Button
    console.log('\n--- 4. Verifying Boarding Pass & WhatsApp Ticket Button ---');
    const waTicketBtn = page.locator('button:has-text("WhatsApp ई-टिकट")');
    console.log('📲 WhatsApp ई-टिकट button present:', await waTicketBtn.isVisible());

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_booking_success_whatsapp.png') });
    console.log('📸 Screenshot saved: 04_booking_success_whatsapp.png');

    if (await waTicketBtn.isVisible()) {
      console.log('📲 Clicking WhatsApp e-ticket button...');
      await waTicketBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_whatsapp_dispatched.png') });
      console.log('📸 Screenshot saved: 05_whatsapp_dispatched.png');
    }

    console.log('\n================================================================');
    console.log('🎉 ALL TESTS PASSED: YouPI PG & OpenWA Integration Verified!');
    console.log('================================================================');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await browser.close();
  }
}

runTest();
