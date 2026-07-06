// api/contipay.js
// Gatekeeper AI - ContiPay Integration
// Merchant ID: 952

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow PUT or POST
    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ 
            status: 'error', 
            message: 'Method not allowed' 
        });
    }

    try {
        const input = req.body;

        // ✅ CONFIRMED CORRECT CREDENTIALS
        const merchantId = '952';
        const apiKey = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09';
        const apiSecret = '764cc5e8-3d34-45ea-b9f0-66df7fff19fe';

        // Get parameters from input
        const phone = input.phone || '0771111111';
        const amount = input.amount || '1.00';
        const reference = input.reference || 'TEST-' + Date.now();
        const provider = input.provider || 'EC';
        const currency = input.currency || 'USD';

        // Provider mapping with correct codes
        const providerMap = {
            'EC': { code: 'EC', name: 'EcoCash' },
            'TC': { code: 'TC', name: 'TeleCash' },
            'OM': { code: 'OM', name: 'OneMoney' },
            'VA': { code: 'VA', name: 'Visa' },
            'MA': { code: 'MA', name: 'Mastercard' },
            'VE': { code: 'VE', name: 'Verve' },
            'AG': { code: 'AG', name: 'AfriGo' },
            'ZS': { code: 'ZS', name: 'ZimSwitch' },
            'IB': { code: 'IB', name: 'InnBucks' },
            'OC': { code: 'OC', name: 'Omari' },
            'VC': { code: 'VC', name: 'Voucher' }
        };

        const providerInfo = providerMap[provider] || providerMap['EC'];

        // ✅ CORRECT PAYLOAD STRUCTURE from ContiPay documentation
        const payload = {
            customer: {
                surname: 'Test',
                firstName: 'User',
                email: 'test@gatekeeperai.co.zw',
                cell: phone,
                countryCode: 'ZW'
            },
            transaction: {
                providerCode: providerInfo.code,
                providerName: providerInfo.name,
                currencyCode: currency,
                merchantId: parseInt(merchantId),
                reference: reference,
                description: 'Gatekeeper AI Subscription',
                amount: parseFloat(amount),
                webhookUrl: 'https://gatekeeperai.co.zw/api/webhook',
                successUrl: 'https://gatekeeperai.co.zw/payment_success.html',
                cancelUrl: 'https://gatekeeperai.co.zw/payment_cancel.html'
            },
            accountDetails: {
                accountNumber: phone,
                accountName: 'Test User'
            }
        };

        // Create Basic Auth
        const authString = apiKey + ':' + apiSecret;
        const authBase64 = Buffer.from(authString).toString('base64');

        // ✅ CORRECT ENDPOINT from ContiPay documentation
        const contipayUrl = 'https://api-uat.contipay.net/acquire/payment';

        console.log('🔵 Gatekeeper AI - ContiPay Request:');
        console.log('URL:', contipayUrl);
        console.log('Method: PUT');
        console.log('Merchant ID:', merchantId);
        console.log('Provider:', providerInfo.name);
        console.log('Amount:', amount, currency);
        console.log('Reference:', reference);

        // Make request to ContiPay
        const response = await fetch(contipayUrl, {
            method: 'PUT',
            headers: {
                'Authorization': 'Basic ' + authBase64,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('📦 ContiPay Response:');
        console.log('Status:', response.status);
        console.log('Data:', data);

        // Return the response
        return res.status(response.status).json({
            status: data.status || 'unknown',
            message: data.message || 'Payment processed',
            data: data,
            raw: data
        });

    } catch (error) {
        console.error('❌ Error in contipay.js:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
                }
