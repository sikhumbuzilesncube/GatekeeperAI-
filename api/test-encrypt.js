// api/test-encrypt.js
// Test encryption and decryption locally

import CryptoJS from 'crypto-js';

export default function handler(req, res) {
    const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

    // Test data
    const testData = {
        amountDetails: {
            amount: 1.00,
            currencyCode: 'USD'
        },
        reasonForPayment: 'Test payment'
    };

    // Encrypt
    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(testData),
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
            iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
        }
    ).toString();

    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
        encrypted,
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
            iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
        }
    ).toString(CryptoJS.enc.Utf8);

    res.status(200).json({
        original: testData,
        encrypted: encrypted,
        decrypted: JSON.parse(decrypted),
        success: JSON.stringify(testData) === decrypted
    });
}
