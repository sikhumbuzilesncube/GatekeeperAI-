const crypto = require('crypto');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, phone, reference } = req.body;
    
    // These come from Vercel Environment Variables
    const apiKey = process.env.CONTIPAY_API_KEY;
    const apiSecret = process.env.CONTIPAY_API_SECRET;
    const merchantId = process.env.CONTIPAY_MERCHANT_ID;
    
    if (!apiKey || !apiSecret || !merchantId) {
      return res.status(500).json({ error: 'Server env vars missing' });
    }

    const payload = {
      merchant_id: merchantId,
      amount: String(amount),
      currency: "USD",
      phone: phone,
      provider: "ecocash",
      reference: reference,
      api_key: apiKey
    };

    // ContiPay hash - check their docs for exact format
    const signString = `${merchantId}${payload.amount}${phone}${apiSecret}`;
    payload.signature = crypto.createHash('sha256').update(signString).digest('hex');

    // Call ContiPay live endpoint - test via phone 0771111111
    const contipayRes = await fetch('https://api.contipay.co.zw/v1/payment/mobile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await contipayRes.json();
    return res.status(contipayRes.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
