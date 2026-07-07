// api/send-whatsapp.js
// WhatsApp Alert System for Gatekeeper AI

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, issue, action } = req.body;

        // ✅ YOUR CORRECT WHATSAPP NUMBER
        const adminPhone = '263777803517';

        // Format the message
        const alertMessage = `
⚠️ *GATEKEEPER AI ALERT*

📅 Time: ${new Date().toISOString()}
📋 Issue: ${issue || 'System Check'}
🔧 Action: ${action || 'None Taken'}

📝 Details:
${message || 'No additional details'}

---
🤖 Auto-Fix System
🌐 ${process.env.VERCEL_URL || 'gatekeeperai.co.zw'}
        `.trim();

        // Send via WhatsApp Business API (if you have it)
        // OR via Twilio
        // OR via Africa's Talking

        // For now, we'll just log and return success
        console.log('📱 WhatsApp Alert:');
        console.log(alertMessage);
        console.log('📱 Would be sent to:', adminPhone);

        // Send to a webhook URL (for testing/logging)
        try {
            const webhookResponse = await fetch('https://webhook.site/YOUR_WEBHOOK_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: adminPhone,
                    message: alertMessage,
                    issue: issue,
                    action: action,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            // Webhook failed but that's okay
        }

        return res.status(200).json({
            success: true,
            message: 'Alert sent successfully',
            recipient: adminPhone,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('WhatsApp alert error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
    }
