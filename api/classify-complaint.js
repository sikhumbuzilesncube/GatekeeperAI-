// api/classify-complaint.js
// Gatekeeper AI - Multi-Language Classification Engine
// Supports: English, Shona, Ndebele, Kalanga, Tonga, Venda

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
        const { message } = req.body;

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
        const location = detectLocation(message, language);

        // Step 5: Find Authority
        const authority = findAuthority(category, location);

        const reference = 'GK-' + Date.now();

        const result = {
            reference: reference,
            language: language,
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

// ─── LANGUAGE DETECTION ───
function detectLanguage(message) {
    const lower = message.toLowerCase();
    
    // Count matches for each language
    const scores = {
        shona: 0,
        ndebele: 0,
        kalanga: 0,
        tonga: 0,
        venda: 0,
        english: 0
    };

    const languageKeywords = {
        shona: ['gomba', 'mugwagwa', 'nzira', 'mvura', 'pombi', 'chipatara', 'chiremba', 'chikoro', 'magetsi', 'marara', 'tsvina', 'njodzi', 'nhamo', 'kukurumidza'],
        ndebele: ['umgwaqo', 'indlela', 'amanzi', 'ugqozi', 'isibhedlela', 'udokotela', 'isikolo', 'umfundisi', 'ugesi', 'imfucuza', 'udoti', 'ingozi', 'phuthuma'],
        kalanga: ['njila', 'zibakala', 'manzi', 'bombi', 'chipatara', 'muradi', 'chikolo', 'mutifundisi', 'njodzi', 'ngano'],
        tonga: ['nzila', 'mubvu', 'mezi', 'mwami', 'chipatara', 'mwana', 'chikoro', 'mutifundisi', 'njodzi', 'ngano'],
        venda: ['mugwa', 'mbvumo', 'maḓi', 'thambo', 'chipatara', 'muraḓi', 'chikolo', 'mutifundisi', 'tshinyu', 'vhuphi']
    };

    for (const [lang, words] of Object.entries(languageKeywords)) {
        for (const word of words) {
            if (lower.includes(word)) {
                scores[lang] += 1;
            }
        }
    }

    // English detection (if no other language detected)
    const englishWords = ['the', 'this', 'that', 'there', 'here', 'please', 'help', 'urgent', 'road', 'water', 'school'];
    for (const word of englishWords) {
        if (lower.includes(word)) {
            scores.english += 1;
        }
    }

    // Find the language with the highest score
    let maxScore = 0;
    let detected = 'english';
    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            detected = lang;
        }
    }

    return detected;
}

// ─── CATEGORY DETECTION ───
function detectCategory(message, language) {
    const lower = message.toLowerCase();

    const categories = {
        roads: {
            english: ['pothole', 'road', 'street', 'pavement', 'traffic', 'asphalt', 'tarmac', 'highway'],
            shona: ['gomba', 'mugwagwa', 'nzira', 'migwagwa', 'marara emugwagwa', 'musuwo', 'mubvumo'],
            ndebele: ['umgwaqo', 'indlela', 'imigwaqo', 'izibakala'],
            kalanga: ['njila', 'zibakala', 'mbugwa'],
            tonga: ['nzila', 'mubvu', 'mikwakwa'],
            venda: ['mugwa', 'mbvumo', 'dzila']
        },
        water: {
            english: ['water', 'tap', 'leak', 'burst', 'pipe', 'flood', 'sewage', 'drain', 'no water'],
            shona: ['mvura', 'pombi', 'mupombi', 'magetsi emvura', 'mvura yemapombi', 'mupata', 'mupombi'],
            ndebele: ['amanzi', 'ugqozi', 'imibhobho', 'umlambo'],
            kalanga: ['manzi', 'bombi', 'bumba'],
            tonga: ['mezi', 'mwami', 'mubvu wamezi'],
            venda: ['maḓi', 'thambo', 'musini']
        },
        health: {
            english: ['clinic', 'hospital', 'health', 'doctor', 'ambulance', 'sick', 'nurse', 'medicine', 'medical'],
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
            shona: ['magetsi', 'chiedza', 'nhamo', 'zesa', 'magetsi emagetsi'],
            ndebele: ['ugesi', 'ukhanyo', 'amandla', 'ugesi kagesi'],
            kalanga: ['mbuyagezi'],
            tonga: ['magetsi'],
            venda: ['magetsi']
        },
        refuse: {
            english: ['bin', 'trash', 'garbage', 'rubbish', 'dump', 'refuse', 'waste', 'litter'],
            shona: ['marara', 'tsvina', 'marara emugwagwa', 'zvisaririra'],
            ndebele: ['imfucuza', 'udoti', 'imfucumfucu'],
            kalanga: ['marara'],
            tonga: ['marara'],
            venda: ['marara']
        },
        fire: {
            english: ['fire', 'burning', 'smoke', 'flame', 'arson', 'wildfire'],
            shona: ['moto', 'utsva', 'nyungwe', 'pfuti'],
            ndebele: ['umlilo', 'ukutsha'],
            kalanga: ['moto', 'nyungwe'],
            tonga: ['moto', 'nyungwe'],
            venda: ['moto', 'nyungwe']
        },
        security: {
            english: ['crime', 'theft', 'robbery', 'police', 'security', 'vandalism', 'violence'],
            shona: ['kuba', 'mhosva', 'mapurisa', 'kutyora', 'chibharo'],
            ndebele: ['ubugebengu', 'amaphoyisa', 'ukweba'],
            kalanga: ['kuba', 'mapurisa'],
            tonga: ['kuba', 'mapurisa'],
            venda: ['kuba', 'mapurisa']
        }
    };

    for (const [category, langMap] of Object.entries(categories)) {
        const keywords = langMap[language] || langMap.english || [];
        for (const word of keywords) {
            if (lower.includes(word)) {
                return category;
            }
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
            english: ['important', 'days', 'waiting', 'still', 'problem', 'issue', 'complaint', 'help', 'urgently'],
            shona: ['zvakakosha', 'mazuva', 'kumirira', 'dambudziko', 'rubatsiro'],
            ndebele: ['kubalulekile', 'insuku', 'ukulinda', 'inkinga'],
            kalanga: ['kubalulekile', 'mazuva'],
            tonga: ['kubalulekile', 'mazuva'],
            venda: ['kubalulekile', 'mazuva']
        },
        green: {
            english: ['question', 'query', 'help', 'information', 'assist', 'enquire'],
            shona: ['mubvunzo', 'rubatsiro', 'tsigiro'],
            ndebele: ['umbuzo', 'usizo', 'ukusiza'],
            kalanga: ['umbuzo', 'rubatsiro'],
            tonga: ['umbuzo', 'rubatsiro'],
            venda: ['umbuzo', 'rubatsiro']
        }
    };

    for (const [urgency, langMap] of Object.entries(urgencyKeywords)) {
        const keywords = langMap[language] || langMap.english || [];
        for (const word of keywords) {
            if (lower.includes(word)) {
                return urgency.toUpperCase();
            }
        }
    }

    return 'GREEN';
}

