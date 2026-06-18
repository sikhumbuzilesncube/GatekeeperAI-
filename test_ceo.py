import requests

tests = [
    ("Client crisis", "Major client is leaving", "URGENT"),
    ("Board meeting", "2pm today", "IMPORTANT"),
    ("System down", "Server crashed", "URGENT"),
    ("Contract signing", "Deadline tomorrow", "URGENT"),
    ("Q3 report", "Please review", "IMPORTANT"),
]

print("Testing CEO Detection")
print("=" * 40)

all_passed = True
for subject, body, expected in tests:
    response = requests.post('http://127.0.0.1:5000/classify',
        json={'subject': subject, 'body': body})
    result = response.json()['label']
    status = "✅" if result == expected else "❌"
    if result != expected:
        all_passed = False
    print(f"{status} {subject} → {result}")

if all_passed:
    print("\n🎉 ALL TESTS PASSED!")
else:
    print("\n⚠️ Some tests failed.")
