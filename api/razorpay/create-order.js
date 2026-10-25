// Vercel Serverless Function: Create Razorpay Order
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Ts22ERsXSrUTOG';
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'h4r597kKdRcIfMUbtz6ttjO8';

  try {
    const { amount, receipt, notes } = req.body || {};
    const amountPaise = Math.round((Number(amount) || 100) * 100);

    const authHeader = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
        payment_capture: 1,
        notes: notes || {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error?.description || 'Failed to create order on Razorpay'
      });
    }

    return res.status(200).json({
      success: true,
      order: data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error'
    });
  }
}
