// api/paynow-direct.js
// Gatekeeper AI - Paynow Direct API (Combined with Webhook)

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ✅ Webhook Handler (GET for verification, POST for notifications)
    if (req.method === 'GET' && req.query.webhook === 'verify') {
        return res.status(200).json({
            status: 'success',
            message: 'Webhook endpoint active'
        });
    }

    if (req.method === 'POST' && req.query.webhook === 'notify') {
        try {
            const data = req.body;
            console.log('📥 Paynow Webhook Received:', data);

            if (data.status === 'paid' || data.status === 'success' || data.paymentStatus === 'paid') {
                console.log('✅ Payment confirmed:', data.reference);
                return res.status(200).json({
                    status: 'success',
                    message: 'Payment confirmed'
                });
            }

            return res.status(200).json({
                status: 'received',
                message: 'Webhook received'
            });
        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // ✅ Only allow POST for payment initiation
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, amount, method, reference } = req.body;

        // ✅ YOUR PAYNOW API KEYS
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

        console.log('📤 Sending to Paynow API:', payload);

        // ✅ Send to Paynow
        const response = await fetch('https://api.paynow.co.zw/transaction/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('📥 Paynow Response:', data);

        // ✅ Check if successful
        if (data.success || data.status === 'success' || data.status === 'ok') {
            return res.status(200).json({
                status: 'success',
                message: 'Payment initiated',
                reference: payload.reference,
                data: data
            });
        }

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
                    }
