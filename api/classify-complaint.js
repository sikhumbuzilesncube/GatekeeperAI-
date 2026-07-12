// api/classify-complaint.js
// Gatekeeper AI - Classification Engine (FIXED)

export default async function handler(req, res) {
    // ✅ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ✅ Handle OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ✅ Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { message } = req.body;

        // ✅ Validate input
        if (!message || message.trim() === '') {
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

    } catch (error) {
        console.error('Classification error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
}

// ─── CATEGORY DETECTION ───
function detectCategory(message) {
    const lower = message.toLowerCase();
    
    const keywords = {
        'roads': ['pothole', 'road', 'street', 'pavement', 'traffic', 'potholes', 'asphalt', 'tarmac'],
        'water': ['water', 'tap', 'leak', 'burst', 'pipe', 'no water', 'flood', 'sewage', 'drain'],
        'health': ['clinic', 'hospital', 'health', 'doctor', 'ambulance', 'sick', 'nurse', 'medicine'],
        'education': ['school', 'teacher', 'classroom', 'student', 'books', 'principal', 'exam'],
        'electricity': ['power', 'electricity', 'light', 'blackout', 'zesa', 'fridge', 'transformer'],
        'refuse': ['bin', 'trash', 'garbage', 'rubbish', 'dump', 'refuse', 'waste', 'litter'],
        'fire': ['fire', 'burning', 'smoke', 'flame', 'arson', 'wildfire'],
        'security': ['crime', 'theft', 'robbery', 'police', 'security', 'vandalism']
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
    const redWords = ['emergency', 'urgent', 'danger', 'life', 'death', 'fire', 'burst', 'flood', 'collapse', 'injured', 'bleeding', 'accident'];
    for (const word of redWords) {
        if (lower.includes(word)) {
            return 'RED';
        }
    }
    
    // Code Amber: Important
    const amberWords = ['important', 'days', 'waiting', 'still', 'problem', 'issue', 'complaint', 'help'];
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
        'harare': ['harare', 'chiremba', 'mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale'],
        'bulawayo': ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'byo', 'entumbane', 'mzilikazi'],
        'mutare': ['mutare', 'dangamvura', 'sakubva', 'utsindiso'],
        'gweru': ['gweru', 'mkoba', 'norton', 'senga'],
        'masvingo': ['masvingo', 'mashava', 'chiredzi'],
        'kwekwe': ['kwekwe', 'redcliff', 'amaveni'],
        'zimbabwe': ['zim', 'zimbabwe']
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
    const departmentMap = {
        'roads': 'Roads Department',
        'water': 'Water Department',
        'health': 'Health Department',
        'education': 'Education Department',
        'electricity': 'Electricity Department (ZESA)',
        'refuse': 'Refuse Department',
        'fire': 'Fire Department',
        'security': 'Police / Security',
        'general': 'General Services'
    };

    const department = departmentMap[category] || 'General Services';

    if (location === 'unknown') {
        return {
            council: 'Unknown',
            department: department,
            contact: 'Please provide your location for routing',
            requiresLocation: true
        };
    }

    // Capitalize location
    const councilName = location.charAt(0).toUpperCase() + location.slice(1);

    return {
        council: councilName,
        department: department,
        contact: `${councilName} City Council - ${department}`,
        requiresLocation: false
    };
}
