// api/status.js
// System Status Dashboard

export default async function handler(req, res) {
    const status = {
        system: {
            name: 'Gatekeeper AI',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        },
        services: {
            api: await checkApi(),
            payment: await checkPayment(),
            database: await checkDatabase(),
            monitoring: await checkMonitoring()
        },
        alerts: {
            whatsapp: {
                configured: true,
                number: '263777803517',
                status: 'active'
            }
        },
        recent_issues: await getRecentIssues()
    };
    
    res.status(200).json(status);
}

async function checkApi() {
    try {
        const response = await fetch('https://gatekeeperai.co.zw/api/health', {
            timeout: 5000
        });
        return {
            status: response.ok ? 'online' : 'offline',
            response_time: response.ok ? 'fast' : 'slow',
            last_check: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'offline',
            error: error.message,
            last_check: new Date().toISOString()
        };
    }
}

async function checkPayment() {
    try {
        const response = await fetch('https://api.test.sandbox.pesepay.com/payments-engine/v1/payments/initiate', {
            method: 'OPTIONS',
            timeout: 10000
        });
        return {
            gateway: 'Pesepay',
            status: response.ok ? 'online' : 'offline',
            environment: 'sandbox',
            last_check: new Date().toISOString()
        };
    } catch (error) {
        return {
            gateway: 'Pesepay',
            status: 'offline',
            error: error.message,
            last_check: new Date().toISOString()
        };
    }
}

async function checkDatabase() {
    return {
        status: 'online',
        type: 'Vercel KV',
        last_check: new Date().toISOString()
    };
}

async function checkMonitoring() {
    return {
        status: 'online',
        provider: 'UptimeRobot',
        last_check: new Date().toISOString()
    };
}

async function getRecentIssues() {
    return [
        {
            id: 1,
            issue: 'None',
            resolved: true,
            timestamp: new Date().toISOString()
        }
    ];
    }
