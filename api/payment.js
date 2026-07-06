// api/payment.js
export default async function handler(req, res) {
    // Allow all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, amount, currency, provider } = req.body;

        // Your ContiPay credentials
        const payload = {
            customer: {
                surname: 'Test',
                firstName: 'User',
                email: 'test@gatekeeperai.co.zw',
                cell: phone || '0771111111',
                countryCode: 'ZW'
            },
            transaction: {
                providerCode: provider || 'EC',
                providerName: 'EcoCash',
                currencyCode: currency || 'USD',
                merchantId: 952,
                reference: 'TEST-' + Date.now(),
                description: 'Gatekeeper AI Subscription',
                amount: parseFloat(amount || '1.00'),
                webhookUrl: 'https://gatekeeperai.co.zw/api/webhook',
                successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
                cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
            },
            accountDetails: {
                accountNumber: phone || '0771111111',
                accountName: 'Test User'
            }
        };

        const auth = Buffer.from('VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09:764cc5e8-3d34-45ea-b9f0-66df7fff19fe').toString('base64');

        const response = await fetch('https://api-uat.contipay.net/acquire/payment', {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return res.status(response.status).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
              }
