// api/paynow-webhook.js
// Paynow Webhook Handler

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = req.body;
        console.log('📥 Paynow Webhook Received:', data);

        // ✅ Check payment status
        if (data.status === 'paid' || data.status === 'success' || data.paymentStatus === 'paid') {
            // Update your database
            // Send confirmation email
            console.log('✅ Payment confirmed:', data.reference);
            
            return res.status(200).json({
                status: 'success',
                message: 'Webhook processed'
            });
        }

        return res.status(200).json({
            status: 'received',
            message: 'Webhook received'
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
          }
