# api/contipay.py
import json
import requests
import time
import base64

def handler(request):
    # CORS headers
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT, POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": ""
        }

    try:
        body = json.loads(request.body)

        merchant_id = "952"
        api_key = "VjIzb2lIK1o0VjZyRXdPUXZHNHoyZz09"
        api_secret = "764cc5e8-3d34-45ea-b9f0-66df7fff19fe"

        phone = body.get("phone", "0771111111")
        amount = float(body.get("amount", "1.00"))
        reference = body.get("reference", "TEST-" + str(int(time.time() * 1000)))
        provider = body.get("provider", "EC")
        currency = body.get("currency", "USD")

        provider_map = {
            "EC": {"code": "EC", "name": "EcoCash"},
            "TC": {"code": "TC", "name": "TeleCash"},
            "OM": {"code": "OM", "name": "OneMoney"},
            "IB": {"code": "IB", "name": "InnBucks"},
            "ZS": {"code": "ZS", "name": "ZimSwitch"},
            "AG": {"code": "AG", "name": "AfriGo"},
            "OC": {"code": "OC", "name": "Omari"},
            "VC": {"code": "VC", "name": "Voucher"},
            "VA": {"code": "VA", "name": "Visa"},
            "MA": {"code": "MA", "name": "Mastercard"},
            "VE": {"code": "VE", "name": "Verve"}
        }

        provider_info = provider_map.get(provider, provider_map["EC"])

        payload = {
            "customer": {
                "surname": "Test",
                "firstName": "User",
                "email": "test@gatekeeperai.co.zw",
                "cell": phone,
                "countryCode": "ZW"
            },
            "transaction": {
                "providerCode": provider_info["code"],
                "providerName": provider_info["name"],
                "currencyCode": currency,
                "merchantId": int(merchant_id),
                "reference": reference,
                "description": "Gatekeeper AI Subscription",
                "amount": amount,
                "webhookUrl": "https://gatekeeperai.co.zw/api/webhook",
                "successUrl": "https://gatekeeperai.co.zw/payment_success.html",
                "cancelUrl": "https://gatekeeperai.co.zw/payment_cancel.html"
            },
            "accountDetails": {
                "accountNumber": phone,
                "accountName": "Test User"
            }
        }

        auth_string = api_key + ":" + api_secret
        auth_bytes = auth_string.encode("utf-8")
        auth_base64 = base64.b64encode(auth_bytes).decode("utf-8")

        contipay_url = "https://api-uat.contipay.net/acquire/payment"

        headers = {
            "Authorization": "Basic " + auth_base64,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        response = requests.put(contipay_url, json=payload, headers=headers, timeout=30)

        response_data = response.json() if response.text else {}

        return {
            "statusCode": response.status_code,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps(response_data)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
            }
