"""
Gatekeeper AI - Call Intelligence
Determines urgency of missed calls based on multiple factors
"""

VIP_NUMBERS = [
    '+263 71 234 5678',  # Parliament
    '+263 77 123 4567',  # Minister
    '+263 78 123 4567',  # Chief
]

def determine_urgency(number, call_count, recent_times, has_message, is_vip, time_of_day):
    """Calculate urgency score for a missed call"""
    score = 0
    reasons = []
    
    # Factor 1: Call count
    if call_count >= 3:
        score += 30
        reasons.append(f"Called {call_count} times")
    elif call_count >= 2:
        score += 15
        reasons.append(f"Called {call_count} times")
    
    # Factor 2: VIP status
    if is_vip:
        score += 25
        reasons.append("VIP contact")
    
    # Factor 3: Also sent a message
    if has_message:
        score += 20
        reasons.append("Also sent a message")
    
    # Factor 4: Late night (after 9pm)
    if time_of_day == 'late_night':
        score += 15
        reasons.append("Late night call")
    
    # Determine urgency
    if score >= 60:
        urgency = "URGENT"
    elif score >= 30:
        urgency = "IMPORTANT"
    else:
        urgency = "NORMAL"
    
    return urgency, reasons

# Test the logic
test_cases = [
    {"number": "+263 77 111 1111", "count": 1, "has_message": False, "is_vip": False, "time": "2pm"},
    {"number": "+263 77 234 5678", "count": 2, "has_message": True, "is_vip": False, "time": "10am"},
    {"number": "+263 77 234 5678", "count": 3, "has_message": True, "is_vip": False, "time": "11pm"},
    {"number": "+263 71 234 5678", "count": 1, "has_message": False, "is_vip": True, "time": "10am"},
]

print("CALL INTELLIGENCE TEST")
print("=" * 40)
for test in test_cases:
    urgency, reasons = determine_urgency(
        test['number'],
        test['count'],
        [],
        test['has_message'],
        test['is_vip'],
        'late_night' if test['time'] == '11pm' else 'day'
    )
    print(f"Number: {test['number']}")
    print(f"  Count: {test['count']}, VIP: {test['is_vip']}, Message: {test['has_message']}")
    print(f"  Urgency: {urgency}")
    print(f"  Reasons: {reasons}")
    print("-" * 40)
