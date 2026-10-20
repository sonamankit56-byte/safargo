async function test859Checkout() {
  const phone = '7489674391';
  const amount = 859;
  const planCode = 'Vi-MP-Chattisgarh-local-plans-Rs-859.0';
  const opId = '338';
  const cirId = '14';

  // 1. Quote
  const quoteRes = await fetch('https://api.paybeez.in/v1/payments/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intentKind: 'recharge',
      category: 'mobile_prepaid',
      amountPaise: `${amount * 100}`,
      utmSource: null,
      mobile: phone,
      surface: 'quick'
    })
  });
  const quoteJson = await quoteRes.json();
  console.log('Quote:', quoteJson.data.feeLabel, 'Total Paise:', quoteJson.data.totalPaise);

  // 2. Checkout
  const checkoutRes = await fetch('https://api.paybeez.in/v1/public/recharge/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: phone,
      amountRupees: amount,
      opId: opId,
      cirId: cirId,
      planCode: planCode,
      planName: 'Voice + 4G Data',
      company: 'Vodafone Idea',
      utmSource: null,
      surface: 'quick',
      redeem: false,
      idempotencyKey: `safargo-${phone}-${amount}-${Date.now()}`
    })
  });
  const checkoutJson = await checkoutRes.json();
  console.log('Checkout Success:', checkoutJson.success);
  console.log('Checkout Data:', checkoutJson.data);
}

test859Checkout();
