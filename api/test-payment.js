// api/test-payment.js
// Quick test for make-payment endpoint

import CryptoJS from 'crypto-js';

export default async function handler(req, res) {
    const integrationKey = '74362486-c8e7-4bb1-8a9f-c042ff8e4497';
    const encryptionKey = 'Oe6a6429cc0445fb8195ffbffOcda11c';

    const paymentBody = {
        amountDetails: {
            amount: 1.00,
            currencyCode: 'USD'
        },
        merchantReference: 'TEST-' + Date.now(),
        reasonForPayment: 'Test payment',
        resultUrl: 'https://gatekeeperai.co.zw/payment_callback.html',
        returnUrl: 'https://gatekeeperai.co.zw/payment_success.html',
        paymentMethodCode: 'PZW211',
        customer: {
            email: 'test@gatekeeperai.co.zw',
            phoneNumber: '0771111111',
            name: 'Test Customer'
        },
        paymentMethodRequiredFields: {
            customerPhoneNumber: '0771111111'
        }
    };

    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(paymentBody),
        CryptoJS.enc.Utf8.parse(encryptionKey),
        {
            iv: CryptoJS.enc.Utf8.parse(encryptionKey.substring(0, 16))
        }
    ).toString();

    const payload = { payload: encrypted };

    const response = await fetch(
        'https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/make-payment',
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

    res.status(200).json({
        status: response.status,
        data: data
    });
}
