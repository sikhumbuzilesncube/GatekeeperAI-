// api/classify-complaint.js
// Gatekeeper AI - Multi-Language Classification Engine
// With Clarification System for Unclear Messages

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const { message, sender, context } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Step 1: Detect Language
        const language = detectLanguage(message);

        // Step 2: Detect Category
        const category = detectCategory(message, language);

        // Step 3: Detect Urgency
        const urgency = detectUrgency(message, language);

        // Step 4: Detect Location
        const locationResult = detectLocationWithConflicts(message, language);

        // Step 5: Check if message is complete
        const isComplete = isMessageComplete(category, locationResult);

        // Step 6: Generate response
        let result = {
            status: 'processed',
            language: language,
            category: category,
            urgency: urgency,
            location: locationResult,
            isComplete: isComplete,
            needsClarification: !isComplete,
            reference: null,
            authority: null,
            clarificationMessage: null
        };

        // Step 7: If complete, route the complaint
        if (isComplete) {
            const reference = 'GK-' + Date.now();
            const authority = findAuthority(category, locationResult.location);
            
            result.reference = reference;
            result.authority = authority;
            result.status = 'routed';
        } else {
            // Step 8: Generate clarification message
            result.clarificationMessage = generateClarification(message, category, locationResult, language);
            result.status = 'clarification_needed';
        }

        return res.status(200).json(result);

    } catch (error) {
        console.error('Classification error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
}

// ─── LANGUAGE DETECTION ───
function detectLanguage(message) {
    const lower = message.toLowerCase();
    const scores = { shona: 0, ndebele: 0, kalanga: 0, tonga: 0, venda: 0, english: 0 };

    const languageKeywords = {
        shona: ['gomba', 'mugwagwa', 'nzira', 'mvura', 'pombi', 'chipatara', 'chiremba', 'chikoro', 'magetsi', 'marara', 'tsvina', 'njodzi', 'nhamo'],
        ndebele: ['umgwaqo', 'indlela', 'amanzi', 'ugqozi', 'isibhedlela', 'udokotela', 'isikolo', 'umfundisi', 'ugesi', 'imfucuza', 'udoti', 'ingozi'],
        kalanga: ['njila', 'zibakala', 'manzi', 'bombi', 'chipatara', 'muradi', 'chikolo', 'mutifundisi', 'njodzi'],
        tonga: ['nzila', 'mubvu', 'mezi', 'mwami', 'chipatara', 'mwana', 'chikoro', 'mutifundisi', 'njodzi'],
        venda: ['mugwa', 'mbvumo', 'maḓi', 'thambo', 'chipatara', 'muraḓi', 'chikolo', 'mutifundisi', 'tshinyu']
    };

    for (const [lang, words] of Object.entries(languageKeywords)) {
        for (const word of words) {
            if (lower.includes(word)) scores[lang] += 1;
        }
    }

    const englishWords = ['the', 'this', 'that', 'there', 'here', 'please', 'help', 'urgent', 'road', 'water', 'school'];
    for (const word of englishWords) {
        if (lower.includes(word)) scores.english += 1;
    }

    let maxScore = 0;
    let detected = 'english';
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) { maxScore = score; detected = lang; }
    }
    return detected;
}

