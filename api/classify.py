from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        subject = data.get('subject', '')
        body = data.get('body', '')
        
        # Keywords
        urgent_keywords = [
            'borehole', 'water', 'broken', 'emergency', 'urgent', 'asap',
            'hospital', 'death', 'died', 'accident', 'no water',
            'school fees', 'funeral', 'burial', 'flood', 'fire',
            'crime', 'stolen', 'assault', 'rape', 'murder', 'cholera',
            'shesha', 'chimbidikira', 'inkinga', 'dambudziko'
        ]
        
        important_keywords = [
            'meeting', 'today', 'tomorrow', 'deadline', 'report',
            'parliament', 'minister', 'constituent', 'visit',
            'request', 'document', 'application', 'permission',
            'approval', 'signature', 'review', 'budget'
        ]
        
        text = f"{subject} {body}".lower()
        
        for word in urgent_keywords:
            if word in text:
                label = "URGENT"
                priority = 90
                break
        else:
            for word in important_keywords:
                if word in text:
                    label = "IMPORTANT"
                    priority = 70
                    break
            else:
                label = "NORMAL"
                priority = 40
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "label": label,
            "priority": priority
        }).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "Gatekeeper AI API is running",
            "version": "1.0",
            "endpoints": {
                "POST /api/classify": "Classify a message",
                "GET /api/health": "Check API status"
            }
        }).encode())
