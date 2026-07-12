// api/dashboard.js
// Super Admin Dashboard - View all complaints

export default function handler(req, res) {
    // For now, return sample data
    // Later, this will pull from a database
    
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
            }
        ]
    };

    res.status(200).json(sampleData);
}
