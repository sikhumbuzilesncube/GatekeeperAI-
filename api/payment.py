from http.server import BaseHTTPRequestHandler
import json
import os
import requests
import hashlib

# Vercel Python functions use BaseHTTPRequestHandler
class handler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        return

    def do_POST(self):
        try:
            # 1. Get request body
            content_len = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_len)
            data = json.loads(body)
            
            # 2. Get env vars - set these in Vercel
            api_key = os.environ.get('CONTIPAY_TEST_KEY')
            api_secret = os.environ.get('CONTIPAY_TEST_SECRET')
            merchant_id = os.environ.get('CONTIPAY_MERCHANT_ID')
            
            # 3. Build ContiPay payload for EcoCash
            payload = {
                "merchant_id": merchant_id,
                "amount": str(data.get('amount')),
                "currency": data.get('currency', 'USD'),
                "phone": data.get('phone'),
                "provider": "ecocash",
                "reference": data.get('reference'),
                "api_key": api_key
            }
            
            # 4. Generate hash - CHECK CONTIPAY DOCS FOR EXACT FORMAT
            # This is a common format: merchant_id + amount + phone + secret
            sign_string = f"{merchant_id}{payload['amount']}{payload['phone']}{api_secret}"
            payload['signature'] = hashlib.sha256(sign_string.encode()).hexdigest()
            
            # 5. Send to ContiPay SANDBOX
            contipay_url = 'https://sandbox.contipay.com/api/v1/payment/request' # Verify this URL
            r = requests.post(contipay_url, json=payload, timeout=30)
            
            # 6. Return response to frontend
            self.send_response(r.status_code)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(r.content)
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_body = json.dumps({"error": str(e), "message": "Proxy failed"})
            self.wfile.write(error_body.encode())
