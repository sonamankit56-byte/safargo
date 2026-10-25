export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { opId, cirId } = req.query || {};
  const query = `opId=${encodeURIComponent(opId || '')}&cirId=${encodeURIComponent(cirId || '')}`;

  try {
    const response = await fetch(`https://api.paybeez.in/v1/recharge/prepaid/plans?${query}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SafarGo/1.0'
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
}
