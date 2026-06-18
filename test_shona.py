import requests

tests = [
    ("Borehole broken at Nketa 8", "No water", "URGENT"),
    ("Chimbidikira! Mvura yapera", "Vanhu vane nzara", "URGENT"),
    ("Shesha! Amanzi aphelile", "Abantu balambe", "URGENT"),
    ("Parliament meeting", "2pm today", "IMPORTANT"),
    ("Hello", "How are you?", "NORMAL"),
]

print("Testing Shona/Ndebele Detection")
print("=" * 40)

for subject, body, expected in tests:
    response = requests.post('http://127.0.0.1:5000/classify',
        json={'subject': subject, 'body': body})
    result = response.json()['label']
    status = "✅ PASS" if result == expected else "❌ FAIL"
    print(f"{subject[:30]}... → {result} ({status})")
