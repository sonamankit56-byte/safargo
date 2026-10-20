async function testServerProxy() {
  const phone = '7489674391';

  // 1. Fetch plans
  const res = await fetch('https://api.paybeez.in/v1/recharge/prepaid/plans-auto', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SafarGo-App/1.0'
    },
    body: JSON.stringify({ mobile: phone })
  });

  const json = await res.json();
  console.log('Success:', json.success);
  console.log('Detected:', json.data.detected);
  console.log('Plan groups count:', json.data.plans.groups.length);
  json.data.plans.groups.forEach(g => {
    console.log(`- ${g.label}: ${g.plans ? g.plans.length : 0} plans`);
  });
}

testServerProxy();