// ─── CATEGORY DETECTION ───
function detectCategory(message, language) {
    const lower = message.toLowerCase();
    const categories = {
        roads: {
            english: ['pothole', 'road', 'street', 'pavement', 'traffic', 'asphalt', 'tarmac', 'highway'],
            shona: ['gomba', 'mugwagwa', 'nzira', 'migwagwa', 'musuwo', 'mubvumo'],
            ndebele: ['umgwaqo', 'indlela', 'imigwaqo', 'izibakala'],
            kalanga: ['njila', 'zibakala', 'mbugwa'],
            tonga: ['nzila', 'mubvu', 'mikwakwa'],
            venda: ['mugwa', 'mbvumo', 'dzila']
        },
        water: {
            english: ['water', 'tap', 'leak', 'burst', 'pipe', 'flood', 'sewage', 'drain', 'no water'],
            shona: ['mvura', 'pombi', 'mupombi', 'magetsi emvura', 'mupata'],
            ndebele: ['amanzi', 'ugqozi', 'imibhobho', 'umlambo'],
            kalanga: ['manzi', 'bombi', 'bumba'],
            tonga: ['mezi', 'mwami', 'mubvu wamezi'],
            venda: ['maḓi', 'thambo', 'musini']
        },
        health: {
            english: ['clinic', 'hospital', 'health', 'doctor', 'ambulance', 'sick', 'nurse', 'medicine'],
            shona: ['chipatara', 'chiremba', 'utano', 'mukoti', 'zvipatara', 'mutano', 'zvirwere'],
            ndebele: ['isibhedlela', 'udokotela', 'umunesi', 'impilo'],
            kalanga: ['chipatara', 'muradi', 'mupila'],
            tonga: ['chipatara', 'mwana', 'mupila'],
            venda: ['chipatara', 'muraḓi', 'vhulamu']
        },
        education: {
            english: ['school', 'teacher', 'classroom', 'student', 'books', 'principal', 'exam', 'class'],
            shona: ['chikoro', 'mudzidzisi', 'vadzidzi', 'zvikoro', 'fundo', 'bvunzo'],
            ndebele: ['isikolo', 'umfundisi', 'abafundi', 'izikolo'],
            kalanga: ['chikolo', 'mutifundisi', 'vadzidzi'],
            tonga: ['chikoro', 'mutifundisi', 'vadzidzi'],
            venda: ['chikolo', 'mutifundisi', 'vhudzidzi']
        },
        electricity: {
            english: ['power', 'electricity', 'light', 'blackout', 'zesa', 'transformer', 'fridge'],
            shona: ['magetsi', 'chiedza', 'nhamo', 'zesa'],
            ndebele: ['ugesi', 'ukhanyo', 'amandla'],
            kalanga: ['mbuyagezi'],
            tonga: ['magetsi'],
            venda: ['magetsi']
        },
        refuse: {
            english: ['bin', 'trash', 'garbage', 'rubbish', 'dump', 'refuse', 'waste', 'litter'],
            shona: ['marara', 'tsvina', 'zvisaririra'],
            ndebele: ['imfucuza', 'udoti', 'imfucumfucu'],
            kalanga: ['marara'],
            tonga: ['marara'],
            venda: ['marara']
        }
    };

    for (const [category, langMap] of Object.entries(categories)) {
        const keywords = langMap[language] || langMap.english || [];
        for (const word of keywords) {
            if (lower.includes(word)) return category;
        }
    }
    return 'general';
}

// ─── URGENCY DETECTION ───
function detectUrgency(message, language) {
    const lower = message.toLowerCase();
    const urgencyKeywords = {
        red: {
            english: ['emergency', 'urgent', 'danger', 'life', 'death', 'fire', 'burst', 'flood', 'collapse', 'injured', 'bleeding', 'accident', 'critical'],
            shona: ['njodzi', 'nhamo', 'kukurumidza', 'upenyu', 'dambudziko', 'hutano', 'ngozi'],
            ndebele: ['ingozi', 'phuthuma', 'impilo', 'ubungozi'],
            kalanga: ['njodzi', 'ngano', 'mupila'],
            tonga: ['njodzi', 'ngano', 'mupila'],
            venda: ['tshinyu', 'vhuphi', 'vhulamu']
        },
        amber: {
            english: ['important', 'days', 'waiting', 'still', 'problem', 'issue', 'complaint', 'help'],
            shona: ['zvakakosha', 'mazuva', 'kumirira', 'dambudziko', 'rubatsiro'],
            ndebele: ['kubalulekile', 'insuku', 'ukulinda', 'inkinga'],
            kalanga: ['kubalulekile', 'mazuva'],
            tonga: ['kubalulekile', 'mazuva'],
            venda: ['kubalulekile', 'mazuva']
        }
    };

    for (const [urgency, langMap] of Object.entries(urgencyKeywords)) {
        const keywords = langMap[language] || langMap.english || [];
        for (const word of keywords) {
            if (lower.includes(word)) return urgency.toUpperCase();
        }
    }
    return 'GREEN';
}

