import subprocess
import json
import requests
import time
from datetime import datetime

AI_URL = "http://127.0.0.1:5000/classify"

def get_call_log():
    """Read recent call log from Android"""
    try:
        # Use Termux:API to read call log
        result = subprocess.run(
            ['termux-call-log'],
            capture_output=True,
            text=True
        )
        if result.stdout:
            return json.loads(result.stdout)
        return []
    except Exception as e:
        print(f"Call log error: {e}")
        return []

def classify_sender(number, name=""):
    """Check if sender is in contacts or VIP"""
    # This would check against your VIP list
    # For now, we'll just return NORMAL
    return "NORMAL"

def log_missed_calls():
    """Log missed calls to the system"""
    calls = get_call_log()
    missed = []
    
    for call in calls:
        if call.get('type') == 'MISSED':
            number = call.get('number', 'Unknown')
            name = call.get('name', 'Unknown')
            timestamp = call.get('date', '')
            duration = call.get('duration', '0')
            
            missed.append({
                'number': number,
                'name': name,
                'time': timestamp,
                'duration': duration,
                'type': 'Missed Call',
                'category': classify_sender(number, name)
            })
    
    return missed

def display_missed_calls():
    """Print missed calls for testing"""
    missed = log_missed_calls()
    
    if not missed:
        print("📞 No missed calls")
        return
    
    print("\n📞 MISSED CALLS")
    print("=" * 40)
    for call in missed:
        print(f"📱 {call['name'] or call['number']}")
        print(f"   Time: {call['time']}")
        print(f"   Duration: {call['duration']}s")
        print("-" * 40)

if __name__ == '__main__':
    display_missed_calls()
