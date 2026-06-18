import requests

tests = [
    # English
    ("Funeral", "My relative passed away", "URGENT"),
    ("Sickness", "Ward 7 has many sick people", "URGENT"),
    ("Accident", "Road accident in my ward", "URGENT"),
    ("Crash", "Car crash on main road", "URGENT"),
    # Ndebele
    ("Imfa", "Kukhona umngcwabo endaweni", "URGENT"),
    ("Ingozi", "Ingozi yemoto", "URGENT"),
    ("Gula", "Abantu bayagula", "URGENT"),
    # Shona
    ("Rufu", "Pane mariro", "URGENT"),
    ("Tsaona", "Tsaona yemotokari", "URGENT"),
    ("Kurwara", "Vanhu vari kurwara", "URGENT"),
]

print("Testing Councillor Detection")
print("=" * 40)

for subject, body, expected in tests:
    response = requests.post('http://127.0.0.1:5000/classify',
        json={'subject': subject, 'body': body})
    result = response.json()['label']
    status = "✅" if result == expected else "❌"
    print(f"{status} {subject} → {result}")
