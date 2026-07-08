// api/test-encryption.js
// Test encryption with Pesepay's exact method

import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
    const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';
    const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';

    // 1. Create the exact payment body
    const paymentBody = {
        amountDetails: {
            amount: 1.00,
            currencyCode: 'USD'
        },
        reasonForPayment: 'Test payment',
        resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
        returnUrl: 'https://gatekeeperai.co.zw/payment_success.html'
    };

    console.log('📤 Payment Body:', JSON.stringify(paymentBody));

    // 2. Encrypt
    const key = CryptoJS.enc.Utf8.parse(encryptionKey);
    const iv = CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16));

    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(paymentBody),
        key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    const encryptedString = encrypted.toString();

    console.log('🔐 Encrypted:', encryptedString);

    // 3. Try to decrypt locally (should work)
    const decryptedBytes = CryptoJS.AES.decrypt(
        encryptedString,
        key,
        {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
    const decrypted = JSON.parse(decryptedString);

    console.log('📥 Decrypted:', decrypted);

    // 4. Send to Pesepay
    const payload = { payload: encryptedString };

    const response = await fetch(
        'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate',
        {
            method: 'POST',
            headers: {
                'authorization': integrationKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    // 5. Return everything
    res.status(200).json({
        success: JSON.stringify(paymentBody) === decryptedString,
        encryption_worked: true,
        payment_body: paymentBody,
        encrypted_string: encryptedString,
        decrypted: decrypted,
        pesepay_response: {
            status: response.status,
            data: data
        }
    });
}
