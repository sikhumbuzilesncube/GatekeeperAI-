"""
Gatekeeper AI - Paynow Payment Integration
"""

import requests
import json
import time
from datetime import datetime

# Paynow Credentials
MERCHANT_ID = "25438"
MERCHANT_KEY = "e845ff38-8afa-4898-bc84-10623af0a2a2"
PAYNOW_URL = "https://www.paynow.co.zw/interface/initiate"

def initiate_payment(user_id, user_phone, amount, role, currency="USD"):
    """
    Initiate a payment request with Paynow
    """
    reference = f"GK-{user_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    payload = {
        "merchant_id": MERCHANT_ID,
        "merchant_key": MERCHANT_KEY,
        "reference": reference,
        "amount": str(amount),
        "currency": currency,
        "phone": user_phone,
        "email": "info@gatekeeperai.co.zw",
        "description": f"Gatekeeper AI Subscription - {role}",
        "return_url": "https://gatekeeperai.co.zw/payment_success.html",
        "cancel_url": "https://gatekeeperai.co.zw/payment_cancel.html",
        "notify_url": "https://gatekeeperai.co.zw/payment_webhook"
    }
    
    try:
        response = requests.post(PAYNOW_URL, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "reference": reference,
                "poll_url": result.get("poll_url"),
                "browser_url": result.get("browser_url")
            }
        else:
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

def check_payment_status(reference):
    """
    Check the status of a payment
    """
    url = "https://www.paynow.co.zw/interface/status"
    payload = {
        "merchant_id": MERCHANT_ID,
        "merchant_key": MERCHANT_KEY,
        "reference": reference
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        if response.status_code == 200:
            return response.json()
        return {"success": False}
    except:
        return {"success": False}

# Test the integration
if __name__ == "__main__":
    print("🔒 Testing Paynow Integration")
    print("-" * 40)
    print(f"Merchant ID: {MERCHANT_ID}")
    print(f"Merchant Key: {MERCHANT_KEY[:10]}...")
    print("-" * 40)
    
    result = initiate_payment(
        user_id="test_user",
        user_phone="0777803517",
        amount=99,
        role="MP Edition"
    )
    
    if result.get("success"):
        print("✅ Payment initiated successfully!")
        print(f"Reference: {result.get('reference')}")
        print(f"Browser URL: {result.get('browser_url')}")
    else:
        print("❌ Payment failed:", result.get("error"))
