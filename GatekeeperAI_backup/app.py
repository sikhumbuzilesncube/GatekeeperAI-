from flask import Flask, request, jsonify

app = Flask(__name__)

URGENT = ['borehole', 'water', 'broken', 'emergency', 'urgent', 'hospital', 'death', 'accident', 'no water', 'school fees', 'funeral']
IMPORTANT = ['meeting', 'today', 'deadline', 'report', 'parliament', 'minister', 'constituent']

def classify(subject, body):
    text = (subject + " " + body).lower()
    for word in URGENT:
        if word in text:
            return "URGENT"
    for word in IMPORTANT:
        if word in text:
            return "IMPORTANT"
    return "NORMAL"

@app.route('/')
def home():
    return "Gatekeeper AI Ready"

@app.route('/classify', methods=['POST'])
def classify_message():
    data = request.get_json()
    result = classify(data.get('subject', ''), data.get('body', ''))
    return jsonify({"label": result})

if __name__ == '__main__':
    print("Gatekeeper AI Running on port 5000")
    app.run(host='0.0.0.0', port=5000)
