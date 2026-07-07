// api/pesepay.js
// Gatekeeper AI - Pesepay Integration (Updated)

export default async function handler(req, res) {
    // CORS
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
        const { amount, phone, provider, currency, reference } = req.body;

        // Your Pesepay credentials
        const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';
        const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

        // ✅ TRY THESE DIFFERENT PESEPAY ENDPOINTS
        // The 404 means we're using the wrong URL
        
        // Option 1: Most common Pesepay endpoint
        const pesepayUrl = 'https://www.pesepay.com/api/v1/transaction/initiate';
        
        // Option 2: Alternative endpoint
        // const pesepayUrl = 'https://api.pesepay.com/v1/transaction/initiate';
        
        // Option 3: Another alternative
        // const pesepayUrl = 'https://www.pesepay.com/api/initiate';

        // Build payload for Pesepay
        const payload = {
            integrationKey: integrationKey,
            encryptionKey: encryptionKey,
            amount: parseFloat(amount || '1.00'),
            currency: currency || 'USD',
            phone: phone || '0771111111',
            provider: provider || 'ECOCASH',
            reference: reference || 'GATEKEEPER-' + Date.now(),
            description: 'Gatekeeper AI Subscription',
            callbackUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
        };

        console.log('Sending to Pesepay:', {
            url: pesepayUrl,
            payload: payload
        });

        // Make request to Pesepay
        const response = await fetch(pesepayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('Pesepay Response:', {
            status: response.status,
            data: data
        });

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
}
