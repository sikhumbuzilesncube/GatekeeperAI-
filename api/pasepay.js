// api/pesepay.js
// Gatekeeper AI - Pesepay Integration

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, phone, provider, currency, reference, email } = req.body;

        // ✅ PESEPAY SANDBOX CREDENTIALS
        const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';
        const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

        // ✅ CORRECT SANDBOX ENDPOINT
        const pesepayUrl = 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate';

        const payload = {
            integrationKey: integrationKey,
            encryptionKey: encryptionKey,
            amount: parseFloat(amount || '1.00'),
            currency: currency || 'USD',
            phone: phone || '0771111111',
            provider: provider || 'ECOCASH',
            reference: reference || 'GK-' + Date.now(),
            description: 'Gatekeeper AI Subscription',
            callbackUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
        };

        console.log('Sending to Pesepay:', {
            url: pesepayUrl,
            payload: payload
        });

        const response = await fetch(pesepayUrl, {
            method: 'POST',
            headers: {
                'authorization': integrationKey,
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
