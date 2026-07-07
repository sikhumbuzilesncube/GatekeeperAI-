// api/cron-fix.js
// Scheduled auto-fix - runs every 15 minutes

export default async function handler(req, res) {
    // Check if this is a cron trigger
    const auth = req.headers.authorization;
    if (auth !== 'Bearer cron-secret-key') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        // Run auto-fix
        const fixResponse = await fetch('https://gatekeeperai.co.zw/api/auto-fix');
        const fixResult = await fixResponse.json();
        
        // Log the result
        console.log('Auto-fix run at:', new Date().toISOString());
        console.log('Result:', fixResult);
        
        // Send alert if issues were found
        if (fixResult.fixes && fixResult.fixes.length > 0) {
            // Send WhatsApp/email alert
            await sendAlert(fixResult);
        }
        
        res.status(200).json({
            success: true,
            message: 'Auto-fix completed',
            result: fixResult,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

async function sendAlert(fixResult) {
    // You can integrate with WhatsApp or email here
    console.log('ALERT: Issues detected and fixed:', fixResult);
          }
