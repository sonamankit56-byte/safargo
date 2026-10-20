async function checkApiJson() {
  const phone = '7489674391';
  console.log('Testing api.paybeez.in JSON responses directly...');

  // 1. Get plans
  const plansRes = await fetch('https://api.paybeez.in/v1/recharge/prepaid/plans-auto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile: phone })
  });
  const plansJson = await plansRes.json();
  console.log('Plans full response:', plansJson);

  const samplePlan = plansJson.data.plans.groups[0].plans[0];
  console.log('Sample plan chosen:', samplePlan.price, samplePlan.planCode);

  // 2. Get quote
  const quoteRes = await fetch('https://api.paybeez.in/v1/payments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number: phone,
      planCode: samplePlan.planCode,
      amount: samplePlan.price,
      operatorId: plansJson.data.detected.operatorId
    })
  });
  const quoteJson = await quoteRes.json();
  console.log('Quote response:', quoteJson);

  // 3. Checkout
  const checkoutRes = await fetch('https://api.paybeez.in/v1/public/recharge/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      number: phone,
      planCode: samplePlan.planCode,
      amount: samplePlan.price,
      operatorId: plansJson.data.detected.operatorId,
      quote: quoteJson.data
    })
  });
  const checkoutJson = await checkoutRes.json();
  console.log('Checkout response:', checkoutJson);
}

checkApiJson();