// ─── LOCATION DETECTION WITH CONFLICT HANDLING ───
function detectLocationWithConflicts(message, language) {
    const lower = message.toLowerCase();
    const locations = {
        harare: {
            keywords: ['harare', 'chiremba', 'mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale', 'waterfalls', 'kambuzuma'],
            suburbs: ['mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale', 'waterfalls', 'kambuzuma']
        },
        bulawayo: {
            keywords: ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi', 'barbourfields', 'pumula', 'gwabalanda', 'njube'],
            suburbs: ['luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi', 'barbourfields', 'pumula', 'gwabalanda', 'njube']
        },
        mutare: {
            keywords: ['mutare', 'dangamvura', 'sakubva', 'utsindiso'],
            suburbs: ['dangamvura', 'sakubva', 'utsindiso']
        },
        gweru: {
            keywords: ['gweru', 'mkoba', 'norton', 'senga'],
            suburbs: ['mkoba', 'norton', 'senga']
        },
        masvingo: {
            keywords: ['masvingo', 'mashava', 'chiredzi'],
            suburbs: ['mashava', 'chiredzi']
        }
    };

    let matchedLocations = [];
    let matchedSuburbs = [];

    // Check all locations
    for (const [city, data] of Object.entries(locations)) {
        const keywords = data.keywords;
        for (const word of keywords) {
            if (lower.includes(word)) {
                if (!matchedLocations.includes(city)) {
                    matchedLocations.push(city);
                }
                // Check if it's a suburb match
                if (data.suburbs.includes(word)) {
                    matchedSuburbs.push({ city, suburb: word });
                }
            }
        }
    }

    // No location found
    if (matchedLocations.length === 0) {
        return { location: 'unknown', conflict: false, matched: [] };
    }

    // Single location found
    if (matchedLocations.length === 1) {
        return { 
            location: matchedLocations[0], 
            conflict: false, 
            matched: matchedLocations,
            suburb: matchedSuburbs.length > 0 ? matchedSuburbs[0].suburb : null
        };
    }

    // Multiple locations found (conflict)
    return {
        location: 'conflict',
        conflict: true,
        matched: matchedLocations,
        suburbs: matchedSuburbs
    };
}

// ─── CHECK IF MESSAGE IS COMPLETE ───
function isMessageComplete(category, locationResult) {
    if (category === 'general') return false;
    if (locationResult.location === 'unknown' || locationResult.location === 'conflict') return false;
    return true;
}

// ─── GENERATE CLARIFICATION MESSAGE ───
function generateClarification(message, category, locationResult, language) {
    let reply = '';
    
    // No category, no location
    if (category === 'general' && locationResult.location === 'unknown') {
        reply = `📱 Gatekeeper AI – Clarification Needed

We couldn't understand your message clearly.

📝 Your message: "${message}"

📍 Please reply with:
- The location (city/suburb)
- The type of problem (Roads, Water, Health, etc.)

Example: "Pothole on Chiremba Road, Harare"

Reply with more details.`;
        return reply;
    }

    // Category found, no location
    if (category !== 'general' && locationResult.location === 'unknown') {
        const categoryNames = {
            'roads': 'Roads (potholes, damaged roads)',
            'water': 'Water (burst pipes, no water)',
            'health': 'Health (clinic issues)',
            'education': 'Education (school issues)',
            'electricity': 'Electricity (power outages)',
            'refuse': 'Refuse (garbage collection)'
        };
        reply = `📱 Gatekeeper AI – Location Needed

We received your message about "${categoryNames[category] || category}".

📝 Your message: "${message}"

📍 Please reply with:
- The name of your city (e.g., Harare, Bulawayo, Mutare)
- Or share your location pin (📍 button)

Example: "Harare" or "Luveve, Bulawayo"

Reply with your location.`;
        return reply;
    }

    // Location found, no category
    if (category === 'general' && locationResult.location !== 'unknown') {
        const cityName = locationResult.location.charAt(0).toUpperCase() + locationResult.location.slice(1);
        reply = `📱 Gatekeeper AI – Category Needed

We received your message from "${cityName}".

📝 Your message: "${message}"

📋 Please reply with the type of problem:
- Roads (potholes, damaged roads)
- Water (burst pipes, no water)
- Health (clinic issues)
- Education (school issues)
- Electricity (power outages)
- Refuse (garbage collection)

Reply with one of the above.`;
        return reply;
    }

    // Location conflict (multiple matches)
    if (locationResult.location === 'conflict') {
        let options = locationResult.matched.map((city, index) => {
            return `${index + 1}️⃣ ${city.charAt(0).toUpperCase() + city.slice(1)}`;
        }).join('\n');
        
        reply = `📱 Gatekeeper AI – Clarification Needed

We found multiple locations matching your message.

📝 Your message: "${message}"

📍 Please select one:
${options}

Reply with the number.`;
        return reply;
    }

    // Default
    reply = `📱 Gatekeeper AI – Clarification Needed

We couldn't fully understand your message.

📝 Your message: "${message}"

📍 Please reply with your location and the type of problem.

Example: "Pothole on Chiremba Road, Harare"

Reply with more details.`;
    return reply;
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

    const councilName = location.charAt(0).toUpperCase() + location.slice(1);
    return {
        council: councilName,
        department: department,
        contact: `${councilName} City Council - ${department}`,
        requiresLocation: false
    };
                }
