from flask import Flask, request, jsonify

app = Flask(__name__)

# English urgent keywords
# ============ ENGLISH URGENT ============
URGENT_EN = [
    # Emergency (everyone)
    'emergency', 'urgent', 'asap', 'immediately', 'crisis',
    'system down', 'server', 'outage', 'breach', 'fraud', 'lawsuit',
    'client crisis', 'customer complaint', 'deal lost',
    'contract signing', 'sign the contract', 'deal deadline',
    # Meeting Detection
    'meeting', 'meet', 'briefing', 'conference', 'session',
    'tomorrow', 'today', 'at 2pm', 'at 3pm', 'at 4pm',
    'am', 'pm', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'
    
    # Health & Safety
    'hospital', 'death', 'died', 'accident', 'fire', 'flood',
    'cholera', 'murder', 'rape', 'assault', 'stolen', 'crime',
    
    # Constituent (MPs)
    'borehole', 'water', 'broken', 'no water', 'school fees',
    
    # Councillor (Community)
    'funeral', 'burial', 'sickness', 'illness', 'crash',
    'victim', 'injured', 'wounded', 'collapsed', 'trapped'
]

# ============ SHONA URGENT ============
URGENT_SH = [
    'chimbidikira', 'nokukurumidza', 'dambudziko', 'chirwere',
    'nzara', 'mvura', 'tsaona', 'rufu', 'chipatara',
    'bhoreru', 'gwatakwata', 'nhaka', 'kurwara', 'nhamo',
    'poto', 'chibharo', 'kupamba', 'moto', 'mhirizhonga',
    # Councillor (Shona)
    'mariro', 'kuparara', 'kupwanyika', 'kukuvara'
]

# ============ NDEBELE URGENT ============
URGENT_ND = [
    'shesha', 'inkinga', 'lamula', 'igciwane', 'indlala',
    'amanzi', 'ingozi', 'ukufa', 'isibhedlela', 'ibhora',
    'ukugula', 'usizi', 'ukuduna', 'ukuthumba', 'umlilo',
    # Councillor (Ndebele)
    'imfa', 'umonakalo', 'bhujiwe', 'gula',
    'umngcwabo', 'isifo', 'ukulimala', 'ukuphahlazeka'
]

## ============Combine all urgent keywords
URGENT = URGENT_EN + URGENT_SH + URGENT_ND

def classify_message(subject, body):
    text = f"{subject} {body}".lower()
    
    # First check URGENT
    for word in URGENT:
        if word in text:
            return "URGENT"
    
    # Then check IMPORTANT
    for word in IMPORTANT:
        if word in text:
            return "IMPORTANT"
    
    return "NORMAL"

@app.route('/')
def home():
    return "Gatekeeper AI v3 - Zimbabwe Edition (Shona/Ndebele)"

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    label = classify_message(data.get('subject', ''), data.get('body', ''))
    return jsonify({"label": label})

if __name__ == '__main__':
    print("=" * 50)
    print("🔒 GATEKEEPER AI v3 - ZIMBABWE EDITION")
    print("=" * 50)
    print(f"🇿🇼 Shona keywords: {len(URGENT_SH)}")
    print(f"🇿🇼 Ndebele keywords: {len(URGENT_ND)}")
    print(f"🇬🇧 English keywords: {len(URGENT_EN)}")
    print("=" * 50)
    print("URGENT keywords loaded:", len(URGENT))
    print("Running on port 5000")
    app.run(host='0.0.0.0', port=5000)
