// api/payment.js
// Gatekeeper AI - Pesepay Integration
// Using Pesepay's official JavaScript encryption method

// ✅ IMPORTANT: Install crypto-js in Vercel
// Run in terminal: npm install crypto-js
// Or add to package.json: "crypto-js": "^4.2.0"

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
        const { amount, phone, provider, currency, reference } = req.body;

        // ✅ YOUR PESEPAY CREDENTIALS
        const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';
        const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

        // ✅ 1. PREPARE THE PAYMENT BODY (Plain Text)
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

        // ✅ 2. ENCRYPT THE PAYLOAD using Pesepay's method
        // IV = first 16 characters of encryption key
        const encryptedJson = CryptoJS.AES.encrypt(
            JSON.stringify(paymentBody),
            CryptoJS.enc.Utf8.parse(encryptionKey),
            {
                iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
            }
        ).toString();

        console.log('2️⃣ Encrypted Payload:', encryptedJson);

        // ✅ 3. CREATE FINAL PAYLOAD
        const payload = { payload: encryptedJson };

        console.log('3️⃣ Final Payload:', JSON.stringify(payload, null, 2));

        // ✅ 4. SEND TO PESEPAY SANDBOX
        const pesepayUrl = 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate';

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

        console.log('4️⃣ Pesepay Response:', {
            status: response.status,
            data: data
        });

        // ✅ 5. DECRYPT THE RESPONSE
        if (data.payload) {
            try {
                const decrypted = decryptData(data.payload, encryptionKey);
                console.log('5️⃣ Decrypted Response:', decrypted);
                
                // Return the decrypted data with redirect URL
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
                // If decryption fails, return raw data
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
