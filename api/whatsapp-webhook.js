// api/whatsapp-webhook.js
// Gatekeeper AI – Twilio WhatsApp Webhook

export default async function handler(req, res) {
    // ✅ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ✅ Twilio sends a GET request to verify the webhook
    if (req.method === 'GET') {
        // Twilio's verification challenge
        const challenge = req.query['hub.challenge'];
        if (challenge) {
            return res.status(200).send(challenge);
        }
        return res.status(200).json({ status: 'Webhook is active' });
    }

    // ✅ Handle incoming WhatsApp messages
    if (req.method === 'POST') {
        try {
            const data = req.body;

            // Twilio sends data as form-urlencoded
            const from = data.From || data.from;
            const to = data.To || data.to;
            const body = data.Body || data.body;
            const messageSid = data.MessageSid || data.messageSid;

            console.log('📱 WhatsApp Message Received:');
            console.log('From:', from);
            console.log('Message:', body);

            // ✅ Check if the message is the join code
            if (body && body.toLowerCase().includes('join')) {
                return res.status(200).send(`
                    <Response>
                        <Message>✅ Welcome to Gatekeeper AI! You are now connected. 
                        Send a complaint and our AI will process it.</Message>
                    </Response>
                `);
            }

            // ✅ Process the message with AI
            // Call your classification engine
            const classification = await classifyMessage(body, from);

            // ✅ Send a response based on the classification
            let reply = '';

            if (classification.needsClarification) {
                reply = `📱 Gatekeeper AI – Clarification Needed\n\nWe couldn't determine the location. Please reply with your city or suburb.`;
            } else {
                reply = `✅ Complaint Received!\n\n📋 Category: ${classification.category}\n🔴 Urgency: ${classification.urgency}\n📍 Location: ${classification.location}\n🆔 Reference: ${classification.reference}\n\nWe have forwarded your complaint to the relevant department.`;
            }

            // Return TwiML response
            return res.status(200).send(`
                <Response>
                    <Message>${reply}</Message>
                </Response>
            `);

        } catch (error) {
            console.error('Webhook error:', error);
            return res.status(500).send(`
                <Response>
                    <Message>⚠️ An error occurred. Please try again later.</Message>
                </Response>
            `);
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// ─── CLASSIFY MESSAGE ───
async function classifyMessage(message, sender) {
    // Simple classification for testing
    const lower = message.toLowerCase();

    // Detect category
    let category = 'general';
    const categories = {
        'roads': ['pothole', 'road', 'street', 'pavement'],
        'water': ['water', 'tap', 'leak', 'burst', 'pipe'],
        'health': ['clinic', 'hospital', 'health', 'doctor'],
        'electricity': ['power', 'electricity', 'light', 'zesa'],
        'refuse': ['bin', 'trash', 'garbage', 'rubbish']
    };

    for (const [cat, keywords] of Object.entries(categories)) {
        for (const word of keywords) {
            if (lower.includes(word)) {
                category = cat;
                break;
            }
        }
        if (category !== 'general') break;
    }

    // Detect urgency
    let urgency = 'GREEN';
    const urgent = ['emergency', 'urgent', 'danger', 'fire', 'burst', 'flood'];
    for (const word of urgent) {
        if (lower.includes(word)) {
            urgency = 'RED';
            break;
        }
    }

    // Detect location
    let location = 'unknown';
    const locations = ['harare', 'bulawayo', 'mutare', 'gweru', 'masvingo'];
    for (const loc of locations) {
        if (lower.includes(loc)) {
            location = loc;
            break;
        }
    }

    return {
        category: category,
        urgency: urgency,
        location: location,
        reference: 'GK-' + Date.now().toString().slice(-6),
        needsClarification: location === 'unknown'
    };
    }
