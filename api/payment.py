def do_POST(self):
    try:
        # TEMP DEBUG - remove after testing
        api_key = os.environ.get('CONTIPAY_API_KEY', 'NOT_FOUND')
        if api_key == 'NOT_FOUND':
            raise Exception("CONTIPAY_API_KEY env var missing")
        if len(api_key) < 10:
            raise Exception(f"API_KEY too short: {len(api_key)} chars")
            
        # ... rest of your payment code
