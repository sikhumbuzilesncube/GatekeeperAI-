from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        message = data.get('message', '')
        departments = data.get('departments', [])
        
        # Find matching department
        matched = []
        for dept in departments:
            keywords = dept.get('keywords', '').lower()
            if any(kw.strip() in message.lower() for kw in keywords.split(',')):
                matched.append(dept)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "matched": matched,
            "message": message,
            "count": len(matched)
        }).encode())
