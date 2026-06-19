"""
Gatekeeper AI - Call Intelligence System
Determines urgency of missed calls based on multiple factors
"""

import json
import re
from datetime import datetime

# VIP numbers (these would come from your database)
VIP_NUMBERS = {
    '+263 71 234 5678': 'Parliament Secretariat',
    '+263 77 123 4567': 'Minister Moyo',
    '+263 78 123 4567': 'Chief Ndlovu',
    '+263 73 304 5325': 'Your Office',
}

# Keywords that make a caller important
IMPORTANT_KEYWORDS = [
    'minister', 'chief', 'director', 'secretary', 
    'parliament', 'government', 'council', 'mayor'
]

class CallIntelligence:
    def __init__(self):
        self.vip_numbers = VIP_NUMBERS
        self.important_keywords = IMPORTANT_KEYWORDS
    
    def is_vip(self, number, name=''):
        """Check if a number is in VIP list"""
        if number in self.vip_numbers:
            return True, self.vip_numbers[number]
        # Check if name contains important keywords
        for keyword in self.important_keywords:
            if keyword.lower() in name.lower():
                return True, name
        return False, None
    
    def count_calls_from_number(self, call_log, number):
        """Count how many times a number called"""
        count = 0
        for call in call_log:
            if call.get('number') == number and call.get('type') == 'MISSED':
                count += 1
        return count
    
    def has_recent_message(self, messages, number):
        """Check if this number also sent a message"""
        for msg in messages:
            if msg.get('sender') == number or msg.get('number') == number:
                return True
        return False
    
    def is_late_night(self, timestamp):
        """Check if call was after 9pm or before 6am"""
        try:
            # Try to extract time from timestamp
            hour = 0
            # Parse different time formats
            if ':' in str(timestamp):
                parts = str(timestamp).split()
                for part in parts:
                    if ':' in part and len(part) <= 5:
                        hour = int(part.split(':')[0])
                        break
            if hour >= 21 or hour < 6:
                return True
        except:
            pass
        return False
    
    def get_call_count(self, calls, number):
        """Get number of calls and timestamps"""
        count = 0
        times = []
        for call in calls:
            if call.get('number') == number and call.get('type') == 'MISSED':
                count += 1
                times.append(call.get('date', ''))
        return count, times
    
    def calls_within_1_hour(self, times):
        """Check if calls were within 1 hour of each other"""
        if len(times) < 2:
            return False
        # Simplified: if more than 2 calls, likely within 1 hour
        return len(times) >= 2
    
    def determine_urgency(self, number, name, call_log, messages):
        """Calculate urgency score and return urgency level"""
        score = 0
        reasons = []
        
        # Factor 1: Count calls
        count, times = self.get_call_count(call_log, number)
        if count >= 3:
            score += 30
            reasons.append(f"Called {count} times")
        elif count >= 2:
            score += 15
            reasons.append(f"Called {count} times")
        
        # Factor 2: VIP status
        is_vip, vip_name = self.is_vip(number, name)
        if is_vip:
            score += 25
            reasons.append(f"VIP: {vip_name}")
        
        # Factor 3: Also sent a message
        if self.has_recent_message(messages, number):
            score += 20
            reasons.append("Also sent a message")
        
        # Factor 4: Late night
        if self.is_late_night(times[0] if times else ''):
            score += 15
            reasons.append("Late night call")
        
        # Factor 5: Multiple calls close together
        if self.calls_within_1_hour(times):
            score += 10
            reasons.append("Calls close together")
        
        # Determine urgency
        if score >= 60:
            urgency = "URGENT"
        elif score >= 30:
            urgency = "IMPORTANT"
        else:
            urgency = "NORMAL"
        
        return urgency, score, reasons

# Test the system
if __name__ == '__main__':
    ci = CallIntelligence()
    
    # Test data
    test_calls = [
        {'number': '+263 77 234 5678', 'name': 'Constituent - Ward 4', 'type': 'MISSED', 'date': '2026-06-19 10:30:00'},
        {'number': '+263 77 234 5678', 'name': 'Constituent - Ward 4', 'type': 'MISSED', 'date': '2026-06-19 10:45:00'},
        {'number': '+263 77 234 5678', 'name': 'Constituent - Ward 4', 'type': 'MISSED', 'date': '2026-06-19 11:00:00'},
        {'number': '+263 71 234 5678', 'name': 'Parliament Secretariat', 'type': 'MISSED', 'date': '2026-06-19 09:00:00'},
        {'number': '+263 73 304 5325', 'name': 'Unknown', 'type': 'MISSED', 'date': '2026-06-19 22:30:00'},
    ]
    
    test_messages = [
        {'sender': '+263 77 234 5678', 'body': 'Borehole broken'},
        {'sender': '+263 71 234 5678', 'body': 'Meeting at 2pm'},
    ]
    
    print("CALL INTELLIGENCE SYSTEM TEST")
    print("=" * 50)
    
    for call in test_calls:
        number = call['number']
        name = call['name']
        urgency, score, reasons = ci.determine_urgency(number, name, test_calls, test_messages)
        
        print(f"\n📞 {name or number}")
        print(f"   Score: {score}")
        print(f"   Urgency: {urgency}")
        print(f"   Reasons: {', '.join(reasons) if reasons else 'No special factors'}")
        print("-" * 40)
