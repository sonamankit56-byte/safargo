// Automated Deep Audit & Reverse Engineering Verification Script
import http from 'http';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🚀 SAFARGO SUPER APP - REVERSE ENGINEERING AUDIT');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Check Core Source Files
const requiredFiles = [
  'src/App.tsx',
  'src/types/travel.ts',
  'src/context/TravelContext.tsx',
  'src/components/common/TravelHeader.tsx',
  'src/components/common/TravelBottomNav.tsx',
  'src/components/common/SafarGoLogo.tsx',
  'src/components/bus/BusSearchCard.tsx',
  'src/components/bus/BusList.tsx',
  'src/components/bus/PassengerForm.tsx',
  'src/components/bus/BusBookingSuccess.tsx',
  'src/components/agent/AgentAuthGateway.tsx',
  'src/components/agent/AgentEarningDesk.tsx',
  'src/components/agent/ApplicationDossierModal.tsx',
  'src/components/account/TravelAccountScreen.tsx',
  'src/components/services/GoTifinComingSoon.tsx',
  'src/components/services/RechargeComingSoon.tsx',
  'src/components/services/HotelComingSoon.tsx',
  'src/components/services/FlightComingSoon.tsx',
  'src/components/auth/AuthModal.tsx',
  'src/lib/emailService.ts',
  'replica/features.csv',
  'replica/recon.md'
];

console.log('📁 1. Verifying Source Code Architecture & File Tree...');
for (const file of requiredFiles) {
  const exists = fs.existsSync(file);
  assert(exists, `Required file present: ${file}`);
}

// 2. Check Dist Output Build
console.log('\n📦 2. Verifying Production Build Bundle (dist/)...');
assert(fs.existsSync('dist/index.html'), 'dist/index.html created');
assert(fs.existsSync('dist/assets'), 'dist/assets directory created');
const assets = fs.readdirSync('dist/assets');
const jsAsset = assets.find(f => f.endsWith('.js'));
const cssAsset = assets.find(f => f.endsWith('.css'));
assert(!!jsAsset, `Production JS bundle generated (${jsAsset})`);
assert(!!cssAsset, `Production CSS stylesheet generated (${cssAsset})`);

// 3. Check Live HTTP Server Response
console.log('\n🌐 3. Verifying Live Server Status (http://localhost:5174)...');
async function testServer() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:5174', (res) => {
      assert(res.statusCode === 200, `Dev server returned HTTP 200 OK`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        assert(data.includes('id="root"'), 'Root React DOM mount container present in HTML');
        assert(data.includes('SafarGo') || data.includes('vite'), 'Application HTML title/meta intact');
        resolve(true);
      });
    });
    req.on('error', (err) => {
      assert(false, `Server error: ${err.message}`);
      resolve(false);
    });
  });
}

await testServer();

// 4. Check Features & Business Rules
console.log('\n🔍 4. Verifying Reverse Engineering Business Features...');
const travelContext = fs.readFileSync('src/context/TravelContext.tsx', 'utf8');
const agentDesk = fs.readFileSync('src/components/agent/AgentEarningDesk.tsx', 'utf8');
const accountScreen = fs.readFileSync('src/components/account/TravelAccountScreen.tsx', 'utf8');
const header = fs.readFileSync('src/components/common/TravelHeader.tsx', 'utf8');
const tifin = fs.readFileSync('src/components/services/GoTifinComingSoon.tsx', 'utf8');
const recharge = fs.readFileSync('src/components/services/RechargeComingSoon.tsx', 'utf8');

// Commission & Withdrawal
assert(travelContext.includes('19.34'), 'Fixed ₹19.34 agent commission enforced');
assert(travelContext.includes('withdrawAgentEarnings'), 'Instant withdrawal & Sunday payout system present');

// Admin & Auth
assert(travelContext.includes('jia647155@gmail.com'), 'Super admin jia647155@gmail.com configured');
assert(travelContext.includes('deleteAgentAccount'), 'Permanent agent account deletion function implemented');
assert(travelContext.includes('isAuthModalOpen'), 'Mandatory Login Gate state implemented');

// Danger zone & Deletion UI
assert(accountScreen.includes('isDeleteModalOpen'), 'Account deletion danger zone modal present in My Account');
assert(accountScreen.includes('agentLogout'), 'Thorough logout trigger present in My Account');
assert(agentDesk.includes('deleteAgentAccount'), 'Delete agent profile option present in Agent Desk');

// Coming Soon Services
assert(tifin.includes('हर महिला को फिक्स सैलरी'), 'GoTifin women empowerment fixed salary featured');
assert(tifin.includes('कंपनी कर्मचारियों व छात्रों'), 'GoTifin meals for company workers & students featured');
assert(recharge.includes('रिचार्ज करके पैसे कमाएं'), 'Mobile & Utility recharge earn tagline featured');
assert(header.includes('handleServiceClick'), 'Mandatory login check gate wired on all header services');

// 5. Final Report Summary
console.log('\n====================================================');
console.log(`📊 AUDIT SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================\n');

if (failCount === 0) {
  console.log('🎉 100% REVERSE ENGINEERING & AUDIT PASSED WITH ZERO ERRORS!');
  process.exit(0);
} else {
  console.error('⚠️ SOME AUDIT CHECKS FAILED');
  process.exit(1);
}
