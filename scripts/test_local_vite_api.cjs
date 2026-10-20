async function testViteEndpoint() {
  console.log('Testing http://localhost:5174/api/recharge/plans-auto ...');
  try {
    const res = await fetch('http://localhost:5174/api/recharge/plans-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: '7489674391' })
    });
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('Success:', json.success);
    console.log('Operator Detected:', json.data?.detected);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testViteEndpoint();
