// api/contipay-simple.js
// MINIMAL TEST VERSION

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Hardcoded test - exactly what Chrissy tested
        const payload = {
            customer: {
                surname: 'Test',
                firstName: 'User',
                email: 'test@gatekeeperai.co.zw',
                cell: '0771111111',
                countryCode: 'ZW'
            },
            transaction: {
                providerCode: 'EC',
                providerName: 'EcoCash',
                currencyCode: 'USD',
                merchantId: 952,
                reference: 'TEST-SIMPLE-' + Date.now(),
                description: 'Test Payment',
                amount: 1.00,
                webhookUrl: 'https://gatekeeperai.co.zw/api/webhook',
                successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
                cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
            },
            accountDetails: {
                accountNumber: '0771111111',
                accountName: 'Test User'
            }
        };

        const authString = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09:764cc5e8-3d34-45ea-b9f0-66df7fff19fe';
        const authBase64 = Buffer.from(authString).toString('base64');

        const response = await fetch('https://api-uat.contipay.net/acquire/payment', {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + authBase64,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return res.status(response.status).json({
            status: response.status,
            data: data
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
                  }
