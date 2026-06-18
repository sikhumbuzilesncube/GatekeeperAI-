import requests

subject = input("Paste email subject: ")
body = input("Paste email body: ")

response = requests.post('http://127.0.0.1:5000/classify',
    json={'subject': subject, 'body': body})

print(f"\n📧 Classification: {response.json()['label']}")
