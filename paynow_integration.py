"""
Gatekeeper AI - Paynow Payment Integration
"""

import requests
from datetime import datetime

# Paynow Credentials
PAYNOW_CONFIG = {
    "USD": {
        "merchant_id": "25438",
        "merchant_key": "e845ff38-8afa-4898-bc84-10623af0a2a2"
    },
    "ZWG": {
        "merchant_id": "25439",
        "merchant_key": "6d2661a1-2d18-4b83-8ae5-37dd0860b461"
    }
}

PAYNOW_URL = "https://www.paynow.co.zw/interface/initiate"

def initiate_payment(user_id, user_phone, amount, role, currency="USD"):
    """
    Initiate a payment request with Paynow
    """
    config = PAYNOW_CONFIG.get(currency, PAYNOW_CONFIG["USD"])
    reference = f"GK-{user_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    payload = {
        "merchant_id": config["merchant_id"],
        "merchant_key": config["merchant_key"],
        "reference": reference,
        "amount": str(amount),
        "currency": currency,
        "phone": user_phone,
        "email": "info@gatekeeperai.co.zw",
        "description": f"Gatekeeper AI Subscription - {role} ({currency})",
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

if __name__ == "__main__":
    print("🔒 Paynow Integration Ready")
    print(f"USD Merchant ID: {PAYNOW_CONFIG['USD']['merchant_id']}")
    print(f"ZWG Merchant ID: {PAYNOW_CONFIG['ZWG']['merchant_id']}")
