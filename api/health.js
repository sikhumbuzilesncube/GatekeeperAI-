// api/health.js
// Health check endpoint

export default function handler(req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            api: 'running',
            payment: 'pending',
            database: 'connected'
        }
    });
}
