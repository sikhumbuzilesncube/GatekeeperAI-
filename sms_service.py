import subprocess
import json
import requests
import time
import os

PROCESSED_FILE = "processed_sms.txt"
AI_URL = "http://127.0.0.1:5000/classify"

def load_processed():
    if os.path.exists(PROCESSED_FILE):
        with open(PROCESSED_FILE, "r") as f:
            return set(f.read().splitlines())
    return set()

def save_processed(sms_id):
    with open(PROCESSED_FILE, "a") as f:
        f.write(str(sms_id) + "\n")

def get_new_sms():
    try:
        result = subprocess.run(['termux-sms-list', '-l', '10'], capture_output=True, text=True)
        if result.stdout:
            return json.loads(result.stdout)
        return []
    except:
        return []

def send_to_ai(body, sender):
    try:
        response = requests.post(AI_URL, json={'subject': sender, 'body': body}, timeout=3)
        return response.json().get('label', 'NORMAL')
    except:
        return 'NORMAL'

def send_notification(sender, body, label):
    if label == 'URGENT':
        try:
            subprocess.run(['termux-notification', '--title', f"URGENT from {sender}", '--content', body[:80], '--priority', 'high', '--sound', 'true'])
        except:
            pass

def main():
    print("Gatekeeper AI - SMS Service Started")
    processed = load_processed()
    while True:
        try:
            for sms in get_new_sms():
                sms_id = sms.get('_id')
                if sms_id not in processed:
                    sender = sms.get('number', 'Unknown')
                    body = sms.get('body', '')[:200]
                    if body.strip():
                        label = send_to_ai(body, sender)
                        send_notification(sender, body, label)
                        processed.add(sms_id)
                        save_processed(sms_id)
                        print(f"[{label}] {sender}: {body[:50]}...")
            time.sleep(10)
        except:
            time.sleep(5)

if __name__ == '__main__':
    main()
