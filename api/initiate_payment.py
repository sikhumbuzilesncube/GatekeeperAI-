import json
import requests
from datetime import datetime

def handler(request):
    """Vercel serverless function for Paynow payment initiation"""
    
    # Get request data
    data = request.json
    
    user_id = data.get('user_id', 'test_user')
    user_phone = data.get('user_phone', '0777803517')
    amount = data.get('amount', 99)
    role = data.get('role', 'MP Edition')
    currency = data.get('currency', 'USD')
    method = data.get('method', 'paynow')
    
    # Paynow credentials based on currency
    if currency == 'USD':
        merchant_id = "25438"
        merchant_key = "e845ff38-8afa-4898-bc84-10623af0a2a2"
    else:
        merchant_id = "25439"
        merchant_key = "6d2661a1-2d18-4b83-8ae5-37dd0860b461"
    
    reference = f"GK-{user_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    payload = {
        "merchant_id": merchant_id,
        "merchant_key": merchant_key,
        "reference": reference,
        "amount": str(amount),
        "currency": currency,
        "phone": user_phone,
        "email": "info@gatekeeperai.co.zw",
        "description": f"Gatekeeper AI Subscription - {role} ({currency})",
        "return_url": "https://gatekeeperai.co.zw/payment_success.html",
        "cancel_url": "https://gatekeeperai.co.zw/payment_cancel.html",
        "notify_url": "https://gatekeeperai.co.zw/api/payment_webhook"
    }
    
    try:
        response = requests.post(
            "https://www.paynow.co.zw/interface/initiate",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "success": True,
                    "browser_url": result.get("browser_url"),
                    "poll_url": result.get("poll_url"),
                    "reference": reference
                }),
                "headers": {
                    "Content-Type": "application/json"
                }
            }
        else:
            return {
                "statusCode": 500,
                "body": json.dumps({
                    "success": False,
                    "error": response.text
                }),
                "headers": {
                    "Content-Type": "application/json"
                }
            }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "success": False,
                "error": str(e)
            }),
            "headers": {
                "Content-Type": "application/json"
            }
  }
