// api/dashboard.js
// Super Admin Dashboard - View all complaints

export default function handler(req, res) {
    // ✅ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        // Sample data for testing
        const sampleData = {
            totalComplaints: 1234,
            resolved: 823,
            pending: 411,
            byCategory: {
                roads: 432,
                water: 280,
                health: 234,
                education: 176,
                electricity: 112
            },
            byUrgency: {
                red: 45,
                amber: 234,
                green: 955
            },
            byCouncil: {
                'Harare': 456,
                'Bulawayo': 345,
                'Mutare': 234,
                'Gweru': 123,
                'Masvingo': 76
            },
            recentComplaints: [
                {
                    id: 'GK-2024-001',
                    category: 'roads',
                    urgency: 'RED',
                    location: 'Harare',
                    message: 'Pothole on Chiremba Road',
                    status: 'pending',
                    timestamp: '2024-07-12T10:00:00Z'
                },
                {
                    id: 'GK-2024-002',
                    category: 'water',
                    urgency: 'AMBER',
                    location: 'Bulawayo',
                    message: 'No water in Luveve for 3 days',
                    status: 'in_progress',
                    timestamp: '2024-07-12T09:30:00Z'
                },
                {
                    id: 'GK-2024-003',
                    category: 'electricity',
                    urgency: 'GREEN',
                    location: 'Mutare',
                    message: 'Street light not working',
                    status: 'resolved',
                    timestamp: '2024-07-12T08:00:00Z'
                }
            ],
            timestamp: new Date().toISOString()
        };

        return res.status(200).json(sampleData);
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
                    }
