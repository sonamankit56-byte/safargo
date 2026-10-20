async function testLocalCheckout() {
  const phone = '7489674391';

  // 1. Quote
  const quoteRes = await fetch('http://localhost:5174/api/recharge/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intentKind: 'recharge',
      category: 'mobile_prepaid',
      amountPaise: '29900',
      utmSource: null,
      mobile: phone,
      surface: 'quick'
    })
  });
  const quoteJson = await quoteRes.json();
  console.log('Quote status:', quoteRes.status, quoteJson.data?.feeLabel);

  // 2. Checkout
  const checkoutRes = await fetch('http://localhost:5174/api/recharge/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: phone,
      amountRupees: 299,
      opId: '338',
      cirId: '14',
      planCode: 'Vi-MP-Chattisgarh-local-plans-Rs-299.0',
      planName: 'Voice + 4G Data',
      company: 'Vodafone Idea',
      utmSource: null,
      surface: 'quick',
      redeem: false,
      idempotencyKey: `safargo-${phone}-299-${Date.now()}`
    })
  });
  const checkoutJson = await checkoutRes.json();
  console.log('Checkout status:', checkoutRes.status, 'Success:', checkoutJson.success);
  console.log('Checkout URL created:', checkoutJson.data?.checkoutUrl?.slice(0, 80));
}

testLocalCheckout();