// ─── LOCATION DETECTION ───
function detectLocation(message, language) {
    const lower = message.toLowerCase();

    const locations = {
        harare: {
            english: ['harare', 'chiremba', 'mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale', 'waterfalls', 'kambuzuma', 'kwekwe'],
            shona: ['harare', 'chiremba', 'mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale'],
            ndebele: ['harare', 'chiremba', 'mbare', 'highfields'],
            kalanga: ['harare', 'chiremba'],
            tonga: ['harare', 'chiremba'],
            venda: ['harare', 'chiremba']
        },
        bulawayo: {
            english: ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi', 'barbourfields', 'pumula', 'gwabalanda', 'njube', 'byo'],
            shona: ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi'],
            ndebele: ['bulawayo', 'luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi', 'byo'],
            kalanga: ['bulawayo', 'luveve'],
            tonga: ['bulawayo', 'luveve'],
            venda: ['bulawayo', 'luveve']
        },
        mutare: {
            english: ['mutare', 'dangamvura', 'sakubva', 'utsindiso'],
            shona: ['mutare', 'dangamvura', 'sakubva', 'utsindiso'],
            ndebele: ['mutare', 'dangamvura'],
            kalanga: ['mutare'],
            tonga: ['mutare'],
            venda: ['mutare']
        },
        gweru: {
            english: ['gweru', 'mkoba', 'norton', 'senga'],
            shona: ['gweru', 'mkoba', 'norton', 'senga'],
            ndebele: ['gweru', 'mkoba'],
            kalanga: ['gweru'],
            tonga: ['gweru'],
            venda: ['gweru']
        },
        masvingo: {
            english: ['masvingo', 'mashava', 'chiredzi'],
            shona: ['masvingo', 'mashava', 'chiredzi'],
            ndebele: ['masvingo', 'mashava'],
            kalanga: ['masvingo'],
            tonga: ['masvingo'],
            venda: ['masvingo']
        },
        kwekwe: {
            english: ['kwekwe', 'redcliff', 'amaveni'],
            shona: ['kwekwe', 'redcliff', 'amaveni'],
            ndebele: ['kwekwe', 'redcliff'],
            kalanga: ['kwekwe'],
            tonga: ['kwekwe'],
            venda: ['kwekwe']
        },
        chitungwiza: {
            english: ['chitungwiza', 'st marys', 'sekuru kaguvi'],
            shona: ['chitungwiza', 'st marys', 'sekuru kaguvi'],
            ndebele: ['chitungwiza', 'st marys'],
            kalanga: ['chitungwiza'],
            tonga: ['chitungwiza'],
            venda: ['chitungwiza']
        }
    };

    // Additional suburbs for each city
    const suburbs = {
        'harare': ['mbare', 'highfields', 'hatcliffe', 'avondale', 'belgravia', 'hatfield', 'borrowdale', 'waterfalls', 'kambuzuma'],
        'bulawayo': ['luveve', 'nkulumane', 'hillside', 'entumbane', 'mzilikazi', 'barbourfields', 'pumula', 'gwabalanda', 'njube'],
        'mutare': ['dangamvura', 'sakubva', 'utsindiso'],
        'gweru': ['mkoba', 'norton', 'senga'],
        'masvingo': ['mashava', 'chiredzi'],
        'kwekwe': ['redcliff', 'amaveni'],
        'chitungwiza': ['st marys', 'sekuru kaguvi']
    };

    for (const [city, keywords] of Object.entries(locations)) {
        const cityKeywords = keywords[language] || keywords.english || [];
        for (const word of cityKeywords) {
            if (lower.includes(word)) {
                return city;
            }
        }
    }

    // Check suburbs (if city detected from suburb)
    for (const [city, suburbList] of Object.entries(suburbs)) {
        for (const suburb of suburbList) {
            if (lower.includes(suburb)) {
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

    const councilName = location.charAt(0).toUpperCase() + location.slice(1);

    return {
        council: councilName,
        department: department,
        contact: `${councilName} City Council - ${department}`,
        requiresLocation: false
    };
                }
