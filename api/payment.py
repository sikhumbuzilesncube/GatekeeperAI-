from flask import Flask, request, jsonify
import os, requests, hashlib

app = Flask(__name__)

@app.route('/', defaults={'path': ''}, methods=['POST', 'OPTIONS'])
@app.route('/<path:path>', methods=['POST', 'OPTIONS'])
def handler(path):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        
        api_key = os.environ['CONTIPAY_API_KEY']
        api_secret = os.environ['CONTIPAY_API_SECRET'] 
        merchant_id = os.environ['CONTIPAY_MERCHANT_ID']
        
        payload = {
            "merchant_id": merchant_id,
            "amount": str(data['amount']),
            "currency": "USD",
            "phone": data['phone'],
            "provider": "ecocash", 
            "reference": data['reference'],
            "api_key": api_key
        }
        
        # ContiPay hash format - verify with their docs
        sign_string = f"{merchant_id}{payload['amount']}{payload['phone']}{api_secret}"
        payload['signature'] = hashlib.sha256(sign_string.encode()).hexdigest()
        
        # Use the live endpoint - test phone 0771111111 makes it a test
        r = requests.post('https://api.contipay.co.zw/v1/payment/mobile', json=payload, timeout=30)
        
        return jsonify(r.json()), r.status_code
        
    except KeyError as e:
        return jsonify({"error": f"Missing env var: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
