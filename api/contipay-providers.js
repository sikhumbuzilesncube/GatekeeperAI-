// api/contipay-providers.js
// Test ContiPay providers endpoint

export default async function handler(req, res) {
    try {
        const merchantId = '952';
        const apiKey = 'VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09';
        const apiSecret = '764cc5e8-3d34-45ea-b9f0-66df7fff19fe';

        const authString = apiKey + ':' + apiSecret;
        const authBase64 = Buffer.from(authString).toString('base64');

        const response = await fetch(
            `https://api-uat.contipay.net/acquire/providers?merchantId=${merchantId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + authBase64,
                    'Accept': 'application/json'
                }
            }
        );

        const data = await response.json();

        res.status(200).json({
            status: response.status,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
          }
