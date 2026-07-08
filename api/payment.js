// api/payment.js
// Gatekeeper AI - Pesepay Integration
// Using 'initiate' endpoint with correct format

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

        // ✅ PAYLOAD FOR 'INITIATE' ENDPOINT (Simpler format)
        // From Pesepay's initiate documentation:
        // amountDetails, reasonForPayment, resultUrl, returnUrl
        const paymentBody = {
            amountDetails: {
                amount: parseFloat(amount || '1.00'),
                currencyCode: currency || 'USD'
            },
            reasonForPayment: 'Gatekeeper AI Subscription',
            resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            returnUrl: 'https://gatekeeperai.co.zw/payment_success.html'
        };

        console.log('1️⃣ Payment Body (Plain):', JSON.stringify(paymentBody, null, 2));

        // ✅ USE THE SAME ENCRYPTION THAT PASSED THE TEST
        const encryptedJson = CryptoJS.AES.encrypt(
            JSON.stringify(paymentBody),
            CryptoJS.enc.Utf8.parse(encryptionKey),
            {
                iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
            }
        ).toString();

        console.log('2️⃣ Encrypted:', encryptedJson);

        const payload = { payload: encryptedJson };

        console.log('3️⃣ Final Payload:', JSON.stringify(payload, null, 2));

        // ✅ USE THE 'INITIATE' ENDPOINT (We know this exists)
        const apiUrl = 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate';

        console.log('4️⃣ Sending to:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'authorization': integrationKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('5️⃣ Pesepay Response:', {
            status: response.status,
            data: data
        });

        // ✅ DECRYPT THE RESPONSE
        if (data.payload) {
            try {
                const decrypted = CryptoJS.AES.decrypt(
                    data.payload,
                    CryptoJS.enc.Utf8.parse(encryptionKey),
                    {
                        iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
                    }
                ).toString(CryptoJS.enc.Utf8);

                const result = JSON.parse(decrypted);
                console.log('6️⃣ Decrypted Response:', result);

                return res.status(response.status).json({
                    status: 'success',
                    message: 'Payment initiated',
                    redirectUrl: result.redirectUrl,
                    referenceNumber: result.referenceNumber,
                    transaction: result,
                    raw: data
                });
            } catch (decryptError) {
                console.error('Decryption error:', decryptError);
                return res.status(response.status).json({
                    status: 'partial',
                    message: 'Payment initiated but response decryption failed',
                    raw: data
                });
            }
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
