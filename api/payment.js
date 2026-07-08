// api/payment.js
// Gatekeeper AI - Pesepay Integration
// Trying multiple endpoints

import CryptoJS from 'crypto-js';

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
        const { amount, phone, provider, currency, reference, email, name } = req.body;

        // ✅ YOUR PESEPAY CREDENTIALS
        const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';
        const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

        // ✅ 1. MAP PROVIDER TO PAYMENT METHOD CODE
        const providerMap = {
            'ECOCASH': { code: 'PZW211', display: 'EcoCash' },
            'INNBUCKS': { code: 'PZW212', display: 'InnBucks' },
        };

        const providerInfo = providerMap[provider] || providerMap['ECOCASH'];
        const paymentMethodCode = providerInfo.code;

        // ✅ 2. BUILD THE PAYMENT BODY
        const paymentBody = {
            amountDetails: {
                amount: parseFloat(amount || '1.00'),
                currencyCode: currency || 'USD'
            },
            merchantReference: reference || 'GK-' + Date.now(),
            reasonForPayment: 'Gatekeeper AI Subscription',
            resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            returnUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            paymentMethodCode: paymentMethodCode,
            customer: {
                email: email || 'customer@gatekeeperai.co.zw',
                phoneNumber: phone || '0771111111',
                name: name || 'Gatekeeper Customer'
            },
            paymentMethodRequiredFields: {
                customerPhoneNumber: phone || '0771111111'
            }
        };

        console.log('1️⃣ Payment Body:', JSON.stringify(paymentBody, null, 2));

        // ✅ 3. ENCRYPT
        const encryptedJson = CryptoJS.AES.encrypt(
            JSON.stringify(paymentBody),
            CryptoJS.enc.Utf8.parse(encryptionKey),
            {
                iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
            }
        ).toString();

        const payload = { payload: encryptedJson };

        console.log('2️⃣ Encrypted Payload:', JSON.stringify(payload, null, 2));

        // ✅ 4. TRY BOTH ENDPOINTS - Sandbox
        const endpoints = [
            // Try the initiate endpoint first (we know this one exists)
            {
                url: 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate',
                name: 'initiate'
            },
            // Then try make-payment (which gave 404)
            {
                url: 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/make-payment',
                name: 'make-payment'
            }
        ];

        let lastError = null;
        let successResponse = null;

        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Trying endpoint: ${endpoint.name}`);
                
                const response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: {
                        'authorization': integrationKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                // If we get a response (not 404), return it
                if (response.status !== 404) {
                    console.log(`✅ Success with endpoint: ${endpoint.name}`);
                    successResponse = { endpoint: endpoint.name, status: response.status, data };
                    break;
                }
                
                lastError = { endpoint: endpoint.name, status: response.status, data };
                console.log(`❌ Endpoint ${endpoint.name} failed:`, response.status);
                
            } catch (error) {
                lastError = { endpoint: endpoint.name, error: error.message };
            }
        }

        // If we have a success response, process it
        if (successResponse) {
            // Decrypt the response
            if (successResponse.data.payload) {
                try {
                    const decrypted = decryptData(successResponse.data.payload, encryptionKey);
                    console.log('4️⃣ Decrypted Response:', decrypted);

                    return res.status(successResponse.status).json({
                        status: 'success',
                        message: 'Payment initiated',
                        endpoint_used: successResponse.endpoint,
                        redirectUrl: decrypted.redirectUrl,
                        referenceNumber: decrypted.referenceNumber,
                        transaction: decrypted,
                        raw: successResponse.data
                    });
                } catch (decryptError) {
                    console.error('Decryption error:', decryptError);
                    return res.status(successResponse.status).json({
                        status: 'partial',
                        message: 'Payment initiated but response decryption failed',
                        endpoint_used: successResponse.endpoint,
                        raw: successResponse.data
                    });
                }
            }
            
            return res.status(successResponse.status).json(successResponse.data);
        }

        // All endpoints failed
        return res.status(404).json({
            status: 'error',
            message: 'All endpoints failed',
            endpoints_tried: endpoints.map(e => e.name),
            last_error: lastError
        });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
}

function decryptData(encryptedJson, encryptionKey) {
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(
            encryptedJson,
            CryptoJS.enc.Utf8.parse(encryptionKey),
            {
                iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
            }
        );

        const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            throw new Error('Decryption failed - empty result');
        }

        return JSON.parse(decryptedData);
    } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
    }
}
