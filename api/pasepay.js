// api/payonify.js
// Gatekeeper AI - Payonify Integration
// Uses Vercel Environment Variables for security

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

        // ✅ Read keys from environment variables (SECURE)
        const publishableKey = process.env.PAYONIFY_PUBLISHABLE_KEY;
        const secretKey = process.env.PAYONIFY_SECRET_KEY;
        const projectId = process.env.PAYONIFY_PROJECT_ID;

        // Check if keys are configured
        if (!secretKey || !projectId) {
            console.error('Missing Payonify environment variables');
            return res.status(500).json({
                status: 'error',
                message: 'Payment gateway not configured. Please set environment variables.'
            });
        }

        // Payonify API endpoint (confirm with Payonify)
        const payonifyUrl = 'https://api.payonify.co.zw/v1/payments/initiate';

        // Build payload
        const payload = {
            projectId: projectId,
            amount: parseFloat(amount || '1.00'),
            currency: currency || 'USD',
            phone: phone || '0771111111',
            provider: provider || 'ECOCASH',
            reference: reference || 'GK-' + Date.now(),
            description: 'Gatekeeper AI Subscription',
            customerEmail: email || 'customer@gatekeeperai.co.zw',
            callbackUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
        };

        console.log('Sending to Payonify:', {
            url: payonifyUrl,
            projectId: projectId,
            payload: payload
        });

        // Make request to Payonify
        const response = await fetch(payonifyUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + secretKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('Payonify Response:', {
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
