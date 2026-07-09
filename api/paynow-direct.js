// api/paynow-direct.js
// Gatekeeper AI - Paynow Direct Integration

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { phone, amount, method, reference } = req.body;

        console.log('📥 Received request:', { phone, amount, method, reference });

        // ✅ YOUR PAYNOW CREDENTIALS
        const integrationId = '25439';
        const integrationKey = '6d2661a1-2d18-4b83-8ae5-37dd0860b461';

        // ✅ Build the payment request
        const payload = {
            id: integrationId,
            key: integrationKey,
            amount: parseFloat(amount || '1.00'),
            currency: 'USD',
            reference: reference || 'GK-' + Date.now(),
            customerPhone: phone || '0771111111',
            customerEmail: 'customer@gatekeeperai.co.zw',
            successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html',
            notificationUrl: 'https://gatekeeperai.co.zw/api/paynow-direct?webhook=notify',
            paymentMethod: method || 'ECOCASH'
        };

        console.log('📤 Sending to Paynow:', payload);

        // ✅ Send to Paynow API
        const response = await fetch('https://api.paynow.co.zw/transaction/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('📥 Paynow Response:', {
            status: response.status,
            data: data
        });

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error',
            stack: error.stack
        });
    }
                }
