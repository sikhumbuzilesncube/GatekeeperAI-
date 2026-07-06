export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { amount, phone, reference } = req.body;
    const { CONTIPAY_API_KEY, CONTIPAY_API_SECRET, CONTIPAY_MERCHANT_ID } = process.env;
    
    if (!CONTIPAY_API_KEY) {
      return res.status(500).json({ error: 'CONTIPAY_API_KEY env var missing' });
    }

    const crypto = await import('crypto');
    const payload = {
      merchant_id: CONTIPAY_MERCHANT_ID,
      amount: String(amount),
      currency: "USD",
      phone: phone,
      provider: "ecocash", 
      reference: reference,
      api_key: CONTIPAY_API_KEY
    };

    const signString = `${CONTIPAY_MERCHANT_ID}${payload.amount}${phone}${CONTIPAY_API_SECRET}`;
    payload.signature = crypto.createHash('sha256').update(signString).digest('hex');

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
