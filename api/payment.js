// api/payment.js
// Gatekeeper AI - Pesepay Integration (FINAL WORKING VERSION)

// ✅ IMPORTANT: Install crypto-js for encryption
// In Vercel: npm install crypto-js
// Or use Node.js built-in crypto

import crypto from 'crypto';

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

        // ✅ 1. BUILD PLAINTEXT PAYLOAD
        // Pesepay requires these 4 fields only
        const plaintextPayload = {
            amountDetails: {
                amount: parseFloat(amount || '1.00'),
                currencyCode: currency || 'USD'
            },
            reasonForPayment: 'Gatekeeper AI Subscription',
            resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
            returnUrl: 'https://gatekeeperai.co.zw/payment_success.html'
        };

        console.log('1️⃣ Plaintext Payload:', JSON.stringify(plaintextPayload, null, 2));

        // ✅ 2. ENCRYPT THE PAYLOAD
        // Convert to string, then encrypt using AES-256-CBC with your encryption key
        const plaintextString = JSON.stringify(plaintextPayload);
        
        // Create encryption key from your encryption key (32 bytes for AES-256)
        const key = crypto.createHash('sha256').update(encryptionKey).digest();
        const iv = crypto.randomBytes(16); // Generate random IV
        
        // Encrypt
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(plaintextString, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        // Combine IV + encrypted data (Pesepay expects this format)
        const encryptedPayload = {
            payload: encrypted,
            iv: iv.toString('base64')
        };

        console.log('2️⃣ Encrypted Payload:', encryptedPayload);

        // ✅ 3. SEND TO PESEPAY
        const pesepayUrl = 'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate';

        const response = await fetch(pesepayUrl, {
            method: 'POST',
            headers: {
                'authorization': integrationKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(encryptedPayload)
        });

        const data = await response.json();

        console.log('3️⃣ Pesepay Response:', {
            status: response.status,
            data: data
        });

        return res.status(response.status).json(data);

    } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Server error'
        });
    }
                }
