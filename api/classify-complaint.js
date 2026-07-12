// api/classify-complaint.js
// Gatekeeper AI - Classification Engine
// Can be tested with sample messages NOW, works with WhatsApp later

export default async function handler(req, res) {
    // Allow testing without WhatsApp
    const { message, testMode } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Step 1: Detect Category
    const category = detectCategory(message);
    
    // Step 2: Detect Urgency
    const urgency = detectUrgency(message);
    
    // Step 3: Detect Location
    const location = detectLocation(message);
    
    // Step 4: Find Authority
    const authority = findAuthority(category, location);

    // Step 5: Generate Reference
    const reference = 'GK-' + Date.now();

    const result = {
        reference: reference,
        category: category,
        urgency: urgency,
        location: location,
        authority: authority,
        message: message,
        timestamp: new Date().toISOString()
    };

    return res.status(200).json({
        status: 'classified',
        data: result
    });
}

// ─── CATEGORY DETECTION ───
function detectCategory(message) {
    const lower = message.toLowerCase();
    
    const keywords = {
        'roads': ['pothole', 'road', 'street', 'pavement', 'traffic', 'potholes'],
        'water': ['water', 'tap', 'leak', 'burst', 'pipe', 'no water', 'flood'],
        'health': ['clinic', 'hospital', 'health', 'doctor', 'ambulance', 'sick'],
        'education': ['school', 'teacher', 'classroom', 'student', 'books'],
        'electricity': ['power', 'electricity', 'light', 'blackout', 'zesa', 'fridge'],
        'refuse': ['bin', 'trash', 'garbage', 'rubbish', 'dump', 'refuse'],
        'fire': ['fire', 'burning', 'smoke', 'flame'],
        'security': ['crime', 'theft', 'robbery', 'police', 'security']
    };

    for (const [category, words] of Object.entries(keywords)) {
        for (const word of words) {
            if (lower.includes(word)) {
                return category;
            }
        }
    }
    
    return 'general';
}

// ─── URGENCY DETECTION ───
function detectUrgency(message) {
    const lower = message.toLowerCase();
    
    // Code Red: Emergency
    const redWords = ['emergency', 'urgent', 'danger', 'life', 'death', 'fire', 'burst', 'flood', 'collapse', 'injured'];
    for (const word of redWords) {
        if (lower.includes(word)) {
            return 'RED';
        }
    }
    
    // Code Amber: Important
    const amberWords = ['important', 'days', 'waiting', 'still', 'problem', 'issue'];
    for (const word of amberWords) {
        if (lower.includes(word)) {
            return 'AMBER';
        }
    }
    
    return 'GREEN';
}

// ─── LOCATION DETECTION ───
function detectLocation(message) {
    const lower = message.toLowerCase();
    
    const locations = {
        'harare': ['harare', 'chiremba', 'mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia'],
        'bulawayo': ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'byo'],
        'mutare': ['mutare', 'dangamvura', 'sakubva'],
        'gweru': ['gweru', 'mkoba', 'norton'],
        'masvingo': ['masvingo', 'mashava']
    };

    for (const [city, keywords] of Object.entries(locations)) {
        for (const word of keywords) {
            if (lower.includes(word)) {
                return city;
            }
        }
    }
    
    return 'unknown';
}

// ─── AUTHORITY ROUTING ───
function findAuthority(category, location) {
    // Simple routing based on category and location
    // We'll expand this with a full database
    
    if (location === 'unknown') {
        return {
            department: 'General Services',
            contact: 'Please provide your location'
        };
    }
    
    const departmentMap = {
        'roads': 'Roads Department',
        'water': 'Water Department',
        'health': 'Health Department',
        'education': 'Education Department',
        'electricity': 'Electricity Department (ZESA)',
        'refuse': 'Refuse Department',
        'fire': 'Fire Department',
        'security': 'Police / Security'
    };

    return {
        council: location,
        department: departmentMap[category] || 'General Services',
        contact: `${location} City Council - ${departmentMap[category] || 'General Services'}`
    };
                  }
