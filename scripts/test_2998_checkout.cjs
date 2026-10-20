async function test2998Payload() {
  const payload = {
    mobile: "7489674391",
    amountRupees: 2998,
    opId: "338",
    cirId: "14",
    planCode: "Vi-MP-Chattisgarh-rate-cutter-Rs-2998.0",
    planName: "Voice + 4G Data",
    company: "Vodafone Idea",
    utmSource: null,
    surface: "quick",
    redeem: false,
    idempotencyKey: `qr-7489674391-2998-${Date.now()}`
  };

  const res = await fetch("https://api.paybeez.in/v1/public/recharge/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Response:", JSON.stringify(json, null, 2));
}

test2998Payload();
