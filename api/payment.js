// api/payment.js
// Gatekeeper AI - Pesepay Integration (MAKE PAYMENT - Updated)
// Based on: https://developers.pesepay.com/api-reference/make-payment

// ✅ IMPORTANT: Ensure crypto-js is installed
// In package.json: "crypto-js": "^4.2.0"
import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
    // CORS Headers
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

        // ✅ 1. MAP PROVIDER TO PAYMENT METHOD CODE (Pesepay Specific)
        // Based on documentation: PZW211 = Ecocash USD, PZW212 = Innbucks
        // For other providers, you'll need to get the correct codes from Pesepay
        const providerMap = {
            'ECOCASH': { code: 'PZW211', display: 'EcoCash' },
            'INNBUCKS': { code: 'PZW212', display: 'InnBucks' },
            // Add other providers here as you get their codes
            // 'ONEMONEY': { code: 'PZW???', display: 'OneMoney' },
            // 'TELECASH': { code: 'PZW???', display: 'Telecash' },
        };

        const providerInfo = providerMap[provider] || providerMap['ECOCASH'];
        const paymentMethodCode = providerInfo.code;

        // ✅ 2. BUILD THE PAYMENT BODY (Plain Text)
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
                // For Ecocash, provide the customer's phone number
                customerPhoneNumber: phone || '0771111111'
                // For Innbucks, send an empty object: {}
            }
        };

        console.log('1️⃣ Payment Body (Plain):', JSON.stringify(paymentBody, null, 2));

        // ✅ 3. ENCRYPT THE PAYLOAD
        const encryptedJson = CryptoJS.AES.encrypt(
            JSON.stringify(paymentBody),
            CryptoJS.enc.Utf8.parse(encryptionKey),
            {
                iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
            }
        ).toString();

        // ✅ 4. CREATE FINAL PAYLOAD
        const payload = { payload: encryptedJson };

        console.log('2️⃣ Final Payload Sent:', JSON.stringify(payload, null, 2));

        // ✅ 5. USE THE CORRECT 'make-payment' ENDPOINT (Sandbox)
        const pesepayUrl = 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/make-payment';

        // For production, switch to:
        // const pesepayUrl = 'https://api.pesepay.com/api/payments-engine/v2/payments/make-payment';

        // ✅ 6. SEND REQUEST TO PESEPAY
        const response = await fetch(pesepayUrl, {
            method: 'POST',
            headers: {
                'authorization': integrationKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('3️⃣ Pesepay Response (Raw):', {
            status: response.status,
            data: data
        });

        // ✅ 7. DECRYPT THE RESPONSE
        if (data.payload) {
            try {
                const decrypted = decryptData(data.payload, encryptionKey);
                console.log('4️⃣ Decrypted Response:', decrypted);

                // Return decrypted data with redirect URL
                return res.status(response.status).json({
                    status: 'success',
                    message: 'Payment initiated',
                    redirectUrl: decrypted.redirectUrl,
                    referenceNumber: decrypted.referenceNumber,
                    transaction: decrypted,
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

        // If no payload to decrypt, return raw response
        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
}

/**
 * Decrypt the encrypted response from Pesepay API
 * @param {string} encryptedJson - The encrypted payload string
 * @param {string} encryptionKey - Your Pesepay encryption key
 * @returns {Object} Decrypted Transaction object
 */
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
