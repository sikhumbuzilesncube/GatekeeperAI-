// api/payment.js
// Gatekeeper AI - Pesepay Integration
// SIMPLIFIED ENCRYPTION - Matching Pesepay's example

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

        console.log('🔑 Encryption Key:', encryptionKey);
        console.log('📏 Key Length:', encryptionKey.length);

        // ✅ BUILD THE PAYMENT BODY (Matching Pesepay's example)
        const paymentBody = {
            amountDetails: {
                amount: parseFloat(amount || '1.00'),
                currencyCode: currency || 'USD'
            },
            merchantReference: reference || 'GK-' + Date.now(),
            reasonForPayment: 'Gatekeeper AI Subscription',
            resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            returnUrl: 'https://gatekeeperai.co.zw/payment_success.html',
            paymentMethodCode: 'PZW211', // EcoCash USD
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

        // ✅ ENCRYPT - SIMPLER METHOD
        // Convert the body to a JSON string
        const jsonString = JSON.stringify(paymentBody);
        console.log('2️⃣ JSON String:', jsonString);

        // Use CryptoJS to encrypt
        // Method: AES-256-CBC with key and IV
        const key = CryptoJS.enc.Utf8.parse(encryptionKey);
        const iv = CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16));

        const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const encryptedString = encrypted.toString();
        console.log('3️⃣ Encrypted String:', encryptedString);

        // ✅ CREATE FINAL PAYLOAD
        const payload = { payload: encryptedString };

        console.log('4️⃣ Final Payload:', JSON.stringify(payload, null, 2));

        // ✅ SEND TO PESEPAY
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

        console.log('5️⃣ Pesepay Response:', {
            status: response.status,
            data: data
        });

        // ✅ TRY TO DECRYPT RESPONSE
        if (data.payload) {
            try {
                const decrypted = decryptResponse(data.payload, encryptionKey);
                console.log('6️⃣ Decrypted Response:', decrypted);
                
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

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
}

function decryptResponse(encryptedJson, encryptionKey) {
    try {
        const key = CryptoJS.enc.Utf8.parse(encryptionKey);
        const iv = CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16));

        const decrypted = CryptoJS.AES.decrypt(encryptedJson, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        console.log('📥 Decrypted String:', decryptedString);

        if (!decryptedString) {
            throw new Error('Decryption returned empty result');
        }

        return JSON.parse(decryptedString);
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
                }
