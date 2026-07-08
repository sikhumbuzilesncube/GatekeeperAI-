// api/contipay.js
// Gatekeeper AI - ContiPay Integration (UPDATED)

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, phone, provider, currency, reference } = req.body;

        // ContiPay credentials
        const merchantId = '952';
        const apiKey = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09';
        const apiSecret = '764cc5e8-3d34-45ea-b9f0-66df7fff19fe';

        // Provider mapping
        const providerMap = {
            'ECOCASH': { code: 'EC', name: 'EcoCash' },
            'TELECASH': { code: 'TC', name: 'TeleCash' },
            'ONEMONEY': { code: 'OM', name: 'OneMoney' },
            'INNBUCKS': { code: 'IB', name: 'InnBucks' },
            'ZIMSWITCH': { code: 'ZS', name: 'ZimSwitch' },
            'AFRIGO': { code: 'AG', name: 'AfriGo' },
            'OMARI': { code: 'OC', name: 'Omari' },
            'VOUCHER': { code: 'VC', name: 'Voucher' }
        };

        const providerInfo = providerMap[provider] || providerMap['ECOCASH'];

        // ✅ PAYLOAD WITH currencyCode in the RIGHT PLACE
        const payload = {
            customer: {
                surname: 'Test',
                firstName: 'User',
                email: 'test@gatekeeperai.co.zw',
                cell: phone || '0771111111',
                countryCode: 'ZW'
            },
            transaction: {
                providerCode: providerInfo.code,
                providerName: providerInfo.name,
                currencyCode: currency || 'USD',  // ✅ This is where it should be
                merchantId: parseInt(merchantId),
                reference: reference || 'CONTIPAY-' + Date.now(),
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

        console.log('📤 Sending to ContiPay:', JSON.stringify(payload, null, 2));

        // Basic Auth
        const authString = apiKey + ':' + apiSecret;
        const authBase64 = Buffer.from(authString).toString('base64');

        // Using the initiate endpoint
        const contipayUrl = 'https://api-uat.contipay.net/acquire/payment/initiate';

        const response = await fetch(contipayUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + authBase64,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('📥 ContiPay Response:', {
            status: response.status,
            data: data
        });

        // ✅ Check for success or redirect URL
        if (data.status === 'success' || data.statusCode === 200 || data.redirectUrl || data.data?.redirectUrl) {
            return res.status(response.status).json({
                status: 'success',
                message: 'Payment initiated',
                redirectUrl: data.redirectUrl || data.data?.redirectUrl || null,
                reference: reference,
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
