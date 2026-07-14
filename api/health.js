// api/health.js
// Gatekeeper AI – Health Check Endpoint

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            api: 'running',
            database: 'connected',
            whatsapp: 'pending',
            server: 'online'
        },
        version: '1.0.0'
    };

    res.status(200).json(health);
}
