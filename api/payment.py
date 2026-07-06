from http.server import BaseHTTPRequestHandler
import json, os, requests, hashlib

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            data = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
            
            # Use the live keys you just added to Vercel
            api_key = os.environ['CONTIPAY_API_KEY']
            api_secret = os.environ['CONTIPAY_API_SECRET']
            merchant_id = os.environ['CONTIPAY_MERCHANT_ID']
            
            payload = {
                "merchant_id": merchant_id,
                "amount": str(data['amount']),
                "currency": "USD",
                "phone": data['phone'], # Use 0771111111 for test
                "provider": "ecocash",
                "reference": data['reference'],
                "api_key": api_key
            }
            
            # Hash format - ContiPay usually wants this exact order
            sign_string = f"{merchant_id}{payload['amount']}{payload['phone']}{api_secret}"
            payload['signature'] = hashlib.sha256(sign_string.encode()).hexdigest()
            
            # Live endpoint - ContiPay uses same URL for test + live
            # The test phone number tells their system not to charge
            r = requests.post('https://api.contipay.co.zw/v1/payment/mobile', json=payload, timeout=30)
            
            self.send_response(r.status_code)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(r.content)
            
        except KeyError as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Missing env var: {str(e)}"}).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
