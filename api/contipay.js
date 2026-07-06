// api/contipay.js
// Gatekeeper AI - ContiPay Integration (Node.js Version)

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST or PUT
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ 
            status: 'error', 
            message: 'Method not allowed. Use POST or PUT.' 
        });
    }

    try {
        const input = req.body;

        // ContiPay credentials
        const apiKey = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09';
        const apiSecret = '764cc5e8-3d34-45ea-b9f0-66df7fff19fe';

        // Get parameters
        const phone = input.phone || '0771111111';
        const amount = parseFloat(input.amount || '1.00');
        const reference = input.reference || 'TEST-' + Date.now();
        const provider = input.provider || 'EC';
        const currency = input.currency || 'USD';

        // Provider mapping
        const providerMap = {
            'EC': { code: 'EC', name: 'EcoCash' },
            'TC': { code: 'TC', name: 'TeleCash' },
            'OM': { code: 'OM', name: 'OneMoney' },
            'IB': { code: 'IB', name: 'InnBucks' },
            'ZS': { code: 'ZS', name: 'ZimSwitch' },
            'AG': { code: 'AG', name: 'AfriGo' },
            'OC': { code: 'OC', name: 'Omari' },
            'VC': { code: 'VC', name: 'Voucher' },
            'VA': { code: 'VA', name: 'Visa' },
            'MA': { code: 'MA', name: 'Mastercard' },
            'VE': { code: 'VE', name: 'Verve' }
        };

        const providerInfo = providerMap[provider] || providerMap['EC'];

        // Build payload
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
                merchantId: 952,
                reference: reference,
                description: 'Gatekeeper AI Subscription',
                amount: amount,
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

        // ContiPay URL
        const contipayUrl = 'https://api-uat.contipay.net/acquire/payment';

        console.log('Sending to ContiPay:', JSON.stringify(payload, null, 2));

        // Make request
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

        console.log('ContiPay Response:', data);

        // Return response
        return res.status(response.status).json({
            status: response.status,
            data: data
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
            }
